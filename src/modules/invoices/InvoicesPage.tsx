import React, { useState, useEffect } from 'react';
import { 
  FileText, Printer, Download, MessageSquare, Eye, CreditCard, 
  CheckCircle2, Building2, QrCode, ArrowLeft, Plus, Check 
} from 'lucide-react';
import { invoiceService } from '@/services/salesService';
import { factoryService } from '@/services/factoryService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Invoice, Factory } from '@/types';
import { formatINR, formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input, CurrencyInput, Select } from '@/components/ui/Input';

export const InvoicesPage: React.FC = () => {
  const { factory } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Invoice Print / View Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Record Payment on Invoice Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payMode, setPayMode] = useState<'upi' | 'bank_transfer' | 'cheque' | 'cash'>('upi');
  const [payRef, setPayRef] = useState('UPI Ref: ');

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoices(factoryId);
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
    const unsub = dbStore.subscribe(() => {
      loadInvoices();
    });
    return unsub;
  }, [factoryId]);

  const handlePrint = () => {
    window.print();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await invoiceService.recordInvoicePayment(selectedInvoice.id, Number(payAmount), payMode, payRef);
      toast.success(`Received payment of ₹${payAmount} for Inv #${selectedInvoice.invoiceNumber}`);
      setPayModalOpen(false);
      setInvoiceModalOpen(false);
      loadInvoices();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleWhatsAppShare = (inv: Invoice) => {
    const text = `*TAX INVOICE - ${factory?.name || 'BrickFlow ERP'}*\nInvoice No: ${inv.invoiceNumber}\nDate: ${formatDate(inv.invoiceDate)}\nCustomer: ${inv.customer.name}\nGrand Total: ${formatINR(inv.grandTotal)}\nPaid: ${formatINR(inv.paidAmount)}\nBalance Due: ${formatINR(inv.pendingAmount)}\n\nThank you for your business!`;
    const url = `https://wa.me/${inv.customer.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalReceived = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalPending = invoices.reduce((acc, i) => acc + i.pendingAmount, 0);

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice # & Date',
      accessorKey: 'invoiceNumber',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{row.invoiceNumber}</div>
          <div className="text-xs text-slate-500 mt-0.5">{formatDate(row.invoiceDate)} • Due: {formatDate(row.dueDate)}</div>
        </div>
      ),
    },
    {
      header: 'Customer Details',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customer.name}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {row.customer.company ? <strong className="text-slate-700">{row.customer.company}</strong> : 'Site Buyer'}
            {row.customer.gstNumber && <span className="ml-1 font-mono text-slate-400">• {row.customer.gstNumber}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Grand Total',
      accessorKey: 'grandTotal',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-mono font-black text-slate-900">{formatINR(row.grandTotal)}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Taxable: {formatINR(row.taxableAmount)}</div>
        </div>
      ),
    },
    {
      header: 'Paid vs Pending',
      cell: (row) => (
        <div>
          <div className="font-mono text-xs text-emerald-700 font-bold">Paid: {formatINR(row.paidAmount)}</div>
          {row.pendingAmount > 0 ? (
            <div className="font-mono text-xs text-amber-700 font-bold mt-0.5">
              Due: {formatINR(row.pendingAmount)}
            </div>
          ) : (
            <span className="text-[10px] text-emerald-600 font-semibold">Cleared</span>
          )}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedInvoice(row);
              setInvoiceModalOpen(true);
            }}
            leftIcon={<Eye className="w-3.5 h-3.5 text-[#E53935]" />}
            className="text-xs"
          >
            View / Print
          </Button>
          <button
            onClick={() => handleWhatsAppShare(row)}
            className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
            title="Share on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="GST Tax Invoices"
        description="Official Indian GST tax invoices with HSN codes, tax breakup, vehicle dispatches, bank QR details, and WhatsApp sharing."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Commercial' },
          { label: 'Invoices' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Invoiced Amount</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{formatINR(totalInvoiced)}</div>
          <p className="text-[11px] text-slate-500 mt-1">{invoices.length} Invoices Generated</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Amount Received</span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{formatINR(totalReceived)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Cleared Receipts</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pending Due</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">{formatINR(totalPending)}</div>
          <p className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-1 inline-block font-semibold">
            Active receivables
          </p>
        </div>
      </div>

      <DataTable
        data={invoices}
        columns={columns}
        searchPlaceholder="Search invoices by number or customer name..."
        searchKey="invoiceNumber"
        exportFileName="gst-invoices-register"
      />

      {/* FULLSCREEN TAX INVOICE VIEWER & PRINT MODAL */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        maxWidth="4xl"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Modal Controls Toolbar (Hidden on Print) */}
            <div className="no-print flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Tax Invoice:</span>
                <span className="font-mono font-black text-[#E53935]">{selectedInvoice.invoiceNumber}</span>
                <StatusBadge status={selectedInvoice.status} />
              </div>

              <div className="flex items-center gap-2.5">
                {selectedInvoice.pendingAmount > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setPayAmount(selectedInvoice.pendingAmount);
                      setPayModalOpen(true);
                    }}
                  >
                    Record Payment
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                  onClick={() => handleWhatsAppShare(selectedInvoice)}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                  onClick={handlePrint}
                >
                  Print / Download PDF
                </Button>
              </div>
            </div>

            {/* PRINTABLE GST INVOICE SHEET (Styled exactly like standard Indian GST Tax Invoice) */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 print-shadow-none text-slate-800 space-y-6 text-xs">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/logo.png" 
                      alt="Patterns BrickOS" 
                      className="h-11 w-auto object-contain" 
                    />
                    <div>
                      <h2 className="text-xl font-black text-slate-900 leading-none">{factory?.name || 'Shree Ram Brick Industries'}</h2>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Fly Ash & Concrete Brick Manufacturers</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">
                    {factory?.address || 'Plot 45-B, Industrial Estate, Hadapsar, Pune, Maharashtra - 411028'}
                  </p>
                  <p className="text-[11px] font-mono font-bold text-slate-900">
                    GSTIN: {factory?.gstNumber || '27AABCS1429B1Z8'}
                  </p>
                  <p className="text-[11px] text-slate-600">Phone: {factory?.phone || '+91 85006 93113'} • Email: {factory?.email || 'info@shreerambricks.com'}</p>
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-block bg-slate-900 text-white font-extrabold uppercase px-3 py-1 rounded text-xs tracking-wider">
                    TAX INVOICE
                  </span>
                  <div className="text-xs font-mono font-black text-slate-900 pt-2">
                    Invoice No: {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-600">Invoice Date: <strong>{formatDate(selectedInvoice.invoiceDate)}</strong></div>
                  <div className="text-xs text-slate-600">Due Date: <strong>{formatDate(selectedInvoice.dueDate)}</strong></div>
                  <div className="text-xs text-slate-600">Truck No: <strong className="font-mono">{selectedInvoice.vehicleNumber || 'MH-12-DT-8821'}</strong></div>
                </div>
              </div>

              {/* Bill To & Ship To */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed To (Buyer):</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedInvoice.customer.name}</div>
                  {selectedInvoice.customer.company && <div className="font-semibold text-slate-700">{selectedInvoice.customer.company}</div>}
                  <div className="text-slate-600 leading-relaxed">{selectedInvoice.customer.address}</div>
                  {selectedInvoice.customer.gstNumber && (
                    <div className="font-mono font-bold text-slate-900">GSTIN: {selectedInvoice.customer.gstNumber}</div>
                  )}
                  <div className="text-slate-600">Phone: {selectedInvoice.customer.phone}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Details:</span>
                  <div className="font-semibold text-slate-900">Destination: Site Delivery by Tipper / Truck</div>
                  <div className="text-slate-600">Vehicle No: <strong>{selectedInvoice.vehicleNumber || 'Direct Site Dispatch'}</strong></div>
                  <div className="text-slate-600">Place of Supply: <strong>Maharashtra (27)</strong></div>
                  <div className="text-slate-600">Reverse Charge: <strong>No</strong></div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700 border-b border-slate-300">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Item Description</th>
                      <th className="p-3">HSN Code</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Rate (₹)</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                      <th className="p-3 text-right">GST Rate</th>
                      <th className="p-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-900">{it.name}</td>
                        <td className="p-3 font-mono">{it.hsnCode}</td>
                        <td className="p-3 text-right font-mono font-bold">{it.quantity.toLocaleString()} {it.unit}</td>
                        <td className="p-3 text-right font-mono">{formatINR(it.rate, false)}</td>
                        <td className="p-3 text-right font-mono">{formatINR(it.amount, false)}</td>
                        <td className="p-3 text-right font-mono">{it.taxRate}%</td>
                        <td className="p-3 text-right font-mono font-bold">{formatINR(it.total, false)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations & Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Bank Details & QR */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bank & UPI Settlement Details</span>
                    <QrCode className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="text-xs space-y-0.5 text-slate-700">
                    <div>Bank: <strong>{factory?.bankDetails?.bankName || 'HDFC Bank Ltd'}</strong></div>
                    <div>A/C Number: <strong className="font-mono">{factory?.bankDetails?.accountNumber || '50200088991122'}</strong></div>
                    <div>IFSC Code: <strong className="font-mono">{factory?.bankDetails?.ifscCode || 'HDFC0001234'}</strong></div>
                    <div>Branch: <strong>{factory?.bankDetails?.branch || 'Hadapsar, Pune'}</strong></div>
                    <div>UPI ID: <strong className="font-mono text-[#E53935]">{factory?.bankDetails?.upiId || 'shreerambricks@okhdfcbank'}</strong></div>
                  </div>
                </div>

                {/* Amount Totals */}
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono font-bold">{formatINR(selectedInvoice.taxableAmount)}</span>
                  </div>
                  {selectedInvoice.cgst > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span>CGST (6%):</span>
                      <span className="font-mono font-bold">{formatINR(selectedInvoice.cgst)}</span>
                    </div>
                  )}
                  {selectedInvoice.sgst > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span>SGST (6%):</span>
                      <span className="font-mono font-bold">{formatINR(selectedInvoice.sgst)}</span>
                    </div>
                  )}
                  {selectedInvoice.igst > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span>IGST (12%):</span>
                      <span className="font-mono font-bold">{formatINR(selectedInvoice.igst)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-slate-800 text-sm font-black text-slate-900">
                    <span>Invoice Grand Total:</span>
                    <span className="font-mono text-base text-[#E53935]">{formatINR(selectedInvoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-700 font-bold">
                    <span>Amount Paid / Received:</span>
                    <span className="font-mono">{formatINR(selectedInvoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-amber-700 font-black border-t border-slate-200">
                    <span>Balance Amount Due:</span>
                    <span className="font-mono">{formatINR(selectedInvoice.pendingAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Terms & Conditions:</span>
                  <ol className="list-decimal pl-4 space-y-0.5 text-[10px] text-slate-500 leading-relaxed">
                    {selectedInvoice.termsAndConditions.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ol>
                </div>

                <div className="text-right flex flex-col justify-between items-end h-24">
                  <span className="text-[11px] font-bold text-slate-900">For {factory?.name || 'Shree Ram Brick Industries'}</span>
                  <div className="border-t border-slate-400 pt-1 text-[10px] text-slate-500 w-48 text-center">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* RECORD PAYMENT ON INVOICE MODAL */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={`Record Payment for Inv #${selectedInvoice?.invoiceNumber}`}
        description={`Customer: ${selectedInvoice?.customer.name} • Remaining Due: ${formatINR(selectedInvoice?.pendingAmount)}`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <CurrencyInput
            label="Payment Received Amount (₹)"
            value={payAmount}
            onChange={e => setPayAmount(Number(e.target.value))}
            required
            isRequired
          />

          <Select
            label="Payment Method"
            value={payMode}
            onChange={e => setPayMode(e.target.value as any)}
          >
            <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
            <option value="bank_transfer">Direct Bank Transfer (NEFT/RTGS)</option>
            <option value="cheque">Cheque</option>
            <option value="cash">Cash Receipt</option>
          </Select>

          <Input
            label="Transaction Reference / Cheque #"
            value={payRef}
            onChange={e => setPayRef(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={() => setPayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save Payment Receipt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
