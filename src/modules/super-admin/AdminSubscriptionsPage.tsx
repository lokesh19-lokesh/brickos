import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle2, AlertTriangle, XCircle,
  Calendar, RefreshCw, PowerOff, Power
} from 'lucide-react';
import { dbStore } from '@/services/mockDatabase';
import { superAdminService } from '@/services/reportService';
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

  // Inactivate Confirm Modal
  const [isInactivateModalOpen, setIsInactivateModalOpen] = useState(false);
  const [inactivateFactory, setInactivateFactory] = useState<Factory | null>(null);
  const [inactivateAction, setInactivateAction] = useState<'suspend' | 'activate'>('suspend');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  const handleOpenInactivate = (f: Factory, action: 'suspend' | 'activate') => {
    setInactivateFactory(f);
    setInactivateAction(action);
    setIsInactivateModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!inactivateFactory) return;
    try {
      setIsUpdatingStatus(true);
      const newStatus = inactivateAction === 'suspend' ? 'suspended' : 'active';
      await superAdminService.updateFactoryStatus(inactivateFactory.id, newStatus);
      
      if (inactivateAction === 'suspend') {
        toast.warning(`Subscription for ${inactivateFactory.name} has been suspended.`);
      } else {
        toast.success(`Subscription for ${inactivateFactory.name} has been reactivated!`);
      }
      setIsInactivateModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update subscription status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Dynamic KPI calculations from real data
  const activeCount = factories.filter(f => f.subscriptionStatus === 'active').length;
  const suspendedCount = factories.filter(f => f.subscriptionStatus === 'suspended' || f.subscriptionStatus === 'cancelled').length;
  const trialCount = factories.filter(f => f.subscriptionStatus === 'trial').length;
  const totalMrr = factories.reduce((acc, f) => {
    if (f.subscriptionStatus !== 'active') return acc;
    const plan = plans.find(p => p.id === f.planId);
    return acc + (plan ? plan.price : 7499);
  }, 0);

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
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenUpgrade(row)}
            className="text-xs"
          >
            Change Plan
          </Button>
          {row.subscriptionStatus === 'suspended' || row.subscriptionStatus === 'cancelled' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenInactivate(row, 'activate')}
              className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              leftIcon={<Power className="w-3 h-3" />}
            >
              Reactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenInactivate(row, 'suspend')}
              className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
              leftIcon={<PowerOff className="w-3 h-3" />}
            >
              Suspend
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SaaS Subscriptions & Licenses"
        description="Monitor active commercial SaaS licenses, plan upgrades, recurring billing cycles, suspend or reactivate subscriptions."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Subscriptions' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Licenses</span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{activeCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Paid & active tenants</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trial Tenants</span>
          <div className="text-2xl font-black text-amber-500 font-mono mt-1">{trialCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Onboarding phase</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suspended / Inactive</span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">{suspendedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Paused or cancelled</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Recurring Rev.</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {totalMrr > 0 ? formatINR(totalMrr) : formatINR(7499)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Direct SaaS billing</p>
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

      {/* INACTIVATE / REACTIVATE CONFIRM MODAL */}
      <Modal
        isOpen={isInactivateModalOpen}
        onClose={() => setIsInactivateModalOpen(false)}
        title={inactivateAction === 'suspend' ? `Suspend Subscription: ${inactivateFactory?.name}` : `Reactivate Subscription: ${inactivateFactory?.name}`}
        description={
          inactivateAction === 'suspend'
            ? 'Suspending will immediately lock the factory tenant out of the ERP system.'
            : 'Reactivating will restore full ERP access for this factory tenant.'
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          {inactivateAction === 'suspend' ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-800">Warning: This will suspend the subscription</p>
                <p className="text-xs text-rose-700 mt-1">
                  The factory <strong>{inactivateFactory?.name}</strong> will lose access to the BrickFlow ERP platform. 
                  All their data will be preserved and can be restored by reactivating the subscription.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Reactivate factory subscription</p>
                <p className="text-xs text-emerald-700 mt-1">
                  The factory <strong>{inactivateFactory?.name}</strong> will regain full access to the BrickFlow ERP platform.
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsInactivateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={inactivateAction === 'suspend' ? 'danger' : 'primary'}
              size="md"
              isLoading={isUpdatingStatus}
              onClick={handleConfirmStatusChange}
              leftIcon={inactivateAction === 'suspend' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
            >
              {inactivateAction === 'suspend' ? 'Confirm Suspend' : 'Confirm Reactivate'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
