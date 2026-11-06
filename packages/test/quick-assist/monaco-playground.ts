/// <reference types="vite/client" />
import { createApp, defineComponent, h, ref } from 'vue'
import { File, Repl, useStore } from '../../playground/node_modules/@vue/repl/dist/vue-repl.js'
import CodeMirror from '../../playground/node_modules/@vue/repl/dist/codemirror-editor.js'
import '../../playground/node_modules/@vue/repl/dist/vue-repl.css'
import { generateImportMap } from '../../playground/src/utils/import-map'
import demo from '../../../docs/demos/quick-assist/monaco.vue?raw'
import vueUrl from 'vue/dist/vue.runtime.esm-browser.prod.js?url'
import vanillaUrl from '../../components/dist/vanilla/index.js?url'
import vanillaStyleUrl from '../../components/dist/vanilla/style.css?url'

createApp(
  defineComponent({
    setup() {
      const map = generateImportMap({ tinyRobotVersion: 'latest' })
      // Use the current local build; keep Monaco's actual CDN module graph intact.
      map.imports!.vue = new URL(vueUrl, location.href).href
      map.imports!['@opentiny/tiny-robot/vanilla'] = new URL(vanillaUrl, location.href).href
      const style = `const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = ${JSON.stringify(new URL(vanillaStyleUrl, location.href).href)}; document.head.appendChild(link);`
      map.imports!['@opentiny/tiny-robot/vanilla/style.css'] = `data:text/javascript,${encodeURIComponent(style)}`
      const store = useStore({
        files: ref({
          'App.vue': new File('App.vue', demo),
        }),
        mainFile: ref('App.vue'),
      })
      store.setImportMap(map)
      return () => h(Repl, { store, editor: CodeMirror, style: 'height: 100vh' })
    },
  }),
).mount('#app')
