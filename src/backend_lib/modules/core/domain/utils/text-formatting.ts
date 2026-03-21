/**
 * Utility functions for formatting and normalizing text
 */

/**
 * Convert a string to Pascal Case (each word capitalized)
 * Examples:
 *   "operations" → "Operations"
 *   "hr" → "HR"
 *   "human resources" → "Human Resources"
 */
export function toPascalCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Normalize a string to lowercase for storage and comparison
 * Removes extra whitespace and converts to lowercase
 */
export function normalize(str: string): string {
  return str.trim().toLowerCase();
}
