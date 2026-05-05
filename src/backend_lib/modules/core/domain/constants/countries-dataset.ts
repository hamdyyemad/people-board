import countriesJson from '@/backend_lib/shared/data/countries.json';
import { normalize } from '../utils/text-formatting';

export type CountryDatasetEntry = {
  phone_code: string;
  name: string;
};

export type CountryDataset = Record<string, CountryDatasetEntry>;

const DATASET = countriesJson as CountryDataset;

export function getCountryDatasetEntry(isoAlpha2: string): CountryDatasetEntry | undefined {
  return DATASET[isoAlpha2.toUpperCase()];
}

/**
 * Canonical international dialing prefix: strips spaces, optional `00` → `+`,
 * bare digits → `+…`. Returns `""` when the source has no calling code.
 */
export function normalizeDialPrefix(raw: string): string {
  if (raw == null || raw.trim() === '') {
    return '';
  }
  let s = raw.trim().replace(/\s+/g, '');
  if (s.startsWith('00')) {
    s = `+${s.slice(2)}`;
  }
  if (!s.startsWith('+')) {
    if (/^\d+$/.test(s)) {
      s = `+${s}`;
    }
  }
  if (!s.startsWith('+')) {
    return '';
  }
  const digits = s.slice(1);
  if (!/^\d+$/.test(digits)) {
    return '';
  }
  return `+${digits}`;
}

/** Expected canonical prefix for an ISO row in `countries.json` (may be `""`). */
export function getCanonicalPhoneForIso(isoAlpha2: string): string | undefined {
  const entry = getCountryDatasetEntry(isoAlpha2);
  if (!entry) return undefined;
  return normalizeDialPrefix(entry.phone_code);
}

/** Canonical normalized display name from `countries.json` for an ISO. */
export function getCanonicalNameForIso(isoAlpha2: string): string | undefined {
  const entry = getCountryDatasetEntry(isoAlpha2);
  if (!entry) return undefined;
  return normalize(entry.name);
}
