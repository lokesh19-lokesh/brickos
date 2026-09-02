import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Plus, Truck, FileText, CheckCircle2, Eye, 
  CreditCard, ArrowUpRight, MessageSquare, Printer, Trash2 
} from 'lucide-react';
import { salesService } from '@/services/salesService';
import { productService } from '@/services/productService';
import { customerService } from '@/services/customerService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { SaleOrder, Product, Customer } from '@/types';
import { formatINR, formatQuantity, formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, CurrencyInput, QuantityInput } from '@/components/ui/Input';
import { StatusBadge, Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const SalesPage: React.FC = () => {
  const { factory } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const factoryId = factory?.id || 'fact_01';

  const [sales, setSales] = useState<SaleOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleOrder | null>(null);

  // New Sale Form
  const [saleForm, setSaleForm] = useState({
    invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    saleDate: new Date().toISOString().split('T')[0],
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerGst: '',
    productId: '',
    quantity: 5000,
    rate: 4.80,
    discount: 0,
    taxPercent: 12,
    paidAmount: 0,
    paymentMode: 'upi' as any,
    vehicleNumber: 'MH-12-DT-8821',
    driverName: 'Ramdas Mane',
    driverPhone: '+91 98223 99881',
    destinationAddress: 'L&T Project Site, Kharadi, Pune',
    notes: 'Gate Pass Delivery Dispatch',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [sList, pList, cList] = await Promise.all([
        salesService.getSales(factoryId),
        productService.getProducts(factoryId),
        customerService.getCustomers(factoryId),
      ]);
      setSales(sList);
      setProducts(pList);
      setCustomers(cList);

      if (cList.length > 0 && !saleForm.customerId) {
        setSaleForm(prev => ({
          ...prev,
          customerId: cList[0].id,
          customerName: cList[0].customerName,
          customerPhone: cList[0].phone,
          customerGst: cList[0].gstNumber || '',
          destinationAddress: cList[0].address,
        }));
      }
      if (pList.length > 0 && !saleForm.productId) {
        setSaleForm(prev => ({
          ...prev,
          productId: pList[0].id,
          rate: pList[0].sellingPrice,
        }));
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

  const handleCustomerChange = (custId: string) => {
    const c = customers.find(cust => cust.id === custId);
    if (c) {
      setSaleForm(prev => ({
        ...prev,
        customerId: c.id,
        customerName: c.customerName,
        customerPhone: c.phone,
        customerGst: c.gstNumber || '',
        destinationAddress: c.address,
      }));
    }
  };

  const handleProductChange = (prodId: string) => {
    const p = products.find(prod => prod.id === prodId);
    if (p) {
      setSaleForm(prev => ({
        ...prev,
        productId: p.id,
        rate: p.sellingPrice,
      }));
    }
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prod = products.find(p => p.id === saleForm.productId);
      const cust = customers.find(c => c.id === saleForm.customerId);

      if (!prod || !cust) {
        toast.error('Select valid customer and product');
        return;
      }

      if (prod.currentStock < saleForm.quantity) {
        if (!window.confirm(`Warning: Requested quantity (${saleForm.quantity.toLocaleString()}) exceeds current yard stock (${prod.currentStock.toLocaleString()}). Proceed with dispatch anyway?`)) {
          return;
        }
      }

      const itemAmount = saleForm.quantity * saleForm.rate;
      const subtotal = itemAmount;
      const taxable = subtotal - saleForm.discount;
      const taxAmount = (taxable * saleForm.taxPercent) / 100;
      const grandTotal = taxable + taxAmount;

      const res = await salesService.createSale(factoryId, {
        invoiceNumber: saleForm.invoiceNumber,
        saleDate: saleForm.saleDate,
        customerId: cust.id,
        customerName: cust.customerName,
        customerPhone: saleForm.customerPhone || cust.phone,
        customerGst: saleForm.customerGst || cust.gstNumber,
        items: [
          {
            productId: prod.id,
            productName: prod.name,
            hsnCode: prod.hsnCode || '681599',
            quantity: Number(saleForm.quantity),
            unit: prod.unit,
            rate: Number(saleForm.rate),
            discount: Number(saleForm.discount),
            taxPercent: Number(saleForm.taxPercent),
            amount: itemAmount,
          },
        ],
        subtotal,
        discountTotal: Number(saleForm.discount),
        taxTotal: taxAmount,
        grandTotal,
        paidAmount: Number(saleForm.paidAmount),
        paymentMode: saleForm.paymentMode,
        deliveryDetails: {
          vehicleNumber: saleForm.vehicleNumber,
          driverName: saleForm.driverName,
          driverPhone: saleForm.driverPhone,
          destinationAddress: saleForm.destinationAddress,
        },
        notes: saleForm.notes,
      });

      toast.success(`Sale Order & Invoice #${saleForm.invoiceNumber} created! Stock deducted.`);
      setIsNewSaleModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error recording sale');
    }
  };

  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalReceived = sales.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalPending = sales.reduce((acc, s) => acc + s.pendingAmount, 0);

  const columns: Column<SaleOrder>[] = [
    {
      header: 'Invoice & Date',
      accessorKey: 'invoiceNumber',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{row.invoiceNumber}</div>
          <div className="text-xs text-slate-500 mt-0.5">{formatDate(row.saleDate)}</div>
        </div>
      ),
    },
    {
      header: 'Customer & Vehicle',
      accessorKey: 'customerName',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customerName}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
            <Truck className="w-3 h-3 text-slate-400" />
            <span className="font-mono font-bold text-slate-700">{row.deliveryDetails?.vehicleNumber || 'Yard Pickup'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Line Items Dispatched',
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          {row.items.map((it, idx) => (
            <div key={idx}>
              <span className="font-semibold text-slate-900">{it.productName}:</span>{' '}
              <strong className="font-mono text-[#E53935]">{it.quantity.toLocaleString()} {it.unit}</strong> @ {formatINR(it.rate)}
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Grand Total & Due',
      accessorKey: 'grandTotal',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-mono font-black text-slate-900">{formatINR(row.grandTotal)}</div>
          <div className="text-[11px] mt-0.5">
            {row.pendingAmount > 0 ? (
              <span className="text-amber-700 font-semibold">
                Due: <strong>{formatINR(row.pendingAmount)}</strong>
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold">Fully Paid</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Payment Status',
      accessorKey: 'paymentStatus',
      cell: (row) => <StatusBadge status={row.paymentStatus} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link to="/invoices">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText className="w-3.5 h-3.5 text-[#E53935]" />}
              className="text-xs"
            >
              GST Invoice
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders & Dispatches"
        description="Record truck dispatches, calculate GST, deduct finished goods stock, and bill builder customers."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Commercial' },
          { label: 'Sales' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSaleForm(prev => ({
                ...prev,
                invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              }));
              setIsNewSaleModalOpen(true);
            }}
          >
            + New Sale Order & Dispatch
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Billed</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{formatINR(totalSalesRevenue)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total revenue generated</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Collected Receipts</span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{formatINR(totalReceived)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Paid via UPI / Bank / Cash</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Customer Dues</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">{formatINR(totalPending)}</div>
          <p className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-1 inline-block font-semibold">
            Receivables to collect
          </p>
        </div>
      </div>

      <DataTable
        data={sales}
        columns={columns}
        searchPlaceholder="Search sale by invoice number, customer, or truck..."
        searchKey="invoiceNumber"
        exportFileName="brick-sales-orders"
      />

      {/* NEW SALE ORDER MODAL */}
      <Modal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        title="Create Sale Order & Dispatch Gate Pass"
        description="Generates GST Tax Invoice and automatically deducts finished brick stock from yard."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSale} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Invoice Number"
                value={saleForm.invoiceNumber}
                onChange={e => setSaleForm({ ...saleForm, invoiceNumber: e.target.value })}
                required
                isRequired
              />
            </div>
            <div>
              <Input
                label="Dispatch Date"
                type="date"
                value={saleForm.saleDate}
                onChange={e => setSaleForm({ ...saleForm, saleDate: e.target.value })}
                required
                isRequired
              />
            </div>
            <div>
              <Select
                label="Customer / Buyer"
                value={saleForm.customerId}
                onChange={e => handleCustomerChange(e.target.value)}
                isRequired
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.customerName} ({c.companyName || 'Individual'})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <Select
                label="Brick Product"
                value={saleForm.productId}
                onChange={e => handleProductChange(e.target.value)}
                isRequired
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (In Stock: {p.currentStock.toLocaleString()} {p.unit})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <QuantityInput
                label="Quantity (Pcs)"
                unit="Pcs"
                value={saleForm.quantity}
                onChange={e => setSaleForm({ ...saleForm, quantity: Number(e.target.value) })}
                required
                isRequired
              />
            </div>
            <div>
              <CurrencyInput
                label="Rate per Pc (₹)"
                value={saleForm.rate}
                onChange={e => setSaleForm({ ...saleForm, rate: Number(e.target.value) })}
                required
                isRequired
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <CurrencyInput
                label="Discount (₹)"
                value={saleForm.discount}
                onChange={e => setSaleForm({ ...saleForm, discount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Select
                label="GST Tax Rate (%)"
                value={saleForm.taxPercent}
                onChange={e => setSaleForm({ ...saleForm, taxPercent: Number(e.target.value) })}
              >
                <option value={5}>5% (Clay Bricks / Special Concession)</option>
                <option value={12}>12% (Fly Ash Cement Bricks - Standard)</option>
                <option value={18}>18% (Paver Blocks & Heavy Precast)</option>
                <option value={0}>0% (Tax Exempted)</option>
              </Select>
            </div>
            <div>
              <CurrencyInput
                label="Advance / Paid Amount (₹)"
                value={saleForm.paidAmount}
                onChange={e => setSaleForm({ ...saleForm, paidAmount: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Real-time GST Calculation Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Item Subtotal ({saleForm.quantity.toLocaleString()} Pcs × ₹{saleForm.rate}):</span>
              <span className="font-mono font-bold">{formatINR(saleForm.quantity * saleForm.rate)}</span>
            </div>
            {saleForm.discount > 0 && (
              <div className="flex justify-between text-xs text-rose-600">
                <span>Discount:</span>
                <span className="font-mono font-bold">-{formatINR(saleForm.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-600">
              <span>GST ({saleForm.taxPercent}%):</span>
              <span className="font-mono font-bold">
                {formatINR(((saleForm.quantity * saleForm.rate - saleForm.discount) * saleForm.taxPercent) / 100)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
              <span>Invoice Grand Total:</span>
              <span className="font-mono text-[#E53935]">
                {formatINR((saleForm.quantity * saleForm.rate - saleForm.discount) * (1 + saleForm.taxPercent / 100))}
              </span>
            </div>
          </div>

          {/* Dispatch Truck & Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Truck Vehicle Number"
                placeholder="MH-12-DT-8821"
                value={saleForm.vehicleNumber}
                onChange={e => setSaleForm({ ...saleForm, vehicleNumber: e.target.value })}
                required
                isRequired
              />
            </div>
            <div>
              <Input
                label="Driver Name"
                value={saleForm.driverName}
                onChange={e => setSaleForm({ ...saleForm, driverName: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Driver Phone"
                value={saleForm.driverPhone}
                onChange={e => setSaleForm({ ...saleForm, driverPhone: e.target.value })}
              />
            </div>
          </div>

          <Input
            label="Destination Site Address"
            value={saleForm.destinationAddress}
            onChange={e => setSaleForm({ ...saleForm, destinationAddress: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsNewSaleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Generate GST Invoice & Dispatch
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
