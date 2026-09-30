import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, User as UserIcon, Mail, Phone, Lock, MapPin, 
  FileText, Factory, Users, CheckCircle2, ArrowRight, ArrowLeft,
  Flame, ShieldCheck, Database, Sparkles, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/common/SEOHead';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [resending, setResending] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: User Details
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Step 2: Factory Info
    factoryName: '',
    factoryCode: '',
    ownerName: '',
    factoryPhone: '',
    factoryEmail: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    gstNumber: '',

    // Step 3: Business Info
    factoryType: 'Fly Ash Brick' as any,
    employeesCount: '25-50 Workers',
    dailyCapacity: '35,000 Bricks / Day',
    mainProducts: ['Fly Ash Bricks', 'Cement Blocks'],
    agreeTerms: true,
  });

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
        setError('Please complete all required fields.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match. Please verify.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.factoryName || !formData.city || !formData.pincode) {
        setError('Please fill in your factory name, city, and pincode.');
        return;
      }
      setStep(3);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResending(true);
      const { authService } = await import('@/services/authService');
      await authService.resendVerificationEmail(formData.email);
      toast.success('Verification email resent! Please check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await register({
        user: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
        factory: {
          name: formData.factoryName,
          code: formData.factoryCode || `FAC-${Math.floor(100 + Math.random() * 900)}`,
          ownerName: formData.ownerName || formData.fullName,
          phone: formData.factoryPhone || formData.phone,
          email: formData.factoryEmail || formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          gstNumber: formData.gstNumber,
          factoryType: formData.factoryType,
          employeesCount: formData.employeesCount,
          dailyCapacity: formData.dailyCapacity,
          mainProducts: formData.mainProducts,
        },
      });

      if (res?.needsEmailVerification) {
        setVerificationPending(true);
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        setSuccess(true);
        toast.success('Account created successfully!');
        setTimeout(() => {
          navigate('/onboarding');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden selection:bg-red-500 selection:text-white">
      <SEOHead
        title="Register Your Brick Factory | 14-Day Free Trial"
        description="Start your 14-day free trial of BrickOS ERP. Automate raw materials, kiln chambers, moulding batch logs, and GST invoices."
        canonical="https://brickos.in/register"
      />
      {/* Background Micro-Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      
      {/* Warm Ambient Glow Highlights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto space-y-6 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#E53935]" />
            <span>Back to Sign In</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>14-Day Free Plant Trial</span>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            <img 
              src="/logo.png" 
              alt="Patterns BrickOS" 
              className="h-12 w-auto mx-auto object-contain transition-transform group-hover:scale-105 drop-shadow-xs" 
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Register Industrial ERP Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Automated production tracking, raw material ledgers & GST compliance
          </p>
        </div>

        {/* Step Indicator */}
        {!verificationPending && !success && (
          <div className="flex items-center justify-center gap-2 sm:gap-4 py-2">
            {[
              { num: 1, label: 'Admin Profile' },
              { num: 2, label: 'Plant Details' },
              { num: 3, label: 'Scale & Output' },
            ].map(s => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.num
                      ? 'bg-[#E53935] text-white shadow-md shadow-red-500/20'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-400 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${step === s.num ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                  {s.label}
                </span>
                {s.num < 3 && <div className="w-6 sm:w-10 h-0.5 bg-slate-200" />}
              </div>
            ))}
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 text-left space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {verificationPending ? (
            /* Email Verification Screen */
            <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                <Mail className="w-8 h-8 text-[#E53935]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Check Your Email to Verify Account</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  We have dispatched an activation confirmation link to <strong className="text-slate-900 font-bold">{formData.email}</strong>. Please check your inbox and click the link to activate your ERP workspace.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs text-slate-700 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Activation Checklist:</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1 leading-normal">
                  <li>Open the email sent from <strong>BrickOS / Supabase Auth</strong>.</li>
                  <li>Check your <strong>Spam / Promotions folder</strong> if not visible within 2 minutes.</li>
                  <li>Click the activation button to verify your email credentials.</li>
                  <li>Once verified, your factory database is immediately activated.</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  isLoading={resending}
                  className="w-full sm:w-auto font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Resend Verification Email
                </Button>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full font-bold shadow-md shadow-red-500/20 cursor-pointer bg-gradient-to-r from-[#E53935] to-[#D32F2F]">
                    Proceed to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : success ? (
            /* Success confirmation */
            <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Factory Workspace Initialized!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your plant profile and database ledgers are ready for operations.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#E53935] animate-pulse">
                Redirecting to ERP Console...
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: USER ACCOUNT */}
              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 mb-2">
                    <h3 className="text-base font-bold text-slate-900">Step 1: Plant Owner & Admin Credentials</h3>
                    <p className="text-xs text-slate-500">Master login credentials for platform operations.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#E53935]" />
                      <span>Full Name <strong className="text-red-500">*</strong></span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#E53935]" />
                        <span>Work Email <strong className="text-red-500">*</strong></span>
                      </label>
                      <input
                        type="email"
                        placeholder="rajesh@yourplant.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#E53935]" />
                        <span>Mobile Phone <strong className="text-red-500">*</strong></span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98220 12345"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#E53935]" />
                        <span>Password <strong className="text-red-500">*</strong></span>
                      </label>
                      <input
                        type="password"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#E53935]" />
                        <span>Confirm Password <strong className="text-red-500">*</strong></span>
                      </label>
                      <input
                        type="password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      type="submit" 
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="font-bold shadow-md shadow-red-500/20 cursor-pointer bg-gradient-to-r from-[#E53935] to-[#D32F2F]"
                    >
                      Next: Factory Profile
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 2: FACTORY INFORMATION */}
              {step === 2 && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 mb-2">
                    <h3 className="text-base font-bold text-slate-900">Step 2: Factory & Site Information</h3>
                    <p className="text-xs text-slate-500">Plant legal identity and commercial location details.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Factory className="w-3.5 h-3.5 text-[#E53935]" />
                        <span>Factory / Plant Name <strong className="text-red-500">*</strong></span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shree Ram Brick Industries"
                        value={formData.factoryName}
                        onChange={e => setFormData({ ...formData, factoryName: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Factory Code (Prefix)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SRB-01"
                        value={formData.factoryCode}
                        onChange={e => setFormData({ ...formData, factoryCode: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Managing Partner / Owner
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Sharma"
                        value={formData.ownerName}
                        onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        GSTIN Number (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 27AABCS1429B1Z8"
                        value={formData.gstNumber}
                        onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E53935]" />
                      <span>Factory Physical Address</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Plot 45-B, Industrial Estate, Hadapsar"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        City <strong className="text-red-500">*</strong>
                      </label>
                      <input
                        type="text"
                        placeholder="Pune"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        State <strong className="text-red-500">*</strong>
                      </label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Pincode <strong className="text-red-500">*</strong>
                      </label>
                      <input
                        type="text"
                        placeholder="411028"
                        value={formData.pincode}
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="md" 
                      type="button" 
                      onClick={() => setStep(1)} 
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Back
                    </Button>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      type="submit" 
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="font-bold shadow-md shadow-red-500/20 cursor-pointer bg-gradient-to-r from-[#E53935] to-[#D32F2F]"
                    >
                      Next: Scale & Output
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 3: BUSINESS INFORMATION */}
              {step === 3 && (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 mb-2">
                    <h3 className="text-base font-bold text-slate-900">Step 3: Manufacturing Classification</h3>
                    <p className="text-xs text-slate-500">Automates default mix recipe templates and unit conversions.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Primary Plant Technology <strong className="text-red-500">*</strong>
                    </label>
                    <select
                      value={formData.factoryType}
                      onChange={e => setFormData({ ...formData, factoryType: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="Fly Ash Brick">Fly Ash Brick (Automatic / Hydraulic Plant)</option>
                      <option value="Clay / Red Brick">Clay / Red Brick (Chamber / Hoffman / Bull Trench Kiln)</option>
                      <option value="Paver Block & Tiles">Paver Block & Interlocking Tiles</option>
                      <option value="Concrete & Hollow Blocks">Concrete Solid & Hollow Blocks</option>
                      <option value="Multi-Product Plant">Multi-Product Integrated Manufacturing Plant</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Total Workforce / Labour
                      </label>
                      <select
                        value={formData.employeesCount}
                        onChange={e => setFormData({ ...formData, employeesCount: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs cursor-pointer"
                      >
                        <option value="1-15 Workers">1-15 Workers (Small)</option>
                        <option value="15-25 Workers">15-25 Workers</option>
                        <option value="25-50 Workers">25-50 Workers (Standard)</option>
                        <option value="50-100 Workers">50-100 Workers (Large Plant)</option>
                        <option value="100+ Workers">100+ Workers (Enterprise Multi-Shift)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Estimated Daily Production
                      </label>
                      <select
                        value={formData.dailyCapacity}
                        onChange={e => setFormData({ ...formData, dailyCapacity: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 border border-slate-300 focus:border-[#E53935] focus:ring-2 focus:ring-red-500/10 rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all shadow-2xs cursor-pointer"
                      >
                        <option value="10,000 Bricks / Day">10,000 Bricks / Day</option>
                        <option value="25,000 Bricks / Day">25,000 Bricks / Day</option>
                        <option value="35,000 Bricks / Day">35,000 Bricks / Day</option>
                        <option value="50,000 Bricks / Day">50,000 Bricks / Day</option>
                        <option value="1,00,000+ Bricks / Day">1,00,000+ Bricks / Day</option>
                      </select>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
                        className="mt-0.5 rounded border-slate-300 text-[#E53935] focus:ring-[#E53935]"
                      />
                      <span>
                        I accept the <a href="#" className="font-bold text-[#E53935] hover:underline">Terms of Service</a> and <a href="#" className="font-bold text-[#E53935] hover:underline">Industrial Data Privacy Policy</a>.
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="md" 
                      type="button" 
                      onClick={() => setStep(2)} 
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Back
                    </Button>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      type="submit" 
                      isLoading={loading} 
                      rightIcon={<CheckCircle2 className="w-4 h-4" />}
                      className="font-bold shadow-lg shadow-red-500/20 cursor-pointer bg-gradient-to-r from-[#E53935] to-[#D32F2F]"
                    >
                      Create Plant ERP Account
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
            Already have a factory workspace?{' '}
            <Link to="/login" className="font-bold text-[#E53935] hover:text-red-700 hover:underline">
              Sign In to Factory
            </Link>
          </div>
        </div>

        {/* Security Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            PostgreSQL Multi-Tenant
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            14-Day Free Access
          </span>
        </div>
      </div>
    </div>
  );
};
