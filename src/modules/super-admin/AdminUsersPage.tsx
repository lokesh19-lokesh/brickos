import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, UserCheck, Mail, Phone, Lock } from 'lucide-react';
import { dbStore } from '@/services/mockDatabase';
import { User, UserRole } from '@/types';
import { formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge, Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/context/ToastContext';

export const AdminUsersPage: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '+91 ',
    role: 'factory_owner' as UserRole,
    status: 'active' as User['status'],
  });

  const loadUsers = () => {
    setUsers(dbStore.get('users'));
  };

  useEffect(() => {
    loadUsers();
    const unsub = dbStore.subscribe(() => {
      loadUsers();
    });
    return unsub;
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        createdAt: new Date().toISOString(),
      };

      const cur = dbStore.get('users');
      dbStore.set('users', [newUser, ...cur]);
      toast.success(`Created platform user: ${formData.fullName}`);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Full Name & Email',
      accessorKey: 'fullName',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.fullName}</div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessorKey: 'phone',
      cell: (row) => <span className="font-mono text-xs text-slate-700">{row.phone}</span>,
    },
    {
      header: 'Assigned Role',
      accessorKey: 'role',
      cell: (row) => {
        let variant: 'success' | 'danger' | 'warning' | 'info' = 'info';
        if (row.role === 'super_admin') variant = 'danger';
        if (row.role === 'factory_owner') variant = 'warning';
        return <Badge variant={variant}>{row.role.replace('_', ' ').toUpperCase()}</Badge>;
      },
    },
    {
      header: 'Account Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Registration Date',
      accessorKey: 'createdAt',
      cell: (row) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Users & Access Control"
        description="Global directory of all platform administrators and factory owners."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Platform Users' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            + Create Platform User
          </Button>
        }
      />

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search users by name, email or role..."
        searchKey="fullName"
        exportFileName="brickflow-platform-users"
      />

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Platform User Account"
        description="Provision administrative credentials or factory owner accounts."
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Anand Mahindra"
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            required
            isRequired
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@plant.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              isRequired
            />
            <Input
              label="Mobile Phone"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
              isRequired
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role Assignment"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as any })}
              isRequired
            >
              <option value="factory_owner">Factory Owner</option>
              <option value="super_admin">Super Admin</option>
            </Select>

            <Select
              label="Account Status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Provision User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
