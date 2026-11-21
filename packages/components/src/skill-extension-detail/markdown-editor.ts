import type { JSONContent } from '@tiptap/core'
import { Mark, mergeAttributes, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import History from '@tiptap/extension-history'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import MarkdownIt from 'markdown-it'

const Strong = Mark.create({
  name: 'bold',
  parseHTML: () => [{ tag: 'strong' }, { tag: 'b' }],
  renderHTML: ({ HTMLAttributes }) => ['strong', mergeAttributes(HTMLAttributes), 0],
})

const Emphasis = Mark.create({
  name: 'italic',
  parseHTML: () => [{ tag: 'em' }, { tag: 'i' }],
  renderHTML: ({ HTMLAttributes }) => ['em', mergeAttributes(HTMLAttributes), 0],
})

const Strikethrough = Mark.create({
  name: 'strike',
  parseHTML: () => [{ tag: 's' }, { tag: 'del' }, { tag: 'strike' }],
  renderHTML: ({ HTMLAttributes }) => ['del', mergeAttributes(HTMLAttributes), 0],
})

const InlineCode = Mark.create({
  name: 'code',
  excludes: '_',
  code: true,
  parseHTML: () => [{ tag: 'code' }],
  renderHTML: ({ HTMLAttributes }) => ['code', mergeAttributes(HTMLAttributes), 0],
})

const Link = Mark.create({
  name: 'link',
  inclusive: false,
  addAttributes() {
    return {
      href: { default: null },
      title: { default: null },
    }
  },
  parseHTML: () => [{ tag: 'a[href]' }],
  renderHTML: ({ HTMLAttributes }) => ['a', mergeAttributes(HTMLAttributes), 0],
})

const Heading = Node.create({
  name: 'heading',
  group: 'block',
  content: 'inline*',
  defining: true,
  addAttributes() {
    return { level: { default: 1 } }
  },
  parseHTML: () =>
    [1, 2, 3, 4, 5, 6].map((level) => ({
      tag: `h${level}`,
      attrs: { level },
    })),
  renderHTML: ({ node, HTMLAttributes }) => [`h${node.attrs.level}`, mergeAttributes(HTMLAttributes), 0],
})

const Blockquote = Node.create({
  name: 'blockquote',
  group: 'block',
  content: 'block+',
  defining: true,
  parseHTML: () => [{ tag: 'blockquote' }],
  renderHTML: ({ HTMLAttributes }) => ['blockquote', mergeAttributes(HTMLAttributes), 0],
})

const ListItem = Node.create({
  name: 'listItem',
  content: 'paragraph block*',
  defining: true,
  parseHTML: () => [{ tag: 'li' }],
  renderHTML: ({ HTMLAttributes }) => ['li', mergeAttributes(HTMLAttributes), 0],
})

const BulletList = Node.create({
  name: 'bulletList',
  group: 'block',
  content: 'listItem+',
  parseHTML: () => [{ tag: 'ul' }],
  renderHTML: ({ HTMLAttributes }) => ['ul', mergeAttributes(HTMLAttributes), 0],
})

const OrderedList = Node.create({
  name: 'orderedList',
  group: 'block',
  content: 'listItem+',
  addAttributes() {
    return { start: { default: 1 } }
  },
  parseHTML: () => [
    { tag: 'ol', getAttrs: (element) => ({ start: Number((element as HTMLElement).getAttribute('start')) || 1 }) },
  ],
  renderHTML: ({ node, HTMLAttributes }) =>
    node.attrs.start === 1
      ? ['ol', mergeAttributes(HTMLAttributes), 0]
      : ['ol', mergeAttributes(HTMLAttributes, { start: node.attrs.start }), 0],
})

const CodeBlock = Node.create({
  name: 'codeBlock',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: (element) => {
          const className = (element as HTMLElement).querySelector('code')?.className || ''
          return className.match(/(?:^|\s)language-([^\s]+)/)?.[1] || null
        },
        renderHTML: ({ language }) => (language ? { 'data-language': language } : {}),
      },
    }
  },
  parseHTML: () => [{ tag: 'pre' }],
  renderHTML: ({ node, HTMLAttributes }) => [
    'pre',
    mergeAttributes(HTMLAttributes),
    ['code', node.attrs.language ? { class: `language-${node.attrs.language}` } : {}, 0],
  ],
})

