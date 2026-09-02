import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, Building2, CreditCard, Sparkles, 
  Users, History, Settings, LogOut, ArrowLeft, RefreshCw, Menu, X,
  Layers, FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { superAdminService } from '@/services/reportService';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export const SuperAdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { user, logout, switchRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetData = async () => {
    if (window.confirm('Reset all demo database records to initial seed state?')) {
      setIsResetting(true);
      await superAdminService.resetDemoData();
      setIsResetting(false);
      toast.success('Database successfully reset to initial seed state');
    }
  };

  const navItems = [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Factory Tenants', path: '/admin/factories', icon: Building2 },
    { label: 'Subscriptions & Billing', path: '/admin/subscriptions', icon: CreditCard },
    { label: 'SaaS Plans Master', path: '/admin/plans', icon: Layers },
    { label: 'Demo Sandbox Manager', path: '/admin/demo', icon: Sparkles },
    { label: 'Platform Users', path: '/admin/users', icon: Users },
    { label: 'Audit & Access Logs', path: '/admin/audit-logs', icon: History },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Super Admin Top Header */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-400 hover:text-white lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight">BrickFlow</span>
                <span className="bg-purple-900/60 text-purple-300 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-purple-500/30">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Multi-tenant Cloud Orchestrator</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            isLoading={isResetting}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-amber-400" />}
            className="hidden sm:flex bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white text-xs font-semibold"
          >
            Reset Mock Database
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await switchRole('factory_owner');
              navigate('/dashboard');
              toast.info('Switched to Factory Owner view');
            }}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            Open Factory ERP
          </Button>

          <button
            onClick={async () => {
              await logout();
              navigate('/admin/login');
            }}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-slate-800 shrink-0 select-none">
          <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Platform Administration</p>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Platform v2.4.0</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </aside>

        {/* Mobile Admin Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <span className="font-bold text-white">Super Admin Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={idx}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold',
                          isActive ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                        )
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Admin Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900 text-slate-100">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
