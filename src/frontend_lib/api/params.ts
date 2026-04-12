export type { ListParams } from '@/frontend_lib/types';

/**
 * Converts a {@link ListParams} (or any extension of it) into a `URLSearchParams`
 * ready to append to a URL.
 *
 * Only defined, non-empty values are included — undefined / null fields are skipped
 * so the server default is used.
 *
 * @example
 * const search = buildListSearchParams({ limit: 20, sortBy: 'name', sortOrder: 'asc' });
 * fetch(`/api/v1/departments?${search}`);
 */
export function buildListSearchParams(params: object): URLSearchParams {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  return search;
}
