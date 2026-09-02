import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, CheckCircle2, AlertTriangle, 
  Calendar, RefreshCw, ArrowUpRight, ShieldCheck 
} from 'lucide-react';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Factory, SubscriptionPlan } from '@/types';
import { formatINR, formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Input';
import { StatusBadge, Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const AdminSubscriptionsPage: React.FC = () => {
  const { toast } = useToast();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Upgrade Plan Modal
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [newPlan, setNewPlan] = useState<'starter' | 'growth' | 'enterprise'>('growth');

  const loadData = () => {
    setFactories(dbStore.get('factories'));
    setPlans(dbStore.get('plans'));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsub = dbStore.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  const handleOpenUpgrade = (f: Factory) => {
    setSelectedFactory(f);
    setNewPlan(f.subscriptionPlan || 'growth');
    setIsUpgradeModalOpen(true);
  };

  const handleSaveUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactory) return;

    const cur = dbStore.get('factories');
    const updated = cur.map(f => {
      if (f.id === selectedFactory.id) {
        return {
          ...f,
          subscriptionPlan: newPlan,
          subscriptionExpiresAt: '2027-12-31T23:59:59Z',
          updatedAt: new Date().toISOString(),
        };
      }
      return f;
    });

    dbStore.set('factories', updated);
    toast.success(`Updated ${selectedFactory.name} to ${newPlan.toUpperCase()} plan!`);
    setIsUpgradeModalOpen(false);
  };

  const columns: Column<Factory>[] = [
    {
      header: 'Factory & Owner',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{row.ownerName} • {row.code}</div>
        </div>
      ),
    },
    {
      header: 'Active Plan',
      accessorKey: 'subscriptionPlan',
      cell: (row) => (
        <span className="font-extrabold text-xs text-[#E53935] uppercase bg-[#FFEBEE] px-2 py-0.5 rounded">
          {row.subscriptionPlan} Plan
        </span>
      ),
    },
    {
      header: 'Billing Cycle & Renewal',
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold text-slate-900">Annual Commercial License</div>
          <div className="text-[11px] text-slate-500">Renews on: {formatDate(row.subscriptionExpiresAt)}</div>
        </div>
      ),
    },
    {
      header: 'Subscription Status',
      accessorKey: 'subscriptionStatus',
      cell: (row) => <StatusBadge status={row.subscriptionStatus} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenUpgrade(row)}
          className="text-xs"
        >
          Change Plan
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SaaS Subscriptions & Licenses"
        description="Monitor active commercial SaaS licenses, plan upgrades, recurring billing cycles, and automated expiration dates."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Subscriptions' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Paid Licenses</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{factories.length} Licenses</div>
          <p className="text-[11px] text-slate-500 mt-1">Multi-tenant factories</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Recurring Revenue</span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{formatINR(7499)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Direct SaaS billing</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan Distribution</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">Enterprise: 100%</div>
          <p className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block font-semibold">
            All features unlocked
          </p>
        </div>
      </div>

      <DataTable
        data={factories}
        columns={columns}
        searchPlaceholder="Search subscriptions by factory name..."
        searchKey="name"
        exportFileName="brickflow-saas-subscriptions"
      />

      {/* UPGRADE PLAN MODAL */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title={`Modify Subscription: ${selectedFactory?.name}`}
        description="Upgrade, downgrade or extend SaaS license validity."
        maxWidth="md"
      >
        <form onSubmit={handleSaveUpgrade} className="space-y-4">
          <Select
            label="Select Subscription Tier"
            value={newPlan}
            onChange={e => setNewPlan(e.target.value as any)}
            isRequired
          >
            <option value="starter">Starter Plan (₹2,999/month)</option>
            <option value="growth">Growth Plan (₹5,999/month)</option>
            <option value="enterprise">Enterprise Unlimited (₹11,999/month)</option>
          </Select>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-900">Included in {newPlan.toUpperCase()}:</div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Up to 15 concurrent machine operators and supervisors</li>
              <li>GST Invoices with WhatsApp QR settlements</li>
              <li>Live Stock & BOM auto deduction</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsUpgradeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Apply Plan Change
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
