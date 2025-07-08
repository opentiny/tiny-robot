import DOMPurify, { Config as DompurifyConfig } from 'dompurify'
import { default as MarkdownIt, Options as MarkdownItOptions } from 'markdown-it'
import { h } from 'vue'
import { BubbleMessageClassRenderer } from './class-renderer'

export interface BubbleMarkdownRendererOptions {
  mdConfig?: MarkdownItOptions
  dompurifyConfig?: DompurifyConfig
  sanitizeDisabled?: boolean
  styleOptions?: {
    class?: string
    style?: string
  }
}

export class BubbleMarkdownMessageRenderer extends BubbleMessageClassRenderer {
  readonly md: MarkdownIt
  readonly mdConfig: MarkdownItOptions
  readonly dompurifyConfig: DompurifyConfig
  readonly sanitizeDisabled: boolean
  readonly styleOptions: { class?: string; style?: string }

  constructor({ mdConfig, dompurifyConfig, sanitizeDisabled, styleOptions }: BubbleMarkdownRendererOptions = {}) {
    super()
    this.mdConfig = mdConfig || {}
    this.dompurifyConfig = dompurifyConfig || {}
    this.md = MarkdownIt(this.mdConfig)
    this.sanitizeDisabled = sanitizeDisabled ?? false
    this.styleOptions = styleOptions ?? {}
  }

  render(options: { content?: string }) {
    let htmlContent = ''

    try {
      htmlContent = this.md.render(options.content ?? '')
    } catch (error) {
      console.error('Error rendering markdown:', error)
      htmlContent = options.content ?? ''
    }

    if (this.sanitizeDisabled) {
      console.warn('HTML sanitization is disabled, potential XSS risk')
      return h('div', { innerHTML: htmlContent, class: this.styleOptions.class, style: this.styleOptions.style })
    }

    const sanitizedHtml = DOMPurify.sanitize(htmlContent, this.dompurifyConfig)
    return h('div', { innerHTML: sanitizedHtml, class: this.styleOptions.class, style: this.styleOptions.style })
  }
}
