import MarkdownIt, { Options } from 'markdown-it'
import Prism from 'prismjs'

import 'prismjs/components/prism-typescript'
import 'prismjs/themes/prism.css'

import 'prismjs/plugins/toolbar/prism-toolbar.js'
import 'prismjs/plugins/toolbar/prism-toolbar.css'

import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.js'
import 'prismjs/plugins/show-language/prism-show-language.js'
import './code-toolbar.css'

const MD_DEFAULT_OPTIONS: Readonly<Options> = {
  highlight: (code, lang) => {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang)
    }

    return `<pre class="language-txt"><code>${MarkdownIt().utils.escapeHtml(code)}</code></pre>`
  },
} as const

export function useMarkdownIt() {
  let cache = new WeakMap<Options, MarkdownIt>()

  const getInstance = (mdConfig = MD_DEFAULT_OPTIONS): MarkdownIt => {
    if (!cache.has(mdConfig)) {
      const md = MarkdownIt(mdConfig)

      cache.set(mdConfig, md)
    }

    return cache.get(mdConfig)!
  }

  const clearCache = () => {
    cache = new WeakMap()
  }

  return {
    MD_DEFAULT_OPTIONS,
    getInstance,
    clearCache,
  }
}
