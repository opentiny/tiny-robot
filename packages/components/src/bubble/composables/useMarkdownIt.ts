import MarkdownIt, { Options } from 'markdown-it'

export function useMarkdownIt() {
  let cache = new WeakMap<Options, MarkdownIt>()

  const defaultOptions: Options = {}

  const getInstance = (mdConfig = defaultOptions): MarkdownIt => {
    if (!cache.has(mdConfig)) {
      cache.set(mdConfig, MarkdownIt(mdConfig))
    }

    return cache.get(mdConfig)!
  }

  const clearCache = () => {
    cache = new WeakMap()
  }

  return {
    getInstance,
    clearCache,
  }
}
