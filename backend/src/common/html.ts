import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = ['a', 'code', 'i', 'strong'];

/**
 * Checks that the allowed HTML tags are balanced (properly closed) —
 * a lightweight XHTML validity check for the tags we permit.
 */
export function isBalancedXhtml(html: string): boolean {
  const stack: string[] = [];
  const tagRe = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  let m: RegExpExecArray | null;

  while ((m = tagRe.exec(html)) !== null) {
    const full = m[0];
    const tag = m[1].toLowerCase();
    if (!ALLOWED_TAGS.includes(tag)) continue; // disallowed tags are stripped later

    const isClosing = full.startsWith('</');
    if (isClosing) {
      if (stack.length === 0 || stack[stack.length - 1] !== tag) return false;
      stack.pop();
    } else if (!full.endsWith('/>')) {
      stack.push(tag);
    }
  }

  return stack.length === 0;
}

/**
 * Removes every tag/attribute except the allowed set, closes any stray
 * opening tags and strips dangerous schemes (javascript:, data:).
 */
export function sanitizeCommentHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
  });
}
