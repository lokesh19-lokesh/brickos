import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@brickflow.io');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, switchRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await login({ email, password });
      toast.success('Signed into Super Admin Control Plane');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid super admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = async () => {
    try {
      setLoading(true);
      await switchRole('super_admin');
      toast.success('Logged in as Super Admin');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Patterns BrickOS" 
              className="h-11 w-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform" 
            />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-[#1E293B]">Brick<span className="text-[#E53935]">Flow</span></span>
                <span className="bg-[#FFEBEE] text-[#D32F2F] text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border border-red-200/60">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">Multi-tenant Cloud Orchestrator</p>
            </div>
          </Link>
          <h2 className="text-xl font-bold text-[#1E293B] pt-2">Super Admin Control Portal</h2>
          <p className="text-xs text-slate-500">Platform subscription orchestration & tenant administration</p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-5">
          {error && (
            <Alert type="error" title="Access Denied">
              {error}
            </Alert>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input
              label="Admin Root Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
              isRequired
            />

            <Input
              label="Master Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              isRequired
            />

            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={loading}
              className="w-full font-bold shadow-sm"
            >
              Sign In to Control Plane
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400 font-medium">Developer Quick Bypass</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="md"
            type="button"
            onClick={handleQuickAdmin}
            leftIcon={<Sparkles className="w-4 h-4 text-[#E53935]" />}
            className="w-full text-xs font-semibold"
          >
            1-Click Super Admin Login
          </Button>
        </div>

        <div className="text-center text-xs text-slate-400">
          <Link to="/login" className="hover:text-slate-600 transition-colors">
            ← Return to Factory User Login
          </Link>
        </div>
      </div>
    </div>
  );
};
