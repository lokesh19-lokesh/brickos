import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Mail, ArrowLeft, CheckCircle2, Lock, ShieldCheck, 
  Sparkles, KeyRound, AlertCircle, Eye, EyeOff, ArrowRight, ShieldAlert,
  Clock, RefreshCw, Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/common/SEOHead';
import { authService } from '@/services/authService';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError('Please enter your registered work email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authService.forgotPassword(normalized);
      setSubmitted(true);
      setCooldown(60);
      toast.success('Password recovery instructions sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Unable to process password reset. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    try {
      setResending(true);
      setError(null);
      await authService.forgotPassword(email.trim().toLowerCase());
      setCooldown(60);
      toast.success('Recovery link resent! Please check your inbox and spam folder.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend recovery email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center relative overflow-hidden selection:bg-red-500 selection:text-white">
      <SEOHead
        title="Recover Your Password"
        description="Self-service credentials recovery for authorized factory owners, plant supervisors, and executive accounts on BrickOS."
        canonical="https://brickos.in/forgot-password"
      />
      {/* Background Industrial Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Industrial SaaS Enterprise Showcase */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Enterprise Industrial Cloud • BrickOS v2.4</span>
            </div>

            <div className="space-y-3">
              <Link to="/" className="inline-block">
                <img 
                  src="/logo.png" 
                  alt="Patterns BrickOS" 
                  className="h-14 sm:h-16 w-auto object-contain mx-auto lg:mx-0 drop-shadow-xs hover:scale-105 transition-transform" 
                />
              </Link>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Enterprise Password <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E53935] via-red-600 to-orange-600">
                  Recovery Engine
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Secure self-service credentials recovery for authorized factory owners, plant supervisors, and executive accounts.
              </p>
            </div>

            {/* Security Guarantee Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit SSL Cloud</span>
                </div>
                <p className="text-[11px] text-slate-500">Encrypted token validation powered by Supabase PostgreSQL RLS.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-700 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>60-Min Expiry</span>
                </div>
                <p className="text-[11px] text-slate-500">One-time single-use recovery link to prevent unauthorized access.</p>
              </div>
            </div>

            {/* Association Trust Proof */}
            <div className="pt-2 text-xs text-slate-500 flex items-center justify-center lg:justify-start gap-2">
              <span className="text-slate-600 font-semibold">Trusted by 150+ Brick & Paver Plants across India</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Security Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 relative space-y-6">
              
              {/* Back to Login Anchor */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#E53935]" />
                  <span>Back to Sign In</span>
                </Link>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  AUTH-SEC-402
                </span>
              </div>

              {submitted ? (
                /* Dispatched Security Verification Card */
                <div className="text-center space-y-5 py-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#E53935] border border-red-200 flex items-center justify-center mx-auto shadow-2xs">
                    <Mail className="w-8 h-8 animate-pulse text-[#E53935]" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recovery Link Dispatched</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      We have transmitted secure password recovery instructions to:
                    </p>
                    <div className="inline-block bg-slate-50 text-slate-800 font-mono text-xs px-3 py-1.5 rounded-xl border border-slate-200 mt-1 font-semibold">
                      {email}
                    </div>
                  </div>

                  {/* 3-Step Instruction Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-700">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Action Required in Your Email:</span>
                    </div>
                    <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                      <li>Open your email inbox (and check <strong className="text-slate-800">Spam/Junk</strong> if not seen).</li>
                      <li>Click the <strong className="text-slate-900 font-bold">"Reset Password"</strong> link sent by <strong className="text-slate-800">BrickOS Security</strong>.</li>
                      <li>The link will open the secure password change screen with an authenticated recovery token.</li>
                    </ol>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0 || resending}
                      className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-white text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                    >
                      {resending ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E53935]" />
                          <span>Resending Recovery Link...</span>
                        </>
                      ) : cooldown > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Resend available in {cooldown}s</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-[#E53935]" />
                          <span>Resend Email Link</span>
                        </>
                      )}
                    </button>

                    <Link to="/login" className="block">
                      <Button variant="primary" size="lg" className="w-full font-bold shadow-md shadow-red-500/20 cursor-pointer bg-gradient-to-r from-[#E53935] to-[#D32F2F]">
                        Return to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Initial Request Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">Reset Account Password</h2>
                    <p className="text-xs text-slate-500">
                      Enter your registered factory email address to receive recovery instructions.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#E53935]" />
                      <span>Registered Work Email Address <strong className="text-red-500">*</strong></span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="owner@shreerambricks.com"
                      autoFocus
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-sm transition-all shadow-2xs font-medium"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    isLoading={loading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full font-bold shadow-lg shadow-red-500/20 cursor-pointer py-3.5 bg-gradient-to-r from-[#E53935] to-[#D32F2F]"
                  >
                    Send Recovery Link
                  </Button>

                  <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Need help? Contact plant support at +91 85006 93113</span>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        // 1. Check for PKCE recovery code in query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
          const { error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (codeErr) console.warn('Recovery code exchange notice:', codeErr);
        }

        // 2. Check for active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          setHasRecoverySession(true);
          setCheckingSession(false);
          return;
        }

        // 3. Listen for onAuthStateChange recovery event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
          if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || s) && isMounted) {
            setHasRecoverySession(true);
            setCheckingSession(false);
          }
        });

        // Timeout check after 1.5 seconds
        setTimeout(() => {
          if (isMounted) {
            setCheckingSession(false);
          }
        }, 1500);

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.warn('Session verification notice:', err);
        if (isMounted) setCheckingSession(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(password);
      setSubmitted(true);
      toast.success('Your password has been updated successfully!');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Recovery link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength evaluation
  const hasMinLength = password.length >= 6;
  const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
  const isStrong = password.length >= 8 && hasNumberOrSymbol;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center relative overflow-hidden selection:bg-red-500 selection:text-white">
      {/* Ambient Glow & Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto px-4 py-12 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-6">
          <Link to="/" className="inline-block group">
            <img 
              src="/logo.png" 
              alt="Patterns BrickOS" 
              className="h-14 w-auto mx-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform" 
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Set New Industrial Password</h1>
            <p className="text-xs text-slate-600">Update credentials for your factory enterprise workspace</p>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5">
          
          {checkingSession ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#E53935] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Verifying security token and recovery session...</p>
            </div>
          ) : !hasRecoverySession ? (
            /* Security Guard Notice if user arrives without clicking recovery email */
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">Recovery Link Required</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  For your plant's security, password updates can only be initiated through the authorized link sent to your registered email address.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>How to reset password:</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Request a recovery email on the Forgot Password page, then click the link inside the email.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <Link to="/forgot-password" className="block">
                  <Button variant="primary" size="lg" className="w-full font-bold shadow-md shadow-red-500/20 cursor-pointer bg-gradient-to-r from-[#E53935] to-[#D32F2F]">
                    Request Password Reset Link
                  </Button>
                </Link>
                <Link to="/login" className="block text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  ← Return to Sign In
                </Link>
              </div>
            </div>
          ) : submitted ? (
            /* Success confirmation */
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Password Updated Successfully</h3>
                <p className="text-xs text-slate-600">
                  Your new credentials have been committed to the enterprise database.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-[#E53935] animate-pulse">
                Redirecting to Sign In...
              </div>
            </div>
          ) : (
            /* Set New Password Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#E53935]" />
                  <span>New Password <strong className="text-red-500">*</strong></span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Minimum 6 characters"
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

              {/* Password Strength Indicator */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Password Strength:</span>
                  <span className={`font-bold ${isStrong ? 'text-emerald-600' : hasMinLength ? 'text-amber-600' : 'text-slate-400'}`}>
                    {isStrong ? 'Strong' : hasMinLength ? 'Moderate' : 'Too Weak'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 transition-all ${hasMinLength ? 'bg-amber-500' : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 transition-all ${isStrong ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#E53935]" />
                  <span>Confirm New Password <strong className="text-red-500">*</strong></span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Re-enter new password"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full font-bold shadow-lg shadow-red-500/20 cursor-pointer mt-2 bg-gradient-to-r from-[#E53935] to-[#D32F2F]"
              >
                Update Password & Launch ERP
              </Button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 text-center">
            <Link to="/login" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

