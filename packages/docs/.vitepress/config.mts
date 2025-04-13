import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'TinyRobot',
  description: 'TinyRobot',
  srcDir: 'src',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    siteTitle: 'TinyRobot',
    nav: [
      { text: '指南', link: '/guide/installation', activeMatch: '/guide/' },
      { text: '组件', link: '/components/bubble', activeMatch: '/components/' },
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
          ],
        },
      ],
    },
  },
})
