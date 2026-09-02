import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-purple-900/40">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Super Admin Control Portal</h2>
          <p className="text-xs text-slate-400">Multi-tenant subscription orchestrator & platform management</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-5">
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
              className="bg-slate-950 border-slate-800 text-white"
              required
              isRequired
            />

            <Input
              label="Master Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              className="bg-slate-950 border-slate-800 text-white"
              required
              isRequired
            />

            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              Access Admin Console
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              onClick={handleQuickAdmin}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              ⚡ Instant 1-Click Root Bypass (Demo)
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          <Link to="/login" className="hover:text-slate-300">
            ← Return to Factory User Login
          </Link>
        </div>
      </div>
    </div>
  );
};
