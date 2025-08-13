export type ColorMode = 'light' | 'dark' | 'auto'

export type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>

export interface ThemeProviderProps {
  /**
   * 颜色模式(v-model:colorMode)，可选值：light、dark、auto，默认值：auto
   */
  colorMode?: ColorMode
  /**
   * 应用主题属性选择器的目标元素，默认值：html。主题只会影响 targetElement 下的元素
   */
  targetElement?: string
  /**
   * 主题(v-model:theme)
   */
  theme?: string
  storage?: ThemeStorage
  storageKey?: string
}
