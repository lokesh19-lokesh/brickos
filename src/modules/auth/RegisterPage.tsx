import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, User as UserIcon, Mail, Phone, Lock, MapPin, 
  FileText, Factory, Users, CheckCircle2, ArrowRight, ArrowLeft,
  Flame, ShieldCheck, Database, Sparkles, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden selection:bg-red-500 selection:text-white">
      {/* Ambient Lighting & Micro-Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#E53935]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto space-y-6 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-800 backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#E53935]" />
            <span>Back to Login</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1.5 rounded-full">
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
              className="h-12 w-auto mx-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md" 
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Register Industrial ERP Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
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
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${step === s.num ? 'text-white font-bold' : 'text-slate-400'}`}>
                  {s.label}
                </span>
                {s.num < 3 && <div className="w-6 sm:w-10 h-0.5 bg-slate-800" />}
              </div>
            ))}
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-2xl text-left space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {verificationPending ? (
            /* Email Verification Screen */
            <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-[#E53935]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Check Your Email to Verify Account</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  We have dispatched an activation confirmation link to <strong className="text-white font-bold">{formData.email}</strong>. Please check your inbox and click the link to activate your ERP workspace.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 max-w-md mx-auto text-left text-xs text-slate-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Activation Checklist:</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-1 leading-normal">
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
                  className="w-full sm:w-auto font-semibold border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  Resend Verification Email
                </Button>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full font-bold shadow-md shadow-red-500/20">
                    Proceed to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : success ? (
            /* Success confirmation */
            <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-white">Factory Workspace Initialized!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
                  <div className="border-b border-slate-800 pb-3 mb-2">
                    <h3 className="text-base font-bold text-white">Step 1: Plant Owner & Admin Credentials</h3>
                    <p className="text-xs text-slate-400">Master login credentials for platform operations.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#E53935]" />
                      <span>Full Name <strong className="text-red-500">*</strong></span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#E53935]" />
                        <span>Work Email <strong className="text-red-500">*</strong></span>
                      </label>
                      <input
                        type="email"
                        placeholder="rajesh@yourplant.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#E53935]" />
                        <span>Mobile Phone <strong className="text-red-500">*</strong></span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98220 12345"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#E53935]" />
                        <span>Password <strong className="text-red-500">*</strong></span>
                      </label>
                      <input
                        type="password"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#E53935]" />
                        <span>Confirm Password <strong className="text-red-500">*</strong></span>
                      </label>
                      <input
                        type="password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      type="submit" 
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="font-bold shadow-md shadow-red-500/20"
                    >
                      Next: Factory Profile
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 2: FACTORY INFORMATION */}
              {step === 2 && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 mb-2">
                    <h3 className="text-base font-bold text-white">Step 2: Factory & Site Information</h3>
                    <p className="text-xs text-slate-400">Plant legal identity and commercial location details.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Factory className="w-3.5 h-3.5 text-[#E53935]" />
                        <span>Factory / Plant Name <strong className="text-red-500">*</strong></span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shree Ram Brick Industries"
                        value={formData.factoryName}
                        onChange={e => setFormData({ ...formData, factoryName: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Factory Code (Prefix)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SRB-01"
                        value={formData.factoryCode}
                        onChange={e => setFormData({ ...formData, factoryCode: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Managing Partner / Owner
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Sharma"
                        value={formData.ownerName}
                        onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        GSTIN Number (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 27AABCS1429B1Z8"
                        value={formData.gstNumber}
                        onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E53935]" />
                      <span>Factory Physical Address</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Plot 45-B, Industrial Estate, Hadapsar"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        City <strong className="text-red-500">*</strong>
                      </label>
                      <input
                        type="text"
                        placeholder="Pune"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        State <strong className="text-red-500">*</strong>
                      </label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Pincode <strong className="text-red-500">*</strong>
                      </label>
                      <input
                        type="text"
                        placeholder="411028"
                        value={formData.pincode}
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
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
                      className="border-slate-800 text-slate-300 hover:bg-slate-800"
                    >
                      Back
                    </Button>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      type="submit" 
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="font-bold shadow-md shadow-red-500/20"
                    >
                      Next: Scale & Output
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 3: BUSINESS INFORMATION */}
              {step === 3 && (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 mb-2">
                    <h3 className="text-base font-bold text-white">Step 3: Manufacturing Classification</h3>
                    <p className="text-xs text-slate-400">Automates default mix recipe templates and unit conversions.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Primary Plant Technology <strong className="text-red-500">*</strong>
                    </label>
                    <select
                      value={formData.factoryType}
                      onChange={e => setFormData({ ...formData, factoryType: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-slate-950/80 text-white border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
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
                      <label className="text-xs font-bold text-slate-300">
                        Total Workforce / Labour
                      </label>
                      <select
                        value={formData.employeesCount}
                        onChange={e => setFormData({ ...formData, employeesCount: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
                      >
                        <option value="1-15 Workers">1-15 Workers (Small)</option>
                        <option value="15-25 Workers">15-25 Workers</option>
                        <option value="25-50 Workers">25-50 Workers (Standard)</option>
                        <option value="50-100 Workers">50-100 Workers (Large Plant)</option>
                        <option value="100+ Workers">100+ Workers (Enterprise Multi-Shift)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Estimated Daily Production
                      </label>
                      <select
                        value={formData.dailyCapacity}
                        onChange={e => setFormData({ ...formData, dailyCapacity: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950/80 text-white border border-slate-800 focus:border-[#E53935] rounded-xl outline-hidden text-xs sm:text-sm font-medium transition-all"
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
                    <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer select-none bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
                        className="mt-0.5 rounded bg-slate-900 border-slate-700 text-[#E53935] focus:ring-[#E53935]"
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
                      className="border-slate-800 text-slate-300 hover:bg-slate-800"
                    >
                      Back
                    </Button>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      type="submit" 
                      isLoading={loading} 
                      rightIcon={<CheckCircle2 className="w-4 h-4" />}
                      className="font-bold shadow-lg shadow-red-500/20 cursor-pointer"
                    >
                      Create Plant ERP Account
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="border-t border-slate-800 pt-4 text-center text-xs text-slate-400">
            Already have a factory workspace?{' '}
            <Link to="/login" className="font-bold text-[#E53935] hover:text-red-400 hover:underline">
              Sign In to Factory
            </Link>
          </div>
        </div>

        {/* Security Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            PostgreSQL Multi-Tenant
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            14-Day Free Access
          </span>
        </div>
      </div>
    </div>
  );
};
