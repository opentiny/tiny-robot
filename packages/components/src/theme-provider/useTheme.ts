import { ComputedRef, inject, type Ref } from 'vue'
import { COLOR_MODE_KEY, RESOLVED_COLOR_MODE_KEY, STORAGE_COLOR_MODE_KEY, STORAGE_KEY } from './constants'
import type { ColorMode, ThemeStorage } from './index.type'

export const useTheme = () => {
  const colorMode = inject<Ref<ColorMode>>(COLOR_MODE_KEY)
  const resolvedColorMode = inject<ComputedRef<Readonly<Exclude<ColorMode, 'auto'>>>>(RESOLVED_COLOR_MODE_KEY)
  const storage = inject<ThemeStorage | null>(STORAGE_KEY)
  const storageKey = inject<string | null>(STORAGE_COLOR_MODE_KEY)

  const saveToStorage = (mode: ColorMode) => {
    if (!storage || !storageKey) return
    storage.setItem(storageKey, mode)
  }

  const toggleColorMode = () => {
    if (!colorMode || !resolvedColorMode) return

    if (resolvedColorMode.value === 'light') {
      colorMode.value = 'dark'
      saveToStorage('dark')
    } else {
      colorMode.value = 'light'
      saveToStorage('light')
    }
  }

  const setColorMode = (mode: ColorMode) => {
    if (!colorMode) return
    colorMode.value = mode
    saveToStorage(mode)
  }

  return { colorMode, resolvedColorMode, toggleColorMode, setColorMode }
}
