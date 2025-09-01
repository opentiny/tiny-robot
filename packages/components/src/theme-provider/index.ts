import { App } from 'vue'
import ThemeProvider from './index.vue'
import { useTheme } from './useTheme'

ThemeProvider.name = 'TrThemeProvider'

const install = function <T>(app: App<T>) {
  app.component(ThemeProvider.name!, ThemeProvider)
}

ThemeProvider.install = install

export default ThemeProvider as typeof ThemeProvider & { install: typeof install }
export { useTheme }
