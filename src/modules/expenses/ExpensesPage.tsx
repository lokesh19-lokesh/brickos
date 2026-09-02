import React, { useState, useEffect } from 'react';
import { 
  Receipt, Plus, Trash2, CreditCard, DollarSign, Calendar, 
  Fuel, Zap, Wrench, Truck, Coffee, Building, AlertCircle 
} from 'lucide-react';
import { expenseService } from '@/services/expenseService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Expense, ExpenseCategory } from '@/types';
import { formatINR, formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, CurrencyInput } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const ExpensesPage: React.FC = () => {
  const { factory, user } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Diesel' as ExpenseCategory,
    description: '',
    amount: 5000,
    paymentMode: 'upi' as Expense['paymentMode'],
    paidBy: user?.fullName || 'Plant Owner',
    recipientName: 'IOCL Dealer',
    reference: 'Txn #99182',
    notes: '',
  });

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getExpenses(factoryId);
      setExpenses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
    const unsub = dbStore.subscribe(() => {
      loadExpenses();
    });
    return unsub;
  }, [factoryId]);

  const handleOpenAdd = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Diesel',
      description: 'Diesel 100L for Genset',
      amount: 9500,
      paymentMode: 'upi',
      paidBy: user?.fullName || 'Rajesh Sharma',
      recipientName: 'IOCL Petrol Pump',
      reference: `UPI-Ref-${Math.floor(10000 + Math.random() * 90000)}`,
      notes: 'Generator fuel tank top-up',
    });
    setIsModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await expenseService.createExpense(factoryId, {
        date: formData.date,
        category: formData.category,
        description: formData.description,
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        paidBy: formData.paidBy,
        recipientName: formData.recipientName,
        reference: formData.reference,
        notes: formData.notes,
      });

      toast.success(`Recorded expense of ₹${formData.amount} for ${formData.category}`);
      setIsModalOpen(false);
      loadExpenses();
    } catch (err: any) {
      toast.error(err.message || 'Error recording expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this expense entry?')) {
      await expenseService.deleteExpense(id);
      toast.info('Expense entry removed');
      loadExpenses();
    }
  };

  const totalMonthlyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Diesel': return <Fuel className="w-3.5 h-3.5 text-amber-500" />;
      case 'Electricity': return <Zap className="w-3.5 h-3.5 text-yellow-500" />;
      case 'Machine Repair':
      case 'Maintenance': return <Wrench className="w-3.5 h-3.5 text-blue-500" />;
      case 'Transport': return <Truck className="w-3.5 h-3.5 text-purple-500" />;
      case 'Food': return <Coffee className="w-3.5 h-3.5 text-emerald-500" />;
      default: return <Receipt className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const columns: Column<Expense>[] = [
    {
      header: 'Date & Voucher',
      accessorKey: 'date',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{formatDate(row.date)}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{row.reference || 'Cash Voucher'}</div>
        </div>
      ),
    },
    {
      header: 'Expense Category',
      accessorKey: 'category',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {getCategoryIcon(row.category)}
          <span className="font-bold text-slate-800 text-xs">{row.category}</span>
        </div>
      ),
    },
    {
      header: 'Description & Paid To',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900 text-xs">{row.description}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Recipient: <strong className="text-slate-600">{row.recipientName || 'Direct Expense'}</strong> • Paid by: {row.paidBy}
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      sortable: true,
      cell: (row) => (
        <div className="font-mono font-black text-slate-900 text-sm">
          {formatINR(row.amount)}
        </div>
      ),
    },
    {
      header: 'Payment Mode',
      accessorKey: 'paymentMode',
      cell: (row) => (
        <span className="text-[11px] uppercase font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {row.paymentMode}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDelete(row.id)}
          className="w-7 h-7 text-rose-600 hover:bg-rose-50 border-rose-200"
          title="Delete Expense"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  const filterTabs = [
    { label: 'All Expenses', value: 'all', count: expenses.length },
    { label: 'Diesel & Fuel', value: 'Diesel', count: expenses.filter(e => e.category === 'Diesel' || e.category === 'Kiln Fuel').length },
    { label: 'Electricity Power', value: 'Electricity', count: expenses.filter(e => e.category === 'Electricity').length },
    { label: 'Machine Repair', value: 'Machine Repair', count: expenses.filter(e => e.category === 'Machine Repair' || e.category === 'Maintenance').length },
    { label: 'Staff Meals & Tea', value: 'Food', count: expenses.filter(e => e.category === 'Food').length },
  ];

  const filterFn = (exp: Expense, tab: string) => {
    if (tab === 'Diesel') return exp.category === 'Diesel' || exp.category === 'Kiln Fuel';
    if (tab === 'Machine Repair') return exp.category === 'Machine Repair' || exp.category === 'Maintenance';
    return exp.category === tab;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory Expenses & Overheads"
        description="Track daily diesel generator consumption, industrial electricity HT bills, machine maintenance, transport, and worker tea/food vouchers."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Commercial' },
          { label: 'Expenses' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            + Record Factory Expense
          </Button>
        }
      />

      {/* Expense KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded Overheads</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{formatINR(totalMonthlyExpenses)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Directly deducted in P&L calculation</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Major Expense Driver</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">Power & Diesel</div>
          <p className="text-[11px] text-slate-500 mt-1">Accounted for ~65% of plant overheads</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expense Vouchers Logged</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{expenses.length} Vouchers</div>
          <p className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block font-semibold">
            All vouchers audited
          </p>
        </div>
      </div>

      <DataTable
        data={expenses}
        columns={columns}
        searchPlaceholder="Search expenses by category, description or recipient..."
        searchKey="description"
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filterFn={filterFn}
        exportFileName="factory-expenses-ledger"
      />

      {/* RECORD EXPENSE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Factory Expense Voucher"
        description="Logs payment in expense ledger and cashflow statements."
        maxWidth="md"
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expense Date"
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
              isRequired
            />
            <Select
              label="Expense Category"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              isRequired
            >
              <option value="Diesel">Diesel (Genset & Tipper)</option>
              <option value="Electricity">Electricity HT Power Bill</option>
              <option value="Machine Repair">Machine Line Repair & Spares</option>
              <option value="Vehicle Repair">Vehicle / JCB / Loader Repair</option>
              <option value="Transport">Transport & Freight</option>
              <option value="Maintenance">Yard Maintenance</option>
              <option value="Office">Office & Stationary</option>
              <option value="Food">Worker Food, Tea & Canteen</option>
              <option value="Kiln Fuel">Kiln Boiler Coal / Fuel</option>
              <option value="Miscellaneous">Miscellaneous Overheads</option>
            </Select>
          </div>

          <Input
            label="Expense Description"
            placeholder="e.g. 100L Diesel for Generator during 4h load shedding"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
            isRequired
          />

          <div className="grid grid-cols-2 gap-4">
            <CurrencyInput
              label="Amount Paid (₹)"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
              isRequired
            />
            <Select
              label="Payment Mode"
              value={formData.paymentMode}
              onChange={e => setFormData({ ...formData, paymentMode: e.target.value as any })}
            >
              <option value="upi">UPI / GPay / PhonePe</option>
              <option value="cash">Cash Voucher</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Paid To (Vendor/Person)"
              placeholder="e.g. IOCL Pump Wagholi"
              value={formData.recipientName}
              onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
            />
            <Input
              label="Paid By (Staff Name)"
              value={formData.paidBy}
              onChange={e => setFormData({ ...formData, paidBy: e.target.value })}
            />
          </div>

          <Input
            label="Bill / Reference Number"
            placeholder="e.g. Invoice #IOCL-88219"
            value={formData.reference}
            onChange={e => setFormData({ ...formData, reference: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save Expense Voucher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
