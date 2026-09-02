import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UserRole } from '@/types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, switchRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your registered email address and password.');
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      toast.success('Signed in successfully!');
      
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or inactive account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole, demoEmail: string) => {
    try {
      setLoading(true);
      setError(null);
      await switchRole(role);
      toast.success(`Logged in as ${role.replace('_', ' ')}`);
      if (role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            <img 
              src="/logo.png" 
              alt="BrickFlow ERP" 
              className="h-14 w-auto mx-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform" 
            />
          </Link>
          <h2 className="text-xl font-bold text-[#1E293B] pt-2">Sign in to your factory</h2>
          <p className="text-xs text-slate-500">Access production, inventory, wages, and GST invoices</p>
        </div>

        {/* 1-Click Sandbox Fast Picker */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-amber-600">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Demo Logins
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Click to test instant access</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleDemoLogin('factory_owner', 'owner@shreerambricks.com')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-200/80 text-xs font-bold text-slate-800 text-center transition-all cursor-pointer flex flex-col items-center justify-center"
            >
              <span className="text-[#D32F2F]">Factory Owner</span>
              <span className="text-[10px] text-slate-500 font-normal">owner@shreerambricks.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('super_admin', 'admin@patterns.cloud')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200/80 text-xs font-bold text-purple-800 text-center transition-all cursor-pointer flex flex-col items-center justify-center"
            >
              <span className="text-purple-700">Super Admin</span>
              <span className="text-[10px] text-slate-500 font-normal">admin@patterns.cloud</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          {error && (
            <Alert type="error" title="Authentication Error">
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              placeholder="owner@shreerambricks.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
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
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
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
              className="w-full font-bold shadow-md"
            >
              Sign In to Factory
            </Button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
            Don't have an ERP account?{' '}
            <Link to="/register" className="font-bold text-[#E53935] hover:underline">
              Create Factory Free
            </Link>
          </div>
        </div>

        {/* Super admin link */}
        <div className="text-center text-xs text-slate-400">
          Super Admin?{' '}
          <Link to="/admin/login" className="font-semibold text-slate-600 hover:text-slate-900 underline">
            Super Admin Control Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
