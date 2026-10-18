// Product article format (written in the admin panel): a blank line starts a new paragraph,
// "## " starts a subheading, "- " starts a list item. Parsed into blocks and rendered as text nodes, never as HTML.
export type ArticleBlock = { type: 'heading'; text: string } | { type: 'paragraph'; text: string } | { type: 'list'; items: string[] }

export function parseArticle(source: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = []
  for (const chunk of source.replace(/\r\n?/g, '\n').split(/\n\s*\n/)) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) continue
    let para: string[] = []
    const flush = () => {
      if (para.length) blocks.push({ type: 'paragraph', text: para.join(' ') })
      para = []
    }
    for (const line of lines) {
      if (line.startsWith('## ')) {
        flush()
        blocks.push({ type: 'heading', text: line.slice(3).trim() })
      } else if (/^[-•]\s+/.test(line)) {
        flush()
        const item = line.replace(/^[-•]\s+/, '')
        const last = blocks[blocks.length - 1]
        if (last?.type === 'list') last.items.push(item)
        else blocks.push({ type: 'list', items: [item] })
      } else {
        para.push(line)
      }
    }
    flush()
  }
  return blocks
}
