import { format, parseISO, isValid } from 'date-fns';

/**
 * Format numbers in Indian Numbering System (e.g. ₹ 1,50,000)
 */
export function formatINR(amount: number | undefined | null, showSymbol = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showSymbol ? '₹0' : '0';
  }
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);

  return showSymbol ? `₹${formatted}` : formatted;
}

/**
 * Format standard quantities with units (e.g. 15,000 Pcs / 45.5 Ton)
 */
export function formatQuantity(quantity: number | undefined | null, unit = ''): string {
  if (quantity === undefined || quantity === null || isNaN(quantity)) {
    return `0 ${unit}`.trim();
  }
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(quantity);

  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format date string or Date object to readable format e.g. "02 Sep 2026"
 */
export function formatDate(dateInput: string | Date | undefined | null, formatStr = 'dd MMM yyyy'): string {
  if (!dateInput) return '-';
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(date)) return String(dateInput);
    return format(date, formatStr);
  } catch {
    return String(dateInput);
  }
}

/**
 * Format date and time e.g. "02 Sep 2026, 04:30 PM"
 */
export function formatDateTime(dateInput: string | Date | undefined | null): string {
  return formatDate(dateInput, 'dd MMM yyyy, hh:mm a');
}

/**
 * Return humanized relative time
 */
export function formatTime(timeStr: string | undefined | null): string {
  if (!timeStr) return '';
  return timeStr;
}

/**
 * Generate a clean unique ID (mock UUID)
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Generate a valid RFC4122 UUID compliant with PostgreSQL UUID columns
 */
export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
