import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  Building2, Layers, ShieldCheck, ArrowRight, Phone, MessageSquare, 
  Menu, X, Sparkles, CheckCircle2, ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (role: UserRole) => {
    await switchRole(role);
    setDemoDropdownOpen(false);
    if (role === 'super_admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top Notification Bar */}
      <div className="bg-[#1E293B] text-white text-xs py-2 px-4 text-center border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2">
            <span className="bg-[#E53935] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">New</span>
            <span>Automated Kiln Chamber & Weighbridge Integration now live in BrickFlow ERP 2.0</span>
          </div>
          <div className="flex items-center gap-4 mx-auto sm:mx-0">
            <a href="tel:+919822012345" className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#E53935]" />
              <span>+91 98220 12345 (Sales & Demo)</span>
            </a>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="hidden md:inline text-slate-300">Mon - Sat: 9 AM - 8 PM IST</span>
          </div>
        </div>
      </div>

      {/* Main SaaS Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Patterns BrickOS" 
              className="h-10 w-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform" 
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-[#1E293B] tracking-tight">Brick</span>
                <span className="text-xl font-black text-[#E53935]">Flow</span>
                <span className="text-[10px] uppercase font-bold bg-[#FFEBEE] text-[#D32F2F] px-1.5 py-0.5 rounded tracking-widest ml-1 border border-red-200/50">ERP</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide -mt-0.5">Cloud OS for Brick Manufacturing</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#why-brickflow" className="hover:text-[#E53935] transition-colors">Why BrickFlow</a>
            <a href="#features" className="hover:text-[#E53935] transition-colors">Features</a>
            <a href="#modules" className="hover:text-[#E53935] transition-colors">ERP Modules</a>
            <a href="#how-it-works" className="hover:text-[#E53935] transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-[#E53935] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#E53935] transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Demo Selector */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E53935]" />
                <span>Explore Live Demos</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">Instant 1-Click Sandbox</p>
                  <button
                    onClick={() => handleQuickLogin('factory_owner')}
                    className="w-full text-left p-2 rounded-lg hover:bg-red-50 hover:text-[#D32F2F] text-xs font-medium flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-[#D32F2F]">Factory Owner</div>
                      <div className="text-[11px] text-slate-500">Full ERP & Financials</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#D32F2F]" />
                  </button>
                  <button
                    onClick={() => handleQuickLogin('factory_manager')}
                    className="w-full text-left p-2 rounded-lg hover:bg-red-50 hover:text-[#D32F2F] text-xs font-medium flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-[#D32F2F]">Plant Manager</div>
                      <div className="text-[11px] text-slate-500">Production & Labour Roster</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#D32F2F]" />
                  </button>
                  <button
                    onClick={() => handleQuickLogin('factory_user')}
                    className="w-full text-left p-2 rounded-lg hover:bg-red-50 hover:text-[#D32F2F] text-xs font-medium flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-[#D32F2F]">Accountant / Billing</div>
                      <div className="text-[11px] text-slate-500">GST Invoices & Payments</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#D32F2F]" />
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => handleQuickLogin('super_admin')}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-xs font-medium flex items-center justify-between group text-purple-700"
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
                <Button variant="secondary" size="md">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="md">
                  Login
                </Button>
              </Link>
            )}

            <Link to="/register">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
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
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#1E293B] text-slate-300 border-t border-slate-800 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="Patterns BrickOS" 
                  className="h-9 w-auto object-contain bg-white/10 p-1 rounded-xl" 
                />
                <span className="text-2xl font-black text-white">Brick<span className="text-[#E53935]">Flow</span> ERP</span>
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
                  <span>+91 98220 12345</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp: +91 98220 12345</span>
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
              <Link to="/admin/login" className="hover:text-slate-400">Super Admin Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
