import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Factory, Users, ShoppingCart, FileText, Layers, Truck, X, ArrowRight } from 'lucide-react';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/utils/formatters';

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { factory } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const factoryId = factory?.id || 'fact_01';

    const items: {
      type: string;
      title: string;
      subtitle: string;
      icon: React.ReactNode;
      link: string;
    }[] = [];

    // Products
    dbStore.get('products').filter(p => p.factoryId === factoryId && (p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))).slice(0, 3).forEach(p => {
      items.push({
        type: 'Product',
        title: p.name,
        subtitle: `${p.code} • Stock: ${p.currentStock.toLocaleString()} ${p.unit} • ${formatINR(p.sellingPrice)}`,
        icon: <Package className="w-4 h-4 text-emerald-600" />,
        link: '/products',
      });
    });

    // Customers
    dbStore.get('customers').filter(c => c.factoryId === factoryId && (c.customerName.toLowerCase().includes(q) || c.companyName?.toLowerCase().includes(q) || c.phone.includes(q))).slice(0, 3).forEach(c => {
      items.push({
        type: 'Customer',
        title: c.customerName,
        subtitle: `${c.companyName || 'Individual'} • Balance: ${formatINR(c.currentBalance)} • ${c.phone}`,
        icon: <Users className="w-4 h-4 text-sky-600" />,
        link: '/customers',
      });
    });

    // Invoices
    dbStore.get('invoices').filter(i => i.factoryId === factoryId && (i.invoiceNumber.toLowerCase().includes(q) || i.customer.name.toLowerCase().includes(q))).slice(0, 3).forEach(i => {
      items.push({
        type: 'Invoice',
        title: i.invoiceNumber,
        subtitle: `${i.customer.name} • Grand Total: ${formatINR(i.grandTotal)} • Status: ${i.status.toUpperCase()}`,
        icon: <FileText className="w-4 h-4 text-red-600" />,
        link: '/invoices',
      });
    });

    // Raw Materials
    dbStore.get('rawMaterials').filter(r => r.factoryId === factoryId && (r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))).slice(0, 2).forEach(r => {
      items.push({
        type: 'Raw Material',
        title: r.name,
        subtitle: `${r.code} • Current Stock: ${r.currentStock} ${r.unit}`,
        icon: <Layers className="w-4 h-4 text-amber-600" />,
        link: '/raw-materials',
      });
    });

    // Production Batches
    dbStore.get('productionBatches').filter(b => b.factoryId === factoryId && (b.batchCode.toLowerCase().includes(q) || b.productName.toLowerCase().includes(q))).slice(0, 2).forEach(b => {
      items.push({
        type: 'Production Batch',
        title: b.batchCode,
        subtitle: `${b.productName} • Output: ${b.outputQuantity.toLocaleString()} • Status: ${b.status.toUpperCase()}`,
        icon: <Factory className="w-4 h-4 text-indigo-600" />,
        link: '/production',
      });
    });

    // Vendors
    dbStore.get('vendors').filter(v => v.factoryId === factoryId && (v.vendorName.toLowerCase().includes(q) || v.company.toLowerCase().includes(q))).slice(0, 2).forEach(v => {
      items.push({
        type: 'Vendor',
        title: v.vendorName,
        subtitle: `${v.company} • Pending Payable: ${formatINR(v.currentBalance)}`,
        icon: <Truck className="w-4 h-4 text-purple-600" />,
        link: '/vendors',
      });
    });

    return items;
  }, [query, factory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden z-10">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search products, invoices, customers, batches, materials..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-xs text-slate-400">
              <p className="font-semibold text-slate-600 mb-1">Quick Navigation</p>
              <p>Type keywords to find invoices, stock balances, customers, or batches instantly.</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    navigate(item.link);
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white transition-colors">
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{item.title}</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#E53935] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No results found for "<span className="font-semibold text-slate-700">{query}</span>"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
