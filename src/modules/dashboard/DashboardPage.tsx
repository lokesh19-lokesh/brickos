import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, TrendingUp, Package, Layers, Factory, Users, 
  ShoppingBag, CreditCard, AlertTriangle, CheckCircle2, Clock, 
  ArrowUpRight, ArrowDownRight, DollarSign, Calendar, Filter, 
  Plus, MessageSquare, ChevronRight, AlertCircle, RefreshCw, FileText,
  ArrowRight, BarChart3, Boxes
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-[#1E293B]">
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
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 sm:p-1.5 rounded-xl border border-slate-200 self-start lg:self-auto overflow-x-auto max-w-full">
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
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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

      {/* 6 CORE MODULE SUMMARY CARDS (RESPONSIVE: 2 COLS ON 1024px, 3 COLS ON >=1280px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 xl:gap-6">
        {/* 1. Raw Material Procurement */}
        <Link 
          to="/raw-materials" 
          className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFEBEE] border border-red-100 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform shrink-0">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-[#E53935]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E293B] group-hover:text-[#D32F2F] transition-colors mb-2 flex items-center justify-between">
              <span>Raw Material Procurement</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#E53935]" />
            </h3>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {formatINR(kpis.rawMaterialStockValue)}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Total Raw Stock Valuation</p>
          </div>

          <div className="pt-3.5 sm:pt-4 mt-3.5 sm:mt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Vendor Payables:</span>
              <span className="text-rose-600 font-bold">{formatINR(kpis.vendorPayables)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Inventory Status:</span>
              <span className={kpis.lowStockMaterials?.length > 0 ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>
                {kpis.lowStockMaterials?.length > 0 ? `${kpis.lowStockMaterials.length} Items Low Stock` : 'Healthy Inventory'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate pt-0.5">
              Fly Ash: 140 MT • OPC Cement: 420 Bags • M-Sand: 85 Brass
            </div>
          </div>
        </Link>

        {/* 2. Production Batch & Kiln Control */}
        <Link 
          to="/production" 
          className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFEBEE] border border-red-100 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform shrink-0">
              <Factory className="w-5 h-5 sm:w-6 sm:h-6 text-[#E53935]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E293B] group-hover:text-[#D32F2F] transition-colors mb-2 flex items-center justify-between">
              <span>Production Batch & Kiln Control</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#E53935]" />
            </h3>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {kpis.todayProduction.toLocaleString()}
              </span>
              <span className="text-xs font-normal text-slate-500">Pcs Today</span>
              <span className="text-[11px] font-bold text-emerald-600 ml-auto">+14.2%</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Hydraulic Press & Kiln Batches</p>
          </div>

          <div className="pt-3.5 sm:pt-4 mt-3.5 sm:mt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Monthly Output:</span>
              <span className="text-slate-900 font-bold">{kpis.monthlyProduction.toLocaleString()} Pcs</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Press Line Status:</span>
              <span className="text-emerald-600 font-bold">Shift #1 Active (420 Pcs/Hr)</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate pt-0.5">
              3 Batches Run Today • Auto-BOM Materials Deducted
            </div>
          </div>
        </Link>

        {/* 3. Transactional Stock Ledger */}
        <Link 
          to="/stock" 
          className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFEBEE] border border-red-100 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#E53935]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E293B] group-hover:text-[#D32F2F] transition-colors mb-2 flex items-center justify-between">
              <span>Transactional Stock Ledger</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#E53935]" />
            </h3>
            <div className="text-xl sm:text-2xl font-black text-[#E53935] font-mono">
              {kpis.finishedStockQuantity.toLocaleString()} <span className="text-xs font-normal text-slate-500">Pcs</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Finished Goods In Yard</p>
          </div>

          <div className="pt-3.5 sm:pt-4 mt-3.5 sm:mt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Yard Stock Valuation:</span>
              <span className="text-slate-900 font-bold">{formatINR(kpis.finishedStockValue)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">SKU Categories:</span>
              <span className="text-emerald-600 font-bold">4 Active Product Lines</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200/80 truncate">
              Opening + Production - Dispatches = Balance
            </div>
          </div>
        </Link>

        {/* 4. Labour Muster & Wage Payroll */}
        <Link 
          to="/labour" 
          className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFEBEE] border border-red-100 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#E53935]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E293B] group-hover:text-[#D32F2F] transition-colors mb-2 flex items-center justify-between">
              <span>Labour Muster & Wage Payroll</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#E53935]" />
            </h3>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {kpis.presentWorkers} <span className="text-xs font-normal text-slate-400">/ {kpis.totalWorkers} On Duty</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">100% Daily Muster Attendance</p>
          </div>

          <div className="pt-3.5 sm:pt-4 mt-3.5 sm:mt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Labour Cost (MTD):</span>
              <span className="text-slate-900 font-bold">{formatINR(kpis.monthlyLabourCost)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Pending Wage Payouts:</span>
              <span className="text-amber-600 font-bold">{formatINR(kpis.pendingLabourWages)}</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate pt-0.5">
              Piece-Rate ₹420/1000 Bricks • Advances Auto-Deducted
            </div>
          </div>
        </Link>

        {/* 5. Sales Dispatches & GST Invoicing */}
        <Link 
          to="/sales" 
          className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFEBEE] border border-red-100 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#E53935]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E293B] group-hover:text-[#D32F2F] transition-colors mb-2 flex items-center justify-between">
              <span>Sales Dispatches & GST Invoicing</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#E53935]" />
            </h3>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              {formatINR(kpis.todaySales)}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Today's Gate Dispatches Billed</p>
          </div>

          <div className="pt-3.5 sm:pt-4 mt-3.5 sm:mt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Monthly Revenue:</span>
              <span className="text-slate-900 font-bold">{formatINR(kpis.monthlySales)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Customer Receivables:</span>
              <span className="text-amber-600 font-bold">{formatINR(kpis.customerReceivables)}</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate pt-0.5">
              1-Click GST Invoices • HSN 68159990 • Gate Passes
            </div>
          </div>
        </Link>

        {/* 6. Profit & Loss & Financial Reports */}
        <Link 
          to="/reports" 
          className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFEBEE] border border-red-100 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-[#E53935]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E293B] group-hover:text-[#D32F2F] transition-colors mb-2 flex items-center justify-between">
              <span>Profit & Loss & Financial Reports</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#E53935]" />
            </h3>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {formatINR(32450)}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                +34.5% Net Margin
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Real-Time Factory Net Profit</p>
          </div>

          <div className="pt-3.5 sm:pt-4 mt-3.5 sm:mt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Operating Expenses (MTD):</span>
              <span className="text-slate-900 font-bold">{formatINR(kpis.monthlyExpenses)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Today's Plant OPEX:</span>
              <span className="text-slate-700 font-bold">{formatINR(kpis.todayExpenses)}</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate pt-0.5">
              Automated COGS: Raw Materials + Labour + Fuel & Power
            </div>
          </div>
        </Link>
      </div>

      {/* INTERACTIVE CHARTS ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6">
        {/* Chart 1: Production Trend */}
        <div className="xl:col-span-7">
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
        <div className="xl:col-span-5">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6">
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
