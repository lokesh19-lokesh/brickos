import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, ArrowDownLeft, ArrowUpRight, CheckCircle2, 
  Users, Briefcase, UserCheck, Receipt, DollarSign 
} from 'lucide-react';
import { paymentService } from '@/services/expenseService';
import { customerService, vendorService } from '@/services/customerService';
import { labourService } from '@/services/labourService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Payment, PartyType, PaymentType } from '@/types';
import { formatINR, formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, CurrencyInput } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const PaymentsPage: React.FC = () => {
  const { factory } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    partyType: 'customer' as PartyType,
    partyId: '',
    partyName: '',
    paymentType: 'receipt' as PaymentType,
    amount: 15000,
    paymentMode: 'upi' as Payment['paymentMode'],
    reference: 'UPI Ref #88910',
    invoiceRef: '',
    notes: 'Advance receipt',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pays, custs, vens, emps] = await Promise.all([
        paymentService.getPayments(factoryId),
        customerService.getCustomers(factoryId),
        vendorService.getVendors(factoryId),
        labourService.getEmployees(factoryId),
      ]);
      setPayments(pays);
      setCustomers(custs);
      setVendors(vens);
      setEmployees(emps);

      if (custs.length > 0 && !formData.partyId) {
        setFormData(prev => ({
          ...prev,
          partyId: custs[0].id,
          partyName: custs[0].customerName,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dbStore.subscribe(() => {
      loadData();
    });
    return unsub;
  }, [factoryId]);

  const handlePartyTypeChange = (type: PartyType) => {
    let newPartyId = '';
    let newPartyName = '';
    let newPayType: PaymentType = type === 'customer' ? 'receipt' : 'payment';

    if (type === 'customer' && customers.length > 0) {
      newPartyId = customers[0].id;
      newPartyName = customers[0].customerName;
    } else if (type === 'vendor' && vendors.length > 0) {
      newPartyId = vendors[0].id;
      newPartyName = vendors[0].vendorName;
    } else if (type === 'labour' && employees.length > 0) {
      newPartyId = employees[0].id;
      newPartyName = employees[0].name;
    }

    setFormData(prev => ({
      ...prev,
      partyType: type,
      partyId: newPartyId,
      partyName: newPartyName,
      paymentType: newPayType,
    }));
  };

  const handlePartySelect = (id: string) => {
    let name = '';
    if (formData.partyType === 'customer') {
      name = customers.find(c => c.id === id)?.customerName || '';
    } else if (formData.partyType === 'vendor') {
      name = vendors.find(v => v.id === id)?.vendorName || '';
    } else if (formData.partyType === 'labour') {
      name = employees.find(e => e.id === id)?.name || '';
    }

    setFormData(prev => ({
      ...prev,
      partyId: id,
      partyName: name,
    }));
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentService.createPayment(factoryId, {
        date: formData.date,
        partyType: formData.partyType,
        partyId: formData.partyId || 'gen_01',
        partyName: formData.partyName || 'General Party',
        paymentType: formData.paymentType,
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        reference: formData.reference,
        invoiceRef: formData.invoiceRef,
        notes: formData.notes,
      });

      toast.success(`Recorded ${formData.paymentType} of ₹${formData.amount} for ${formData.partyName}`);
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error recording payment');
    }
  };

  const totalInflow = payments.filter(p => p.paymentType === 'receipt').reduce((acc, p) => acc + p.amount, 0);
  const totalOutflow = payments.filter(p => p.paymentType === 'payment').reduce((acc, p) => acc + p.amount, 0);
  const netCashflow = totalInflow - totalOutflow;

  const columns: Column<Payment>[] = [
    {
      header: 'Date & Reference',
      accessorKey: 'date',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{formatDate(row.date)}</div>
          <div className="text-[11px] font-mono text-slate-500 mt-0.5">{row.reference || 'Cash/Voucher'}</div>
        </div>
      ),
    },
    {
      header: 'Party / Entity',
      accessorKey: 'partyName',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.partyName}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{row.partyType}</div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'paymentType',
      cell: (row) => (
        row.paymentType === 'receipt' ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs font-bold border border-emerald-200">
            <ArrowDownLeft className="w-3 h-3" /> INFLOW (Receipt)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg text-xs font-bold border border-rose-200">
            <ArrowUpRight className="w-3 h-3" /> OUTFLOW (Payout)
          </span>
        )
      ),
    },
    {
      header: 'Amount (₹)',
      accessorKey: 'amount',
      sortable: true,
      cell: (row) => (
        <span className={`font-mono font-black text-sm ${row.paymentType === 'receipt' ? 'text-emerald-700' : 'text-slate-900'}`}>
          {row.paymentType === 'receipt' ? `+${formatINR(row.amount)}` : `-${formatINR(row.amount)}`}
        </span>
      ),
    },
    {
      header: 'Payment Mode',
      accessorKey: 'paymentMode',
      cell: (row) => (
        <span className="text-[11px] font-bold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {row.paymentMode}
        </span>
      ),
    },
    {
      header: 'Notes',
      cell: (row) => <span className="text-xs text-slate-600 truncate max-w-xs">{row.notes || row.invoiceRef || '-'}</span>,
    },
  ];

  const filterTabs = [
    { label: 'All Transactions', value: 'all', count: payments.length },
    { label: 'Customer Inflow Receipts', value: 'customer', count: payments.filter(p => p.partyType === 'customer').length },
    { label: 'Vendor Payables', value: 'vendor', count: payments.filter(p => p.partyType === 'vendor').length },
    { label: 'Labour Wages Disbursed', value: 'labour', count: payments.filter(p => p.partyType === 'labour').length },
    { label: 'Factory Expenses', value: 'expense', count: payments.filter(p => p.partyType === 'expense').length },
  ];

  const filterFn = (pay: Payment, tab: string) => {
    return pay.partyType === tab;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Cashflow Ledger"
        description="Unified financial cashflow ledger tracking incoming customer receipts and outgoing vendor, worker wage, and expense disbursements."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Commercial' },
          { label: 'Payments' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            + Record Transaction Voucher
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Cash Inflow (Receipts)</span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">+{formatINR(totalInflow)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Collected from customer sales</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Cash Outflow (Disbursements)</span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">-{formatINR(totalOutflow)}</div>
          <p className="text-[11px] text-slate-500 mt-1">To vendors, workers & expenses</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Cash Position</span>
          <div className={`text-2xl font-black font-mono mt-1 ${netCashflow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatINR(netCashflow)}
          </div>
          <p className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block font-semibold">
            Positive Cashflow
          </p>
        </div>
      </div>

      <DataTable
        data={payments}
        columns={columns}
        searchPlaceholder="Search by party name, mode or reference..."
        searchKey="partyName"
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filterFn={filterFn}
        exportFileName="brickflow-payments-cashflow"
      />

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Financial Transaction Voucher"
        description="Logs entry in cashbook and automatically adjusts corresponding customer/vendor ledger balances."
        maxWidth="md"
      >
        <form onSubmit={handleSavePayment} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Transaction Date"
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
              isRequired
            />
            <Select
              label="Party Type"
              value={formData.partyType}
              onChange={e => handlePartyTypeChange(e.target.value as any)}
              isRequired
            >
              <option value="customer">Customer (Buyer)</option>
              <option value="vendor">Vendor (Raw Material Supplier)</option>
              <option value="labour">Labour Worker (Wage Payout)</option>
              <option value="expense">Direct Factory Expense</option>
            </Select>
          </div>

          {formData.partyType === 'customer' && (
            <Select
              label="Select Customer"
              value={formData.partyId}
              onChange={e => handlePartySelect(e.target.value)}
              isRequired
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.customerName} (Due: {formatINR(c.currentBalance)})
                </option>
              ))}
            </Select>
          )}

          {formData.partyType === 'vendor' && (
            <Select
              label="Select Vendor"
              value={formData.partyId}
              onChange={e => handlePartySelect(e.target.value)}
              isRequired
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vendorName} (Payable: {formatINR(v.currentBalance)})
                </option>
              ))}
            </Select>
          )}

          {formData.partyType === 'labour' && (
            <Select
              label="Select Employee"
              value={formData.partyId}
              onChange={e => handlePartySelect(e.target.value)}
              isRequired
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.jobType})
                </option>
              ))}
            </Select>
          )}

          {formData.partyType === 'expense' && (
            <Input
              label="Recipient / Expense Name"
              placeholder="e.g. MSEDCL Electricity Department"
              value={formData.partyName}
              onChange={e => setFormData({ ...formData, partyName: e.target.value })}
              required
              isRequired
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <CurrencyInput
              label="Amount (₹)"
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
              <option value="bank_transfer">Direct Bank Transfer (NEFT/RTGS)</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="UTR / Cheque / Txn Ref"
              placeholder="e.g. UPI-4491028"
              value={formData.reference}
              onChange={e => setFormData({ ...formData, reference: e.target.value })}
            />
            <Input
              label="Invoice / PO Ref"
              placeholder="e.g. INV-2026-0419"
              value={formData.invoiceRef}
              onChange={e => setFormData({ ...formData, invoiceRef: e.target.value })}
            />
          </div>

          <Input
            label="Transaction Description Notes"
            placeholder="e.g. Part payment received against Site Kharadi dispatch"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Post Transaction Voucher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
