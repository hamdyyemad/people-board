/**
 * Normalize phone numbers for storage and duplicate detection.
 * Keeps an optional leading + and strips formatting characters.
 */
export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    return trimmed;
  }
  return hasPlus ? `+${digits}` : digits;
}
