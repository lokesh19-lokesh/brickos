import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Phone, MessageSquare, Mail, Eye, Edit2, 
  CheckCircle2, CreditCard, Layers, Truck 
} from 'lucide-react';
import { vendorService } from '@/services/customerService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Vendor } from '@/types';
import { formatINR, formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, CurrencyInput, Select } from '@/components/ui/Input';
import { StatusBadge, Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const VendorsPage: React.FC = () => {
  const { factory } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorHistory, setVendorHistory] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vendorName: '',
    company: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    gstNumber: '',
    materialsSupplied: 'Grade 53 OPC Cement, Thermal Fly Ash',
    openingBalance: 0,
    status: 'active' as Vendor['status'],
  });

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getVendors(factoryId);
      setVendors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
    const unsub = dbStore.subscribe(() => {
      loadVendors();
    });
    return unsub;
  }, [factoryId]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      vendorName: '',
      company: '',
      phone: '+91 ',
      whatsapp: '+91 ',
      email: '',
      address: '',
      city: 'Pune',
      state: 'Maharashtra',
      gstNumber: '',
      materialsSupplied: 'Cement, Fly Ash, Sand',
      openingBalance: 0,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      vendorName: vendor.vendorName,
      company: vendor.company,
      phone: vendor.phone,
      whatsapp: vendor.whatsapp || vendor.phone,
      email: vendor.email || '',
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      gstNumber: vendor.gstNumber || '',
      materialsSupplied: vendor.materialsSupplied.join(', '),
      openingBalance: vendor.openingBalance,
      status: vendor.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const matArray = formData.materialsSupplied.split(',').map(s => s.trim()).filter(Boolean);
      if (editingVendor) {
        await vendorService.updateVendor(editingVendor.id, {
          vendorName: formData.vendorName,
          company: formData.company,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          gstNumber: formData.gstNumber,
          materialsSupplied: matArray,
          status: formData.status,
        });
        toast.success(`Updated vendor ${formData.vendorName}`);
      } else {
        await vendorService.createVendor(factoryId, {
          vendorName: formData.vendorName,
          company: formData.company,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          gstNumber: formData.gstNumber,
          materialsSupplied: matArray,
          openingBalance: Number(formData.openingBalance),
          status: formData.status,
        });
        toast.success(`Registered vendor ${formData.vendorName}`);
      }
      setIsModalOpen(false);
      loadVendors();
    } catch (err: any) {
      toast.error(err.message || 'Error saving vendor');
    }
  };

  const handleViewDetails = async (v: Vendor) => {
    setSelectedVendor(v);
    const history = await vendorService.getVendorTransactions(v.id);
    setVendorHistory(history);
    setDetailModalOpen(true);
  };

  const totalPayables = vendors.reduce((acc, v) => acc + v.totalPending, 0);
  const totalPurchasesBilled = vendors.reduce((acc, v) => acc + v.totalPurchases, 0);

  const columns: Column<Vendor>[] = [
    {
      header: 'Vendor & Company',
      accessorKey: 'vendorName',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.vendorName}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-semibold text-slate-700">
            {row.company}
            {row.gstNumber && <span className="ml-1 text-[11px] font-mono text-slate-400 font-normal">• {row.gstNumber}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Supplied Raw Materials',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.materialsSupplied.map((m, idx) => (
            <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
              {m}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Total Purchases',
      accessorKey: 'totalPurchases',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{formatINR(row.totalPurchases)}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Paid: {formatINR(row.totalPaid)}</div>
        </div>
      ),
    },
    {
      header: 'Pending Payable',
      accessorKey: 'currentBalance',
      sortable: true,
      cell: (row) => (
        <div className={`font-mono font-black text-sm ${row.currentBalance > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
          {formatINR(row.currentBalance)}
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
            size="icon"
            onClick={() => handleViewDetails(row)}
            className="w-7 h-7 text-slate-600"
            title="View History"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleOpenEdit(row)}
            className="w-7 h-7 text-slate-600"
            title="Edit Vendor"
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
        title="Vendors & Supplier Payables"
        description="Manage cement depots, fly ash handling transporters, sand quarries, and supplier payment balances."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Commercial' },
          { label: 'Vendors' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            + Register New Vendor
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Supplier Payables</span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">
            {formatINR(totalPayables)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pending payments to raw material vendors</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Purchases Inward</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatINR(totalPurchasesBilled)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Materials billed to plant</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Suppliers</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {vendors.length} Vendors
          </div>
          <p className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block font-semibold">
            Active credit accounts
          </p>
        </div>
      </div>

      <DataTable
        data={vendors}
        columns={columns}
        searchPlaceholder="Search vendors by name, company, or material..."
        searchKey="vendorName"
        exportFileName="brick-vendors-directory"
      />

      {/* ADD / EDIT VENDOR MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? `Edit ${editingVendor.vendorName}` : 'Register New Supplier Vendor'}
        description="Add supplier profile, materials supplied, and opening payable balance."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveVendor} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person Name"
              placeholder="e.g. Rameshwar Agarwal"
              value={formData.vendorName}
              onChange={e => setFormData({ ...formData, vendorName: e.target.value })}
              required
              isRequired
            />
            <Input
              label="Agency / Company Name"
              placeholder="e.g. UltraTech Cement Depot"
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
              required
              isRequired
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
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
              placeholder="sales@vendor.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="GSTIN Number"
              placeholder="27AAACU1234F1Z8"
              value={formData.gstNumber}
              onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
            />
          </div>

          <Input
            label="Materials Supplied (Comma separated)"
            placeholder="Grade 53 OPC Cement, Thermal Fly Ash, M-Sand"
            value={formData.materialsSupplied}
            onChange={e => setFormData({ ...formData, materialsSupplied: e.target.value })}
            required
            isRequired
          />

          {!editingVendor && (
            <CurrencyInput
              label="Opening Balance Payable (₹)"
              value={formData.openingBalance}
              onChange={e => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
            />
          )}

          <Input
            label="Street Address / Depot Yard"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
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
              {editingVendor ? 'Save Changes' : 'Register Vendor'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* VENDOR DETAIL MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedVendor?.vendorName}
        description={`Company: ${selectedVendor?.company} • Pending Payable: ${formatINR(selectedVendor?.currentBalance)}`}
        maxWidth="2xl"
      >
        {selectedVendor && vendorHistory && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Purchases</span>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {formatINR(selectedVendor.totalPurchases)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Paid</span>
                <div className="text-base font-black text-emerald-600 font-mono mt-0.5">
                  {formatINR(selectedVendor.totalPaid)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Payable</span>
                <div className="text-base font-black text-rose-600 font-mono mt-0.5">
                  {formatINR(selectedVendor.currentBalance)}
                </div>
              </div>
            </div>

            {/* Purchases List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Purchase PO Inward Deliveries</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Truck No</th>
                      <th className="p-2.5">Material & Quantity</th>
                      <th className="p-2.5 text-right">Total Amount</th>
                      <th className="p-2.5 text-right">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {vendorHistory.purchases.length > 0 ? (
                      vendorHistory.purchases.map((pur: any) => (
                        <tr key={pur.id}>
                          <td className="p-2.5">{formatDate(pur.purchaseDate)}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{pur.truckNumber}</td>
                          <td className="p-2.5">{pur.quantity} {pur.unit} {pur.materialName}</td>
                          <td className="p-2.5 text-right font-mono font-bold">{formatINR(pur.totalAmount)}</td>
                          <td className="p-2.5 text-right font-mono text-rose-700">{formatINR(pur.pendingAmount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-xs text-slate-400">No purchase records found.</td>
                      </tr>
                    )}
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
