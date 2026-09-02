import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, LayoutDashboard, Package, Layers, Factory, Boxes, 
  Users, UserCheck, Briefcase, ShoppingBag, FileText, Receipt, 
  CreditCard, BarChart3, Settings, Search, Bell, LogOut, ChevronDown, 
  Menu, X, Sparkles, Plus, CheckCircle2, AlertTriangle, Info, ExternalLink,
  ShieldAlert, RefreshCw, Home
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbStore } from '@/services/mockDatabase';
import { notificationService } from '@/services/reportService';
import { NotificationItem, UserRole } from '@/types';
import { GlobalSearchModal } from '@/components/ui/GlobalSearchModal';
import { SuperAdminAccessModal } from '@/components/common/SuperAdminAccessModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

export const FactoryLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const mainScrollRef = useRef<HTMLElement>(null);

  const { user, factory, role, logout, switchRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Synchronously reset main viewport scroll to top on every navigation before paint
  useLayoutEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  useEffect(() => {
    const factoryId = factory?.id || 'fact_01';
    notificationService.getNotifications(factoryId).then(setNotifications);

    const unsubscribe = dbStore.subscribe(() => {
      notificationService.getNotifications(factoryId).then(setNotifications);
    });

    return unsubscribe;
  }, [factory]);

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (factory?.id) {
      await notificationService.markAllAsRead(factory.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.info('Logged out successfully');
  };

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        { label: 'Products Master', path: '/products', icon: Package },
        { label: 'Raw Materials & POs', path: '/raw-materials', icon: Layers },
        { label: 'Production Batches', path: '/production', icon: Factory },
        { label: 'Stock & Inventory Ledger', path: '/stock', icon: Boxes },
        { label: 'Labour & Wage Payroll', path: '/labour', icon: UserCheck },
      ],
    },
    {
      group: 'COMMERCIAL & FINANCE',
      items: [
        { label: 'Customers & Receivables', path: '/customers', icon: Users },
        { label: 'Vendors & Payables', path: '/vendors', icon: Briefcase },
        { label: 'Sales & Dispatches', path: '/sales', icon: ShoppingBag },
        { label: 'GST Tax Invoices', path: '/invoices', icon: FileText },
        { label: 'Factory Expenses', path: '/expenses', icon: Receipt },
        { label: 'Payments & Cashflow', path: '/payments', icon: CreditCard },
      ],
    },
    {
      group: 'ANALYTICS & CONTROL',
      items: [
        { label: 'Profit & Loss & Reports', path: '/reports', icon: BarChart3 },
        { label: 'Factory Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="h-screen bg-slate-50 flex flex-col antialiased overflow-hidden">
      {/* Top Demo Notification Strip */}
      <div className="bg-[#1E293B] text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800 shrink-0 z-30">
        <div className="flex items-center gap-2">
          <span className="bg-[#E53935] text-white font-bold text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">Demo Mode</span>
          <span className="hidden sm:inline">Active Factory:</span>
          <strong className="text-white">{factory?.name || 'Shree Ram Brick Industries'}</strong>
          <span className="text-slate-500 hidden md:inline">({factory?.code || 'SRB-01'})</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
              className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded-md border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#E53935]" />
              <span>Switch Persona: <strong className="capitalize">{role?.replace('_', ' ')}</strong></span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {demoSwitchOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Simulate Role</p>
                <button
                  onClick={async () => {
                    await switchRole('factory_owner');
                    setDemoSwitchOpen(false);
                    toast.info('Switched to Factory Owner persona');
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-red-50 text-xs font-semibold flex items-center justify-between text-slate-900"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E53935]" />
                    <span>Factory Owner</span>
                  </div>
                  {role === 'factory_owner' && <CheckCircle2 className="w-3.5 h-3.5 text-[#E53935]" />}
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    setDemoSwitchOpen(false);
                    setAdminModalOpen(true);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-purple-50 text-xs font-semibold text-purple-700 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>Super Admin Portal</span>
                  </div>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <Link 
            to="/" 
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors shadow-2xs"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'hidden lg:flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 z-30 shrink-0 select-none',
            sidebarCollapsed ? 'w-20' : 'w-64'
          )}
        >
          {/* Factory Brand Header */}
          <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
              <img 
                src="/logo.png" 
                alt="BrickFlow ERP" 
                className={cn('w-auto object-contain shrink-0 transition-all', sidebarCollapsed ? 'h-9' : 'h-11')} 
              />
            </Link>
          </div>

          {/* Nav Items List */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {!sidebarCollapsed && (
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 px-3 uppercase mb-1.5">
                    {grp.group}
                  </p>
                )}
                {grp.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={iIdx}
                      to={item.path}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                          isActive
                            ? 'bg-[#FFEBEE] text-[#D32F2F] font-bold shadow-xs border border-red-200/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        )
                      }
                    >
                      <Icon className={cn('w-4 h-4 shrink-0 transition-transform group-hover:scale-110')} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Subscription Status Card in Sidebar */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/70">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Plan Status</span>
                  <Badge variant="success" size="sm">Active Pro</Badge>
                </div>
                <div className="text-xs font-bold text-[#1E293B]">Standard Pro Edition</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Valid until 31 Dec 2027</p>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col">
              <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
                <img src="/logo.png" alt="BrickFlow ERP" className="h-10 w-auto object-contain" />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                {navGroups.map((grp, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">{grp.group}</p>
                    {grp.items.map((item, iIdx) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={iIdx}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold',
                              isActive ? 'bg-[#FFEBEE] text-[#D32F2F] font-bold' : 'text-slate-600 hover:bg-slate-100'
                            )
                          }
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
            {/* Left Search & Mobile Toggle */}
            <div className="flex items-center gap-3 max-w-md w-full">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Global Search trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 w-full max-w-sm px-3.5 py-2 text-xs font-medium text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer group"
              >
                <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                <span className="truncate">Search products, invoices, stock...</span>
                <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 shadow-2xs">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Right Tools & Profile */}
            <div className="flex items-center gap-2.5">
              {/* Quick Action Button */}
              <div className="relative">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setQuickActionOpen(!quickActionOpen)}
                  className="hidden md:flex font-semibold shadow-xs"
                >
                  Quick Action
                </Button>

                {quickActionOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                    <p className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1 tracking-wider">Fast Entry</p>
                    <Link
                      to="/production"
                      onClick={() => setQuickActionOpen(false)}
                      className="block p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#D32F2F]"
                    >
                      + New Production Batch
                    </Link>
                    <Link
                      to="/sales"
                      onClick={() => setQuickActionOpen(false)}
                      className="block p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#D32F2F]"
                    >
                      + New Sale Order & Dispatch
                    </Link>
                    <Link
                      to="/raw-materials"
                      onClick={() => setQuickActionOpen(false)}
                      className="block p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#D32F2F]"
                    >
                      + Add Raw Material PO
                    </Link>
                    <Link
                      to="/labour"
                      onClick={() => setQuickActionOpen(false)}
                      className="block p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#D32F2F]"
                    >
                      + Mark Daily Attendance
                    </Link>
                    <Link
                      to="/expenses"
                      onClick={() => setQuickActionOpen(false)}
                      className="block p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#D32F2F]"
                    >
                      + Record Factory Expense
                    </Link>
                  </div>
                )}
              </div>

              {/* Notification Center */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#E53935] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Alerts & Notifications</h4>
                        {unreadNotifsCount > 0 && (
                          <span className="bg-[#FFEBEE] text-[#D32F2F] text-[10px] font-bold px-1.5 py-0.2 rounded">
                            {unreadNotifsCount} New
                          </span>
                        )}
                      </div>
                      {unreadNotifsCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-[#E53935] hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={cn(
                              'p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer',
                              !n.isRead && 'bg-red-50/30'
                            )}
                            onClick={() => {
                              notificationService.markAsRead(n.id);
                              if (n.link) navigate(n.link);
                              setNotificationsOpen(false);
                            }}
                          >
                            <div className="shrink-0 mt-0.5">
                              {n.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                              {n.severity === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              {n.severity === 'error' && <ShieldAlert className="w-4 h-4 text-rose-500" />}
                              {n.severity === 'info' && <Info className="w-4 h-4 text-sky-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 leading-snug">{n.title}</h5>
                              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{n.message}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400">No active notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user?.fullName?.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-500 capitalize leading-tight mt-0.5 font-medium">{role?.replace('_', ' ')}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {role}
                      </span>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      Factory Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main ERP Page Content Viewport */}
          <main ref={mainScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Global Cmd+K Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Super Admin Master Access Key Modal */}
      <SuperAdminAccessModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </div>
  );
};
