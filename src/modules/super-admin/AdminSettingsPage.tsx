import React, { useState } from 'react';
import { Settings, Shield, Server, Bell, Save, CheckCircle2, Key, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/context/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'BrickFlow ERP Platform',
    supportEmail: 'support@brickflow.io',
    salesPhone: '+91 85006 93113',
    trialPeriodDays: 14,
    defaultCurrency: 'INR (₹)',
    enforce2FA: false,
    maintenanceMode: false,
    autoBackupDaily: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Platform global settings updated successfully!');
    }, 400);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Global Configuration"
        description="Configure SaaS platform defaults, multi-tenant parameters, notification channels, and security policies."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Platform Settings' },
        ]}
      />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">SaaS Identity & Support Contact</h3>
            <p className="text-xs text-slate-500">Global headers and email notification footers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Display Name"
              value={settings.platformName}
              onChange={e => setSettings({ ...settings, platformName: e.target.value })}
              required
              isRequired
            />
            <Input
              label="Support Email"
              type="email"
              value={settings.supportEmail}
              onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              required
              isRequired
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Direct Sales & Demo Phone"
              value={settings.salesPhone}
              onChange={e => setSettings({ ...settings, salesPhone: e.target.value })}
              required
              isRequired
            />
            <Input
              label="Free Trial Period (Days)"
              type="number"
              value={settings.trialPeriodDays}
              onChange={e => setSettings({ ...settings, trialPeriodDays: Number(e.target.value) })}
              required
              isRequired
            />
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Platform Security & Maintenance</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={settings.autoBackupDaily}
                  onChange={e => setSettings({ ...settings, autoBackupDaily: e.target.checked })}
                  className="rounded text-[#E53935] focus:ring-[#E53935]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Automated Daily Database Backups</span>
                  <span className="text-[11px] text-slate-500">Nightly snapshots saved to redundant cloud storage</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="rounded text-[#E53935] focus:ring-[#E53935]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Scheduled Maintenance Mode</span>
                  <span className="text-[11px] text-slate-500">Show friendly maintenance banner across tenant portals</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button variant="primary" size="md" type="submit" isLoading={loading} leftIcon={<Save className="w-4 h-4" />}>
              Save Platform Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
