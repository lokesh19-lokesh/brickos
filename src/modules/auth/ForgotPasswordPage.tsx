import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await authService.forgotPassword(email);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/logo.png" alt="Patterns BrickOS" className="h-10 w-auto object-contain" />
            <span className="text-2xl font-black text-[#1E293B]">Brick<span className="text-[#E53935]">Flow</span></span>
          </Link>
          <h2 className="text-xl font-bold text-[#1E293B]">Reset Your Password</h2>
          <p className="text-xs text-slate-500">Enter your registered email address and we'll send a password recovery link.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Reset link sent!</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                If an account exists for <strong className="text-slate-800">{email}</strong>, you will receive password reset instructions within 2 minutes.
              </p>
              <div className="pt-4">
                <Link to="/reset-password">
                  <Button variant="primary" size="md" className="w-full">
                    Proceed to Reset Password
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="owner@shreerambricks.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                isRequired
              />

              <Button variant="primary" size="lg" type="submit" isLoading={loading} className="w-full font-bold">
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="border-t border-slate-100 pt-4 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    await authService.resetPassword(password);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/logo.png" alt="Patterns BrickOS" className="h-10 w-auto object-contain" />
            <span className="text-2xl font-black text-[#1E293B]">Brick<span className="text-[#E53935]">Flow</span></span>
          </Link>
          <h2 className="text-xl font-bold text-[#1E293B]">Set New Password</h2>
          <p className="text-xs text-slate-500">Create a secure password for your factory ERP account.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          {error && <div className="text-xs text-rose-600 font-semibold">{error}</div>}

          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Password reset successful!</h4>
              <p className="text-xs text-slate-500">You can now sign in with your new credentials.</p>
              <div className="pt-3">
                <Link to="/login">
                  <Button variant="primary" size="md" className="w-full">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
                isRequired
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
                isRequired
              />

              <Button variant="primary" size="lg" type="submit" isLoading={loading} className="w-full font-bold">
                Reset Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
