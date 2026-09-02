import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, TrendingUp, Package, Layers, Factory, Users, 
  ShoppingBag, CreditCard, AlertTriangle, CheckCircle2, Clock, 
  ArrowUpRight, ArrowDownRight, DollarSign, Calendar, Filter, 
  Plus, MessageSquare, ChevronRight, AlertCircle, RefreshCw, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { reportService } from '@/services/reportService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatINR, formatQuantity, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Card';
import { ChartCard, PageHeader } from '@/components/ui/PageHeader';

export const DashboardPage: React.FC = () => {
  const { factory, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const factoryId = factory?.id || 'fact_01';

  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'last_month'>('today');
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await reportService.getDashboardKPIs(factoryId);
      setKpis(data);
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

  if (loading || !kpis) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#E53935] animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Calculating real-time factory metrics...</p>
      </div>
    );
  }

  const recentBatches = dbStore.get('productionBatches').filter(b => b.factoryId === factoryId).slice(0, 4);
  const recentSales = dbStore.get('saleOrders').filter(s => s.factoryId === factoryId).slice(0, 4);
  const recentPayments = dbStore.get('payments').filter(p => p.factoryId === factoryId).slice(0, 4);
  const recentAudit = dbStore.get('auditLogs').filter(a => a.factoryId === factoryId).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar with Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#1E293B]">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Factory Owner'}!
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Live Plant Status
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Plant: <strong className="text-slate-800">{factory?.name || 'Shree Ram Brick Industries'}</strong> • Code: {factory?.code || 'SRB-01'}
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto overflow-x-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
          ].map(d => (
            <button
              key={d.id}
              onClick={() => {
                setDateFilter(d.id as any);
                toast.info(`Filtered view for: ${d.label}`);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                dateFilter === d.id
                  ? 'bg-white text-[#E53935] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* 12 KPI CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Production</span>
            <Factory className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {kpis.todayProduction.toLocaleString()} <span className="text-xs font-normal text-slate-500">Pcs</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% vs yesterday</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Output</span>
            <Package className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {kpis.monthlyProduction.toLocaleString()} <span className="text-xs font-normal text-slate-500">Pcs</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Target: 3,50,000 Pcs</p>
        </div>

        {/* KPI 3 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Sales</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {formatINR(kpis.todaySales)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Dispatches logged today</p>
        </div>

        {/* KPI 4 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatINR(kpis.monthlySales)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Billed under GST invoices</p>
        </div>

        {/* KPI 5 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Finished Goods Stock</span>
            <Package className="w-4 h-4 text-[#E53935]" />
          </div>
          <div className="text-2xl font-black text-[#E53935] font-mono mt-1">
            {kpis.finishedStockQuantity.toLocaleString()} <span className="text-xs font-normal text-slate-500">Pcs</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">Valuation: {formatINR(kpis.finishedStockValue)}</p>
        </div>

        {/* KPI 6 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Raw Material Stock</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatINR(kpis.rawMaterialStockValue)}
          </div>
          <p className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-1 inline-block font-semibold">
            {kpis.lowStockMaterials.length > 0 ? `${kpis.lowStockMaterials.length} Items Low Stock` : 'Stock Healthy'}
          </p>
        </div>

        {/* KPI 7 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Customer Receivables</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {formatINR(kpis.customerReceivables)}
          </div>
          <Link to="/customers" className="text-[10px] font-bold text-[#E53935] hover:underline mt-1 block">
            View Outstanding Ledgers →
          </Link>
        </div>

        {/* KPI 8 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vendor Payables</span>
            <CreditCard className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">
            {formatINR(kpis.vendorPayables)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">To Cement & Ash Suppliers</p>
        </div>

        {/* KPI 9 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Expenses</span>
            <CreditCard className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatINR(kpis.todayExpenses)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Diesel, Power & Canteen</p>
        </div>

        {/* KPI 10 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Labour Cost (MTD)</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatINR(kpis.monthlyLabourCost)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Wages + Piece-rate + Overtime</p>
        </div>

        {/* KPI 11 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Workers on Duty</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {kpis.presentWorkers} <span className="text-xs font-normal text-slate-400">/ {kpis.totalWorkers}</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
            {Math.round((kpis.presentWorkers / (kpis.totalWorkers || 1)) * 100)}% Muster Attendance
          </span>
        </div>

        {/* KPI 12 */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Labour Wages</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {formatINR(kpis.pendingLabourWages)}
          </div>
          <Link to="/labour" className="text-[10px] font-bold text-[#E53935] hover:underline mt-1 block">
            Process Wage Payouts →
          </Link>
        </div>
      </div>

      {/* INTERACTIVE CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Production Trend (7 cols) */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Daily Production Output Trend"
            subtitle="Fly Ash vs Red Brick vs Paver Blocks (Last 7 Days)"
            headerAction={
              <Link to="/production" className="text-xs font-bold text-[#E53935] hover:underline">
                View Batches →
              </Link>
            }
          >
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpis.productionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="flyAshGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E53935" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#E53935" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="redBrickGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C86D51" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C86D51" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} Pcs`, '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="flyAsh" name="Fly Ash Bricks" stroke="#E53935" strokeWidth={2.5} fillOpacity={1} fill="url(#flyAshGrad)" />
                  <Area type="monotone" dataKey="redBrick" name="Red Clay Bricks" stroke="#C86D51" strokeWidth={2} fillOpacity={1} fill="url(#redBrickGrad)" />
                  <Area type="monotone" dataKey="pavers" name="Paver Blocks" stroke="#64748B" strokeWidth={1.5} fill="#f1f5f9" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 2: Monthly Sales vs Target (5 cols) */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Monthly Sales vs Target (₹)"
            subtitle="Revenue performance & direct plant expenses"
            headerAction={
              <Link to="/sales" className="text-xs font-bold text-[#E53935] hover:underline">
                Sales Ledger →
              </Link>
            }
          >
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis.salesTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [formatINR(val), '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="sales" name="Actual Sales" fill="#E53935" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#64748B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ACTION WIDGETS ROW: Low Stock & Payments Due */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Low Stock Warnings */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Low Stock Alerts</h4>
                <p className="text-[11px] text-slate-500">Raw materials near threshold</p>
              </div>
            </div>
            <Link to="/raw-materials" className="text-xs font-bold text-[#E53935] hover:underline">
              All Items →
            </Link>
          </div>

          <div className="space-y-2.5">
            {kpis.lowStockMaterials.length > 0 ? (
              kpis.lowStockMaterials.map((rm: any) => (
                <div key={rm.id} className="p-3 bg-red-50/40 rounded-xl border border-red-200/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{rm.name}</div>
                    <div className="text-[11px] text-red-600 font-semibold mt-0.5">
                      Current: {rm.currentStock} {rm.unit} (Min: {rm.minimumStock} {rm.unit})
                    </div>
                  </div>
                  <Link to="/raw-materials">
                    <Button variant="primary" size="sm" className="text-[11px] px-2.5 py-1">
                      + Reorder
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-emerald-600 bg-emerald-50 rounded-xl font-semibold">
                ✓ All raw material inventories are well above minimum thresholds.
              </div>
            )}
          </div>
        </div>

        {/* Widget 2: Customer Payments Overdue */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-50 text-[#E53935]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Receivables Due</h4>
                <p className="text-[11px] text-slate-500">Builder invoices pending payment</p>
              </div>
            </div>
            <Link to="/customers" className="text-xs font-bold text-[#E53935] hover:underline">
              Ledger →
            </Link>
          </div>

          <div className="space-y-2.5">
            {dbStore.get('customers').filter(c => c.factoryId === factoryId && c.currentBalance > 0).slice(0, 2).map(c => (
              <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{c.customerName}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Due: <strong className="text-amber-600 font-mono">{formatINR(c.currentBalance)}</strong></div>
                </div>
                <a
                  href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=Dear%20${encodeURIComponent(c.customerName)},%20gentle%20reminder%20regarding%20outstanding%20balance%20of%20${encodeURIComponent(formatINR(c.currentBalance))}%20towards%20brick%20supplies.%20Thank%20you,%20${encodeURIComponent(factory?.name || 'BrickFlow')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  title="Send WhatsApp Reminder"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Live Plant Activities */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Recent Audit Stream</h4>
                <p className="text-[11px] text-slate-500">Live operational events</p>
              </div>
            </div>
            <Link to="/settings" className="text-xs font-bold text-[#E53935] hover:underline">
              Logs →
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentAudit.map(a => (
              <div key={a.id} className="text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{a.module}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{formatDate(a.timestamp, 'hh:mm a')}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1">{a.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT BATCHES & RECENT SALES TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Batches */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Recent Production Batches</h4>
            <Link to="/production" className="text-xs font-bold text-[#E53935] hover:underline">
              View All Batches →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2">Batch</th>
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Output</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {recentBatches.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-slate-900">{b.batchCode}</td>
                    <td className="py-3">{b.productName}</td>
                    <td className="py-3 font-mono font-bold">{b.outputQuantity.toLocaleString()} {b.unit}</td>
                    <td className="py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sales Orders */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Recent Sales & Invoices</h4>
            <Link to="/sales" className="text-xs font-bold text-[#E53935] hover:underline">
              View All Sales →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2">Invoice</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Grand Total</th>
                  <th className="pb-2">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {recentSales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-slate-900">{s.invoiceNumber}</td>
                    <td className="py-3 truncate max-w-[120px]">{s.customerName}</td>
                    <td className="py-3 font-mono font-bold text-slate-900">{formatINR(s.grandTotal)}</td>
                    <td className="py-3">
                      <StatusBadge status={s.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
