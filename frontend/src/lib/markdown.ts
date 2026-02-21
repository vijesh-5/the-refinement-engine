/**
 * Strip Markdown formatting to produce clean plain text.
 * Used for copy-to-clipboard and plain-text export.
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    // Remove headings (## Heading → Heading)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold (**text** or __text__ → text)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic (*text* or _text_ → text)
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove strikethrough (~~text~~ → text)
    .replace(/~~(.+?)~~/g, '$1')
    // Remove inline code (`code` → code)
    .replace(/`(.+?)`/g, '$1')
    // Remove links [text](url) → text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove images ![alt](url) → alt
    .replace(/!\[(.+?)\]\(.+?\)/g, '$1')
    // Remove blockquote markers (> text → text)
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    .replace(/^\*\*\*+$/gm, '')
    // Remove unordered list markers (- item or * item → item)
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    // Remove ordered list markers (1. item → item)
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Collapse multiple blank lines into one
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
