import React, { useState, useEffect } from 'react';
import { 
  Settings, Building2, CreditCard, Shield, Users, History, 
  CheckCircle2, Save, Plus, Trash2, Key 
} from 'lucide-react';
import { factoryService } from '@/services/factoryService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Factory, AuditLogItem } from '@/types';
import { formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const SettingsPage: React.FC = () => {
  const { factory, user } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [activeTab, setActiveTab] = useState<'profile' | 'bank' | 'machines' | 'audit'>('profile');
  const [loading, setLoading] = useState(false);

  // Form State
  const [profileForm, setProfileForm] = useState({
    name: factory?.name || 'Shree Ram Brick Industries',
    code: factory?.code || 'SRB-01',
    ownerName: factory?.ownerName || 'Rajesh Sharma',
    phone: factory?.phone || '+91 98220 12345',
    email: factory?.email || 'info@shreerambricks.com',
    address: factory?.address || 'Plot 45-B, Industrial Estate, Hadapsar',
    city: factory?.city || 'Pune',
    state: factory?.state || 'Maharashtra',
    pincode: factory?.pincode || '411028',
    gstNumber: factory?.gstNumber || '27AABCS1429B1Z8',
  });

  const [bankForm, setBankForm] = useState({
    bankName: factory?.bankDetails?.bankName || 'HDFC Bank Ltd',
    accountNumber: factory?.bankDetails?.accountNumber || '50200088991122',
    ifscCode: factory?.bankDetails?.ifscCode || 'HDFC0001234',
    branch: factory?.bankDetails?.branch || 'Hadapsar Branch, Pune',
    upiId: factory?.bankDetails?.upiId || 'shreerambricks@okhdfcbank',
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    const logs = dbStore.get('auditLogs').filter(a => a.factoryId === factoryId);
    setAuditLogs(logs);

    const unsub = dbStore.subscribe(() => {
      const updatedLogs = dbStore.get('auditLogs').filter(a => a.factoryId === factoryId);
      setAuditLogs(updatedLogs);
    });

    return unsub;
  }, [factoryId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await factoryService.updateFactory(factoryId, {
        ...profileForm,
      });
      toast.success('Factory profile settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await factoryService.updateFactory(factoryId, {
        bankDetails: bankForm,
      });
      toast.success('Bank & Settlement details updated on Invoices!');
    } catch (err: any) {
      toast.error(err.message || 'Error updating bank details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory & System Settings"
        description="Configure plant business information, GSTIN, bank details for tax invoices, and view audit trail."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' },
        ]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'profile', label: 'Factory Profile & Tax', icon: Building2 },
          { id: 'bank', label: 'Bank & UPI Settlement', icon: CreditCard },
          { id: 'machines', label: 'Machine Lines & Kilns', icon: Settings },
          { id: 'audit', label: 'Security & Audit Trail', icon: History },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#E53935] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FACTORY PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Legal Plant & GST Details</h3>
              <p className="text-xs text-slate-500">Printed on all GST Tax Invoices and Delivery Challans.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Factory Name"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  isRequired
                />
              </div>
              <div>
                <Input
                  label="Factory Code"
                  value={profileForm.code}
                  onChange={e => setProfileForm({ ...profileForm, code: e.target.value })}
                  required
                  isRequired
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner / Managing Director Name"
                value={profileForm.ownerName}
                onChange={e => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                required
                isRequired
              />
              <Input
                label="GSTIN Registration Number"
                value={profileForm.gstNumber}
                onChange={e => setProfileForm({ ...profileForm, gstNumber: e.target.value })}
                required
                isRequired
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Factory Phone"
                value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                required
                isRequired
              />
              <Input
                label="Factory Email"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                required
                isRequired
              />
            </div>

            <Input
              label="Plant Physical Address"
              value={profileForm.address}
              onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
              required
              isRequired
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City"
                value={profileForm.city}
                onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                required
                isRequired
              />
              <Input
                label="State"
                value={profileForm.state}
                onChange={e => setProfileForm({ ...profileForm, state: e.target.value })}
                required
                isRequired
              />
              <Input
                label="Pincode"
                value={profileForm.pincode}
                onChange={e => setProfileForm({ ...profileForm, pincode: e.target.value })}
                required
                isRequired
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="primary" size="md" type="submit" isLoading={loading} leftIcon={<Save className="w-4 h-4" />}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: BANK & UPI DETAILS */}
      {activeTab === 'bank' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl">
          <form onSubmit={handleSaveBank} className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Bank Account & UPI Payment Gateway</h3>
              <p className="text-xs text-slate-500">Printed on the bottom of customer invoices for direct wire/UPI settlement.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Bank Name"
                placeholder="HDFC Bank Ltd"
                value={bankForm.bankName}
                onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                required
                isRequired
              />
              <Input
                label="Account Number"
                placeholder="50200088991122"
                value={bankForm.accountNumber}
                onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                required
                isRequired
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="IFSC Code"
                placeholder="HDFC0001234"
                value={bankForm.ifscCode}
                onChange={e => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                required
                isRequired
              />
              <Input
                label="Bank Branch"
                placeholder="Hadapsar Branch, Pune"
                value={bankForm.branch}
                onChange={e => setBankForm({ ...bankForm, branch: e.target.value })}
                required
                isRequired
              />
            </div>

            <Input
              label="UPI ID / VPA"
              placeholder="shreerambricks@okhdfcbank"
              value={bankForm.upiId}
              onChange={e => setBankForm({ ...bankForm, upiId: e.target.value })}
              required
              isRequired
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="primary" size="md" type="submit" isLoading={loading} leftIcon={<Save className="w-4 h-4" />}>
                Save Bank Details
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MACHINE LINES & KILNS */}
      {activeTab === 'machines' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-3xl">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Configured Machine Lines & Kiln Chambers</h3>
              <p className="text-xs text-slate-500">Assign batches and track equipment maintenance velocity.</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Automatic Hydraulic Line 1', type: 'Vibro-Hydraulic Press', capacity: '20,000 Bricks / Shift', status: 'Operational' },
              { name: 'Semi-Automatic Line 2', type: 'Toggle Press', capacity: '15,000 Bricks / Shift', status: 'Operational' },
              { name: 'Paver Vibro-Compactor Press', type: 'High Density Paver Line', capacity: '8,000 Blocks / Shift', status: 'Operational' },
              { name: 'Continuous Chamber Kiln #4', type: 'Fixed Chimney Bull Trench Kiln', capacity: '50,000 Bricks / Round', status: 'Firing' },
            ].map((m, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{m.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{m.type} • Capacity: <strong>{m.capacity}</strong></div>
                </div>
                <Badge variant="success">{m.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Security & Operational Audit Trail</h3>
            <p className="text-xs text-slate-500">Immutable ledger recording who created, modified, or deleted records.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User & Role</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Record Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.map(a => (
                  <tr key={a.id}>
                    <td className="p-3 font-mono text-slate-500">{formatDate(a.timestamp, 'dd MMM yyyy, hh:mm a')}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{a.userName}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{a.userRole}</span>
                    </td>
                    <td className="p-3 font-semibold">{a.module}</td>
                    <td className="p-3">
                      <Badge variant={a.action === 'DELETE' ? 'danger' : (a.action === 'CREATE' ? 'success' : 'info')}>
                        {a.action}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-600 max-w-md">{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
