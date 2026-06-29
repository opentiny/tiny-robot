import type { App } from 'vue'
import LayoutComp from './Layout.vue'
import LayoutAsideToggleComp from './LayoutAsideToggle.vue'
import LayoutProxyScrollbarComp from './LayoutProxyScrollbar.vue'

export * from './index.type'

LayoutProxyScrollbarComp.name = 'TrLayoutProxyScrollbar'

const layoutProxyScrollbarInstall = function <T>(app: App<T>) {
  app.component(LayoutProxyScrollbarComp.name!, LayoutProxyScrollbarComp)
}

const LayoutProxyScrollbar = LayoutProxyScrollbarComp as typeof LayoutProxyScrollbarComp & {
  install: typeof layoutProxyScrollbarInstall
}

LayoutProxyScrollbar.install = layoutProxyScrollbarInstall

LayoutAsideToggleComp.name = 'TrLayoutAsideToggle'

const layoutAsideToggleInstall = function <T>(app: App<T>) {
  app.component(LayoutAsideToggleComp.name!, LayoutAsideToggleComp)
}

const LayoutAsideToggle = LayoutAsideToggleComp as typeof LayoutAsideToggleComp & {
  install: typeof layoutAsideToggleInstall
}

LayoutAsideToggle.install = layoutAsideToggleInstall

LayoutComp.name = 'TrLayout'

const layoutInstall = function <T>(app: App<T>) {
  app.component(LayoutComp.name!, LayoutComp)
  app.component(LayoutProxyScrollbar.name!, LayoutProxyScrollbar)
  app.component(LayoutAsideToggle.name!, LayoutAsideToggle)
}

type LayoutCompound = typeof LayoutComp & {
  install: typeof layoutInstall
  ProxyScrollbar: typeof LayoutProxyScrollbar
  AsideToggle: typeof LayoutAsideToggle
}

const Layout = LayoutComp as LayoutCompound

Layout.install = layoutInstall
Layout.ProxyScrollbar = LayoutProxyScrollbar
Layout.AsideToggle = LayoutAsideToggle

export { Layout, LayoutProxyScrollbar, LayoutAsideToggle }

export default Layout
