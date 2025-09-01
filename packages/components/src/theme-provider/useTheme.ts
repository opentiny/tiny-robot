import { ComputedRef, inject, readonly, type Ref } from 'vue'
import { COLOR_MODE, RESOLVED_COLOR_MODE, SYSTEM_COLOR_MODE, THEME } from './constants'
import type { ColorMode } from './index.type'

const WARN_MESSAGE =
  'Theme context not available, cannot set theme data. Consider using ThemeProvider to wrap your app.'

export const useTheme = () => {
  const theme = inject<Ref<string>>(THEME)
  const colorMode = inject<Ref<ColorMode>>(COLOR_MODE)
  const resolvedColorMode = inject<ComputedRef<'light' | 'dark'>>(RESOLVED_COLOR_MODE)
  const systemColorMode = inject<Ref<'light' | 'dark'>>(SYSTEM_COLOR_MODE)

  /**
   * @param newTheme - 要设置的新主题
   * @returns 主题是否设置成功
   */
  const setTheme = (newTheme: string) => {
    if (!theme) {
      console.warn(WARN_MESSAGE)
      return false
    }

    theme.value = newTheme

    return true
  }

  /**
   * 切换颜色模式
   * @returns 颜色模式是否切换成功
   */
  const toggleColorMode = () => {
    if (!colorMode || !resolvedColorMode) {
      console.warn(WARN_MESSAGE)
      return false
    }

    colorMode.value = resolvedColorMode.value === 'light' ? 'dark' : 'light'

    return true
  }

  /**
   * 设置颜色模式
   * @param mode - 要设置的颜色模式
   * @returns 颜色模式是否设置成功
   */
  const setColorMode = (mode: ColorMode) => {
    if (!colorMode) {
      console.warn(WARN_MESSAGE)
      return false
    }

    colorMode.value = mode

    return true
  }

  return {
    theme,
    colorMode,
    resolvedColorMode: resolvedColorMode ? readonly(resolvedColorMode) : undefined,
    systemColorMode: systemColorMode ? readonly(systemColorMode) : undefined,
    setTheme,
    toggleColorMode,
    setColorMode,
  }
}
