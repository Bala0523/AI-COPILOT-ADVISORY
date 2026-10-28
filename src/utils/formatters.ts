/**
 * AdvisoryOS Currency & Data Formatting Utilities
 * Standard Indian numbering system (Lakhs and Crores)
 */

export function formatINR(val: number, options?: { compact?: boolean; hideDecimals?: boolean }): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0';

  if (options?.compact) {
    const absVal = Math.abs(val);
    if (absVal >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (absVal >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    if (absVal >= 1000) {
      return `₹${(val / 1000).toFixed(1)} k`;
    }
  }

  // Standard Indian comma format
  const isNegative = val < 0;
  const rounded = options?.hideDecimals !== false ? Math.round(Math.abs(val)) : Math.abs(val);
  const formatted = rounded.toLocaleString('en-IN');

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatPercent(val: number, decimals: number = 1): string {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${val.toFixed(decimals)}%`;
}

export function formatDemoTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
