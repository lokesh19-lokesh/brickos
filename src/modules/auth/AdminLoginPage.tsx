import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Eye, EyeOff, ArrowRight, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { SUPER_ADMIN_ACCESS_KEY } from '@/components/common/SuperAdminAccessModal';

export const AdminLoginPage: React.FC = () => {
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { switchRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAccessKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = accessKey.trim();

    if (!trimmed) {
      setError('Please enter the Super Admin access key.');
      return;
    }

    if (trimmed.toLowerCase() !== SUPER_ADMIN_ACCESS_KEY.toLowerCase()) {
      setError('Invalid access key. Access to Super Admin platform is restricted.');
      return;
    }

    try {
      setLoading(true);
      await switchRole('super_admin');
      toast.success('Signed into Super Admin Control Plane');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate Super Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Navigation Back Link */}
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#E53935] transition-colors bg-white/80 hover:bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Super Admin Portal
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="BrickFlow ERP" 
              className="h-14 w-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform" 
            />
            <span className="bg-[#FFEBEE] text-[#D32F2F] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-red-200/60">
              SUPER ADMIN CONTROL PLANE
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#1E293B] pt-2">Super Admin Verification</h2>
          <p className="text-xs text-slate-500">Platform subscription orchestration & tenant administration</p>
        </div>

        {/* Master Key Card */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-5">
          {error && (
            <Alert type="error" title="Access Denied">
              {error}
            </Alert>
          )}

          <form onSubmit={handleAccessKeySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#E53935]" />
                  <span>Super Admin Access Key <strong className="text-red-500">*</strong></span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={accessKey}
                  onChange={e => {
                    setAccessKey(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter access key..."
                  autoFocus
                  required
                  className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#E53935] rounded-xl outline-hidden font-mono transition-all"
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
              className="w-full font-bold shadow-sm cursor-pointer"
            >
              Authenticate & Enter Control Plane
            </Button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-400">
          <Link to="/login" className="hover:text-slate-600 transition-colors">
            ← Return to Factory Owner Login
          </Link>
        </div>
      </div>
    </div>
  );
};
