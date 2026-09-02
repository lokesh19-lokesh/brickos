import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, RotateCcw, Users, Database, Download, 
  Upload, CheckCircle2, Factory, ShoppingCart, Layers, Shield 
} from 'lucide-react';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { productionService } from '@/services/productionService';
import { salesService } from '@/services/salesService';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Card';

export const AdminDemoPage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);

  const handleResetDatabase = () => {
    if (window.confirm('Reset database to clean initial factory seed data? Any temporary transactions will be refreshed.')) {
      dbStore.reset();
      toast.success('Database successfully reset to clean factory state!');
    }
  };

  const handleSwitchRole = async (role: any, label: string) => {
    await switchRole(role);
    toast.success(`Switched active persona to ${label}`);
    if (role === 'super_admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleGenerateBatches = async () => {
    try {
      setGenerating(true);
      const prods = dbStore.get('products');
      const curBatches = dbStore.get('productionBatches');
      const defaultProd = prods[0];

      for (let i = 1; i <= 5; i++) {
        await productionService.createBatch('fact_01', {
          batchCode: `BAT-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
          productionDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
          productId: defaultProd.id,
          productName: defaultProd.name,
          targetQuantity: 15000,
          outputQuantity: 14850,
          damagedQuantity: 150,
          unit: defaultProd.unit,
          machineLine: 'Automatic Hydraulic Line 1',
          kilnChamber: 'Yard Curing Area #2',
          supervisorName: 'Dinesh Patil',
          mixProportion: '1 Part Cement : 5 Parts Fly Ash : 3 Parts Stone Dust',
          workersCount: 14,
          startTime: '08:00 AM',
          endTime: '05:30 PM',
          status: 'completed',
          qualityGrade: 'A Grade',
          remarks: 'Auto-generated demo batch',
          materialsUsed: [
            { materialId: 'rm_01', materialName: 'Grade 53 OPC Cement', quantity: 42, unit: 'Bags' },
            { materialId: 'rm_02', materialName: 'Thermal Fly Ash', quantity: 9.5, unit: 'Ton' },
          ],
        });
      }

      toast.success('Generated 5 completed production batches! Stock updated.');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSales = async () => {
    try {
      setGenerating(true);
      const prods = dbStore.get('products');
      const custs = dbStore.get('customers');
      const defaultProd = prods[0];
      const defaultCust = custs[0];

      for (let i = 1; i <= 5; i++) {
        const qty = 5000;
        const rate = 4.8;
        const amount = qty * rate;
        const tax = (amount * 12) / 100;
        const grand = amount + tax;

        await salesService.createSale('fact_01', {
          invoiceNumber: `INV-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
          saleDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
          customerId: defaultCust.id,
          customerName: defaultCust.customerName,
          customerPhone: defaultCust.phone,
          customerGst: defaultCust.gstNumber,
          items: [
            {
              productId: defaultProd.id,
              productName: defaultProd.name,
              hsnCode: '681599',
              quantity: qty,
              unit: defaultProd.unit,
              rate: rate,
              discount: 0,
              taxPercent: 12,
              amount: amount,
            },
          ],
          subtotal: amount,
          discountTotal: 0,
          taxTotal: tax,
          grandTotal: grand,
          paidAmount: grand,
          paymentMode: 'bank_transfer',
          deliveryDetails: {
            vehicleNumber: `MH-12-TR-${1000 + i}`,
            driverName: 'Demo Driver',
            driverPhone: '+91 98000 00000',
            destinationAddress: 'Pune Construction Site',
          },
          notes: 'Auto-generated demo sale dispatch',
        });
      }

      toast.success('Generated 5 sales dispatches & GST invoices!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportJSON = () => {
    const json = dbStore.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brickflow-database-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Downloaded complete mock database JSON snapshot!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo Sandbox & Data Generator"
        description="Comprehensive developer & presentation toolbox for 1-click persona switching, mock database reset, and instant transaction simulation."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Demo Sandbox' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: 1-Click Persona Switcher */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Users className="w-5 h-5 text-[#E53935]" />
            <span>Instant Demo Persona Switcher</span>
          </div>
          <p className="text-xs text-slate-500">
            Switch your active account with 1 click to experience the app from different user perspectives without logging in and out.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={() => handleSwitchRole('factory_owner', 'Factory Owner')}
              className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                user?.role === 'factory_owner'
                  ? 'bg-[#FFEBEE] border-[#E53935] text-[#E53935]'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-bold text-xs">Factory Owner</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Full financial & P&L access</div>
            </button>

            <button
              onClick={() => handleSwitchRole('factory_manager', 'Plant Manager')}
              className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                user?.role === 'factory_manager'
                  ? 'bg-[#FFEBEE] border-[#E53935] text-[#E53935]'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-bold text-xs">Plant Manager</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Production, stock & labour</div>
            </button>

            <button
              onClick={() => handleSwitchRole('factory_user', 'Dispatch Operator')}
              className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                user?.role === 'factory_user'
                  ? 'bg-[#FFEBEE] border-[#E53935] text-[#E53935]'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-bold text-xs">Dispatch Clerk</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sales dispatches & gate passes</div>
            </button>

            <button
              onClick={() => handleSwitchRole('super_admin', 'Super Admin')}
              className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                user?.role === 'super_admin'
                  ? 'bg-[#FFEBEE] border-[#E53935] text-[#E53935]'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-bold text-xs">Super Admin</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Multi-tenant control plane</div>
            </button>
          </div>
        </div>

        {/* Card 2: 1-Click Database Reset */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>Reset Database to Clean State</span>
            </div>
            <p className="text-xs text-slate-500">
              Restores the default realistic factory data (Fly ash bricks, cement, suppliers, muster roll, and balanced accounts).
            </p>
          </div>

          <Button
            variant="danger"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={handleResetDatabase}
            className="w-full"
          >
            Reset All Mock Data to Default
          </Button>
        </div>

        {/* Card 3: Instant Transaction Generators */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Generate Demo Transactions</span>
          </div>
          <p className="text-xs text-slate-500">
            Instantly populate charts and ledgers with real batches and dispatches.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Factory className="w-4 h-4 text-[#E53935]" />}
              onClick={handleGenerateBatches}
              isLoading={generating}
              className="flex-1 text-xs"
            >
              +5 Production Batches
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<ShoppingCart className="w-4 h-4 text-emerald-600" />}
              onClick={handleGenerateSales}
              isLoading={generating}
              className="flex-1 text-xs"
            >
              +5 Sales Dispatches
            </Button>
          </div>
        </div>

        {/* Card 4: State JSON Export / Import */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Database className="w-5 h-5 text-emerald-600" />
              <span>Database Backup & Snapshot</span>
            </div>
            <p className="text-xs text-slate-500">
              Download complete localStorage database state as a portable JSON file.
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportJSON}
            className="w-full"
          >
            Download Database Snapshot JSON
          </Button>
        </div>
      </div>
    </div>
  );
};
