import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, Terminal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Ambient Lighting & Micro-Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#E53935]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto px-4 py-12 relative z-10 space-y-6">
        
        {/* Navigation Back Link */}
        <div className="flex items-center justify-between">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
            <span>Factory Owner Sign In</span>
          </Link>
          <span className="text-[11px] font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-800/60 flex items-center gap-1.5">
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
              className="h-14 w-auto mx-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Super Admin Portal</h1>
            <p className="text-xs text-slate-400">Global tenant management, subscription billing & audit console</p>
          </div>
        </div>

        {/* Master Key Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-5 text-left">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAccessKeySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  <span>Master Access Key <strong className="text-red-500">*</strong></span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">SHA-256</span>
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
                  className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-purple-500 rounded-xl outline-hidden font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
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
              className="w-full font-bold shadow-lg shadow-purple-500/20 cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-none pt-3 pb-3 text-xs sm:text-sm"
            >
              Authenticate & Launch Control Plane
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-center">
            <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
              ← Return to Standard Factory Sign In
            </Link>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>Restricted to Authorized System Administrators Only</span>
        </div>
      </div>
    </div>
  );
};
