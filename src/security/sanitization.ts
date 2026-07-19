/**
 * Escapes a value for an HTML text node or a quoted HTML attribute.
 * This is contextual output encoding, not a general-purpose HTML sanitizer.
 */
export function escapeHtmlText(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Removes tag-shaped substrings for plain-text extraction.
 * It must never be used as an XSS boundary.
 */
export function stripHtmlTags(unsafe: string): string {
  return unsafe.replace(/(<([^>]+)>)/gi, "");
}

/** @deprecated Use escapeHtmlText to make the output context explicit. */
export const escapeHtml = escapeHtmlText;

/** @deprecated Use stripHtmlTags. This function is not an HTML sanitizer. */
export const stripHtml = stripHtmlTags;
