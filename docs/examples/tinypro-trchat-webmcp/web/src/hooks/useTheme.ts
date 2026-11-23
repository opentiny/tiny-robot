import type TinyThemeTool from '@opentiny/vue-theme/theme-tool'
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch } from 'vue'
import * as Themes from '@/components/theme/type'
import { useAppStore } from '@/store'
import useThemes from './themes'

export function useTheme(themeTool: TinyThemeTool) {
  const appStore = useAppStore()
  const { themelist } = storeToRefs(appStore)
  const themeName = computed(() =>
    themelist.value?.length
      ? `${themelist.value[0].toUpperCase()}${themelist.value.slice(1).toLowerCase()}Theme`
      : 'DefaultTheme',
  )

  const { isDark } = useThemes()

  watch(
    themeName,
    () => {
      const nextTheme = themeName.value === 'DefaultTheme'
        ? Themes.DefaultTheme
        : (Themes as any)[themeName.value]
      if (nextTheme) {
        themeTool.changeTheme(nextTheme)
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    watch(
      isDark,
      () => {
        if (isDark.value) {
          document.body.style.filter = 'invert(0.9) hue-rotate(180deg)'
        }
        else {
          document.body.style.filter = ''
        }
      },
      { immediate: true },
    )
  })

  const toggleTheme = (name: string) => {
    appStore.$patch({
      themelist: name,
    })
  }

  return { toggleTheme }
}
