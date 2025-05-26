import { fromAsyncCodeToHtml } from '@shikijs/markdown-it/async'
import DOMPurify, { Config as DompurifyConfig } from 'dompurify'
import createMarkdownItAsync, { MarkdownItAsync, Options } from 'markdown-it-async'
import { BundledLanguage, bundledLanguages, codeToHtml } from 'shiki'
import { defineCustomElement, onBeforeUnmount } from 'vue'
import CopyBtn from '../CopyBtn.vue'

const COPY_BTN_TAG = 'tr-copy-btn'

const MD_DEFAULT_OPTIONS: Readonly<Options> = {} as const
const DOMPURIFY_DEFAULT_CONFIG: Readonly<DompurifyConfig> = {
  ADD_TAGS: [COPY_BTN_TAG],
  ADD_ATTR: ['content'],
}

if (!customElements.get(COPY_BTN_TAG)) {
  const Element = defineCustomElement(CopyBtn, { styles: [] })
  customElements.define(COPY_BTN_TAG, Element)
}

const mergeDompurifyConfig = (config1: DompurifyConfig, config2?: DompurifyConfig) => {
  const merged: DompurifyConfig = { ...config1 }

  for (const _key in config2) {
    const key = _key as keyof DompurifyConfig
    const val1 = merged[key]
    const val2 = config2[key]

    if (Array.isArray(val1) && Array.isArray(val2)) {
      ;(merged[key] as string[]) = Array.from(new Set([...val1, ...val2]))
    } else if (
      typeof val1 === 'object' &&
      typeof val2 === 'object' &&
      val1 !== null &&
      val2 !== null &&
      !Array.isArray(val1) &&
      !Array.isArray(val2)
    ) {
      ;(merged[key] as unknown) = { ...val1, ...val2 }
    } else {
      ;(merged[key] as unknown) = val2
    }
  }

  return merged
}

const markdownItShiki = (md: MarkdownItAsync) => {
  md.use(
    fromAsyncCodeToHtml(
      async (code, options) => {
        const lang = bundledLanguages[options.lang as BundledLanguage] ? options.lang : 'txt'

        Object.assign(options, { lang })

        return codeToHtml(code, options)
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

const escapeQuotes = (str: string): string => {
  return str
    .replace(/"/g, '&quot;') // 转义双引号
    .replace(/'/g, '&apos;') // 转义单引号
}

export const createMarkdownItWithPlugins = (mdConfig: Options = {}) => {
  const md = createMarkdownItAsync(mdConfig)
  md.use(markdownItShiki)
  // 自定义插件，给code block套一层div容器
  md.use((md) => {
    const fenceRenderer = md.renderer.rules.fence

    if (!fenceRenderer) {
      return
    }

    const customFenceRender: typeof fenceRenderer = (token, idx, options, env, self) => {
      const result = fenceRenderer(token, idx, options, env, self)
      if (token[idx].tag === 'code' && result.startsWith('<pre')) {
        const lang = bundledLanguages[token[idx].info as BundledLanguage] ? token[idx].info : 'txt'

        return (
          `<div class="tr-bubble__code-wrapper">` +
          `<div class="tr-bubble__code-toolbar">` +
          `<span>${lang.toLowerCase()}</span>` +
          `<div><${COPY_BTN_TAG} content="${escapeQuotes(token[idx].content)}"></${COPY_BTN_TAG}></div></div>` +
          `${result}</div>`
        )
      }

      return result
    }

    md.renderer.rules.fence = customFenceRender
  })

  return md
}

export const parseMarkdown = async (
  mdContent: string,
  mdConfig = MD_DEFAULT_OPTIONS,
  domPurifyConfig?: DompurifyConfig,
) => {
  const md = createMarkdownItWithPlugins(mdConfig)
  const htmlContent = await md.renderAsync(mdContent)
  return DOMPurify.sanitize(htmlContent, mergeDompurifyConfig(DOMPURIFY_DEFAULT_CONFIG, domPurifyConfig))
}

export function useMarkdownIt() {
  let cache: WeakMap<Options, MarkdownItAsync> | null = new WeakMap<Options, MarkdownItAsync>()

  const getInstance = async (mdConfig = MD_DEFAULT_OPTIONS): Promise<MarkdownItAsync> => {
    const cacheMap = cache!

    if (!cacheMap.has(mdConfig)) {
      const md = createMarkdownItWithPlugins(mdConfig)
      cacheMap.set(mdConfig, md)
    }

    return cacheMap.get(mdConfig)!
  }

  const parse = async (mdContent: string, mdConfig?: Options, domPurifyConfig?: DompurifyConfig) => {
    const md = await getInstance(mdConfig)
    const htmlContent = await md.renderAsync(mdContent)
    return DOMPurify.sanitize(htmlContent, mergeDompurifyConfig(DOMPURIFY_DEFAULT_CONFIG, domPurifyConfig))
  }

  onBeforeUnmount(() => {
    cache = null
  })

  return {
    parse,
  }
}
