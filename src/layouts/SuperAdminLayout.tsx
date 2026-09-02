import React, { useState, useRef, useLayoutEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, Building2, CreditCard, Sparkles, 
  Users, History, Settings, LogOut, ArrowLeft, RefreshCw, Menu, X,
  Layers, FileText, ChevronDown, CheckCircle2, Search, Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { superAdminService } from '@/services/reportService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

export const SuperAdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);
  const mainScrollRef = useRef<HTMLElement>(null);
  const { user, logout, switchRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useLayoutEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const handleResetData = async () => {
    if (window.confirm('Reset all demo database records to clean initial seed state?')) {
      setIsResetting(true);
      await superAdminService.resetDemoData();
      setIsResetting(false);
      toast.success('Database successfully reset to initial seed state');
    }
  };

  const navItems = [
    { label: 'Platform Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Factory Tenants', path: '/admin/factories', icon: Building2 },
    { label: 'Subscriptions & MRR', path: '/admin/subscriptions', icon: CreditCard },
    { label: 'SaaS Plans Master', path: '/admin/plans', icon: Layers },
    { label: 'Demo Sandbox Controls', path: '/admin/demo', icon: Sparkles },
    { label: 'Platform Users', path: '/admin/users', icon: Users },
    { label: 'Security & Audit Logs', path: '/admin/audit-logs', icon: History },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Super Admin Top Strip */}
      <div className="bg-[#1E293B] text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="bg-[#E53935] text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
            Super Admin Control Plane
          </span>
          <span className="text-slate-400 hidden sm:inline">• Multi-Tenant SaaS Platform Manager</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
              className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded-md border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#E53935]" />
              <span>Switch Persona</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {demoSwitchOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Simulate Role</p>
                <button
                  onClick={async () => {
                    await switchRole('factory_owner');
                    setDemoSwitchOpen(false);
                    navigate('/dashboard');
                    toast.info('Switched to Factory Owner persona');
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-red-50 text-xs font-semibold flex items-center justify-between text-slate-800 hover:text-[#D32F2F]"
                >
                  <span>Factory Owner</span>
                </button>
                <button
                  onClick={async () => {
                    await switchRole('factory_manager');
                    setDemoSwitchOpen(false);
                    navigate('/dashboard');
                    toast.info('Switched to Plant Manager persona');
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-red-50 text-xs font-semibold flex items-center justify-between text-slate-800 hover:text-[#D32F2F]"
                >
                  <span>Plant Manager</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={async () => {
                    await switchRole('super_admin');
                    setDemoSwitchOpen(false);
                    navigate('/admin/dashboard');
                  }}
                  className="w-full text-left p-2 rounded-lg bg-[#FFEBEE] text-[#D32F2F] text-xs font-bold flex items-center justify-between"
                >
                  <span>Super Admin Portal</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E53935]" />
                </button>
              </div>
            )}
          </div>

          <Link to="/" className="text-slate-400 hover:text-white transition-colors text-xs hidden sm:inline">
            Public Site
          </Link>
        </div>
      </div>

      {/* Super Admin Main Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Logo & Brand Title */}
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="BrickFlow ERP" 
              className="h-10 sm:h-11 w-auto object-contain shrink-0" 
            />
            <span className="bg-[#FFEBEE] text-[#D32F2F] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-red-200/60 ml-1">
              SUPER ADMIN
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            isLoading={isResetting}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#E53935]" />}
            className="hidden sm:flex text-xs font-semibold"
          >
            Reset Mock Database
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await switchRole('factory_owner');
              navigate('/dashboard');
              toast.info('Switched to Factory Owner ERP');
            }}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="text-xs font-semibold"
          >
            Open Factory ERP
          </Button>

          <button
            onClick={async () => {
              await logout();
              navigate('/admin-login');
            }}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0 select-none">
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 mt-2">Platform Administration</p>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                      isActive
                        ? 'bg-[#FFEBEE] text-[#D32F2F] font-bold shadow-xs border border-red-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700">Multi-tenant Cloud v2.4</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">LIVE</span>
          </div>
        </aside>

        {/* Mobile Admin Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col p-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <img src="/logo.png" alt="BrickFlow ERP" className="h-10 w-auto object-contain" />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
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
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold',
                          isActive ? 'bg-[#FFEBEE] text-[#D32F2F] font-bold border border-red-200/60' : 'text-slate-600 hover:bg-slate-100'
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
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 text-slate-900">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
