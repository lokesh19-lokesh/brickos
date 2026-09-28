import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { SuperAdminAccessModal } from '@/components/common/SuperAdminAccessModal';
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
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const { login, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Check if returning with an active session (e.g. from OAuth redirect)
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-amber-50/20 px-4 py-12 selection:bg-red-500 selection:text-white">
      <div className="w-full max-w-md space-y-5">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#E53935] transition-colors bg-white/90 hover:bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloud Live • v2.4</span>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            <img 
              src="/logo.png" 
              alt="BrickFlow ERP" 
              className="h-14 w-auto mx-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform" 
            />
          </Link>
          <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
            Sign in to Patterns BrickOS
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Manufacturing operations, inventory ledgers, payroll, and GST compliance
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          {error && (
            <Alert type="error" title="Authentication Notice">
              {error}
            </Alert>
          )}

          {/* 1. Google OAuth Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#E53935]" />
                  <span className="text-slate-600">Connecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Official Google G Logo */}
                  <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-3 pb-1">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                or continue with email
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>
          </div>

          {/* 2. Email & Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              placeholder="owner@shreerambricks.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
              isRequired
            />

            <div className="space-y-1.5">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
                isRequired
              />
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded text-[#E53935] focus:ring-[#E53935]"
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="font-semibold text-[#E53935] hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={loading}
              className="w-full font-bold shadow-md hover:shadow-lg transition-all"
            >
              Sign In to Factory
            </Button>
          </form>

          {/* Registration link */}
          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
            Don't have an ERP account?{' '}
            <Link to="/register" className="font-bold text-[#E53935] hover:underline">
              Create Factory Free
            </Link>
          </div>
        </div>

        {/* Security & Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            GST & E-Way Ready
          </span>
        </div>

        {/* Super admin link */}
        <div className="text-center text-xs text-slate-400">
          Super Admin?{' '}
          <button
            type="button"
            onClick={() => setAdminModalOpen(true)}
            className="font-semibold text-slate-600 hover:text-[#E53935] underline cursor-pointer"
          >
            Super Admin Control Portal
          </button>
        </div>
      </div>

      {/* Super Admin Master Access Key Modal */}
      <SuperAdminAccessModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </div>
  );
};
