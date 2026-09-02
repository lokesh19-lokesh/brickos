import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  Building2, Layers, ShieldCheck, ArrowRight, Phone, MessageSquare, 
  Menu, X, Sparkles, CheckCircle2, ChevronDown, Shield 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { SuperAdminAccessModal } from '@/components/common/SuperAdminAccessModal';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (role: UserRole) => {
    if (role === 'super_admin') {
      setDemoDropdownOpen(false);
      setAdminModalOpen(true);
      return;
    }
    await switchRole(role);
    setDemoDropdownOpen(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans overflow-x-hidden w-full max-w-full">
      {/* Top Notification Bar */}
      <div className="bg-[#1E293B] text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden lg:flex items-center gap-2 truncate">
            <span className="bg-[#E53935] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">New</span>
            <span className="truncate">Automated Kiln Chamber & Weighbridge Integration now live in BrickFlow ERP 2.0</span>
          </div>
          <div className="flex items-center gap-4 mx-auto lg:mx-0 shrink-0">
            <a href="tel:+918500693113" className="flex items-center gap-1.5 hover:text-red-400 transition-colors font-medium">
              <Phone className="w-3.5 h-3.5 text-[#E53935]" />
              <span>+91 85006 93113 (Sales & Demo)</span>
            </a>
            <span className="text-slate-600 hidden xl:inline">•</span>
            <span className="hidden xl:inline text-slate-300">Mon - Sat: 9 AM - 8 PM IST</span>
          </div>
        </div>
      </div>

      {/* Main SaaS Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between gap-3 xl:gap-6">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center shrink-0 mr-2 lg:mr-4 group">
            <img 
              src="/logo.png" 
              alt="Patterns BrickOS" 
              className="h-12 sm:h-14 xl:h-16 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>

          {/* Center: Desktop Nav (xl and 2xl) */}
          <nav className="hidden xl:flex items-center gap-5 2xl:gap-7 text-sm font-semibold text-slate-700">
            <a href="#why-brickflow" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Why BrickFlow</a>
            <a href="#features" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Features</a>
            <a href="#modules" className="hover:text-[#E53935] transition-colors whitespace-nowrap">ERP Modules</a>
            <a href="#how-it-works" className="hover:text-[#E53935] transition-colors whitespace-nowrap">How It Works</a>
            <a href="#pricing" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Pricing</a>
            <a href="#faq" className="hover:text-[#E53935] transition-colors whitespace-nowrap">FAQ</a>
          </nav>

          {/* Condensed Nav for lg screens (1024px - 1279px) */}
          <nav className="hidden lg:flex xl:hidden items-center gap-3.5 text-xs font-semibold text-slate-700">
            <a href="#why-brickflow" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Why BrickFlow</a>
            <a href="#features" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Features</a>
            <a href="#modules" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Modules</a>
            <a href="#pricing" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Pricing</a>
          </nav>

          {/* Right: Action Buttons */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Quick Demo Selector */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E53935]" />
                <span className="hidden md:inline">Explore</span>
                <span>Demos</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">Instant 1-Click Sandbox</p>
                  <button
                    onClick={() => handleQuickLogin('factory_owner')}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-red-50 hover:text-[#D32F2F] text-xs font-medium flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-[#D32F2F]">Factory Owner</div>
                      <div className="text-[11px] text-slate-500">Full ERP, Production & Financials</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#D32F2F]" />
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => handleQuickLogin('super_admin')}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-purple-50 text-xs font-medium flex items-center justify-between group text-purple-700"
                  >
                    <div>
                      <div className="font-bold">Super Admin Platform</div>
                      <div className="text-[11px] text-slate-500">Multi-tenant SaaS Control</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-700" />
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <Link to={user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard'}>
                <Button variant="secondary" size="md" className="whitespace-nowrap px-3 xl:px-4 text-xs xl:text-sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="md" className="whitespace-nowrap px-3 xl:px-4 text-xs xl:text-sm">
                  Login
                </Button>
              </Link>
            )}

            <Link to="/register">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4 hidden sm:inline" />} className="whitespace-nowrap font-bold px-3.5 xl:px-5 text-xs xl:text-sm shadow-xs">
                Start Your Factory
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in">
            <nav className="flex flex-col gap-2 font-semibold text-slate-700 text-sm">
              <a href="#why-brickflow" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">Why BrickFlow</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">Features</a>
              <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">ERP Modules</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">FAQ</a>
            </nav>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full">
                  Start Your Factory Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1 overflow-x-hidden w-full max-w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#1E293B] text-slate-300 border-t border-slate-800 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white px-3 py-1.5 rounded-xl inline-block shadow-sm">
                  <img 
                    src="/logo.png" 
                    alt="BrickFlow ERP" 
                    className="h-10 w-auto object-contain" 
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                India's #1 Cloud Operating System for Fly Ash, Red Clay, Cement & Paver Block manufacturing plants. Built to streamline production, stop inventory leakage, and automate GST compliance.
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>GST Ready</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ISO 27001 Cloud</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Made for India</span>
                </div>
              </div>
            </div>

            {/* Col 2: Product & Modules */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">ERP Modules</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/products" className="hover:text-white transition-colors">Product Masters</Link></li>
                <li><Link to="/raw-materials" className="hover:text-white transition-colors">Raw Material Inventory</Link></li>
                <li><Link to="/production" className="hover:text-white transition-colors">Batch & Kiln Control</Link></li>
                <li><Link to="/stock" className="hover:text-white transition-colors">Real-time Stock Ledger</Link></li>
                <li><Link to="/labour" className="hover:text-white transition-colors">Labour & Wages Payroll</Link></li>
                <li><Link to="/sales" className="hover:text-white transition-colors">Sales & GST Invoicing</Link></li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Brick Types Supported</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><span className="hover:text-white">Fly Ash Cement Bricks</span></li>
                <li><span className="hover:text-white">Red Clay Chamber Kilns</span></li>
                <li><span className="hover:text-white">Concrete Hollow Blocks</span></li>
                <li><span className="hover:text-white">Interlocking Paver Blocks</span></li>
                <li><span className="hover:text-white">Precast Solid Blocks</span></li>
                <li><span className="hover:text-white">Multi-Line Automatic Plants</span></li>
              </ul>
            </div>

            {/* Col 4: Contact & Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Direct Sales & Help</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#E53935]" />
                  <a href="tel:+918500693113" className="hover:text-white transition-colors">+91 85006 93113</a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <a href="https://wa.me/918500693113" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp: +91 85006 93113</a>
                </li>
                <li><span>Email: support@brickflow.io</span></li>
                <li><span>HQ: Industrial Tech Hub, Pune, Maharashtra</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} BrickFlow ERP SaaS. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-400">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400">Terms of Service</a>
              <button 
                onClick={() => setAdminModalOpen(true)} 
                className="hover:text-slate-300 cursor-pointer"
              >
                Super Admin Portal
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Super Admin Access Key Modal */}
      <SuperAdminAccessModal 
        isOpen={adminModalOpen} 
        onClose={() => setAdminModalOpen(false)} 
      />
    </div>
  );
};
