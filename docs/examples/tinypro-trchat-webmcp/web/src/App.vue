<script lang="ts" setup>
import { TinyConfigProvider } from '@opentiny/vue'
import TinyThemeTool from '@opentiny/vue-theme/theme-tool'
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GlobalSetting from '@/components/global-setting/index.vue'
import { tinyProOperatorSkillText } from '@/skills'
import { useTheme } from './hooks/useTheme'
import { waitForPageTools } from './tiny-robot-chat/webmcp-tools'

const theme = new TinyThemeTool()
useTheme(theme)
const router = useRouter()
const design = {
  name: 'x-design', // 设计规范名称
  version: '1.0.0', // 设计规范版本号
  components: {
    Button: {
      props: {
        resetTime: 0,
        round: true,
      },
    },
  },
}
const toolAbortController = new AbortController()

onMounted(() => {
  document.modelContext.registerTool({
    name: 'navigate_url',
    title: '导航到指定URL',
    description: '当需要的工具在当前页面不可用时，使用此工具跳转到特定页面。例如：要跳转到 "/vue-pro/order/allOrder"，要创建价保时跳转到 "/vue-pro/price-protection/allPriceProtection"。',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL' },
      },
      required: ['url'],
    },
    execute: async ({ url }) => {
      const target = router.resolve(url)
      await router.push(url)
      const route = router.currentRoute.value
      if (route.name === 'notFound') {
        return { content: [{ type: 'text', text: JSON.stringify({ status: 'route_not_found', url }) }] }
      }
      if (route.fullPath !== target.fullPath) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ status: 'redirected', requested: target.fullPath, actual: route.fullPath }) }],
        }
      }
      const tools = await waitForPageTools(document.modelContext, route.path)
      return {
        content: [{ type: 'text', text: JSON.stringify({ status: 'ready', route: route.fullPath, tools }) }],
      }
    },
  }, { signal: toolAbortController.signal })

  document.modelContext.registerTool({
    name: 'system-overview',
    title: '系统概览',
    description: '整体介绍网站的模块、路由、页面工具、使用规范等等内容',
    execute: async () => {
      return { content: [{ type: 'text', text: tinyProOperatorSkillText }] }
    },
  }, { signal: toolAbortController.signal })
})

onUnmounted(() => toolAbortController.abort())
</script>

<template>
  <div>
    <TinyConfigProvider :design="design">
      <router-view />
    </TinyConfigProvider>

    <GlobalSetting />
  </div>
</template>

<style lang="less" scoped>
  @import '@/assets/style/menu.less'; /* 引入公共样式 */
</style>
