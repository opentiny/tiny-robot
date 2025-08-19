import pkg from '@opentiny/tiny-robot/package.json' assert { type: 'json' }
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin'

const { version } = pkg

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

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'TinyRobot',
  description: 'TinyRobot',
  srcDir: 'src',
  outDir: 'dist',
  base: '/cdocs/tiny-robot/',
  vite: {
    plugins: [vueJsx()],
    server: { open: true },
    resolve: {
      alias: {
        ...(process.env.VP_MODE === 'development' ? devAlias : prodAlias),
      },
    },
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
      { text: '演示', link: '/examples/assistant', activeMatch: '/examples/' },
      { text: version, link: '/releases/update-log', activeMatch: '/releases/' },
    ],
    sidebar: {
      '/components/': [
        {
          text: '组件',
          base: '/components/',
          items: [
            { text: 'Container 容器', link: 'container' },
            { text: 'Bubble 气泡', link: 'bubble' },
            { text: 'Sender 消息输入框', link: 'sender' },
            { text: 'Prompts 提示集', link: 'prompts' },
            { text: 'Welcome 欢迎', link: 'welcome' },
            { text: 'Feedback 气泡反馈', link: 'feedback' },
            { text: 'History 历史', link: 'history' },
            { text: 'DropdownMenu 下拉菜单', link: 'dropdown-menu' },
            { text: 'SuggestionPopover 建议弹出框', link: 'suggestion-popover' },
            { text: 'SuggestionPills 建议按钮组', link: 'suggestion-pills' },
            { text: 'DragOverlay 拖拽浮层', link: 'drag-overlay' },
            { text: 'Attachments 附件卡片', link: 'attachments' },
            { text: 'McpServerPicker 插件选择器', link: 'mcp-server-picker' },
            { text: 'Theme 主题', link: 'theme' },
          ],
        },
      ],
      '/tools/': [
        {
          text: '工具',
          base: '/tools/',
          items: [
            { text: 'AI模型交互工具类', link: 'ai-client' },
            { text: '消息数据管理', link: 'message' },
            { text: '会话数据管理', link: 'conversation' },
          ],
        },
      ],
    },
    search: {
      provider: 'local',
    },
  },
})
