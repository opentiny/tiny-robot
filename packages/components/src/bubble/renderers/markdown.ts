import DOMPurify, { Config as DompurifyConfig } from 'dompurify'
import { default as MarkdownIt, Options as MarkdownItOptions } from 'markdown-it'
import { h } from 'vue'
import { BubbleContentClassRenderer } from './class-renderer'

export class BubbleMarkdownContentRenderer extends BubbleContentClassRenderer {
  readonly mdConfig: MarkdownItOptions
  readonly dompurifyConfig: DompurifyConfig & { disable?: boolean }
  private md: MarkdownIt

  constructor(mdConfig?: MarkdownItOptions, dompurifyConfig?: DompurifyConfig & { disable?: boolean }) {
    super()
    this.mdConfig = mdConfig || {}
    this.dompurifyConfig = dompurifyConfig || {}
    this.md = MarkdownIt(this.mdConfig)
  }

  render(options: { content?: string }) {
    let htmlContent = ''

    try {
      htmlContent = this.md.render(options.content ?? '')
    } catch (error) {
      console.error('Error rendering markdown:', error)
      htmlContent = options.content ?? ''
    }

    if (this.dompurifyConfig.disable) {
      console.warn('HTML sanitization is disabled, potential XSS risk')
      return h('div', { innerHTML: htmlContent })
    }

    const sanitizedHtml = DOMPurify.sanitize(htmlContent, this.dompurifyConfig)
    return h('div', { innerHTML: sanitizedHtml })
  }
}
