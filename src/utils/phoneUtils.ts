/**
 * Utility functions for Colombian phone numbers formatting and normalization.
 * Colombia mobile numbers are 10 digits starting with 3 (e.g. 312 456 7890).
 * International WhatsApp standard requires country code 57 (e.g. 573124567890).
 */

/**
 * Formats a phone number for user-friendly display,
 * e.g. "573124567890" -> "+57 312 456 7890"
 */
export const formatColombianPhone = (phone?: string | null): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('573')) {
    return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.length === 10 && digits.startsWith('3')) {
    return `+57 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone.startsWith('+') ? phone : `+${phone}`;
};

/**
 * Extracts the local 10-digit mobile number for form inputs,
 * stripping leading '57' if present.
 */
export const extractLocalPhone = (phone?: string | null): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('573')) {
    return digits.slice(2);
  }
  return digits;
};

/**
 * Normalizes input to canonical international format (573XXXXXXXXX)
 * for WhatsApp links and persistent storage.
 */
export const normalizeToColombianWa = (input?: string | null): string => {
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('3')) {
    return `57${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('573')) {
    return digits;
  }
  return digits;
};
