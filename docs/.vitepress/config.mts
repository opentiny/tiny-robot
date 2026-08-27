import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin'
import { MarkdownBadgePlugin, SidebarBadgePlugin } from './plugins/badge'
import { themeConfig } from './themeConfig'

const devAlias = {
  '@opentiny/tiny-robot': fileURLToPath(new URL('../../packages/components/src', import.meta.url)),
  '@opentiny/tiny-robot-kit': fileURLToPath(new URL('../../packages/kit/src', import.meta.url)),
  '@opentiny/tiny-robot-style': fileURLToPath(
    new URL('../../packages/components/src/styles/root.css', import.meta.url),
  ),
}

const prodAlias = {
  '@opentiny/tiny-robot-style': '@opentiny/tiny-robot/dist/style.css',
}

const tinyVueAlias = fileURLToPath(new URL('./tiny-vue-runtime.ts', import.meta.url))

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'TinyRobot',
  description: 'TinyRobot',
  srcDir: 'src',
  outDir: 'dist',
  base: process.env.VITEPRESS_BASE || '/',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: `${process.env.VITEPRESS_BASE ? process.env.VITEPRESS_BASE.replace(/\/$/, '') : ''}/logo-mini.svg`,
      },
    ],
  ],
  vite: {
    plugins: [vueJsx(), SidebarBadgePlugin()],
    server: {
      open: true,
      proxy: process.env.VP_MODE === 'development' ? { '/playground': 'http://localhost:5184' } : undefined,
    },
    resolve: {
      alias: {
        '@opentiny/vue': tinyVueAlias,
        ...(process.env.VP_MODE === 'development' ? devAlias : prodAlias),
      },
    },
  },
  markdown: {
    config: (md) => {
      md.use(vitepressDemoPlugin, {
        playground: { show: true },
        codeTransformer: (code) => {
          return code.replace(/import\.meta\.env\.BASE_URL/g, `'${process.env.VITEPRESS_BASE || '/'}'`)
        },
      })
      // 添加 Markdown 内容中的版本标记支持
      md.use(MarkdownBadgePlugin)
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo-mini.svg',
    siteTitle: 'TinyRobot',
    ...themeConfig,
    search: {
      provider: 'local',
    },
  },
})
