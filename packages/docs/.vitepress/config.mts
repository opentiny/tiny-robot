import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'TinyRobot',
  description: 'TinyRobot',
  srcDir: 'src',
  outDir: 'dist',
  base: '/cdocs/tiny-robot/',
  vite: {
    server: { open: true },
  },
  markdown: {
    config: (md) => {
      md.use(vitepressDemoPlugin)
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    siteTitle: 'TinyRobot',
    nav: [
      { text: '指南', link: '/guide/installation', activeMatch: '/guide/' },
      { text: '组件', link: '/components/bubble', activeMatch: '/components/' },
      { text: '工具', link: '/tools/ai-client', activeMatch: '/tools/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          base: '/guide/',
          items: [{ text: '安装', link: 'installation' }],
        },
      ],
      '/components/': [
        {
          text: '组件',
          base: '/components/',
          items: [
            { text: 'Bubble 气泡', link: 'bubble' },
            { text: 'Sender 消息输入框', link: 'sender' },
            { text: 'Prompts', link: 'prompts' },
            { text: 'Welcome', link: 'welcome' },
            { text: '示例', link: 'example' },
          ],
        },
      ],
      '/tools/': [
        {
          text: '工具',
          base: '/tools/',
          items: [
            { text: 'AI模型交互工具类', link: 'ai-client' },
            { text: '消息与数据管理', link: 'message' },
          ],
        },
      ],
    },
    search: {
      provider: 'local',
    },
  },
})
