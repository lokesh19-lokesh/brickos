import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, Building2, CreditCard, Users, TrendingUp, 
  ArrowUpRight, Sparkles, Database, CheckCircle2, AlertTriangle, ExternalLink 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { superAdminService } from '@/services/reportService';
import { dbStore } from '@/services/mockDatabase';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Card';
import { PageHeader, ChartCard } from '@/components/ui/PageHeader';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getPlatformStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const unsub = dbStore.subscribe(() => {
      loadStats();
    });
    return unsub;
  }, []);

  const mrrData = [
    { month: 'Apr 2026', mrr: 185000, factories: 24 },
    { month: 'May 2026', mrr: 230000, factories: 31 },
    { month: 'Jun 2026', mrr: 310000, factories: 42 },
    { month: 'Jul 2026', mrr: 440000, factories: 58 },
    { month: 'Aug 2026', mrr: 580000, factories: 74 },
    { month: 'Sep 2026', mrr: 690000, factories: 88 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Control Plane"
        description="Platform-wide multi-tenant monitoring, SaaS subscription MRR, factory instances, and demo sandbox controls."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Platform Overview' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/admin/demo">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Demo Sandbox Controls
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary SaaS Platform KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Factory Tenants</span>
            <Building2 className="w-4 h-4 text-[#E53935]" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {stats?.totalFactories || 1} <span className="text-xs font-normal text-slate-500">Plants</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded mt-1.5 inline-block">
            100% Operational Uptime
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Recurring Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-2">
            {formatINR(stats?.mrr || 7499)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">+24.8% vs last month</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Platform Brick Production</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {(stats?.platformProduction || 45200).toLocaleString()} <span className="text-xs font-normal text-slate-500">Pcs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">Across all tenant plants</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Platform GMV</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {formatINR(stats?.platformSales || 398000)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">Invoiced through BrickFlow</p>
        </div>
      </div>

      {/* MRR Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Platform MRR & Tenant Growth Trajectory" subtitle="SaaS monthly recurring revenue in INR (₹)">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mrrData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v: any) => formatINR(Number(v))} />
                  <Bar dataKey="mrr" fill="#E53935" radius={[6, 6, 0, 0]} name="MRR (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div>
          <ChartCard title="Quick Sandbox Actions" subtitle="Demo testing utilities">
            <div className="space-y-3 pt-2">
              <Link to="/admin/demo" className="block p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Reset Demo Mock Database</span>
                  <Sparkles className="w-4 h-4 text-[#E53935]" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Re-seed clean mock data for presentations</p>
              </Link>

              <Link to="/admin/factories" className="block p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Factory Tenants Directory</span>
                  <Building2 className="w-4 h-4 text-slate-700" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Impersonate plant owners and manage plans</p>
              </Link>

              <Link to="/dashboard" className="block p-3.5 bg-[#FFEBEE] hover:bg-[#FDE8E8] rounded-2xl border border-[#E53935]/20 transition-colors">
                <div className="font-bold text-[#E53935] text-xs flex items-center justify-between">
                  <span>Open Factory ERP Workspace</span>
                  <ExternalLink className="w-4 h-4 text-[#E53935]" />
                </div>
                <p className="text-[11px] text-[#E53935]/80 mt-1">Switch to plant owner manufacturing view</p>
              </Link>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Registered Factory Tenants Table Preview */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Registered Factory Tenants</h3>
            <p className="text-xs text-slate-500">Live multi-tenant instances on BrickFlow ERP</p>
          </div>
          <Link to="/admin/factories">
            <Button variant="outline" size="sm" className="text-xs">
              View All Tenants
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
              <tr>
                <th className="p-3">Factory Name & Code</th>
                <th className="p-3">Owner & Contact</th>
                <th className="p-3">Location</th>
                <th className="p-3">Subscription Plan</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats?.factories?.map((f: any) => (
                <tr key={f.id}>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{f.name}</div>
                    <span className="font-mono text-[11px] text-slate-400">{f.code}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{f.ownerName}</div>
                    <div className="text-[11px] text-slate-500">{f.phone}</div>
                  </td>
                  <td className="p-3">{f.city}, {f.state}</td>
                  <td className="p-3 font-semibold text-[#E53935] uppercase">{f.subscriptionPlan}</td>
                  <td className="p-3"><StatusBadge status={f.status} /></td>
                  <td className="p-3 text-right">
                    <Link to="/dashboard">
                      <Button variant="outline" size="sm" className="text-xs">
                        Impersonate
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
