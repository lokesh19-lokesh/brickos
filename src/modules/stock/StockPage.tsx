import React, { useState, useEffect } from 'react';
import { 
  Boxes, Plus, ArrowUpRight, ArrowDownRight, AlertTriangle, 
  RotateCcw, ShieldAlert, FileText, CheckCircle2, History 
} from 'lucide-react';
import { stockService } from '@/services/stockService';
import { productService } from '@/services/productService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { StockTransaction, Product, StockTransactionType } from '@/types';
import { formatQuantity, formatDate, formatINR } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, QuantityInput } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Card';
import { PageHeader, Alert } from '@/components/ui/PageHeader';

export const StockPage: React.FC = () => {
  const { factory } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'adjustments' | 'low_stock'>('overview');

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    adjustmentType: 'adjustment' as 'adjustment' | 'damage' | 'return' | 'stock_in' | 'stock_out',
    quantity: 500,
    notes: 'Physical monthly yard stock audit reconciliation',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, txns] = await Promise.all([
        productService.getProducts(factoryId),
        stockService.getStockTransactions(factoryId),
      ]);
      setProducts(prods);
      setTransactions(txns);

      if (prods.length > 0 && !adjustForm.productId) {
        setAdjustForm(prev => ({ ...prev, productId: prods[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dbStore.subscribe(() => {
      loadData();
    });
    return unsub;
  }, [factoryId]);

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prod = products.find(p => p.id === adjustForm.productId);
      if (!prod) {
        toast.error('Select a valid product');
        return;
      }

      await stockService.adjustStock(
        factoryId,
        prod.id,
        adjustForm.adjustmentType,
        Number(adjustForm.quantity),
        adjustForm.notes
      );

      toast.success(`Adjusted stock for ${prod.name}`);
      setIsAdjustModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error updating stock');
    }
  };

  const totalYardStock = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalStockValuation = products.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0);
  const lowStockCount = products.filter(p => p.currentStock <= p.minimumStock).length;

  // Overview Columns
  const overviewColumns: Column<Product>[] = [
    {
      header: 'Product Name & Code',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">{row.code} • {row.category}</div>
        </div>
      ),
    },
    {
      header: 'Current Available Stock',
      accessorKey: 'currentStock',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-mono font-black text-slate-900 text-sm">
            {formatQuantity(row.currentStock, row.unit)}
          </div>
          <div className="text-[11px] mt-0.5">
            {row.currentStock <= row.minimumStock ? (
              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                Low Stock Warning (Min: {formatQuantity(row.minimumStock, row.unit)})
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold">Healthy Level</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Stock Valuation (₹)',
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{formatINR(row.currentStock * row.sellingPrice)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">@ {formatINR(row.sellingPrice)}/{row.unit}</div>
        </div>
      ),
    },
    {
      header: 'Quick Action',
      className: 'text-right',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setAdjustForm({
              productId: row.id,
              adjustmentType: 'adjustment',
              quantity: 500,
              notes: 'Yard count adjustment',
            });
            setIsAdjustModalOpen(true);
          }}
          className="text-xs"
        >
          Adjust Stock
        </Button>
      ),
    },
  ];

  // Transaction Ledger Columns
  const ledgerColumns: Column<StockTransaction>[] = [
    {
      header: 'Date & Batch/Ref',
      accessorKey: 'date',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{formatDate(row.date)}</div>
          <div className="text-xs font-mono text-slate-500 mt-0.5">{row.batchCode || row.referenceId || 'Direct Entry'}</div>
        </div>
      ),
    },
    {
      header: 'Product',
      accessorKey: 'productName',
      cell: (row) => <div className="font-semibold text-slate-900">{row.productName}</div>,
    },
    {
      header: 'Transaction Type',
      accessorKey: 'transactionType',
      cell: (row) => {
        const t = row.transactionType;
        if (t === 'production' || t === 'stock_in' || t === 'return') {
          return <Badge variant="success">IN: {t}</Badge>;
        }
        if (t === 'sale') {
          return <Badge variant="charcoal">OUT: Sale</Badge>;
        }
        if (t === 'damage') {
          return <Badge variant="danger">OUT: Damage</Badge>;
        }
        return <Badge variant="warning">ADJ: {t}</Badge>;
      },
    },
    {
      header: 'Qty In (+)',
      cell: (row) => (
        <span className={row.quantityIn > 0 ? 'font-mono font-bold text-emerald-600' : 'text-slate-300'}>
          {row.quantityIn > 0 ? `+${row.quantityIn.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      header: 'Qty Out (-)',
      cell: (row) => (
        <span className={row.quantityOut > 0 ? 'font-mono font-bold text-[#E53935]' : 'text-slate-300'}>
          {row.quantityOut > 0 ? `-${row.quantityOut.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      header: 'Balance After',
      accessorKey: 'balance',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-black text-slate-900">
          {row.balance.toLocaleString()} Pcs
        </span>
      ),
    },
    {
      header: 'Notes & User',
      cell: (row) => (
        <div className="text-xs text-slate-600 max-w-xs truncate">
          {row.notes || '-'}
          <span className="text-[10px] text-slate-400 block font-medium">By: {row.createdBy}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock & Inventory Ledger"
        description="Transaction-based stock control tracking production inward, sales dispatches, curing damage, and physical audit adjustments."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Operations' },
          { label: 'Stock Ledger' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAdjustModalOpen(true)}
          >
            + Record Stock Adjustment
          </Button>
        }
      />

      {/* High-level Stock KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Finished Goods in Yard</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {totalYardStock.toLocaleString()} <span className="text-xs font-normal text-slate-500">Pcs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all {products.length} product lines</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Stock Valuation</span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {formatINR(totalStockValuation)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on current selling price</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">
            {lowStockCount} Products
          </div>
          <p className="text-[11px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded mt-1 inline-block font-semibold">
            {lowStockCount > 0 ? 'Production run recommended' : 'All stocks optimal'}
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#E53935] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Yard Stock Overview ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-[#E53935] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Detailed Transaction Ledger ({transactions.length})
        </button>
      </div>

      {activeTab === 'overview' ? (
        <DataTable
          data={products}
          columns={overviewColumns}
          searchPlaceholder="Search products in stock..."
          searchKey="name"
          exportFileName="brick-yard-stock-overview"
        />
      ) : (
        <DataTable
          data={transactions}
          columns={ledgerColumns}
          searchPlaceholder="Search transactions by product, batch, or note..."
          searchKey="productName"
          exportFileName="stock-transaction-ledger"
        />
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Record Stock Adjustment / Physical Audit"
        description="Update stock balance due to breakage damage, physical yard count variance, or returns."
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4">
          <Select
            label="Product"
            value={adjustForm.productId}
            onChange={e => setAdjustForm({ ...adjustForm, productId: e.target.value })}
            isRequired
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (Current: {p.currentStock.toLocaleString()} {p.unit})
              </option>
            ))}
          </Select>

          <Select
            label="Transaction Adjustment Type"
            value={adjustForm.adjustmentType}
            onChange={e => setAdjustForm({ ...adjustForm, adjustmentType: e.target.value as any })}
            isRequired
          >
            <option value="adjustment">Physical Audit Count Adjustment</option>
            <option value="damage">Yard Damage / Breakage Scrap</option>
            <option value="return">Customer Return</option>
            <option value="stock_in">Manual Inward Stock Transfer</option>
            <option value="stock_out">Manual Outward Stock Transfer</option>
          </Select>

          <QuantityInput
            label="Adjustment Quantity"
            unit="Pcs"
            value={adjustForm.quantity}
            onChange={e => setAdjustForm({ ...adjustForm, quantity: Number(e.target.value) })}
            required
            isRequired
          />

          <Input
            label="Reason / Audit Reference Notes"
            placeholder="e.g. Month-end physical stock audit verified by Plant Manager"
            value={adjustForm.notes}
            onChange={e => setAdjustForm({ ...adjustForm, notes: e.target.value })}
            required
            isRequired
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Apply Stock Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
