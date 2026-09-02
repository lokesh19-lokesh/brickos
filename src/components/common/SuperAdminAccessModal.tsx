import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Eye, EyeOff, AlertCircle, ArrowRight, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';

interface SuperAdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectTo?: string;
}

export const SUPER_ADMIN_ACCESS_KEY = 'brickserpsoftware@gmail.com';

export const SuperAdminAccessModal: React.FC<SuperAdminAccessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  redirectTo = '/admin/dashboard',
}) => {
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { switchRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = accessKey.trim();

    if (!trimmed) {
      setError('Please enter the Super Admin access key.');
      return;
    }

    if (trimmed.toLowerCase() !== SUPER_ADMIN_ACCESS_KEY.toLowerCase()) {
      setError('Invalid access key. Access to Super Admin is restricted.');
      return;
    }

    try {
      setIsLoading(true);
      await switchRole('super_admin');
      toast.success('Super Admin Demo unlocked successfully!');
      setAccessKey('');
      setError(null);
      onClose();

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(redirectTo);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate Super Admin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAccessKey('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mb-3 text-purple-300">
            <Shield className="w-6 h-6" />
          </div>
          
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">Super Admin Access</h3>
            <span className="text-[10px] font-black tracking-wider uppercase bg-purple-500/30 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded">
              Protected Demo
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Enter the master access key to open the multi-tenant SaaS control plane.
          </p>
        </div>

        {/* Modal Body & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#E53935]" />
              <span>Master Access Key <strong className="text-red-500">*</strong></span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={accessKey}
                onChange={(e) => {
                  setAccessKey(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter access key..."
                autoFocus
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

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold shadow-xs cursor-pointer"
            >
              Unlock Super Admin
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
