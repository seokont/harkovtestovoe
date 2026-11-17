import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['a', 'code', 'i', 'strong']

export function sanitizeCommentHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'title'],
  })
}

export function isBalancedXhtml(html: string): boolean {
  const stack: string[] = []
  const tagRe = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(html)) !== null) {
    const full = m[0]
    const tag = (m[1] ?? '').toLowerCase()
    if (!ALLOWED_TAGS.includes(tag)) continue
    const isClosing = full.startsWith('</')
    if (isClosing) {
      if (stack.length === 0 || stack[stack.length - 1] !== tag) return false
      stack.pop()
    } else if (!full.endsWith('/>')) {
      stack.push(tag)
    }
  }
  return stack.length === 0
}