const HardBreak = Node.create({
  name: 'hardBreak',
  inline: true,
  group: 'inline',
  selectable: false,
  parseHTML: () => [{ tag: 'br' }],
  renderHTML: () => ['br'],
})

const HorizontalRule = Node.create({
  name: 'horizontalRule',
  group: 'block',
  atom: true,
  parseHTML: () => [{ tag: 'hr' }],
  renderHTML: ({ HTMLAttributes }) => ['hr', mergeAttributes(HTMLAttributes)],
})

const Image = Node.create({
  name: 'image',
  inline: true,
  group: 'inline',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
    }
  },
  parseHTML: () => [{ tag: 'img[src]' }],
  renderHTML: ({ HTMLAttributes }) => ['img', mergeAttributes(HTMLAttributes)],
})

const TableCell = Node.create({
  name: 'tableCell',
  content: 'block+',
  isolating: true,
  addAttributes() {
    return { align: { default: null } }
  },
  parseHTML: () => [{ tag: 'td', getAttrs: readCellAlignment }],
  renderHTML: ({ node, HTMLAttributes }) => [
    'td',
    mergeAttributes(HTMLAttributes, node.attrs.align ? { style: `text-align: ${node.attrs.align}` } : {}),
    0,
  ],
})

const TableHeader = Node.create({
  name: 'tableHeader',
  content: 'block+',
  isolating: true,
  addAttributes() {
    return { align: { default: null } }
  },
  parseHTML: () => [{ tag: 'th', getAttrs: readCellAlignment }],
  renderHTML: ({ node, HTMLAttributes }) => [
    'th',
    mergeAttributes(HTMLAttributes, node.attrs.align ? { style: `text-align: ${node.attrs.align}` } : {}),
    0,
  ],
})

const TableRow = Node.create({
  name: 'tableRow',
  content: '(tableHeader | tableCell)+',
  parseHTML: () => [{ tag: 'tr' }],
  renderHTML: ({ HTMLAttributes }) => ['tr', mergeAttributes(HTMLAttributes), 0],
})

const Table = Node.create({
  name: 'table',
  group: 'block',
  content: 'tableRow+',
  isolating: true,
  parseHTML: () => [{ tag: 'table' }],
  renderHTML: ({ HTMLAttributes }) => ['table', mergeAttributes(HTMLAttributes), ['tbody', 0]],
})

export const skillMarkdownExtensions = [
  Document,
  Paragraph,
  Text,
  History,
  Strong,
  Emphasis,
  Strikethrough,
  InlineCode,
  Link,
  Heading,
  Blockquote,
  ListItem,
  BulletList,
  OrderedList,
  CodeBlock,
  HardBreak,
  HorizontalRule,
  Image,
  Table,
  TableRow,
  TableHeader,
  TableCell,
]

const markdownParser = new MarkdownIt({ html: false, linkify: false })

export const markdownToHtml = (markdown: string) => markdownParser.render(markdown)

type MarkdownNode = {
  type?: string
  attrs?: Record<string, unknown>
  content?: MarkdownNode[]
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
}

const escapeText = (value: string) => value.replace(/[\\`*_{}\[\]<>]/g, '\\$&')

const escapeBlockStart = (value: string) =>
  value.replace(/^([#>+\-*])(?=\s)/, '\\$1').replace(/^(\d+)([.)])(?=\s)/, '\\$1$2')

const escapeTitle = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const serializeCode = (value: string) => {
  const longestFence = Math.max(0, ...Array.from(value.matchAll(/`+/g), ([fence]) => fence.length))
  const fence = '`'.repeat(Math.max(1, longestFence + 1))
  const padding = value.startsWith('`') || value.endsWith('`') || (value.startsWith(' ') && value.endsWith(' '))
  return `${fence}${padding ? ' ' : ''}${value}${padding ? ' ' : ''}${fence}`
}

const serializeImage = (node: MarkdownNode) => {
  const attrs = node.attrs || {}
  const alt = escapeText(String(attrs.alt || ''))
  const src = String(attrs.src || '').replace(/>/g, '%3E')
  const title = attrs.title ? ` "${escapeTitle(String(attrs.title))}"` : ''
  return `![${alt}](<${src}>${title})`
}

