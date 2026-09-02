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
      {/* 1. HERO SECTION - INDUSTRIAL BRICK MANUFACTURING CLOUD OS */}
      <section className="relative pt-8 pb-20 lg:pt-14 lg:pb-28 overflow-hidden w-full max-w-full bg-gradient-to-b from-white via-slate-50/50 to-slate-100/60">
        {/* Background Decorative Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* FLOATING 3D ANIMATED BRICK ICON - LEFT FLANK */}
          <div className="hidden 2xl:flex absolute -left-6 top-16 items-center gap-3.5 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-red-200/90 shadow-xl animate-float-slow z-20 max-w-xs select-none">
            {/* 3D Isometric Red Clay Brick SVG */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100/80 border border-red-200 flex items-center justify-center shrink-0 shadow-inner">
              <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-md">
                {/* Top Face */}
                <polygon points="32,10 54,21 32,32 10,21" fill="#E53935" />
                {/* Left Face */}
                <polygon points="10,21 32,32 32,54 10,43" fill="#B71C1C" />
                {/* Right Face */}
                <polygon points="32,32 54,21 54,43 32,54" fill="#C62828" />
                {/* Brick Holes */}
                <ellipse cx="23" cy="21" rx="3.5" ry="1.8" fill="#7F0000" opacity="0.75" />
                <ellipse cx="32" cy="25" rx="3.5" ry="1.8" fill="#7F0000" opacity="0.75" />
                <ellipse cx="41" cy="21" rx="3.5" ry="1.8" fill="#7F0000" opacity="0.75" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#D32F2F]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E53935] animate-ping" />
                <span>Kiln Chamber #4</span>
              </div>
              <div className="text-xs font-black text-slate-900 leading-tight">Red Clay Brick (9×4×3")</div>
              <div className="text-[10px] text-slate-500 font-semibold">Grade A • Comp: 10.5 N/mm²</div>
            </div>
          </div>

          {/* FLOATING 3D ANIMATED BRICK ICON - RIGHT FLANK */}
          <div className="hidden 2xl:flex absolute -right-6 top-24 items-center gap-3.5 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300 shadow-xl animate-float-reverse z-20 max-w-xs select-none">
            {/* 3D Isometric Fly Ash Cement Block SVG */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center shrink-0 shadow-inner">
              <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-md">
                {/* Top Face */}
                <polygon points="32,10 54,21 32,32 10,21" fill="#94A3B8" />
                {/* Left Face */}
                <polygon points="10,21 32,32 32,54 10,43" fill="#475569" />
                {/* Right Face */}
                <polygon points="32,32 54,21 54,43 32,54" fill="#64748B" />
                {/* Hollow Studs / Texture */}
                <polygon points="20,19 28,15 36,19 28,23" fill="#334155" opacity="0.8" />
                <polygon points="36,23 44,19 50,22 42,26" fill="#334155" opacity="0.8" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Hydraulic Press #1</span>
              </div>
              <div className="text-xs font-black text-slate-900 leading-tight">Fly Ash Cement Block</div>
              <div className="text-[10px] text-slate-500 font-semibold">High Density • 35,000 / Shift</div>
            </div>
          </div>

          {/* FLOATING MINI PAVER BLOCK BADGE */}
          <div className="hidden 2xl:inline-flex absolute left-8 -top-2 items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-200/90 text-amber-900 text-xs font-bold shadow-sm animate-float-gentle select-none">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-amber-600 fill-current">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>Interlocking Paver Blocks (60mm & 80mm)</span>
          </div>

          {/* FLOATING MINI STACK BADGE */}
          <div className="hidden 2xl:inline-flex absolute right-8 -top-2 items-center gap-2 px-3 py-1 bg-red-50 rounded-full border border-red-200/90 text-[#D32F2F] text-xs font-bold shadow-sm animate-float-slow select-none">
            <span className="text-sm">🧱</span>
            <span>Automated Mix Proportion (BOM)</span>
          </div>

          {/* Top Hero Text Header */}
          <div className="text-center max-w-4xl mx-auto space-y-5">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFEBEE] border border-red-200 text-[#D32F2F] text-xs font-bold tracking-wide shadow-2xs animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-[#E53935] animate-pulse" />
              <span>Dedicated Cloud ERP & Operating System for Brick & Block Manufacturers</span>
            </div>

            {/* Main Headline with Animated 3D Isometric Brick */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1E293B] tracking-tight leading-[1.12]">
              The Operating System for Modern{' '}
              <span className="text-[#E53935] relative inline-flex items-center gap-2">
                <span>Brick Manufacturing</span>
                {/* Animated 3D Isometric Brick Icon */}
                <span className="inline-block align-middle animate-brick-pulse">
                  <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-lg">
                    {/* Top Face */}
                    <polygon points="32,8 56,20 32,32 8,20" fill="#EF5350" />
                    {/* Left Face */}
                    <polygon points="8,20 32,32 32,56 8,44" fill="#B71C1C" />
                    {/* Right Face */}
                    <polygon points="32,32 56,20 56,44 32,56" fill="#E53935" />
                    {/* Brick Holes */}
                    <ellipse cx="23" cy="20" rx="4" ry="2" fill="#7F0000" opacity="0.75" />
                    <ellipse cx="32" cy="24" rx="4" ry="2" fill="#7F0000" opacity="0.75" />
                    <ellipse cx="41" cy="20" rx="4" ry="2" fill="#7F0000" opacity="0.75" />
                  </svg>
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#E53935]/30 pointer-events-none" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-3xl mx-auto">
              Automate raw material weighbridge entries, hydraulic machine press batches, daily piece-rate labour wages, customer ledgers, and 1-click GST dispatch invoices — engineered specifically for brick & block kilns.
            </p>

            {/* Brick & Block Types Supported Tag Chips with Animated 3D Mini Icons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-red-300 hover:shadow-xs transition-all cursor-default group">
                <svg viewBox="0 0 32 32" className="w-4 h-4 text-slate-500 group-hover:scale-110 transition-transform">
                  <polygon points="16,4 28,10 16,16 4,10" fill="#94A3B8" />
                  <polygon points="4,10 16,16 16,28 4,22" fill="#475569" />
                  <polygon points="16,16 28,10 28,22 16,28" fill="#64748B" />
                </svg>
                <span>Fly Ash Bricks</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-red-300 hover:shadow-xs transition-all cursor-default group">
                <svg viewBox="0 0 32 32" className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform">
                  <polygon points="16,4 28,10 16,16 4,10" fill="#EF5350" />
                  <polygon points="4,10 16,16 16,28 4,22" fill="#B71C1C" />
                  <polygon points="16,16 28,10 28,22 16,28" fill="#E53935" />
                </svg>
                <span>Red Clay Kiln Bricks</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-red-300 hover:shadow-xs transition-all cursor-default group">
                <svg viewBox="0 0 32 32" className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform">
                  <polygon points="16,4 26,9 21,16 26,23 16,27 6,23 11,16 6,9" fill="#F59E0B" />
                </svg>
                <span>Interlocking Paver Blocks</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-red-300 hover:shadow-xs transition-all cursor-default group">
                <svg viewBox="0 0 32 32" className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform">
                  <polygon points="16,4 28,10 16,16 4,10" fill="#CBD5E1" />
                  <polygon points="4,10 16,16 16,28 4,22" fill="#64748B" />
                  <polygon points="16,16 28,10 28,22 16,28" fill="#94A3B8" />
                  <polygon points="11,9 15,7 19,9 15,11" fill="#334155" />
                </svg>
                <span>Concrete Hollow Blocks</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-red-300 hover:shadow-xs transition-all cursor-default group">
                <span className="text-sm">📐</span>
                <span>AAC Lightweight Blocks</span>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link to="/register">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto shadow-md font-bold text-base px-8 py-4">
                  Start 14-Day Free Factory Trial
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDemoModalOpen(true)}
                leftIcon={<Play className="w-4 h-4 text-[#E53935]" />}
                className="w-full sm:w-auto font-bold text-base bg-white hover:bg-slate-50 border-slate-300"
              >
                Schedule Factory Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>14-Day Full Access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Instant Multi-Role Demo</span>
              </div>
            </div>
          </div>

          {/* REAL BRICK FACTORY + LIVE CLOUD ERP SHOWCASE */}
          <div className="mt-14 relative max-w-6xl mx-auto">
            {/* Outer Frame with Industrial Glass Effect */}
            <div className="relative rounded-3xl border border-slate-300/80 shadow-2xl bg-white p-3 sm:p-4 overflow-hidden group">
              {/* Browser Window Bar */}
              <div className="bg-[#1E293B] rounded-t-2xl px-4 py-3 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-[11px] text-slate-300 flex items-center gap-1.5">
                    <span className="text-[#E53935]">●</span> app.brickflow.io/dashboard • Plant Line #1 & Kiln Chamber Active
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  <span>Factory Online: Shree Ram Brick Industries</span>
                </div>
              </div>

              {/* Main Factory Visual Container with Live ERP HUD Overlays */}
              <div className="relative h-[380px] sm:h-[480px] lg:h-[540px] rounded-b-2xl overflow-hidden bg-slate-900">
                {/* Real High-Definition Brick Manufacturing Plant Image */}
                <img 
                  src="/hero-brick-factory.jpg" 
                  alt="Modern Automated Brick Manufacturing Plant" 
                  className="w-full h-full object-cover object-center filter brightness-95 group-hover:scale-[1.02] transition-transform duration-700 ease-out" 
                />

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                {/* FLOATING ERP HUD WIDGET 1: Top-Left Live Production Batch */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/60 shadow-xl max-w-xs animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Live Hydraulic Press
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Shift #1</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                    Batch #BP-2026-042: 35,000 Pcs
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    4-Inch Fly Ash Bricks (Comp: 12.5 N/mm²)
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>BOM Auto-Deduction:</span>
                    <strong className="text-slate-800 font-mono">14.2 MT Fly Ash | 2.8 MT Cement</strong>
                  </div>
                </div>

                {/* FLOATING ERP HUD WIDGET 2: Top-Right Finished Goods Inventory */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/60 shadow-xl max-w-xs hidden sm:block animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#D32F2F] bg-[#FFEBEE] px-2 py-0.5 rounded-full border border-red-200">
                      Yard Stock Valuation
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">Audit Ready</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#E53935] font-mono">
                    1,68,200 <span className="text-xs font-normal text-slate-700">Finished Bricks</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold">Total Stock Value: <strong className="text-slate-900">₹9,85,000</strong></p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-700 font-bold">Grade A Quality: 96.4%</span>
                    <span className="text-slate-400">0% Unaccounted Loss</span>
                  </div>
                </div>

                {/* FLOATING ERP HUD WIDGET 3: Bottom-Left Piece-Rate Labour Wages */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/60 shadow-xl max-w-xs hidden md:block animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Daily Wage Muster Roll
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">42 Workers</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900">
                    ₹14,450 Earned Today
                  </div>
                  <p className="text-[11px] text-slate-600">Rate: <strong>₹420 / 1000 Bricks</strong> (Moulding Gang A)</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Attendance:</span>
                    <strong className="text-emerald-600 font-bold">40 Present • 2 Half Day</strong>
                  </div>
                </div>

                {/* FLOATING ERP HUD WIDGET 4: Bottom-Right Instant Dispatch & GST Tax Invoice */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#1E293B]/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl border border-slate-700 shadow-2xl max-w-sm">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      Dispatched Truck
                    </span>
                    <span className="font-mono text-[10px] text-amber-300">MH-12-DT-8821</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white">
                    10,000 Fly Ash Bricks Loaded
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    GST Invoice #INV-2026-089 • <strong className="text-emerald-400 font-mono">₹54,600</strong>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleQuickSandbox('factory_owner')}
                      className="flex-1 py-2 px-3 bg-[#E53935] hover:bg-[#D32F2F] text-white text-xs font-bold rounded-xl text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open Live Interactive ERP</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KEY MANUFACTURING STATS BANNER */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#1E293B] font-mono">500+</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active Brick Plants</p>
              <p className="text-[10px] text-slate-400">Across 18 Indian States</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#E53935] font-mono">₹150+ Cr</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dispatches Invoiced</p>
              <p className="text-[10px] text-slate-400">100% GST & E-Way Ready</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">65%</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Wastage Reduction</p>
              <p className="text-[10px] text-slate-400">Zero Raw Material Theft</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">4.9/5★</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Manufacturer Rating</p>
              <p className="text-[10px] text-slate-400">1-Click WhatsApp Billing</p>
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

        {/* Real Brick Yard & Quality Inspection Visual Section */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBEE] text-[#D32F2F] text-xs font-bold border border-red-200">
                <span>📦 Finished Goods & Yard Management</span>
              </div>
              <h3 className="text-2xl font-black text-[#1E293B]">
                Track Every Brick Lot from Hydraulic Press to Truck Dispatch
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                BrickFlow ERP automatically categorizes your inventory into curing stacks, Grade A finished stock, Grade B seconds, and breakage scrap. Every pallet has full batch traceability.
              </p>
              <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Automated Curing Timer & Compressive Strength Logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Weighbridge & Truck Loading Audit Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real-time Physical Audit vs Ledger Stock Reconciliation</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 group">
                <img 
                  src="/brick-pallet-stack.jpg" 
                  alt="Brick Yard Stacks & Pallet Inspection" 
                  className="w-full h-72 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl text-white text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-400 block">Yard Stack Lot Traceability</span>
                    <span className="text-[10px] text-slate-300">Terracotta Clay (Lot #A4B7) • Fly Ash Blocks (Batch #F025)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Audit Verified
                  </span>
                </div>
              </div>
            </div>
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
