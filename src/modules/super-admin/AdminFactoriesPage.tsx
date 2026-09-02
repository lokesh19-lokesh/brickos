import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, ExternalLink, ShieldCheck, 
  CreditCard, Phone, Mail, MapPin, Users, Edit2, Ban 
} from 'lucide-react';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Factory } from '@/types';
import { formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge, Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const AdminFactoriesPage: React.FC = () => {
  const { switchRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: `SRB-0${Math.floor(2 + Math.random() * 8)}`,
    ownerName: '',
    phone: '+91 ',
    email: '',
    address: 'Industrial Phase II',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380001',
    gstNumber: '24AAACT8819A1Z1',
    subscriptionPlan: 'growth' as Factory['subscriptionPlan'],
    subscriptionStatus: 'active' as Factory['subscriptionStatus'],
    status: 'active' as Factory['status'],
  });

  const loadFactories = () => {
    setFactories(dbStore.get('factories'));
    setLoading(false);
  };

  useEffect(() => {
    loadFactories();
    const unsub = dbStore.subscribe(() => {
      loadFactories();
    });
    return unsub;
  }, []);

  const handleImpersonate = async (f: Factory) => {
    await switchRole('factory_owner');
    toast.success(`Impersonating factory: ${f.name}`);
    navigate('/dashboard');
  };

  const handleCreateFactory = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newFact: Factory = {
        id: `fact_${Date.now()}`,
        name: formData.name,
        code: formData.code,
        ownerName: formData.ownerName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        gstNumber: formData.gstNumber,
        subscriptionPlan: formData.subscriptionPlan,
        subscriptionStatus: formData.subscriptionStatus,
        subscriptionExpiresAt: '2027-12-31T23:59:59Z',
        maxUsers: 15,
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const cur = dbStore.get('factories');
      dbStore.set('factories', [newFact, ...cur]);
      toast.success(`Created tenant instance for ${formData.name}`);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns: Column<Factory>[] = [
    {
      header: 'Factory & Tenant Code',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-xs font-mono text-slate-500 mt-0.5">
            <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">{row.code}</span>
            <span className="ml-2 font-sans">{row.city}, {row.state}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Owner & Contact',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">{row.ownerName}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{row.phone} • {row.email}</div>
        </div>
      ),
    },
    {
      header: 'SaaS Plan',
      accessorKey: 'subscriptionPlan',
      cell: (row) => (
        <span className="text-xs font-extrabold text-[#E53935] uppercase bg-[#FFEBEE] px-2.5 py-1 rounded-lg">
          {row.subscriptionPlan}
        </span>
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
            onClick={() => handleImpersonate(row)}
            leftIcon={<ExternalLink className="w-3.5 h-3.5 text-[#E53935]" />}
            className="text-xs"
          >
            Impersonate
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory Tenants Directory"
        description="Multi-tenant management for all brick manufacturing plants on the platform with 1-click workspace impersonation."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Factory Tenants' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            + Provision New Factory
          </Button>
        }
      />

      <DataTable
        data={factories}
        columns={columns}
        searchPlaceholder="Search factories by name, owner, city or plan..."
        searchKey="name"
        exportFileName="brickflow-tenant-factories"
      />

      {/* PROVISION FACTORY MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision New Brick Factory Tenant"
        description="Creates isolated database partition and owner account."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateFactory} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Factory Name"
                placeholder="e.g. Ganga Bricks & Pavers"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                isRequired
              />
            </div>
            <div>
              <Input
                label="Tenant Code"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                required
                isRequired
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Owner Full Name"
              placeholder="e.g. Vikas Patil"
              value={formData.ownerName}
              onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
              required
              isRequired
            />
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
              isRequired
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="owner@plant.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              isRequired
            />
            <Input
              label="GSTIN Number"
              placeholder="24AAACT8819A1Z1"
              value={formData.gstNumber}
              onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assigned Subscription Plan"
              value={formData.subscriptionPlan}
              onChange={e => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
            >
              <option value="starter">Starter Plan (₹2,999/mo)</option>
              <option value="growth">Growth Plan (₹5,999/mo)</option>
              <option value="enterprise">Enterprise Plan (₹11,999/mo)</option>
            </Select>

            <Select
              label="Tenant Status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="active">Active Operational</option>
              <option value="suspended">Suspended (Payment Due)</option>
              <option value="trial">Trial Sandbox</option>
            </Select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Provision Tenant Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
