import type DOMPurify from 'dompurify'
import type MarkdownIt from 'markdown-it'

let jsonrepairPromise: Promise<typeof import('jsonrepair')> | null = null

export const getJsonrepair = () => {
  if (!jsonrepairPromise) {
    jsonrepairPromise = import('jsonrepair')
  }
  return jsonrepairPromise
}

let markdownItAndDompurify: { markdown: typeof MarkdownIt; dompurify: typeof DOMPurify } | null = null

export const getMarkdownItAndDompurify = async () => {
  if (markdownItAndDompurify) {
    return markdownItAndDompurify
  }

  try {
    const [md, dompurify] = await Promise.all([import('markdown-it'), import('dompurify')])
    markdownItAndDompurify = { markdown: md.default, dompurify: dompurify.default }
    return markdownItAndDompurify
  } catch {
    console.warn('[BubbleMarkdownRenderer] install markdown-it and dompurify to use markdown renderer')
    markdownItAndDompurify = null
    return null
  }
}
