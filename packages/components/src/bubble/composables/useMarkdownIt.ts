import { fromAsyncCodeToHtml } from '@shikijs/markdown-it/async'
import DOMPurify, { Config as DompurifyConfig } from 'dompurify'
import createMarkdownItAsync, { MarkdownItAsync, Options } from 'markdown-it-async'
import { BundledLanguage, bundledLanguages, codeToHtml } from 'shiki'
import { onBeforeUnmount } from 'vue'

const MD_DEFAULT_OPTIONS: Readonly<Options> = {} as const

const markdownItShiki = (md: MarkdownItAsync) => {
  md.use(
    fromAsyncCodeToHtml(
      async (code, options) => {
        if (bundledLanguages[options.lang as BundledLanguage]) {
          return codeToHtml(code, options)
        }
        return codeToHtml(code, { ...options, lang: 'plaintext' })
      },
      {
        theme: 'github-light',
        transformers: [
          {
            pre: function (node) {
              node.properties.style = undefined
            },

            code: function (node) {
              this.addClassToHast(node, 'tr-bubble__code')
            },
          },
        ],
      },
    ),
  )
}

export const parseMarkdown = async (mdContent: string, mdConfig: Options = {}, domPurifyConfig?: DompurifyConfig) => {
  const md = createMarkdownItAsync(mdConfig)
  md.use(markdownItShiki)
  const htmlContent = await md.renderAsync(mdContent)
  return DOMPurify.sanitize(htmlContent, domPurifyConfig)
}

export function useMarkdownIt() {
  let cache: WeakMap<Options, MarkdownItAsync> | null = new WeakMap<Options, MarkdownItAsync>()

  const getInstance = async (mdConfig = MD_DEFAULT_OPTIONS): Promise<MarkdownItAsync> => {
    const cacheMap = cache!

    if (!cacheMap.has(mdConfig)) {
      const md = createMarkdownItAsync(mdConfig)
      md.use(markdownItShiki)
      cacheMap.set(mdConfig, md)
    }

    return cacheMap.get(mdConfig)!
  }

  const parse = async (mdContent: string, mdConfig?: Options, domPurifyConfig?: DompurifyConfig) => {
    const md = await getInstance(mdConfig)
    const htmlContent = md.render(mdContent)
    return DOMPurify.sanitize(htmlContent, domPurifyConfig)
  }

  onBeforeUnmount(() => {
    cache = null
  })

  return {
    parse,
  }
}
