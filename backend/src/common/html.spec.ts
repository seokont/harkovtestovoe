import { isBalancedXhtml, sanitizeCommentHtml } from './html.js';

describe('html utils', () => {
  it('accepts balanced allowed tags', () => {
    expect(isBalancedXhtml('<strong>hello</strong>')).toBe(true);
    expect(isBalancedXhtml('<i>a</i> <code>b</code>')).toBe(true);
    expect(isBalancedXhtml('<a href="https://x.com" title="t">link</a>')).toBe(true);
  });

  it('rejects unbalanced allowed tags', () => {
    expect(isBalancedXhtml('<strong>hello')).toBe(false);
    expect(isBalancedXhtml('</strong>')).toBe(false);
    expect(isBalancedXhtml('<a>link</code>')).toBe(false);
  });

  it('strips disallowed tags and attributes', () => {
    const out = sanitizeCommentHtml('<script>alert(1)</script><strong onclick="x">hi</strong>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('onclick');
    expect(out).toContain('<strong>hi</strong>');
  });

  it('keeps only http/https/mailto links', () => {
    const safe = sanitizeCommentHtml('<a href="https://example.com">ok</a>');
    expect(safe).toContain('href="https://example.com"');

    const unsafe = sanitizeCommentHtml('<a href="javascript:alert(1)">x</a>');
    expect(unsafe).not.toContain('javascript:');
  });
});
