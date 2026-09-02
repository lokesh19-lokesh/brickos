import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Phone, MessageSquare, Mail, Eye, Edit2, 
  CheckCircle2, AlertTriangle, FileText, CreditCard, ArrowUpRight 
} from 'lucide-react';
import { customerService } from '@/services/customerService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Customer } from '@/types';
import { formatINR, formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, CurrencyInput, Select } from '@/components/ui/Input';
import { StatusBadge, Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const CustomersPage: React.FC = () => {
  const { factory } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    companyName: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    gstNumber: '',
    creditLimit: 200000,
    openingBalance: 0,
    status: 'active' as Customer['status'],
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getCustomers(factoryId);
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    const unsub = dbStore.subscribe(() => {
      loadCustomers();
    });
    return unsub;
  }, [factoryId]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      customerName: '',
      companyName: '',
      phone: '+91 ',
      whatsapp: '+91 ',
      email: '',
      address: '',
      city: 'Pune',
      state: 'Maharashtra',
      gstNumber: '',
      creditLimit: 200000,
      openingBalance: 0,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      customerName: customer.customerName,
      companyName: customer.companyName || '',
      phone: customer.phone,
      whatsapp: customer.whatsapp || customer.phone,
      email: customer.email || '',
      address: customer.address,
      city: customer.city,
      state: customer.state,
      gstNumber: customer.gstNumber || '',
      creditLimit: customer.creditLimit,
      openingBalance: customer.openingBalance,
      status: customer.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, {
          customerName: formData.customerName,
          companyName: formData.companyName,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          gstNumber: formData.gstNumber,
          creditLimit: Number(formData.creditLimit),
          status: formData.status,
        });
        toast.success(`Updated customer ${formData.customerName}`);
      } else {
        await customerService.createCustomer(factoryId, {
          customerName: formData.customerName,
          companyName: formData.companyName,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          gstNumber: formData.gstNumber,
          creditLimit: Number(formData.creditLimit),
          openingBalance: Number(formData.openingBalance),
          status: formData.status,
        });
        toast.success(`Created customer ${formData.customerName}`);
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      toast.error(err.message || 'Error saving customer');
    }
  };

  const handleViewDetails = async (c: Customer) => {
    setSelectedCustomer(c);
    const history = await customerService.getCustomerTransactions(c.id);
    setCustomerHistory(history);
    setDetailModalOpen(true);
  };

  const totalReceivables = customers.reduce((acc, c) => acc + c.totalPending, 0);
  const totalSalesBilled = customers.reduce((acc, c) => acc + c.totalSales, 0);

  const columns: Column<Customer>[] = [
    {
      header: 'Customer & Company',
      accessorKey: 'customerName',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.customerName}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {row.companyName ? <strong className="text-slate-700">{row.companyName}</strong> : 'Individual Builder'}
            {row.gstNumber && <span className="ml-1 text-[11px] font-mono text-slate-400 font-normal">• GSTIN: {row.gstNumber}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Details',
      cell: (row) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{row.phone}</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate max-w-xs">{row.city}, {row.state}</div>
        </div>
      ),
    },
    {
      header: 'Total Sales Billed',
      accessorKey: 'totalSales',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{formatINR(row.totalSales)}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Paid: {formatINR(row.totalPaid)}</div>
        </div>
      ),
    },
    {
      header: 'Outstanding Balance',
      accessorKey: 'currentBalance',
      sortable: true,
      cell: (row) => (
        <div>
          <div className={`font-mono font-black text-sm ${row.currentBalance > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {formatINR(row.currentBalance)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Credit Limit: {formatINR(row.creditLimit)}
          </div>
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
          {row.currentBalance > 0 && (
            <a
              href={`https://wa.me/${row.phone.replace(/[^0-9]/g, '')}?text=Dear%20${encodeURIComponent(row.customerName)},%20gentle%20reminder%20regarding%20outstanding%20balance%20of%20${encodeURIComponent(formatINR(row.currentBalance))}%20for%20brick%20supplies.%20Thank%20you,%20${encodeURIComponent(factory?.name || 'BrickFlow')}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              title="Send WhatsApp Reminder"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleViewDetails(row)}
            className="w-7 h-7 text-slate-600"
            title="View Ledger"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleOpenEdit(row)}
            className="w-7 h-7 text-slate-600"
            title="Edit Customer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory & Receivables"
        description="Manage real estate developers, contractors, retail dealers, credit limits, and WhatsApp ledger reminders."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Commercial' },
          { label: 'Customers' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            + Add New Customer
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Customer Receivables</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {formatINR(totalReceivables)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Outstanding unpaid builder invoices</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Lifetime Sales</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatINR(totalSalesBilled)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all registered builder accounts</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Customer Accounts</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {customers.length} Accounts
          </div>
          <p className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block font-semibold">
            Credit limits active
          </p>
        </div>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        searchPlaceholder="Search customer by name, company, phone or GSTIN..."
        searchKey="customerName"
        exportFileName="brick-customers-directory"
      />

      {/* ADD / EDIT CUSTOMER MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? `Edit ${editingCustomer.customerName}` : 'Add New Customer Account'}
        description="Configure commercial details, GSTIN, and credit limits."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person Name"
              placeholder="e.g. Ramesh Kulkarni"
              value={formData.customerName}
              onChange={e => setFormData({ ...formData, customerName: e.target.value })}
              required
              isRequired
            />
            <Input
              label="Company / Project Name"
              placeholder="e.g. L&T Realty Project"
              value={formData.companyName}
              onChange={e => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Phone"
              placeholder="+91 98220 12345"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
              isRequired
            />
            <Input
              label="WhatsApp Number"
              placeholder="+91 98220 12345"
              value={formData.whatsapp}
              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="purchase@builder.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="GSTIN Number (Optional)"
              placeholder="27AAACL0149B1Z2"
              value={formData.gstNumber}
              onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencyInput
              label="Approved Credit Limit (₹)"
              value={formData.creditLimit}
              onChange={e => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
              required
              isRequired
            />
            {!editingCustomer && (
              <CurrencyInput
                label="Opening Balance Due (₹)"
                value={formData.openingBalance}
                onChange={e => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
              />
            )}
          </div>

          <Input
            label="Site / Delivery Address"
            placeholder="Plot 18, Commercial Zone, Kharadi, Pune"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            required
            isRequired
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              required
              isRequired
            />
            <Input
              label="State"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
              required
              isRequired
            />
            <Select
              label="Status"
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
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CUSTOMER LEDGER DETAIL MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedCustomer?.customerName}
        description={`Company: ${selectedCustomer?.companyName || 'Individual'} • Outstanding: ${formatINR(selectedCustomer?.currentBalance)}`}
        maxWidth="2xl"
      >
        {selectedCustomer && customerHistory && (
          <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Sales Billed</span>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {formatINR(selectedCustomer.totalSales)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Paid / Received</span>
                <div className="text-base font-black text-emerald-600 font-mono mt-0.5">
                  {formatINR(selectedCustomer.totalPaid)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Pending Due</span>
                <div className="text-base font-black text-amber-600 font-mono mt-0.5">
                  {formatINR(selectedCustomer.currentBalance)}
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Issued Tax Invoices</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="p-2.5">Invoice #</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Grand Total</th>
                      <th className="p-2.5">Paid</th>
                      <th className="p-2.5">Pending</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {customerHistory.invoices.length > 0 ? (
                      customerHistory.invoices.map((inv: any) => (
                        <tr key={inv.id}>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                          <td className="p-2.5">{formatDate(inv.invoiceDate)}</td>
                          <td className="p-2.5 font-mono font-bold">{formatINR(inv.grandTotal)}</td>
                          <td className="p-2.5 font-mono text-emerald-700">{formatINR(inv.paidAmount)}</td>
                          <td className="p-2.5 font-mono text-amber-700">{formatINR(inv.pendingAmount)}</td>
                          <td className="p-2.5"><StatusBadge status={inv.status} /></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-xs text-slate-400">No invoices generated yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Receipts Log */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Payment Receipts Received</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Payment Mode</th>
                      <th className="p-2.5">Reference / Txn ID</th>
                      <th className="p-2.5 text-right">Amount Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {customerHistory.payments.map((p: any) => (
                      <tr key={p.id}>
                        <td className="p-2.5">{formatDate(p.date)}</td>
                        <td className="p-2.5 font-semibold uppercase">{p.paymentMode}</td>
                        <td className="p-2.5 font-mono text-slate-500">{p.reference || '-'}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                          +{formatINR(p.amount)}
                        </td>
                      </tr>
                    ))}
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
