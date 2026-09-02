import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Printer, Download, Calendar, Filter, TrendingUp, 
  Layers, Package, Users, DollarSign, CreditCard, Factory, PieChart as PieIcon 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { reportService } from '@/services/reportService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatINR, formatQuantity, formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { PageHeader, ChartCard } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Card';

export const ReportsPage: React.FC = () => {
  const { factory } = useAuth();
  const { toast } = useToast();
  const factoryId = factory?.id || 'fact_01';

  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'production' | 'stock' | 'sales' | 'labour' | 'receivables'>('pnl');
  const [dateRange, setDateRange] = useState('Aug - Sep 2026');
  const [pnlData, setPnlData] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [pnl, kpiData] = await Promise.all([
        reportService.getProfitAndLoss(factoryId),
        reportService.getDashboardKPIs(factoryId),
      ]);
      setPnlData(pnl);
      setKpis(kpiData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [factoryId]);

  const handlePrint = () => {
    window.print();
  };

  const batches = dbStore.get('productionBatches').filter(b => b.factoryId === factoryId);
  const sales = dbStore.get('saleOrders').filter(s => s.factoryId === factoryId);
  const rawMaterials = dbStore.get('rawMaterials').filter(r => r.factoryId === factoryId);
  const customers = dbStore.get('customers').filter(c => c.factoryId === factoryId);
  const employees = dbStore.get('employees').filter(e => e.factoryId === factoryId);
  const wageSlips = dbStore.get('wageSlips').filter(w => w.factoryId === factoryId);

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title="Reports & Analytics Suite"
          description="Comprehensive multi-dimensional business reports, cost of production breakdown, and real-time Profit & Loss (P&L) statements."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Analytics' },
            { label: 'Reports' },
          ]}
          actions={
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Printer className="w-4 h-4 text-[#E53935]" />}
                onClick={handlePrint}
              >
                Print Report
              </Button>
            </div>
          }
        />

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'pnl', label: 'Profit & Loss Statement (P&L)', icon: DollarSign },
            { id: 'production', label: 'Production Reports', icon: Factory },
            { id: 'stock', label: 'Stock Valuation & Consumption', icon: Layers },
            { id: 'sales', label: 'Sales & Customer Rankings', icon: TrendingUp },
            { id: 'labour', label: 'Labour Cost & Wages', icon: Users },
            { id: 'receivables', label: 'Customer Receivables Aging', icon: CreditCard },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeReportTab === tab.id
                    ? 'bg-[#E53935] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. PROFIT & LOSS STATEMENT TAB */}
      {activeReportTab === 'pnl' && pnlData && (
        <div className="space-y-6">
          {/* Top P&L KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Billed Revenue</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">{formatINR(pnlData.totalRevenue)}</div>
              <p className="text-[11px] text-slate-500 mt-1">Gross sales turnover</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cost of Goods Made (COGS)</span>
              <div className="text-2xl font-black text-rose-600 font-mono mt-1">-{formatINR(pnlData.totalCostOfGoods)}</div>
              <p className="text-[11px] text-slate-500 mt-1">Raw materials + Labour + Fuel</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Factory Overheads</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">-{formatINR(pnlData.factoryOverheads)}</div>
              <p className="text-[11px] text-slate-500 mt-1">Diesel, Maintenance, Admin</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border-2 border-emerald-500 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Net Operating Profit</span>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{formatINR(pnlData.netProfit)}</div>
              <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded mt-1 inline-block">
                {pnlData.profitMargin}% Net Margin
              </p>
            </div>
          </div>

          {/* Detailed P&L Statement Sheet */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Profit & Loss Statement (Manufacturing Account)</h3>
                <p className="text-xs text-slate-500">Period: August 1, 2026 - September 2, 2026 (Financial Year 2026-27)</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                Currency: INR (₹)
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Revenue */}
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-slate-200 font-bold text-slate-900 text-sm">
                  <span>1. Operating Revenue (Sales Turnover)</span>
                  <span className="font-mono">{formatINR(pnlData.totalRevenue)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-600">
                  <span>Gross Sales from Brick Dispatches</span>
                  <span className="font-mono">{formatINR(pnlData.totalRevenue)}</span>
                </div>
              </div>

              {/* Direct Manufacturing Costs */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between py-2 border-b border-slate-200 font-bold text-rose-700 text-sm">
                  <span>2. Direct Manufacturing Costs (COGS)</span>
                  <span className="font-mono">-{formatINR(pnlData.totalCostOfGoods)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-600">
                  <span>Raw Materials Consumed (Cement, Fly Ash, Sand, Stone Dust)</span>
                  <span className="font-mono font-medium">-{formatINR(pnlData.directMaterialCost)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-600">
                  <span>Direct Production Labour & Piece-rate Wages</span>
                  <span className="font-mono font-medium">-{formatINR(pnlData.directLabourCost)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-600">
                  <span>Kiln Fuel & Industrial Power (HT Electricity)</span>
                  <span className="font-mono font-medium">-{formatINR(pnlData.powerAndFuelCost)}</span>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="flex justify-between py-2.5 bg-slate-50 px-4 rounded-xl font-black text-slate-900 text-sm border border-slate-200">
                <span>GROSS MANUFACTURING PROFIT</span>
                <span className="font-mono text-emerald-700">{formatINR(pnlData.grossProfit)}</span>
              </div>

              {/* Operating Overheads */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between py-2 border-b border-slate-200 font-bold text-slate-900 text-sm">
                  <span>3. Factory Administration & Indirect Overheads</span>
                  <span className="font-mono">-{formatINR(pnlData.factoryOverheads)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-600">
                  <span>Genset Diesel Consumption</span>
                  <span className="font-mono font-medium">-{formatINR(24500)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-600">
                  <span>Hydraulic Press & Machinery Maintenance / Spares</span>
                  <span className="font-mono font-medium">-{formatINR(18500)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-600">
                  <span>Staff Tea, Canteen & Miscellaneous Overheads</span>
                  <span className="font-mono font-medium">-{formatINR(27050)}</span>
                </div>
              </div>

              {/* Net Profit Summary */}
              <div className="flex justify-between py-3 bg-[#1E293B] text-white px-5 rounded-2xl font-black text-base shadow-md">
                <span>NET OPERATING PROFIT (Before Tax)</span>
                <span className="font-mono text-emerald-400">{formatINR(pnlData.netProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTION REPORTS TAB */}
      {activeReportTab === 'production' && (
        <div className="space-y-6">
          <ChartCard title="Production Output Breakdown by Batch" subtitle="Daily run log and machine performance">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Batch Code</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Machine Line</th>
                    <th className="p-3 text-right">Target</th>
                    <th className="p-3 text-right">Actual Good Output</th>
                    <th className="p-3 text-right">Scrap Rate</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {batches.map(b => (
                    <tr key={b.id}>
                      <td className="p-3">{formatDate(b.productionDate)}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{b.batchCode}</td>
                      <td className="p-3 font-semibold">{b.productName}</td>
                      <td className="p-3">{b.machineLine}</td>
                      <td className="p-3 text-right font-mono">{b.targetQuantity.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{b.outputQuantity.toLocaleString()} {b.unit}</td>
                      <td className="p-3 text-right font-mono text-rose-600">{b.damagedQuantity}</td>
                      <td className="p-3"><Badge variant="success">{b.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* 3. STOCK VALUATION TAB */}
      {activeReportTab === 'stock' && (
        <div className="space-y-6">
          <ChartCard title="Raw Material Inventory Consumption Ledger" subtitle="Summary of inward vs consumed materials">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Raw Material</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3 text-right">Current Stock</th>
                    <th className="p-3 text-right">Avg Unit Cost</th>
                    <th className="p-3 text-right">Total Purchased</th>
                    <th className="p-3 text-right">Total Consumed</th>
                    <th className="p-3 text-right">Current Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rawMaterials.map(rm => (
                    <tr key={rm.id}>
                      <td className="p-3 font-bold text-slate-900">{rm.name}</td>
                      <td className="p-3">{rm.unit}</td>
                      <td className="p-3 text-right font-mono font-bold">{formatQuantity(rm.currentStock, rm.unit)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(rm.averageUnitCost)}</td>
                      <td className="p-3 text-right font-mono text-emerald-700">+{rm.totalPurchased}</td>
                      <td className="p-3 text-right font-mono text-rose-700">-{rm.totalConsumed}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{formatINR(rm.currentStock * rm.averageUnitCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* 4. SALES REPORTS TAB */}
      {activeReportTab === 'sales' && (
        <div className="space-y-6">
          <ChartCard title="Customer Revenue Rankings" subtitle="Top buyers ranked by billing volume">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Customer / Company</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3 text-right">Total Billed Sales</th>
                    <th className="p-3 text-right">Total Paid</th>
                    <th className="p-3 text-right">Current Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {customers.map((c, idx) => (
                    <tr key={c.id}>
                      <td className="p-3 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{c.customerName} ({c.companyName || 'Individual'})</td>
                      <td className="p-3 text-slate-500">{c.phone}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{formatINR(c.totalSales)}</td>
                      <td className="p-3 text-right font-mono text-emerald-700">{formatINR(c.totalPaid)}</td>
                      <td className="p-3 text-right font-mono text-amber-700 font-bold">{formatINR(c.currentBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* 5. LABOUR REPORTS TAB */}
      {activeReportTab === 'labour' && (
        <div className="space-y-6">
          <ChartCard title="Worker Wage Disbursement Summary" subtitle="Total payout breakdown for current month">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Worker Name</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-right">Present Days</th>
                    <th className="p-3 text-right">Overtime</th>
                    <th className="p-3 text-right">Gross Wages</th>
                    <th className="p-3 text-right">Advance Deducted</th>
                    <th className="p-3 text-right">Net Payable</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {wageSlips.map(w => (
                    <tr key={w.id}>
                      <td className="p-3 font-bold text-slate-900">{w.employeeName}</td>
                      <td className="p-3">{w.jobType}</td>
                      <td className="p-3 text-right font-mono">{w.presentDays} Days</td>
                      <td className="p-3 text-right font-mono">{w.overtimeHours} hrs</td>
                      <td className="p-3 text-right font-mono font-bold">{formatINR(w.grossAmount)}</td>
                      <td className="p-3 text-right font-mono text-rose-600">-{formatINR(w.advanceDeduction)}</td>
                      <td className="p-3 text-right font-mono font-black text-emerald-700">{formatINR(w.netPayable)}</td>
                      <td className="p-3"><Badge variant="success">{w.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* 6. RECEIVABLES AGING TAB */}
      {activeReportTab === 'receivables' && (
        <div className="space-y-6">
          <ChartCard title="Customer Receivables Schedule" subtitle="Outstanding builder balances">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3 text-right">Approved Credit Limit</th>
                    <th className="p-3 text-right">Outstanding Due</th>
                    <th className="p-3 text-right">Credit Utilized</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {customers.filter(c => c.currentBalance > 0).map(c => {
                    const util = c.creditLimit > 0 ? Math.round((c.currentBalance / c.creditLimit) * 100) : 0;
                    return (
                      <tr key={c.id}>
                        <td className="p-3 font-bold text-slate-900">{c.customerName}</td>
                        <td className="p-3 text-slate-500">{c.phone}</td>
                        <td className="p-3 text-right font-mono">{formatINR(c.creditLimit)}</td>
                        <td className="p-3 text-right font-mono font-bold text-amber-700">{formatINR(c.currentBalance)}</td>
                        <td className="p-3 text-right font-semibold">{util}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
};
