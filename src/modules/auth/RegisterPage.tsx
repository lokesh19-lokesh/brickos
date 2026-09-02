import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, User as UserIcon, Mail, Phone, Lock, MapPin, 
  FileText, Factory, Users, CheckCircle2, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Alert } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register({
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
          address: formData.address || 'Industrial Estate',
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

      setSuccess(true);
      toast.success('Account created successfully!');
      setTimeout(() => {
        navigate('/onboarding');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            <img 
              src="/logo.png" 
              alt="BrickFlow ERP" 
              className="h-14 w-auto mx-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>
          <h2 className="text-2xl font-extrabold text-[#1E293B]">Create Your Factory Account</h2>
          <p className="text-xs text-slate-500">14-Day Free Access • Full Multi-Module Features • Instant Activation</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3">
          {[
            { num: 1, label: 'User Account' },
            { num: 2, label: 'Factory Profile' },
            { num: 3, label: 'Production Scale' },
          ].map(s => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s.num
                    ? 'bg-[#E53935] text-white shadow-xs'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${step === s.num ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {s.num < 3 && <div className="w-8 h-0.5 bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-8">
          {error && (
            <div className="mb-5">
              <Alert type="error" title="Form Verification">
                {error}
              </Alert>
            </div>
          )}

          {success ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Your account has been created successfully!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Setting up your factory workspace and initializing stock ledgers...
              </p>
              <div className="pt-2 text-xs font-semibold text-[#E53935] animate-pulse">
                Redirecting to Setup Wizard...
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: USER ACCOUNT */}
              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 mb-2">
                    <h3 className="text-base font-bold text-slate-900">Step 1: Factory Owner / Admin Profile</h3>
                    <p className="text-xs text-slate-500">Your personal login details to manage the platform.</p>
                  </div>

                  <Input
                    label="Full Name"
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    leftIcon={<UserIcon className="w-4 h-4" />}
                    required
                    isRequired
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="rajesh@shreerambricks.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      leftIcon={<Mail className="w-4 h-4" />}
                      required
                      isRequired
                    />
                    <Input
                      label="Mobile Phone"
                      placeholder="+91 98220 12345"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      leftIcon={<Phone className="w-4 h-4" />}
                      required
                      isRequired
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      leftIcon={<Lock className="w-4 h-4" />}
                      required
                      isRequired
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      leftIcon={<Lock className="w-4 h-4" />}
                      required
                      isRequired
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button variant="primary" size="lg" type="submit" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Next: Factory Info
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 2: FACTORY INFORMATION */}
              {step === 2 && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 mb-2">
                    <h3 className="text-base font-bold text-slate-900">Step 2: Factory Information</h3>
                    <p className="text-xs text-slate-500">Legal factory address and commercial GST details.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Factory / Plant Name"
                        placeholder="e.g. Shree Ram Brick Industries"
                        value={formData.factoryName}
                        onChange={e => setFormData({ ...formData, factoryName: e.target.value })}
                        required
                        isRequired
                      />
                    </div>
                    <div>
                      <Input
                        label="Factory Code (Short)"
                        placeholder="e.g. SRB-01"
                        value={formData.factoryCode}
                        onChange={e => setFormData({ ...formData, factoryCode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Owner / Managing Partner Name"
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.ownerName}
                      onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                    />
                    <Input
                      label="GSTIN Number (Optional)"
                      placeholder="e.g. 27AABCS1429B1Z8"
                      value={formData.gstNumber}
                      onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Factory Street Address"
                    placeholder="Plot 45-B, Industrial Area, Hadapsar"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="City"
                      placeholder="Pune"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      required
                      isRequired
                    />
                    <Input
                      label="State"
                      placeholder="Maharashtra"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      required
                      isRequired
                    />
                    <Input
                      label="Pincode"
                      placeholder="411028"
                      value={formData.pincode}
                      onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                      required
                      isRequired
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <Button variant="outline" size="md" type="button" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                      Back
                    </Button>
                    <Button variant="primary" size="lg" type="submit" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Next: Business Scale
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 3: BUSINESS INFORMATION */}
              {step === 3 && (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 mb-2">
                    <h3 className="text-base font-bold text-slate-900">Step 3: Manufacturing Type & Scale</h3>
                    <p className="text-xs text-slate-500">Configure default mix recipes, machine line templates, and units.</p>
                  </div>

                  <Select
                    label="Primary Factory Type"
                    value={formData.factoryType}
                    onChange={e => setFormData({ ...formData, factoryType: e.target.value as any })}
                    isRequired
                  >
                    <option value="Fly Ash Brick">Fly Ash Brick (Automatic / Hydraulic Plant)</option>
                    <option value="Clay / Red Brick">Clay / Red Brick (Chamber / Hoffman / Bull Trench Kiln)</option>
                    <option value="Paver Block & Tiles">Paver Block & Interlocking Tiles</option>
                    <option value="Concrete & Hollow Blocks">Concrete Solid & Hollow Blocks</option>
                    <option value="Multi-Product Plant">Multi-Product Integrated Manufacturing Plant</option>
                  </Select>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Total Workforce / Employees"
                      value={formData.employeesCount}
                      onChange={e => setFormData({ ...formData, employeesCount: e.target.value })}
                    >
                      <option value="1-15 Workers">1-15 Workers (Small)</option>
                      <option value="15-25 Workers">15-25 Workers</option>
                      <option value="25-50 Workers">25-50 Workers (Standard)</option>
                      <option value="50-100 Workers">50-100 Workers (Large Plant)</option>
                      <option value="100+ Workers">100+ Workers (Enterprise Multi-Shift)</option>
                    </Select>

                    <Select
                      label="Estimated Daily Output Capacity"
                      value={formData.dailyCapacity}
                      onChange={e => setFormData({ ...formData, dailyCapacity: e.target.value })}
                    >
                      <option value="10,000 Bricks / Day">10,000 Bricks / Day</option>
                      <option value="25,000 Bricks / Day">25,000 Bricks / Day</option>
                      <option value="35,000 Bricks / Day">35,000 Bricks / Day</option>
                      <option value="50,000 Bricks / Day">50,000 Bricks / Day</option>
                      <option value="1,00,000+ Bricks / Day">1,00,000+ Bricks / Day</option>
                    </Select>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
                        className="mt-0.5 rounded text-[#E53935] focus:ring-[#E53935]"
                      />
                      <span>
                        I agree to the <a href="#" className="font-bold text-[#E53935] underline">Terms & Conditions</a> and <a href="#" className="font-bold text-[#E53935] underline">Privacy Policy</a> of BrickFlow ERP.
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <Button variant="outline" size="md" type="button" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                      Back
                    </Button>
                    <Button variant="primary" size="lg" type="submit" isLoading={loading} rightIcon={<CheckCircle2 className="w-4 h-4" />}>
                      Create Account & Setup Factory
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="border-t border-slate-100 pt-4 mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#E53935] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
