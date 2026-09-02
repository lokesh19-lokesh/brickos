import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Layers, Factory, Boxes, Users, ShoppingBag, FileText, 
  CreditCard, BarChart3, ArrowRight, CheckCircle2, ShieldCheck, 
  TrendingUp, Sparkles, ChevronRight, Phone, MessageSquare, Play, 
  Check, HelpCircle, Calculator, Zap, Clock, Truck, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatINR } from '@/utils/formatters';
import { cn } from '@/lib/cn';

export const HomePage: React.FC = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // ROI Calculator States
  const [dailyOutput, setDailyOutput] = useState<number>(35000);
  const [brickPrice, setBrickPrice] = useState<number>(5.5);
  const [materialWastagePercent, setMaterialWastagePercent] = useState<number>(6);

  const { switchRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculations for interactive calculator
  const monthlyVolume = dailyOutput * 26; // 26 working days
  const monthlyRevenue = monthlyVolume * brickPrice;
  const estimatedWastageLoss = Math.round(monthlyRevenue * (materialWastagePercent / 100));
  const estimatedBrickFlowSavings = Math.round(estimatedWastageLoss * 0.65); // 65% reduction in leakage

  const handleQuickSandbox = async (role: any) => {
    await switchRole(role);
    toast.success(`Logged in as ${role.replace('_', ' ')}`);
    navigate('/dashboard');
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoModalOpen(false);
      setDemoSubmitted(false);
      toast.success('Demo request received! Our product specialist will call you within 30 minutes.');
    }, 1500);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-white via-red-50/20 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFEBEE] border border-red-200 text-[#D32F2F] text-xs font-bold tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailor-made for Indian Brick & Block Manufacturers</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1E293B] tracking-tight leading-[1.1]">
              Complete ERP Management for <span className="text-[#E53935]">Brick Manufacturing</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Manage raw materials, machine batches, kiln chambers, transactional stock, piece-rate labour wages, customer receivables, GST tax invoices, and real-time P&L from one powerful cloud platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/register">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto shadow-md">
                  Start Your Factory Free
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDemoModalOpen(true)}
                leftIcon={<Play className="w-4 h-4 text-[#E53935]" />}
                className="w-full sm:w-auto font-semibold"
              >
                Request Live Demo
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>14-Day Full Free Trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Instant Multi-Role Sandbox</span>
              </div>
            </div>
          </div>

          {/* Polished Visual Preview of ERP Dashboard */}
          <div className="mt-14 relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl border-4 border-slate-900/10 shadow-2xl bg-white overflow-hidden">
              {/* Fake Browser Top Bar */}
              <div className="bg-[#1E293B] px-4 py-3 flex items-center justify-between border-b border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-[11px] text-slate-400">app.brickflow.io/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400">
                  <span>Factory: Shree Ram Brick Industries (SRB-01)</span>
                </div>
              </div>

              {/* Preview Dashboard Content */}
              <div className="p-6 bg-slate-50/80 space-y-6">
                {/* Metric Preview Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Production</span>
                    <div className="text-xl font-extrabold text-slate-900 mt-1">31,450 <span className="text-xs font-normal text-slate-500">Pcs</span></div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">+12.4% vs Avg</span>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Finished Goods Stock</span>
                    <div className="text-xl font-extrabold text-[#E53935] mt-1">1,68,200 <span className="text-xs font-normal text-slate-500">Pcs</span></div>
                    <span className="text-[10px] font-bold text-slate-600">Valuation: ₹9.85 Lakh</span>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Receivables</span>
                    <div className="text-xl font-extrabold text-amber-600 mt-1">₹1,61,150</div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">4 Invoices Overdue</span>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Profit (MTD)</span>
                    <div className="text-xl font-extrabold text-emerald-600 mt-1">₹3,42,800</div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">32.8% Margin</span>
                  </div>
                </div>

                {/* Simulated Chart Banner */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="text-xs font-bold text-slate-900">Live Interactive Cloud Control Plane</div>
                    <p className="text-[11px] text-slate-500">Experience the full power of automated BOM deduction, daily muster roll & GST e-way billing.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickSandbox('factory_owner')}
                      className="px-4 py-2 bg-[#E53935] hover:bg-[#D32F2F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Open Live Dashboard Demo →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY BRICKFLOW ERP */}
      <section id="why-brickflow" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#E53935]">Traditional Registers vs BrickFlow</h2>
          <h3 className="text-3xl font-extrabold text-[#1E293B]">Why 500+ Brick Plants Switched to BrickFlow</h3>
          <p className="text-sm text-slate-600">Manual registers lead to raw material pilferage, dispatch mismatches, and unpaid customer balances. BrickFlow gives you 100% mathematical certainty.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Traditional Chaos */}
          <div className="p-8 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-6">
            <div className="flex items-center gap-3 text-rose-700">
              <ShieldAlert className="w-6 h-6" />
              <h4 className="text-lg font-bold">Manual Factory Management Pain</h4>
            </div>
            <ul className="space-y-3 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold text-sm">✕</span>
                <span><strong>Unaccounted Raw Material Leakage:</strong> Cement and fly ash trucks unloaded without systematic mix proportion checks.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold text-sm">✕</span>
                <span><strong>Manual Piece-Rate Wage Disagreements:</strong> Confusion over how many thousand bricks were moulded vs loaded into trucks.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold text-sm">✕</span>
                <span><strong>Uncollected Customer Debts:</strong> Builders taking credit without clear ledger statements or automated WhatsApp reminders.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold text-sm">✕</span>
                <span><strong>No Real-time Cost per Brick:</strong> Unaware if diesel, coal price hike, or electricity power cuts are eroding margins.</span>
              </li>
            </ul>
          </div>

          {/* Right: BrickFlow Solution */}
          <div className="p-8 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-6">
            <div className="flex items-center gap-3 text-emerald-800">
              <ShieldCheck className="w-6 h-6" />
              <h4 className="text-lg font-bold">The BrickFlow ERP Advantage</h4>
            </div>
            <ul className="space-y-3 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Automated BOM Formula:</strong> Each batch automatically deducts cement, fly ash, sand, and gypsum stock based on output.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Transparent Labour Payroll:</strong> Track daily attendance, piece-rate (₹/1000 bricks), overtime, advances, and pay slips.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>1-Click GST Invoices & WhatsApp:</strong> Generate branded GST tax invoices with vehicle numbers and share directly with builders.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Exact Cost & P&L Statement:</strong> Live breakdown of raw material %, labour %, electricity/fuel %, and net profit margins.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. CORE ERP MODULES GRID */}
      <section id="modules" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#E53935]">Modular Capabilities</h2>
          <h3 className="text-3xl font-extrabold text-[#1E293B]">Complete Plant Operations Covered</h3>
          <p className="text-sm text-slate-600">Every module is interconnected. Record a production batch, and stock, raw materials, and labour wages update simultaneously.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FFEBEE] text-[#D32F2F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#1E293B] mb-2">Raw Material Procurement</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track Cement (bags), Fly Ash (tons), M-Sand (brass), Stone Dust, and Kiln Coal. Record truck numbers, driver info, and vendor partial payments.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FFEBEE] text-[#D32F2F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Factory className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#1E293B] mb-2">Production Batch & Kiln Control</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Manage automatic lines, hydraulic presses, and kiln chambers. Track mix proportions, curing water cycles, quality grading, and breakage scrap.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FFEBEE] text-[#D32F2F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#1E293B] mb-2">Transactional Stock Ledger</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No manual fake stock numbers. Automatically calculates: <code className="text-[10px] bg-slate-100 p-0.5 rounded font-mono">Opening + Production - Sales - Damage = Closing Stock</code>.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FFEBEE] text-[#D32F2F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#1E293B] mb-2">Labour Muster & Wage Payroll</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Support for daily wage supervisors/operators and piece-rate loaders/moulders (₹/1000 bricks). Compute overtime, advance deductions, and pay slips.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FFEBEE] text-[#D32F2F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#1E293B] mb-2">Sales Dispatches & GST Invoicing</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Log truck dispatches, customer GSTIN, HSN codes, and generate beautiful GST Tax Invoices. Instant stock deduction and receivable logging.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#E53935]/40 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FFEBEE] text-[#D32F2F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#1E293B] mb-2">P&L & Financial Reports</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Know your exact monthly cost of raw materials, labour, electricity, diesel, and net profit margins. Export reports to Excel or PDF in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE PRODUCTION COST & ROI CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1E293B] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E53935]/20 text-red-400 text-xs font-bold border border-red-500/30">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive ROI Calculator</span>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight">Calculate Your Monthly Wastage Savings</h3>
            <p className="text-sm text-slate-300">See how much revenue you can recover by stopping raw material pilferage and uncollected receivables.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Slider 1: Daily Production */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Daily Production Output:</span>
                  <span className="text-[#E53935] font-mono text-sm">{dailyOutput.toLocaleString()} Bricks / Day</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="150000"
                  step="5000"
                  value={dailyOutput}
                  onChange={e => setDailyOutput(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#E53935]"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>5,000 (Small Plant)</span>
                  <span>75,000 (Medium)</span>
                  <span>1,50,000+ (High-Volume)</span>
                </div>
              </div>

              {/* Slider 2: Average Selling Price */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Average Brick Selling Price:</span>
                  <span className="text-emerald-400 font-mono text-sm">₹{brickPrice.toFixed(2)} / Pc</span>
                </div>
                <input
                  type="range"
                  min="3.5"
                  max="35"
                  step="0.5"
                  value={brickPrice}
                  onChange={e => setBrickPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>₹3.50 (Fly Ash)</span>
                  <span>₹8.50 (Red Clay)</span>
                  <span>₹35.00 (Hollow / Pavers)</span>
                </div>
              </div>

              {/* Slider 3: Material & Dispatch Leakage */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Estimated Material & Breakage Leakage:</span>
                  <span className="text-amber-400 font-mono text-sm">{materialWastagePercent}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={materialWastagePercent}
                  onChange={e => setMaterialWastagePercent(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>2% (Well managed)</span>
                  <span>6% (Industry Average)</span>
                  <span>15% (Severe Leakage)</span>
                </div>
              </div>
            </div>

            {/* Right Result Card */}
            <div className="lg:col-span-5 bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-5">
              <div className="space-y-1 border-b border-slate-700 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Plant Turnover</span>
                <div className="text-2xl font-black text-white font-mono">{formatINR(monthlyRevenue)}</div>
                <p className="text-[11px] text-slate-400">{monthlyVolume.toLocaleString()} bricks produced per month</p>
              </div>

              <div className="space-y-1 border-b border-slate-700 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Current Monthly Loss from Leakage</span>
                <div className="text-xl font-black text-rose-400 font-mono">{formatINR(estimatedWastageLoss)}</div>
                <p className="text-[10px] text-slate-400">Raw material wastage + uncollected builder dues</p>
              </div>

              <div className="space-y-1 bg-emerald-950/60 p-4 rounded-xl border border-emerald-600/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Estimated Monthly Profit Boost</span>
                <div className="text-3xl font-black text-emerald-400 font-mono">{formatINR(estimatedBrickFlowSavings)}</div>
                <p className="text-[11px] text-emerald-200 mt-1">Recovered every month with BrickFlow ERP</p>
              </div>

              <Link to="/register" className="block">
                <Button variant="primary" size="md" className="w-full">
                  Start Saving Today →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (7 STEPS) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#E53935]">Implementation Roadmap</h2>
          <h3 className="text-3xl font-extrabold text-[#1E293B]">How BrickFlow ERP Works in 7 Steps</h3>
          <p className="text-sm text-slate-600">Go live with your factory in less than 15 minutes with our guided setup wizard.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Create Account', desc: 'Sign up with your plant details, factory code, and location in 2 minutes.' },
            { step: '02', title: 'Add Factory & Machines', desc: 'Configure automatic press lines, kiln chambers, and factory staff roster.' },
            { step: '03', title: 'Configure Products & BOM', desc: 'Set up brick sizes (4", 6", 8", Pavers) and raw material mix proportions.' },
            { step: '04', title: 'Start Production', desc: 'Log daily batches. System automatically deducts cement, fly ash, and sand.' },
            { step: '05', title: 'Manage Stock & Dispatches', desc: 'Track truck loadings with vehicle numbers and print instant GST gate passes.' },
            { step: '06', title: 'Track Builder Payments', desc: 'Receive payments via UPI/Bank and trigger WhatsApp reminders for dues.' },
            { step: '07', title: 'View Real-time P&L', desc: 'Monitor daily profit, worker attendance, and plant health from your phone.' },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative space-y-2">
              <span className="text-2xl font-black text-[#E53935]/30">{item.step}</span>
              <h4 className="text-sm font-bold text-[#1E293B]">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}

          {/* Step 8 Bonus Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-slate-900 text-white flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-[#E53935] uppercase tracking-wider">Ready to roll?</span>
              <h4 className="text-base font-bold mt-1">Get Onboarded Today</h4>
              <p className="text-xs text-slate-300 mt-1">Our dedicated engineering team assists with your initial product & stock data import.</p>
            </div>
            <Link to="/register">
              <Button variant="primary" size="sm" className="w-full">
                Begin Setup →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#E53935]">Transparent Indian Pricing</h2>
          <h3 className="text-3xl font-extrabold text-[#1E293B]">Simple Plans for Every Brick Factory Scale</h3>
          <p className="text-sm text-slate-600">Affordable SaaS subscriptions with zero hidden charges. Upgrade or cancel anytime.</p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={cn('text-xs font-bold', billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400')}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-12 h-6 rounded-full bg-slate-300 p-1 transition-colors cursor-pointer relative"
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full bg-[#E53935] shadow-xs transition-transform',
                  billingCycle === 'yearly' && 'translate-x-6'
                )}
              />
            </button>
            <span className={cn('text-xs font-bold', billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400')}>
              Yearly <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-1 font-extrabold">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Basic Plant */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-[#1E293B]">Basic Plant</h4>
                <p className="text-xs text-slate-500 mt-1">For single-machine or traditional kiln plants.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#1E293B]">₹{billingCycle === 'yearly' ? '1,999' : '2,499'}</span>
                <span className="text-xs text-slate-500 font-medium">/ month</span>
              </div>
              <div className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                Up to 2,50,000 Bricks / Month • 5 Staff Users
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Single Machine Line / Kiln</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Raw Material Purchases</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Stock & Inventory Ledger</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Labour Attendance Muster</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> GST Tax Invoicing & PDF</li>
              </ul>
            </div>
            <Link to="/register" className="block">
              <Button variant="outline" size="md" className="w-full">
                Choose Basic Plan
              </Button>
            </Link>
          </div>

          {/* Plan 2: Standard Pro (Most Popular) */}
          <div className="p-8 rounded-2xl bg-white border-2 border-[#E53935] shadow-xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E53935] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Most Popular
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-[#1E293B]">Standard Pro</h4>
                <p className="text-xs text-slate-500 mt-1">For multi-chamber kilns & automatic block plants.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#E53935]">₹{billingCycle === 'yearly' ? '3,999' : '4,999'}</span>
                <span className="text-xs text-slate-500 font-medium">/ month</span>
              </div>
              <div className="text-[11px] font-bold text-[#D32F2F] bg-[#FFEBEE] px-2.5 py-1 rounded-lg border border-red-200">
                Up to 10,00,000 Bricks / Month • 15 Staff Users
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Multi-Machine Lines & Kiln Chambers</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Automated Raw Material Consumption</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Piece-Rate & Daily Wage Payroll</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Customer Receivables & Aging Alerts</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> WhatsApp Invoice & Payment Reminders</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Real-time Profit & Loss Statement</li>
              </ul>
            </div>
            <Link to="/register" className="block">
              <Button variant="primary" size="lg" className="w-full shadow-md">
                Start 14-Day Free Trial
              </Button>
            </Link>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-[#1E293B]">Enterprise Multi-Plant</h4>
                <p className="text-xs text-slate-500 mt-1">For multi-location manufacturing groups.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#1E293B]">₹{billingCycle === 'yearly' ? '7,999' : '9,999'}</span>
                <span className="text-xs text-slate-500 font-medium">/ month</span>
              </div>
              <div className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                Unlimited Production • 50+ Staff Users
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Multi-Factory Unified Console</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Weighbridge IoT Integration Support</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Custom Tally / SAP Data Sync</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Priority 24/7 Phone Support</li>
              </ul>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setDemoModalOpen(true)}
              className="w-full"
            >
              Contact Enterprise Sales
            </Button>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#E53935]">Frequently Asked Questions</h2>
          <h3 className="text-3xl font-extrabold text-[#1E293B]">Got Questions? We Have Answers</h3>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Can BrickFlow handle piece-rate labour wages (e.g. ₹600 per 1000 bricks)?',
              a: 'Yes! BrickFlow has built-in support for both Daily Wage rates (for supervisors, machine operators, drivers) and Piece-Rate wages (per 1,000 bricks produced by moulders or per 1,000 bricks loaded into trucks by loading crews). You can also deduct advance payments and calculate net weekly/monthly pay slips.',
            },
            {
              q: 'How does automatic raw material stock deduction work?',
              a: 'When you record a completed production batch (e.g., 15,000 4-inch Fly Ash Bricks), BrickFlow automatically calculates and deducts the required Cement (in bags), Fly Ash (in tons), and Stone Dust (in tons) from your inventory based on your factory’s custom Bill of Materials (BOM) mix proportion.',
            },
            {
              q: 'Is GST tax invoicing compliant with Indian regulations?',
              a: '100% compliant. Invoices include your factory GSTIN, customer GSTIN, proper HSN codes (e.g. 681599 for Fly Ash bricks, 690410 for clay bricks), CGST + SGST (or IGST for interstate deliveries), vehicle numbers, terms & conditions, and bank/UPI payment details.',
            },
            {
              q: 'Can I use BrickFlow on mobile phones at the plant site?',
              a: 'Yes. BrickFlow is responsive and optimized for mobile devices and tablets. Supervisors and dispatch operators can record batches and gate passes directly on their mobile phones in the yard.',
            },
            {
              q: 'What happens after the 14-day free trial?',
              a: 'You can choose to subscribe to our Basic, Standard Pro, or Enterprise plan. All your entered factory products, raw materials, staff, and sales history will remain safely intact.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <h4 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#E53935] shrink-0" />
                {item.q}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FINAL CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#E53935] to-[#B71C1C] rounded-3xl p-8 sm:p-14 text-white text-center shadow-2xl space-y-6">
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight">Transform Your Brick Manufacturing Plant Today</h3>
          <p className="text-sm sm:text-base text-red-100 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of progressive brick plants across India operating with zero stock leakage, automated GST invoicing, and effortless worker payroll.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register">
              <Button variant="white" size="lg" className="font-bold shadow-md">
                Start Your Factory (14 Days Free)
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setDemoModalOpen(true)}
              className="bg-red-700/60 border-red-400 text-white hover:bg-red-800"
            >
              Talk to Our Brick Plant Expert
            </Button>
          </div>
        </div>
      </section>

      {/* REQUEST DEMO MODAL */}
      <Modal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        title="Schedule a Personalized BrickFlow ERP Demo"
        description="Our product engineer will demonstrate how BrickFlow automates production and stock for your exact brick type."
        maxWidth="md"
      >
        {demoSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Demo Request Submitted!</h4>
            <p className="text-xs text-slate-500">We will connect with you on WhatsApp / Phone shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleDemoSubmit} className="space-y-4">
            <Input label="Your Name" placeholder="e.g. Rajesh Sharma" required isRequired />
            <Input label="Factory Name" placeholder="e.g. Shree Ram Brick Industries" required isRequired />
            <Input label="Mobile / WhatsApp Number" placeholder="+91 85006 93113" required isRequired />
            <Input label="City / State" placeholder="e.g. Pune, Maharashtra" required isRequired />
            <div className="pt-2">
              <Button variant="primary" size="md" type="submit" className="w-full">
                Request Instant Demo Call
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
