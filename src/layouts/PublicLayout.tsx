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
            <span className="truncate">Automated Kiln Chamber & Weighbridge Integration now live in BrickOS™ 2.4</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 xl:px-8 h-18 sm:h-20 flex items-center justify-between gap-2 lg:gap-3 xl:gap-4">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center shrink-0 mr-1 lg:mr-2 group">
            <img 
              src="/logo.png" 
              alt="Patterns BrickOS" 
              className="h-10 sm:h-12 xl:h-13 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>

          {/* Center: Desktop Nav for 2xl (>1536px) */}
          <nav className="hidden 2xl:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <a href="#why-brickflow" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Why BrickOS</a>
            <a href="#features" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Features</a>
            <a href="#modules" className="hover:text-[#E53935] transition-colors whitespace-nowrap">ERP Modules</a>
            <a href="#how-it-works" className="hover:text-[#E53935] transition-colors whitespace-nowrap">How It Works</a>
            <a href="#pricing" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Pricing</a>
            <a href="#faq" className="hover:text-[#E53935] transition-colors whitespace-nowrap">FAQ</a>
          </nav>

          {/* Center: Desktop Nav for xl (1280px - 1535px) */}
          <nav className="hidden xl:flex 2xl:hidden items-center gap-3.5 text-xs font-semibold text-slate-700">
            <a href="#why-brickflow" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Why BrickOS</a>
            <a href="#features" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Features</a>
            <a href="#modules" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Modules</a>
            <a href="#pricing" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Pricing</a>
            <a href="#faq" className="hover:text-[#E53935] transition-colors whitespace-nowrap">FAQ</a>
          </nav>

          {/* Condensed Nav for lg screens (1024px - 1279px, including 1080px) */}
          <nav className="hidden lg:flex xl:hidden items-center gap-2.5 text-xs font-semibold text-slate-700">
            <a href="#why-brickflow" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Why BrickOS</a>
            <a href="#features" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Features</a>
            <a href="#modules" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Modules</a>
            <a href="#pricing" className="hover:text-[#E53935] transition-colors whitespace-nowrap">Pricing</a>
          </nav>

          {/* Right: Action Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 xl:gap-2.5 shrink-0">
            {/* Quick Demo Selector */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs whitespace-nowrap"
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
                    className="w-full text-left p-2.5 rounded-lg hover:bg-red-50 hover:text-[#D32F2F] text-xs font-medium flex items-center justify-between group transition-colors cursor-pointer"
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
                    className="w-full text-left p-2.5 rounded-lg hover:bg-purple-50 text-xs font-medium flex items-center justify-between group text-purple-700 cursor-pointer"
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

            <Link to="/login">
              <Button variant="outline" size="sm" className="whitespace-nowrap px-2.5 xl:px-3 py-1.5 text-xs font-semibold">
                Sign In
              </Button>
            </Link>

            {user && (
              <Link to={user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard'}>
                <Button variant="secondary" size="sm" className="whitespace-nowrap px-2.5 xl:px-3 py-1.5 text-xs font-semibold">
                  Dashboard
                </Button>
              </Link>
            )}

            <Link to="/register">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5 hidden md:inline" />} className="whitespace-nowrap font-bold px-3 xl:px-4 py-1.5 text-xs shadow-xs">
                Start Your Factory
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in">
            <nav className="flex flex-col gap-2 font-semibold text-slate-700 text-sm">
              <a href="#why-brickflow" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">Why BrickOS</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">Features</a>
              <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">ERP Modules</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">FAQ</a>
            </nav>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full font-bold">
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

              {/* Social Media Links */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Follow BrickOS
                </p>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://x.com/tpcbrickos"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow BrickOS on X (formerly Twitter)"
                    title="X (Twitter)"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700/60 transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/tpcbricksos/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow BrickOS on Instagram"
                    title="Instagram"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700/60 transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </a>
                  <a
                    href="https://in.pinterest.com/brickserpsoftware/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow BrickOS on Pinterest"
                    title="Pinterest"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#E60023] text-slate-400 hover:text-white flex items-center justify-center border border-slate-700/60 transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.987.026l.03-.026z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@TPCBricksos"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Subscribe to BrickOS on YouTube"
                    title="YouTube"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#FF0000] text-slate-400 hover:text-white flex items-center justify-center border border-slate-700/60 transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
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
                <li><span>Email: support@brickos.in</span></li>
                <li><span>HQ: Industrial Tech Hub, Pune, Maharashtra</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
              <p>© {new Date().getFullYear()} BrickOS™ Manufacturing Cloud. All rights reserved.</p>
              <span className="hidden sm:inline text-slate-700">•</span>
              <p>
                Powered by{' '}
                <a 
                  href="https://thepatternscompany.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-white font-medium underline underline-offset-4 decoration-slate-600 hover:decoration-white transition-colors"
                >
                  Patterns Infotech Pvt Ltd.
                </a>
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 pr-2 border-r border-slate-700/60">
                <a
                  href="https://x.com/tpcbrickos"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  title="X (Twitter)"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/tpcbricksos/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="text-slate-400 hover:text-pink-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a
                  href="https://in.pinterest.com/brickserpsoftware/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  title="Pinterest"
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.987.026l.03-.026z"/>
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@TPCBricksos"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  title="YouTube"
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
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
