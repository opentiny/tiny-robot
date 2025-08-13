import DOMPurify, { Config as DompurifyConfig } from 'dompurify'
import { default as MarkdownIt, Options as MarkdownItOptions } from 'markdown-it'
import { h } from 'vue'
import { BubbleContentClassRenderer } from './class-renderer'

export interface BubbleMarkdownRendererOptions {
  mdConfig?: MarkdownItOptions
  dompurifyConfig?: DompurifyConfig
  sanitizeDisabled?: boolean
  defaultAttrs?: Record<string, unknown>
}

export class BubbleMarkdownContentRenderer extends BubbleContentClassRenderer {
  readonly mdConfig: MarkdownItOptions
  readonly dompurifyConfig: DompurifyConfig
  readonly sanitizeDisabled: boolean
  readonly defaultAttrs: Record<string, unknown>
  private md: MarkdownIt

  constructor(options: BubbleMarkdownRendererOptions = {}) {
    super()
    this.mdConfig = options.mdConfig || {}
    this.dompurifyConfig = options.dompurifyConfig || {}
    this.sanitizeDisabled = options.sanitizeDisabled ?? false
    this.defaultAttrs = options.defaultAttrs || {}
    this.md = MarkdownIt(this.mdConfig)
  }

  render(options: { content?: string; [key: string]: unknown }) {
    const { content, ...rest } = options

    let htmlContent = ''

    try {
      htmlContent = this.md.render(content ?? '')
    } catch (error) {
      console.error('Error rendering markdown:', error)
      htmlContent = content ?? ''
    }

    if (this.sanitizeDisabled) {
      console.warn('HTML sanitization is disabled, potential XSS risk')
      return h('div', { ...this.defaultAttrs, ...rest, innerHTML: htmlContent })
    }

    const sanitizedHtml = DOMPurify.sanitize(htmlContent, this.dompurifyConfig)
    return h('div', { ...this.defaultAttrs, ...rest, innerHTML: sanitizedHtml })
  }
}
