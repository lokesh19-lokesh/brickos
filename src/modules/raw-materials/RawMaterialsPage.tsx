import React, { useState, useEffect } from 'react';
import { 
  Layers, Plus, ShoppingCart, Truck, AlertTriangle, Eye, 
  CheckCircle2, FileText, ArrowUpRight, ArrowDownRight, Clock, Users 
} from 'lucide-react';
import { rawMaterialService } from '@/services/rawMaterialService';
import { vendorService } from '@/services/customerService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { RawMaterial, RawMaterialPurchase, Vendor } from '@/types';
import { formatINR, formatQuantity, formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, CurrencyInput, QuantityInput } from '@/components/ui/Input';
import { StatusBadge, Badge } from '@/components/ui/Card';
import { PageHeader, Alert } from '@/components/ui/PageHeader';

export const RawMaterialsPage: React.FC = () => {
  const { factory } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [purchases, setPurchases] = useState<RawMaterialPurchase[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'purchases'>('inventory');

  // Modals state
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMaterialAnalytics, setSelectedMaterialAnalytics] = useState<any>(null);

  // New Purchase Form State
  const [purchaseForm, setPurchaseForm] = useState({
    purchaseDate: new Date().toISOString().split('T')[0],
    materialId: '',
    quantity: 300,
    unit: 'Bags',
    vendorId: '',
    vendorPhone: '',
    truckNumber: 'MH-12-Q-9944',
    driverName: 'Sanjay Yadav',
    driverPhone: '+91 97654 32100',
    rate: 345,
    paidAmount: 70000,
    paymentMode: 'bank_transfer' as RawMaterialPurchase['paymentMode'],
    notes: 'Delivered to Plant Shed #1',
  });

  // New Material Form State
  const [materialForm, setMaterialForm] = useState({
    name: '',
    code: `RM-${Math.floor(100 + Math.random() * 900)}`,
    unit: 'Ton' as RawMaterial['unit'],
    minimumStock: 30,
    currentStock: 50,
    averageUnitCost: 500,
    status: 'active' as RawMaterial['status'],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [mats, purs, vens] = await Promise.all([
        rawMaterialService.getRawMaterials(factoryId),
        rawMaterialService.getPurchases(factoryId),
        vendorService.getVendors(factoryId),
      ]);
      setMaterials(mats);
      setPurchases(purs);
      setVendors(vens);

      if (mats.length > 0 && !purchaseForm.materialId) {
        setPurchaseForm(prev => ({
          ...prev,
          materialId: mats[0].id,
          unit: mats[0].unit,
        }));
      }
      if (vens.length > 0 && !purchaseForm.vendorId) {
        setPurchaseForm(prev => ({
          ...prev,
          vendorId: vens[0].id,
          vendorPhone: vens[0].phone,
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

  const handleOpenPurchaseModal = () => {
    if (materials.length === 0) {
      toast.error('Please create at least one raw material master first.');
      return;
    }
    const defaultMat = materials[0];
    const defaultVen = vendors[0];
    setPurchaseForm({
      purchaseDate: new Date().toISOString().split('T')[0],
      materialId: defaultMat?.id || '',
      quantity: 100,
      unit: defaultMat?.unit || 'Ton',
      vendorId: defaultVen?.id || '',
      vendorPhone: defaultVen?.phone || '',
      truckNumber: `MH-12-TR-${Math.floor(1000 + Math.random() * 9000)}`,
      driverName: 'Driver Name',
      driverPhone: '+91 98000 00000',
      rate: defaultMat?.averageUnitCost || 500,
      paidAmount: 0,
      paymentMode: 'upi',
      notes: 'Direct factory delivery',
    });
    setIsPurchaseModalOpen(true);
  };

  const handleMaterialSelect = (matId: string) => {
    const mat = materials.find(m => m.id === matId);
    if (mat) {
      setPurchaseForm(prev => ({
        ...prev,
        materialId: mat.id,
        unit: mat.unit,
        rate: mat.averageUnitCost,
      }));
    }
  };

  const handleVendorSelect = (venId: string) => {
    const ven = vendors.find(v => v.id === venId);
    if (ven) {
      setPurchaseForm(prev => ({
        ...prev,
        vendorId: ven.id,
        vendorPhone: ven.phone,
      }));
    }
  };

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mat = materials.find(m => m.id === purchaseForm.materialId);
      const ven = vendors.find(v => v.id === purchaseForm.vendorId);
      if (!mat || !ven) {
        toast.error('Please select valid material and vendor');
        return;
      }

      const totalAmount = purchaseForm.quantity * purchaseForm.rate;

      await rawMaterialService.createPurchase(factoryId, {
        purchaseDate: purchaseForm.purchaseDate,
        materialId: mat.id,
        materialName: mat.name,
        quantity: Number(purchaseForm.quantity),
        unit: mat.unit,
        vendorId: ven.id,
        vendorName: ven.vendorName,
        vendorPhone: purchaseForm.vendorPhone || ven.phone,
        truckNumber: purchaseForm.truckNumber,
        driverName: purchaseForm.driverName,
        driverPhone: purchaseForm.driverPhone,
        rate: Number(purchaseForm.rate),
        totalAmount,
        paidAmount: Number(purchaseForm.paidAmount),
        paymentMode: purchaseForm.paymentMode,
        notes: purchaseForm.notes,
      });

      toast.success(`Recorded purchase PO of ${purchaseForm.quantity} ${mat.unit} ${mat.name}`);
      setIsPurchaseModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error recording purchase');
    }
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rawMaterialService.createRawMaterial(factoryId, {
        name: materialForm.name,
        code: materialForm.code,
        unit: materialForm.unit,
        minimumStock: Number(materialForm.minimumStock),
        currentStock: Number(materialForm.currentStock),
        averageUnitCost: Number(materialForm.averageUnitCost),
        status: materialForm.status,
      });
      toast.success(`Created material ${materialForm.name}`);
      setIsMaterialModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error creating material');
    }
  };

  const handleViewMaterialDetail = async (mat: RawMaterial) => {
    const analytics = await rawMaterialService.getMaterialAnalytics(mat.id);
    setSelectedMaterialAnalytics(analytics);
    setDetailModalOpen(true);
  };

  // Columns for Inventory Master
  const inventoryColumns: Column<RawMaterial>[] = [
    {
      header: 'Material Name & Code',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">{row.code}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Unit',
      accessorKey: 'unit',
      cell: (row) => <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">{row.unit}</span>,
    },
    {
      header: 'Current Stock',
      accessorKey: 'currentStock',
      sortable: true,
      cell: (row) => {
        const isLow = row.currentStock <= row.minimumStock;
        return (
          <div>
            <div className="font-mono font-black text-slate-900 text-sm">
              {formatQuantity(row.currentStock, row.unit)}
            </div>
            <div className="text-[11px] mt-0.5">
              {isLow ? (
                <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                  Low Stock (Min: {formatQuantity(row.minimumStock, row.unit)})
                </span>
              ) : (
                <span className="text-slate-400">Min: {formatQuantity(row.minimumStock, row.unit)}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Valuation & Avg Rate',
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">
            {formatINR(row.currentStock * row.averageUnitCost)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Avg: {formatINR(row.averageUnitCost)} / {row.unit}
          </div>
        </div>
      ),
    },
    {
      header: 'Purchased vs Consumed',
      cell: (row) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <div>In: <strong className="text-emerald-700">{row.totalPurchased}</strong> {row.unit}</div>
          <div>Used: <strong className="text-slate-700">{row.totalConsumed}</strong> {row.unit}</div>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewMaterialDetail(row)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Ledger
        </Button>
      ),
    },
  ];

  // Columns for Purchases POs
  const purchaseColumns: Column<RawMaterialPurchase>[] = [
    {
      header: 'Date & Truck No.',
      accessorKey: 'purchaseDate',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{formatDate(row.purchaseDate)}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <Truck className="w-3 h-3 text-slate-400" />
            <span className="font-mono font-bold text-slate-700">{row.truckNumber}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Material & Quantity',
      accessorKey: 'materialName',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.materialName}</div>
          <div className="font-mono font-bold text-[#E53935] text-xs mt-0.5">
            {row.quantity} {row.unit} @ {formatINR(row.rate)}/{row.unit}
          </div>
        </div>
      ),
    },
    {
      header: 'Vendor & Driver',
      accessorKey: 'vendorName',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.vendorName}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{row.driverName || 'Direct Delivery'} ({row.driverPhone || row.vendorPhone})</div>
        </div>
      ),
    },
    {
      header: 'Total & Pending Amount',
      sortable: true,
      accessorKey: 'totalAmount',
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{formatINR(row.totalAmount)}</div>
          <div className="text-[11px] mt-0.5">
            {row.pendingAmount > 0 ? (
              <span className="text-amber-700 font-semibold">
                Paid: {formatINR(row.paidAmount)} • Pending: <strong>{formatINR(row.pendingAmount)}</strong>
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold">Fully Cleared</span>
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw Material Management"
        description="Procure cement, fly ash, sand, stone dust and track truck loadings and vendor payments."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Operations' },
          { label: 'Raw Materials' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsMaterialModalOpen(true)}
            >
              + New Material
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<ShoppingCart className="w-4 h-4" />}
              onClick={handleOpenPurchaseModal}
            >
              + Record Purchase PO
            </Button>
          </div>
        }
      />

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[#E53935] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Inventory Stock Masters ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'purchases'
              ? 'bg-[#E53935] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Purchase PO Receipts & Inward Truck Logs ({purchases.length})
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <DataTable
          data={materials}
          columns={inventoryColumns}
          searchPlaceholder="Search material by name or code..."
          searchKey="name"
          exportFileName="raw-materials-inventory"
        />
      ) : (
        <DataTable
          data={purchases}
          columns={purchaseColumns}
          searchPlaceholder="Search purchase by truck no, material, or vendor..."
          searchKey="truckNumber"
          exportFileName="raw-materials-purchases"
        />
      )}

      {/* RECORD PURCHASE MODAL */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Record Raw Material Purchase PO"
        description="Add inward truck delivery, vendor billing, and partial payment details."
        maxWidth="lg"
      >
        <form onSubmit={handleSavePurchase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Purchase Date"
              type="date"
              value={purchaseForm.purchaseDate}
              onChange={e => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
              required
              isRequired
            />
            <Select
              label="Raw Material"
              value={purchaseForm.materialId}
              onChange={e => handleMaterialSelect(e.target.value)}
              isRequired
            >
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.unit})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuantityInput
              label="Quantity Received"
              unit={purchaseForm.unit}
              value={purchaseForm.quantity}
              onChange={e => setPurchaseForm({ ...purchaseForm, quantity: Number(e.target.value) })}
              required
              isRequired
            />
            <CurrencyInput
              label={`Rate per ${purchaseForm.unit} (₹)`}
              value={purchaseForm.rate}
              onChange={e => setPurchaseForm({ ...purchaseForm, rate: Number(e.target.value) })}
              required
              isRequired
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Vendor / Supplier"
              value={purchaseForm.vendorId}
              onChange={e => handleVendorSelect(e.target.value)}
              isRequired
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vendorName} ({v.company})
                </option>
              ))}
            </Select>
            <Input
              label="Vendor Phone"
              value={purchaseForm.vendorPhone}
              onChange={e => setPurchaseForm({ ...purchaseForm, vendorPhone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Truck Number"
                placeholder="MH-12-Q-9944"
                value={purchaseForm.truckNumber}
                onChange={e => setPurchaseForm({ ...purchaseForm, truckNumber: e.target.value })}
                required
                isRequired
              />
            </div>
            <div>
              <Input
                label="Driver Name"
                placeholder="Sanjay Yadav"
                value={purchaseForm.driverName}
                onChange={e => setPurchaseForm({ ...purchaseForm, driverName: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Driver Phone"
                placeholder="+91 97654 32100"
                value={purchaseForm.driverPhone}
                onChange={e => setPurchaseForm({ ...purchaseForm, driverPhone: e.target.value })}
              />
            </div>
          </div>

          {/* Amount Calculation Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Total Purchase Amount:</span>
              <span className="font-mono text-sm text-slate-900">{formatINR(purchaseForm.quantity * purchaseForm.rate)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <CurrencyInput
                label="Paid Amount (Advance/On Unload)"
                value={purchaseForm.paidAmount}
                onChange={e => setPurchaseForm({ ...purchaseForm, paidAmount: Number(e.target.value) })}
              />
              <Select
                label="Payment Mode"
                value={purchaseForm.paymentMode}
                onChange={e => setPurchaseForm({ ...purchaseForm, paymentMode: e.target.value as any })}
              >
                <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="upi">UPI / GPay / PhonePe</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
              </Select>
            </div>

            <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-200">
              <span className="text-amber-700">Pending Balance Added to Vendor Ledger:</span>
              <span className="font-mono text-sm text-amber-700">
                {formatINR(Math.max(0, (purchaseForm.quantity * purchaseForm.rate) - purchaseForm.paidAmount))}
              </span>
            </div>
          </div>

          <Input
            label="Notes / Challan Ref"
            placeholder="e.g. Weighbridge Slip #44910"
            value={purchaseForm.notes}
            onChange={e => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsPurchaseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save Purchase PO
            </Button>
          </div>
        </form>
      </Modal>

      {/* CREATE MATERIAL MASTER MODAL */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title="Add New Raw Material Master"
        description="Configure unit of measure, minimum reorder point, and opening inventory."
        maxWidth="md"
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4">
          <Input
            label="Material Name"
            placeholder="e.g. Calcined Gypsum Powder"
            value={materialForm.name}
            onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })}
            required
            isRequired
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Material Code"
              placeholder="e.g. RM-GYP"
              value={materialForm.code}
              onChange={e => setMaterialForm({ ...materialForm, code: e.target.value })}
              required
              isRequired
            />
            <Select
              label="Unit"
              value={materialForm.unit}
              onChange={e => setMaterialForm({ ...materialForm, unit: e.target.value as any })}
            >
              <option value="Ton">Ton</option>
              <option value="Bags">Bags</option>
              <option value="Cubic Meter">Cubic Meter</option>
              <option value="Brass">Brass</option>
              <option value="Kg">Kg</option>
              <option value="Liters">Liters</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <QuantityInput
              label="Minimum Reorder Threshold"
              unit={materialForm.unit}
              value={materialForm.minimumStock}
              onChange={e => setMaterialForm({ ...materialForm, minimumStock: Number(e.target.value) })}
              required
              isRequired
            />
            <QuantityInput
              label="Initial Opening Stock"
              unit={materialForm.unit}
              value={materialForm.currentStock}
              onChange={e => setMaterialForm({ ...materialForm, currentStock: Number(e.target.value) })}
            />
          </div>

          <CurrencyInput
            label={`Average Unit Cost per ${materialForm.unit} (₹)`}
            value={materialForm.averageUnitCost}
            onChange={e => setMaterialForm({ ...materialForm, averageUnitCost: Number(e.target.value) })}
            required
            isRequired
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsMaterialModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Create Material Master
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAIL VIEW MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedMaterialAnalytics?.material.name}
        description="Comprehensive inventory velocity, consumption in production batches, and purchase history."
        maxWidth="2xl"
      >
        {selectedMaterialAnalytics && (
          <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Stock</span>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {formatQuantity(selectedMaterialAnalytics.material.currentStock, selectedMaterialAnalytics.material.unit)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stock Valuation</span>
                <div className="text-lg font-black text-emerald-600 font-mono">
                  {formatINR(selectedMaterialAnalytics.currentValue)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Inward</span>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {formatQuantity(selectedMaterialAnalytics.material.totalPurchased, selectedMaterialAnalytics.material.unit)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Consumed</span>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {formatQuantity(selectedMaterialAnalytics.material.totalConsumed, selectedMaterialAnalytics.material.unit)}
                </div>
              </div>
            </div>

            {/* Consumption History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Production Batch Consumption Log</h4>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Batch Code</th>
                      <th className="p-2.5">Finished Product</th>
                      <th className="p-2.5 text-right">Quantity Consumed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedMaterialAnalytics.consumptionHistory.length > 0 ? (
                      selectedMaterialAnalytics.consumptionHistory.map((c: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2.5">{formatDate(c.date)}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{c.batchCode}</td>
                          <td className="p-2.5">{c.productName}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-[#E53935]">
                            -{c.quantity} {c.unit}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 text-xs">
                          No production batch consumption recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
