import Shiki from '@shikijs/markdown-it'
import DOMPurify, { Config as DompurifyConfig } from 'dompurify'
import MarkdownIt, { Options } from 'markdown-it'
import { onBeforeUnmount } from 'vue'

const MD_DEFAULT_OPTIONS: Readonly<Options> = {} as const

const markdownItShiki = Shiki({
  themes: {
    light: 'vitesse-light',
    dark: 'vitesse-dark',
  },
})

export const parseMarkdown = async (mdContent: string, mdConfig: Options = {}, domPurifyConfig?: DompurifyConfig) => {
  const md = MarkdownIt(mdConfig)
  md.use(await markdownItShiki)
  const htmlContent = md.render(mdContent)
  return DOMPurify.sanitize(htmlContent, domPurifyConfig)
}

export function useMarkdownIt() {
  let cache: WeakMap<Options, MarkdownIt> | null = new WeakMap<Options, MarkdownIt>()

  const getInstance = async (mdConfig = MD_DEFAULT_OPTIONS): Promise<MarkdownIt> => {
    const cacheMap = cache!

    if (!cacheMap.has(mdConfig)) {
      const md = MarkdownIt(mdConfig)
      md.use(await markdownItShiki)
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
