/**
 * Blog utility functions
 */

export interface TocItem {
  id: string
  text: string
  level: number // 2 for h2, 3 for h3
}

/**
 * Generate a table of contents from markdown text by extracting ## and ### headings.
 *
 * @param markdown The article markdown content
 * @returns Array of { id, text, level }
 */
export function generateTocFromMarkdown(markdown: string): TocItem[] {
  if (!markdown) return []

  const items: TocItem[] = []
  const lines = markdown.split("\n")
  const headingRegex = /^(#{2,3})\s+(.+)$/

  for (const line of lines) {
    const match = line.match(headingRegex)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[*_`~]/g, "").trim()
      if (!text) continue
      const id = slugifyHeading(text)
      items.push({ id, text, level })
    }
  }

  return items
}

/**
 * Generate a table of contents from an HTML string by extracting h2 and h3 headings.
 * Each heading's `id` is derived from its text (slugified).
 *
 * @param html The article HTML content
 * @returns Array of { id, text, level }
 */
export function generateTocFromHtml(html: string): TocItem[] {
  if (!html) return []

  const items: TocItem[] = []
  // Match <h2> and <h3> tags (case-insensitive, with optional attributes)
  const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10)
    const text = match[2].replace(/<[^>]+>/g, "").trim()
    if (!text) continue
    const id = slugifyHeading(text)
    items.push({ id, text, level })
  }

  return items
}

/**
 * Auto-detect content format and generate a TOC accordingly.
 * If the content looks like HTML (starts with `<`), use generateTocFromHtml;
 * otherwise treat as markdown and use generateTocFromMarkdown.
 */
export function generateToc(content: string): TocItem[] {
  if (!content) return []
  const trimmed = content.trim()
  if (trimmed.startsWith("<") || /<\/?(h[1-6]|p|div|ul|ol|li|pre|blockquote)/i.test(trimmed)) {
    return generateTocFromHtml(content)
  }
  return generateTocFromMarkdown(content)
}

/**
 * Slugify a heading for use as an HTML id.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Inject id attributes into h2/h3 tags in an HTML string.
 * Returns a new HTML string with `id` attributes added to all h2/h3 elements
 * that don't already have one.
 *
 * @param html The article HTML content
 * @returns HTML with id attributes on headings
 */
export function injectHeadingIds(html: string): string {
  if (!html) return ""

  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
    // Check if id already exists
    if (/id=["'][^"']+["']/i.test(attrs)) return match
    const text = content.replace(/<[^>]+>/g, "").trim()
    const id = slugifyHeading(text)
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`
  })
}

/**
 * Format a view count for display (e.g. 1234 → "1.2k")
 */
export function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k"
  return String(n)
}

/**
 * Format an ISO date string for display
 */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Calculate estimated read time from content length
 */
export function estimateReadTime(content: string): string {
  // Average reading speed: 200 words per minute
  const text = content.replace(/<[^>]+>/g, " ")
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}
