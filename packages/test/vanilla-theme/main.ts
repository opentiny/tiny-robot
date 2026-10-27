import * as esm from '../../components/dist/vanilla/index.js'
import cssURL from '../../components/dist/vanilla/style.css?url'
import umdURL from '../../components/dist/vanilla/vanilla.umd.js?url'
import sharedThemeCSS from '../../components/src/styles/variables.css?inline'
import type { QuickAssistInstance, VanillaThemeConfig } from '../../components/src/vanilla'

declare global {
  interface Window {
    themeFixture: {
      configure(config: VanillaThemeConfig, root?: Document): void
      create(root?: Document): QuickAssistInstance
      instances: QuickAssistInstance[]
      events: string[]
      observers(): number
      sharedThemeCSS: string
      cssURL: string
    }
  }
}

const activeObservers = new Map<MutationObserver, MutationObserverInit | undefined>()
const NativeObserver = window.MutationObserver
window.MutationObserver = class extends NativeObserver {
  observe(target: Node, options?: MutationObserverInit) {
    super.observe(target, options)
    activeObservers.set(this, options)
  }
  disconnect() {
    super.disconnect()
    activeObservers.delete(this)
  }
}

async function main() {
  let runtime = esm
  if (new URLSearchParams(location.search).get('entry') === 'umd') {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = umdURL
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('UMD load failed'))
      document.head.append(script)
    })
    runtime = (window as unknown as { TinyRobotVanilla: typeof esm }).TinyRobotVanilla
  } else {
    await new Promise<void>((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = cssURL
      link.onload = () => resolve()
      link.onerror = () => reject(new Error('CSS load failed'))
      document.head.append(link)
    })
  }
  const events: string[] = []
  const instances: QuickAssistInstance[] = []
  window.themeFixture = {
    configure: runtime.configureVanillaTheme,
    create(root = document) {
      const instance = runtime.createQuickAssist({
        root,
        include: ['#scope'],
        adapter: { submit() {} },
        onEvent: (event) => events.push(event.type),
      })
      instances.push(instance)
      return instance
    },
    instances,
    events,
    observers: () => [...activeObservers.values()].filter((options) => options?.attributeFilter).length,
    sharedThemeCSS,
    cssURL,
  }
  window.themeFixture.create()
}
void main()
