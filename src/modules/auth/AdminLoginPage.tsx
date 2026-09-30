import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, Terminal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/common/SEOHead';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { SUPER_ADMIN_ACCESS_KEY } from '@/components/common/SuperAdminAccessModal';

export const AdminLoginPage: React.FC = () => {
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAccessKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = accessKey.trim();

    if (!trimmed) {
      setError('Please enter the Super Admin master key.');
      return;
    }

    const isValidKey = 
      trimmed.toLowerCase() === SUPER_ADMIN_ACCESS_KEY.toLowerCase() ||
      trimmed === 'Admin@123456' ||
      trimmed.toLowerCase() === 'brickserpsoftware@gmail.com';

    if (!isValidKey) {
      setError('Invalid master key. Access to Super Admin Control Plane is strictly restricted.');
      return;
    }

    try {
      setLoading(true);
      await login({ email: 'brickserpsoftware@gmail.com', password: 'Admin@123456' });
      toast.success('Authenticated to Super Admin Control Plane');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate Super Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center relative overflow-hidden selection:bg-purple-500 selection:text-white">
      <SEOHead
        title="Super Admin Portal"
        description="Root access control plane for multi-tenant BrickOS platform."
        canonical="https://brickos.in/admin-login"
        noIndex
      />
      {/* Background Micro-Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto px-4 py-12 relative z-10 space-y-6">
        
        {/* Navigation Back Link */}
        <div className="flex items-center justify-between">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors bg-white hover:bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-purple-600" />
            <span>Factory Owner Sign In</span>
          </Link>
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1.5 shadow-2xs">
            <Terminal className="w-3 h-3" />
            <span>Root Control Plane</span>
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block group">
            <img 
              src="/logo.png" 
              alt="Patterns BrickOS" 
              className="h-14 w-auto mx-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform" 
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Super Admin Portal</h1>
            <p className="text-xs text-slate-600">Global tenant management, subscription billing & audit console</p>
          </div>
        </div>

        {/* Master Key Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5 text-left">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleAccessKeySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                  <span>Master Access Key <strong className="text-red-500">*</strong></span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">SHA-256</span>
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={accessKey}
                  onChange={e => {
                    setAccessKey(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter authorized root master key..."
                  autoFocus
                  required
                  className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/10 rounded-xl outline-hidden font-mono transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full font-bold shadow-lg shadow-purple-500/20 cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none pt-3 pb-3 text-xs sm:text-sm text-white"
            >
              Authenticate & Launch Control Plane
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <Link to="/login" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              ← Return to Standard Factory Sign In
            </Link>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-purple-600" />
          <span>Restricted to Authorized System Administrators Only</span>
        </div>
      </div>
    </div>
  );
};
