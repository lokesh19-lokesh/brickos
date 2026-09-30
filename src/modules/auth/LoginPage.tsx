import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, Mail, Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, 
  CheckCircle2, Loader2, Factory, Layers, Truck, 
  Users, Flame, Database
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/common/SEOHead';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Check if returning with an active session (e.g. from OAuth redirect or existing token)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        authService.getCurrentUser().then(user => {
          if (user) {
            const isSuperAdmin = user.role === 'super_admin' || user.email?.toLowerCase() === 'brickserpsoftware@gmail.com';
            if (isSuperAdmin) {
              toast.success('Welcome back, Super Admin!');
              navigate('/admin/dashboard', { replace: true });
            } else {
              toast.success(`Welcome back, ${user.fullName}!`);
              navigate(from.startsWith('/admin') ? '/dashboard' : from, { replace: true });
            }
          }
        });
      }
    });
  }, [navigate, from, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await login({ email, password });
      
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail === 'brickserpsoftware@gmail.com' || res?.user?.role === 'super_admin') {
        toast.success('Welcome back, Super Admin!');
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast.success('Welcome back to BrickOS!');
        navigate(from.startsWith('/admin') ? '/dashboard' : from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or inactive account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      const res = await signInWithGoogle();
      if (res?.error) {
        setError(res.error);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to Google authentication.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center relative overflow-hidden selection:bg-red-500 selection:text-white">
      <SEOHead
        title="Sign In to Plant Workspace"
        description="Secure sign-in for brick plant owners, plant supervisors, dispatch managers, and accountants on BrickOS."
        canonical="https://brickos.in/login"
      />
      {/* Background Micro-Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      
      {/* Warm Ambient Glow Highlights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Two-Column Split Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 z-10 flex-1 flex flex-col justify-center">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#E53935]" />
            <span>Marketing Portal</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Cloud DB Connected</span>
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs">
              v2.4 Enterprise
            </span>
          </div>
        </div>

        {/* 2-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Industrial SaaS Product Showcase */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#E53935] text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>Next-Gen Industrial Plant Intelligence</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                The Operating System for <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Modern Brick & Paver Plants
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Connect raw material weighbridges, multi-chamber kilns, finished stock ledgers, piece-rate labour wages, and GST e-invoicing in one synchronized database.
              </p>
            </div>

            {/* 4 Feature Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-[#E53935] flex items-center justify-center">
                    <Factory className="w-4 h-4" />
                  </div>
                  <span>Batch & Kiln Telemetry</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Chamber-wise firing records, daily molding cycles, breakage analysis, and mix optimization.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span>Zero-Leakage Inventory</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Real-time finished goods & raw material ledgers with automatic re-order alerts and audit logs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span>GST & E-Way Bill Dispatch</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  1-click tax invoicing, transport challans, customer receivables aging, and WhatsApp billing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Piece-Rate Labour Payroll</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Shift attendance, contractor piece-rates per thousand, cash advances, and automated wage slips.
                </p>
              </div>
            </div>

            {/* Enterprise Trust Footnote */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL Cloud Sync</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Multi-Tenant PostgreSQL Isolation</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-600" />
                <span>99.98% High Availability</span>
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Enterprise Sign-In Card (Clean Light Theme) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 space-y-6 text-left relative overflow-hidden">
              
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <img 
                    src="/logo.png" 
                    alt="Patterns BrickOS" 
                    className="h-10 w-auto object-contain" 
                  />
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    Client Portal
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Sign In to Factory ERP
                </h2>
                <p className="text-xs text-slate-500">
                  Access your plant ledgers, kiln operations, and dispatches
                </p>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <div className="w-4 h-4 shrink-0 mt-0.5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px]">
                    !
                  </div>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* 1. Google 1-Click OAuth Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E53935]" />
                      <span className="text-slate-600 font-medium">Connecting with Google...</span>
                    </>
                  ) : (
                    <>
                      {/* Official Google Icon */}
                      <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.59l4.03 3.15c.95-2.83 3.6-4.99 6.72-4.99z"
                        />
                      </svg>
                      <span>Continue with Google Workspace</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center pt-2 pb-1">
                  <div className="flex-grow border-t border-slate-200" />
                  <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    or sign in with work email
                  </span>
                  <div className="flex-grow border-t border-slate-200" />
                </div>
              </div>

              {/* 2. Email & Password Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#E53935]" />
                    <span>Work Email Address <strong className="text-red-500">*</strong></span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="owner@yourbrickplant.com"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#E53935]" />
                      <span>Password <strong className="text-red-500">*</strong></span>
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-[11px] font-semibold text-[#E53935] hover:text-red-700 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-2.5 pr-10 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#E53935] focus:ring-[#E53935]"
                    />
                    <span>Remember this workstation</span>
                  </label>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  isLoading={loading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full font-bold shadow-lg shadow-red-500/25 cursor-pointer pt-3 pb-3 text-sm bg-gradient-to-r from-[#E53935] to-[#D32F2F] hover:from-[#D32F2F] hover:to-[#B71C1C] text-white"
                >
                  Sign In to Plant ERP
                </Button>
              </form>

              {/* Registration footer */}
              <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
                <p>
                  Don't have an enterprise account?{' '}
                  <Link to="/register" className="font-bold text-[#E53935] hover:text-red-700 hover:underline">
                    Create Factory Free (14-Day Access)
                  </Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default LoginPage;