const serializeInline = (node: MarkdownNode): string => {
  if (node.type === 'text') {
    const text = node.text || ''
    const marks = node.marks || []
    const code = marks.find((mark) => mark.type === 'code')
    if (code) return serializeCode(text)

    let value = escapeText(text)
    for (const mark of marks) {
      switch (mark.type) {
        case 'bold':
          value = `**${value}**`
          break
        case 'italic':
          value = `*${value}*`
          break
        case 'strike':
          value = `~~${value}~~`
          break
        case 'link': {
          const href = String(mark.attrs?.href || '').replace(/>/g, '%3E')
          const title = mark.attrs?.title ? ` "${escapeTitle(String(mark.attrs.title))}"` : ''
          value = `[${value}](<${href}>${title})`
          break
        }
      }
    }
    return value
  }

  if (node.type === 'hardBreak') return '  \n'
  if (node.type === 'image') return serializeImage(node)
  return (node.content || []).map(serializeInline).join('')
}

const serializeCell = (node: MarkdownNode) =>
  (node.content || [])
    .map((block) => serializeInline(block))
    .join(' ')
    .replace(/\s*\|\s*/g, '\\|')
    .replace(/\r?\n/g, '<br>')

const serializeTable = (node: MarkdownNode) => {
  const rows = node.content || []
  if (!rows.length) return ''
  const header = rows[0].content || []
  const alignments = header.map((cell) => {
    switch (cell.attrs?.align) {
      case 'left':
        return ':---'
      case 'center':
        return ':---:'
      case 'right':
        return '---:'
      default:
        return '---'
    }
  })
  const formatRow = (row: MarkdownNode) => `| ${(row.content || []).map(serializeCell).join(' | ')} |`
  return [formatRow(rows[0]), `| ${alignments.join(' | ')} |`, ...rows.slice(1).map(formatRow)].join('\n')
}

const serializeList = (node: MarkdownNode, indent = ''): string => {
  let index = Number(node.attrs?.start) || 1
  const items: string[] = (node.content || []).map((item): string => {
    const marker = node.type === 'orderedList' ? `${index++}. ` : '- '
    let firstBlock = true
    const continuation = `${indent}${' '.repeat(marker.length)}`
    return (item.content || [])
      .map((block) => {
        if (block.type === 'bulletList' || block.type === 'orderedList') {
          firstBlock = false
          return serializeList(block, continuation)
        }
        const content = serializeBlock(block)
        const prefix = firstBlock ? `${indent}${marker}` : continuation
        firstBlock = false
        return content
          .split('\n')
          .map((line, lineIndex) => (lineIndex === 0 ? prefix : continuation) + line)
          .join('\n')
      })
      .join('\n')
  })
  return items.join('\n')
}

const serializeBlock = (node: MarkdownNode): string => {
  const children = node.content || []
  switch (node.type) {
    case 'paragraph':
      return escapeBlockStart(children.map(serializeInline).join(''))
    case 'heading':
      return `${'#'.repeat(Math.min(6, Math.max(1, Number(node.attrs?.level) || 1)))} ${children.map(serializeInline).join('')}`
    case 'blockquote':
      return serializeBlocks(children)
        .split('\n')
        .map((line) => (line ? `> ${line}` : '>'))
        .join('\n')
    case 'bulletList':
    case 'orderedList':
      return serializeList(node)
    case 'codeBlock': {
      const code = children.map((child) => child.text || '').join('')
      const fenceLength = Math.max(3, ...Array.from(code.matchAll(/`+/g), ([fence]) => fence.length + 1))
      const fence = '`'.repeat(fenceLength)
      const language = node.attrs?.language ? String(node.attrs.language) : ''
      return `${fence}${language}\n${code}${code.endsWith('\n') ? '' : '\n'}${fence}`
    }
    case 'horizontalRule':
      return '---'
    case 'table':
      return serializeTable(node)
    default:
      return children.map((child) => (child.type === 'text' ? child.text || '' : serializeBlock(child))).join('\n')
  }
}

const serializeBlocks = (nodes: MarkdownNode[]) => nodes.map(serializeBlock).join('\n\n')

export const serializeMarkdown = (document: JSONContent) =>
  serializeBlocks((document.content || []) as MarkdownNode[]).trim()

function readCellAlignment(element: HTMLElement) {
  const align = element.style.textAlign
  return { align: align === 'left' || align === 'center' || align === 'right' ? align : null }
}
