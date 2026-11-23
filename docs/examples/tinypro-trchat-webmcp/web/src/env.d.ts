/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare module '*.svg' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_MOCK_SERVER_HOST: string
    readonly VITE_LOWCODE_DESIGNER_ENABLED: string
    readonly VITE_LOWCODE_DESIGNER_URL: string
    readonly VITE_TINY_EDITOR_ENABLED: string
    readonly VITE_MOCK_LOGIN_ENABLED: string
    readonly VITE_CONTEXT: string
    readonly VITE_BASE_API: string
    readonly VITE_SERVER_HOST: string
    readonly VITE_MOCK_HOST: string
    readonly VITE_USE_MOCK: string
    readonly VITE_MOCK_IGNORE: string
    readonly VITE_COLLAB_WEBSOCKET_URL: string | undefined
  }
  declare const BUILD_TOOLS: string
  declare interface NodeRequire {
    context: any
  }
}

declare module '@opentiny/vue-locale';
declare module '@opentiny/vue';
declare module '@opentiny/vue-icon';
declare module '@opentiny/vue-theme/theme-tool.js';
declare module '@opentiny/vue-theme/theme';
declare module 'query-string';
