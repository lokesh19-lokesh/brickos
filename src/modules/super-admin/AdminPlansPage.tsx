import React, { useState, useEffect } from 'react';
import { 
  Package, Check, Plus, Edit2, ShieldCheck, Sparkles 
} from 'lucide-react';
import { dbStore } from '@/services/mockDatabase';
import { useToast } from '@/context/ToastContext';
import { SubscriptionPlan } from '@/types';
import { formatINR } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, CurrencyInput } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';

export const AdminPlansPage: React.FC = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    priceMonthly: 0,
    priceYearly: 0,
    maxUsers: 5,
    maxProducts: 10,
    featuresText: '',
  });

  const loadPlans = () => {
    setPlans(dbStore.get('plans'));
  };

  useEffect(() => {
    loadPlans();
    const unsub = dbStore.subscribe(() => {
      loadPlans();
    });
    return unsub;
  }, []);

  const handleOpenEdit = (p: SubscriptionPlan) => {
    setEditingPlan(p);
    setForm({
      name: p.name,
      priceMonthly: p.priceMonthly || p.price || 0,
      priceYearly: p.priceYearly || p.price * 12 || 0,
      maxUsers: p.maxUsers,
      maxProducts: p.maxProducts || 10,
      featuresText: p.features.join('\n'),
    });
    setIsModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const feats = form.featuresText.split('\n').map(f => f.trim()).filter(Boolean);

    const cur = dbStore.get('plans');
    const updated = cur.map(p => {
      if (p.id === editingPlan.id) {
        return {
          ...p,
          name: form.name,
          priceMonthly: Number(form.priceMonthly),
          priceYearly: Number(form.priceYearly),
          maxUsers: Number(form.maxUsers),
          maxProducts: Number(form.maxProducts),
          features: feats,
        };
      }
      return p;
    });

    dbStore.set('plans', updated);
    toast.success(`Updated pricing plan: ${form.name}`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Plans Master"
        description="Configure commercial SaaS pricing tiers, feature gates, and usage quotas."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Plans Master' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(p => (
          <div
            key={p.id}
            className={`p-6 rounded-3xl border bg-white shadow-xs space-y-5 flex flex-col justify-between ${
              p.tier === 'growth' ? 'border-[#E53935] ring-2 ring-[#E53935]/20' : 'border-slate-200'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.tier} TIER</span>
                </div>
                {p.tier === 'growth' && (
                  <span className="bg-[#FFEBEE] text-[#E53935] text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 font-mono">{formatINR(p.priceMonthly)}</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  Billed annually at {formatINR(p.priceYearly)} / year
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Staff Accounts:</span>
                  <strong className="text-slate-900">{p.maxUsers === 999 ? 'Unlimited' : p.maxUsers}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Brick Products:</span>
                  <strong className="text-slate-900">{p.maxProducts === 999 ? 'Unlimited' : p.maxProducts}</strong>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Included Features:</span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              variant="outline"
              size="md"
              leftIcon={<Edit2 className="w-4 h-4" />}
              onClick={() => handleOpenEdit(p)}
              className="w-full"
            >
              Edit Pricing & Limits
            </Button>
          </div>
        ))}
      </div>

      {/* EDIT PLAN MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit Plan: ${editingPlan?.name}`}
        description="Update pricing and user limits."
        maxWidth="md"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <Input
            label="Plan Display Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            isRequired
          />

          <div className="grid grid-cols-2 gap-4">
            <CurrencyInput
              label="Monthly Price (₹)"
              value={form.priceMonthly}
              onChange={e => setForm({ ...form, priceMonthly: Number(e.target.value) })}
              required
              isRequired
            />
            <CurrencyInput
              label="Yearly Price (₹)"
              value={form.priceYearly}
              onChange={e => setForm({ ...form, priceYearly: Number(e.target.value) })}
              required
              isRequired
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Staff Accounts"
              type="number"
              value={form.maxUsers}
              onChange={e => setForm({ ...form, maxUsers: Number(e.target.value) })}
              required
              isRequired
            />
            <Input
              label="Max Product Lines"
              type="number"
              value={form.maxProducts}
              onChange={e => setForm({ ...form, maxProducts: Number(e.target.value) })}
              required
              isRequired
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Features (One per line)</label>
            <textarea
              rows={5}
              value={form.featuresText}
              onChange={e => setForm({ ...form, featuresText: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#E53935] focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
