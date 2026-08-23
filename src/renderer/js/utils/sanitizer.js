/**
 * SANITIZER UTILITY
 * Escapes HTML characters to prevent XSS (Cross-Site Scripting) injection attacks.
 */

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeAttribute(str) {
  return escapeHtml(str).replace(/`/g, '&#96;');
}

export default { escapeHtml, sanitizeAttribute };
