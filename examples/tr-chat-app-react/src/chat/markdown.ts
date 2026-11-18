import './markdown.css'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import type { ChatBubbleRenderers } from '@opentiny/tiny-robot-chat/experimental'

// 应用持有解析器，可在这里配置 Markdown-it 规则与插件。
const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true, breaks: true })
markdown.renderer.rules.fence = (tokens, index) => {
  const token = tokens[index]
  const language = markdown.utils.escapeHtml(token.info.trim().split(/\s+/)[0] || 'text')
  return `<div class="markdown-code"><div class="markdown-code-header"><span>${language}</span><span>代码</span></div><pre tabindex="0" role="region" aria-label="代码块"><code>${markdown.utils.escapeHtml(token.content)}</code></pre></div>`
}
markdown.renderer.rules.table_open = () =>
  '<div class="markdown-table" tabindex="0" role="region" aria-label="表格"><table>'
markdown.renderer.rules.table_close = () => '</table></div>'

export const bubbleRenderers: ChatBubbleRenderers = {
  contentRendererMatches: [
    {
      find: (message, content) => message.role === 'assistant' && content.type === 'text',
      renderer: ({ content }) => {
        const article = document.createElement('article')
        article.className = 'assistant-markdown'
        article.innerHTML = DOMPurify.sanitize(markdown.render(typeof content.text === 'string' ? content.text : ''))
        for (const link of article.querySelectorAll('a')) {
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
        }
        return article
      },
    },
  ],
}
