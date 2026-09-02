import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow duration-200 overflow-hidden',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-5 border-b border-slate-100 flex items-center justify-between', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-bold text-[#1E293B] tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs text-slate-500 mt-0.5', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3', className)} {...props} />;
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'crimson' | 'charcoal' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    crimson: 'bg-[#FFEBEE] text-[#D32F2F] border-red-200/60 font-semibold',
    charcoal: 'bg-slate-900 text-white border-slate-800',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    outline: 'border border-slate-300 text-slate-600 bg-white',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-1 rounded-lg',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium border uppercase tracking-wider',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: string | undefined | null }) {
  if (!status) return null;
  const s = status.toLowerCase();

  if (s === 'paid' || s === 'active' || s === 'completed' || s === 'present' || s === 'a grade') {
    return <Badge variant="success">{status}</Badge>;
  }
  if (s === 'partial' || s === 'curing' || s === 'in_progress' || s === 'half_day' || s === 'trial') {
    return <Badge variant="warning">{status.replace('_', ' ')}</Badge>;
  }
  if (s === 'pending' || s === 'draft' || s === 'leave') {
    return <Badge variant="info">{status}</Badge>;
  }
  if (s === 'rejected' || s === 'absent' || s === 'expired' || s === 'suspended' || s === 'inactive' || s === 'cancelled' || s === 'scrap') {
    return <Badge variant="danger">{status}</Badge>;
  }

  return <Badge variant="default">{status}</Badge>;
}
