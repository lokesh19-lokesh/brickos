import React, { useState, useEffect } from 'react';
import { 
  Factory, Plus, Play, CheckCircle2, Clock, Eye, AlertCircle, 
  Layers, Package, Users, Settings2, Sparkles, Filter 
} from 'lucide-react';
import { productionService } from '@/services/productionService';
import { productService } from '@/services/productService';
import { rawMaterialService } from '@/services/rawMaterialService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ProductionBatch, Product, RawMaterial } from '@/types';
import { formatQuantity, formatDate, generateId } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, QuantityInput } from '@/components/ui/Input';
import { StatusBadge, Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const ProductionPage: React.FC = () => {
  const { factory } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Modals state
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // New Batch Form State
  const [batchForm, setBatchForm] = useState({
    productionDate: new Date().toISOString().split('T')[0],
    batchCode: `BAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    productId: '',
    targetQuantity: 15000,
    outputQuantity: 14800,
    damagedQuantity: 200,
    unit: 'Pcs',
    machineLine: 'Automatic Hydraulic Line 1',
    kilnChamber: 'Yard Curing Area #2',
    supervisorName: 'Dinesh Patil',
    mixProportion: '1 Part Cement : 5 Parts Fly Ash : 3 Parts Stone Dust',
    workersCount: 14,
    startTime: '08:00 AM',
    endTime: '05:30 PM',
    status: 'completed' as ProductionBatch['status'],
    qualityGrade: 'A Grade' as ProductionBatch['qualityGrade'],
    remarks: 'High compression strength achieved. Automated curing initiated.',
    materialsUsed: [
      { materialId: '', materialName: 'Grade 53 OPC Cement', quantity: 42, unit: 'Bags' },
      { materialId: '', materialName: 'Thermal Fly Ash', quantity: 9.5, unit: 'Ton' },
      { materialId: '', materialName: 'Crushed Stone Dust', quantity: 6.2, unit: 'Ton' },
    ],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [bList, pList, rmList] = await Promise.all([
        productionService.getBatches(factoryId),
        productService.getProducts(factoryId),
        rawMaterialService.getRawMaterials(factoryId),
      ]);
      setBatches(bList);
      setProducts(pList);
      setRawMaterials(rmList);

      if (pList.length > 0 && !batchForm.productId) {
        setBatchForm(prev => ({
          ...prev,
          productId: pList[0].id,
          unit: pList[0].unit,
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

  const handleOpenNewBatch = () => {
    if (products.length === 0) {
      toast.error('Please create at least one finished brick product master first.');
      return;
    }
    const defaultProduct = products[0];

    // Pre-match raw materials for BOM
    const cement = rawMaterials.find(r => r.name.toLowerCase().includes('cement')) || rawMaterials[0];
    const flyAsh = rawMaterials.find(r => r.name.toLowerCase().includes('fly')) || rawMaterials[1];
    const dust = rawMaterials.find(r => r.name.toLowerCase().includes('dust') || r.name.toLowerCase().includes('sand')) || rawMaterials[2];

    const materialsUsed = [
      cement ? { materialId: cement.id, materialName: cement.name, quantity: 42, unit: cement.unit } : null,
      flyAsh ? { materialId: flyAsh.id, materialName: flyAsh.name, quantity: 9.5, unit: flyAsh.unit } : null,
      dust ? { materialId: dust.id, materialName: dust.name, quantity: 6.5, unit: dust.unit } : null,
    ].filter(Boolean) as any[];

    setBatchForm({
      productionDate: new Date().toISOString().split('T')[0],
      batchCode: `BAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: defaultProduct.id,
      targetQuantity: 15000,
      outputQuantity: 14750,
      damagedQuantity: 250,
      unit: defaultProduct.unit,
      machineLine: 'Automatic Hydraulic Line 1',
      kilnChamber: 'Yard Curing Area #2',
      supervisorName: 'Dinesh Patil',
      mixProportion: '1 Part Cement : 5 Parts Fly Ash : 3 Parts Stone Dust',
      workersCount: 12,
      startTime: '08:00 AM',
      endTime: '05:30 PM',
      status: 'completed',
      qualityGrade: 'A Grade',
      remarks: 'Smooth edge finish, standard compression achieved.',
      materialsUsed,
    });
    setIsNewBatchModalOpen(true);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prod = products.find(p => p.id === batchForm.productId);
      if (!prod) {
        toast.error('Select a valid product');
        return;
      }

      await productionService.createBatch(factoryId, {
        batchCode: batchForm.batchCode,
        productionDate: batchForm.productionDate,
        productId: prod.id,
        productName: prod.name,
        targetQuantity: Number(batchForm.targetQuantity),
        outputQuantity: Number(batchForm.outputQuantity),
        damagedQuantity: Number(batchForm.damagedQuantity),
        unit: prod.unit,
        machineLine: batchForm.machineLine,
        kilnChamber: batchForm.kilnChamber,
        supervisorName: batchForm.supervisorName,
        mixProportion: batchForm.mixProportion,
        materialsUsed: batchForm.materialsUsed,
        workersCount: Number(batchForm.workersCount),
        startTime: batchForm.startTime,
        endTime: batchForm.endTime,
        status: batchForm.status,
        qualityGrade: batchForm.qualityGrade,
        remarks: batchForm.remarks,
      });

      toast.success(`Batch ${batchForm.batchCode} recorded! Stock & raw materials updated.`);
      setIsNewBatchModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error recording batch');
    }
  };

  const handleUpdateStatus = async (batchId: string, status: ProductionBatch['status']) => {
    try {
      await productionService.updateBatchStatus(batchId, status);
      toast.success(`Batch status updated to ${status}`);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const columns: Column<ProductionBatch>[] = [
    {
      header: 'Batch & Date',
      accessorKey: 'batchCode',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{row.batchCode}</div>
          <div className="text-xs text-slate-500 mt-0.5">{formatDate(row.productionDate)}</div>
        </div>
      ),
    },
    {
      header: 'Product & Grade',
      accessorKey: 'productName',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.productName}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">{row.qualityGrade}</span>
            <span>•</span>
            <span>{row.mixProportion}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Output & Scrap',
      accessorKey: 'outputQuantity',
      sortable: true,
      cell: (row) => {
        const efficiency = row.targetQuantity > 0 ? ((row.outputQuantity / row.targetQuantity) * 100).toFixed(1) : '100';
        return (
          <div>
            <div className="font-mono font-black text-slate-900 text-sm">
              {row.outputQuantity.toLocaleString()} {row.unit}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Scrap: <strong className="text-rose-600">{row.damagedQuantity}</strong> • Eff: <strong className="text-emerald-600">{efficiency}%</strong>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Machine & Kiln Chamber',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.machineLine}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{row.kilnChamber || 'Open Stacking'}</div>
        </div>
      ),
    },
    {
      header: 'Supervisor & Crew',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900 text-xs">{row.supervisorName}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{row.workersCount} Workers • {row.startTime} - {row.endTime}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBatch(row);
              setDetailModalOpen(true);
            }}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            BOM Detail
          </Button>
        </div>
      ),
    },
  ];

  const filterTabs = [
    { label: 'All Batches', value: 'all', count: batches.length },
    { label: 'Completed', value: 'completed', count: batches.filter(b => b.status === 'completed').length },
    { label: 'Curing / Firing', value: 'curing', count: batches.filter(b => b.status === 'curing').length },
    { label: 'In Progress', value: 'in_progress', count: batches.filter(b => b.status === 'in_progress').length },
  ];

  const filterFn = (batch: ProductionBatch, tab: string) => {
    return batch.status === tab;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Batch Management"
        description="Log daily manufacturing runs, machine output, kiln curing cycles, and automated BOM raw material deductions."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Operations' },
          { label: 'Production' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenNewBatch}
          >
            + New Production Batch
          </Button>
        }
      />

      <DataTable
        data={batches}
        columns={columns}
        searchPlaceholder="Search by batch code, product, supervisor, or machine..."
        searchKey="batchCode"
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filterFn={filterFn}
        exportFileName="production-batches"
      />

      {/* NEW BATCH ENTRY MODAL */}
      <Modal
        isOpen={isNewBatchModalOpen}
        onClose={() => setIsNewBatchModalOpen(false)}
        title="Record New Production Batch"
        description="Enter output numbers and verify automated raw material consumption."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateBatch} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Production Date"
                type="date"
                value={batchForm.productionDate}
                onChange={e => setBatchForm({ ...batchForm, productionDate: e.target.value })}
                required
                isRequired
              />
            </div>
            <div>
              <Input
                label="Batch Code"
                value={batchForm.batchCode}
                onChange={e => setBatchForm({ ...batchForm, batchCode: e.target.value })}
                required
                isRequired
              />
            </div>
            <div>
              <Select
                label="Finished Brick Product"
                value={batchForm.productId}
                onChange={e => {
                  const p = products.find(prod => prod.id === e.target.value);
                  setBatchForm({
                    ...batchForm,
                    productId: e.target.value,
                    unit: p?.unit || 'Pcs',
                  });
                }}
                isRequired
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuantityInput
              label="Target Output"
              unit={batchForm.unit}
              value={batchForm.targetQuantity}
              onChange={e => setBatchForm({ ...batchForm, targetQuantity: Number(e.target.value) })}
              required
              isRequired
            />
            <QuantityInput
              label="Actual Good Output"
              unit={batchForm.unit}
              value={batchForm.outputQuantity}
              onChange={e => setBatchForm({ ...batchForm, outputQuantity: Number(e.target.value) })}
              required
              isRequired
            />
            <QuantityInput
              label="Damage / Scrap"
              unit={batchForm.unit}
              value={batchForm.damagedQuantity}
              onChange={e => setBatchForm({ ...batchForm, damagedQuantity: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Machine Line"
              placeholder="Automatic Hydraulic Line 1"
              value={batchForm.machineLine}
              onChange={e => setBatchForm({ ...batchForm, machineLine: e.target.value })}
              required
              isRequired
            />
            <Input
              label="Kiln Chamber / Curing Yard"
              placeholder="Chamber #4 or Yard Curing Area #2"
              value={batchForm.kilnChamber}
              onChange={e => setBatchForm({ ...batchForm, kilnChamber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Supervisor / Operator"
                value={batchForm.supervisorName}
                onChange={e => setBatchForm({ ...batchForm, supervisorName: e.target.value })}
                required
                isRequired
              />
            </div>
            <div>
              <Input
                label="Worker Crew Count"
                type="number"
                value={batchForm.workersCount}
                onChange={e => setBatchForm({ ...batchForm, workersCount: Number(e.target.value) })}
                required
                isRequired
              />
            </div>
            <div>
              <Select
                label="Quality Grade"
                value={batchForm.qualityGrade}
                onChange={e => setBatchForm({ ...batchForm, qualityGrade: e.target.value as any })}
              >
                <option value="A Grade">A Grade (Commercial First)</option>
                <option value="B Grade">B Grade (Standard)</option>
                <option value="Commercial">Commercial Partition</option>
                <option value="Scrap">Scrap / Recycled</option>
              </Select>
            </div>
          </div>

          {/* BOM RAW MATERIALS AUTO CONSUMPTION CALCULATOR */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#E53935]" />
                Automated Raw Material Consumption (BOM)
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Deducted from stock upon save</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {batchForm.materialsUsed.map((mat, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{mat.materialName}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      value={mat.quantity}
                      onChange={e => {
                        const updated = [...batchForm.materialsUsed];
                        updated[idx].quantity = Number(e.target.value);
                        setBatchForm({ ...batchForm, materialsUsed: updated });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                    />
                    <span className="text-xs font-semibold text-slate-500">{mat.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Production Status"
              value={batchForm.status}
              onChange={e => setBatchForm({ ...batchForm, status: e.target.value as any })}
            >
              <option value="completed">Completed (Stock Transferred to Yard)</option>
              <option value="curing">Curing / Water Sprinkling</option>
              <option value="in_progress">In-Progress</option>
              <option value="draft">Draft</option>
            </Select>
            <Input
              label="Mix Proportions & Notes"
              value={batchForm.mixProportion}
              onChange={e => setBatchForm({ ...batchForm, mixProportion: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsNewBatchModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Record Batch & Update Inventory
            </Button>
          </div>
        </form>
      </Modal>

      {/* BATCH DETAIL MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Batch ${selectedBatch?.batchCode}`}
        description="Detailed manufacturing breakdown and material consumption receipt."
        maxWidth="lg"
      >
        {selectedBatch && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Product</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedBatch.productName}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Good Output</span>
                <div className="text-base font-black text-emerald-600 font-mono mt-0.5">
                  {selectedBatch.outputQuantity.toLocaleString()} {selectedBatch.unit}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Machine</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedBatch.machineLine}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                <div className="mt-1"><StatusBadge status={selectedBatch.status} /></div>
              </div>
            </div>

            {/* Consumed Materials Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Raw Material Consumption (BOM)</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="p-2.5">Material</th>
                      <th className="p-2.5 text-right">Quantity Consumed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedBatch.materialsUsed.map((m, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-semibold text-slate-900">{m.materialName}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#E53935]">
                          {m.quantity} {m.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">Supervisor Notes:</div>
              <p className="text-slate-600">{selectedBatch.remarks || 'No additional remarks.'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
