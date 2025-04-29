<template>
  <tr-bubble-list :items="items" :roles="roles"></tr-bubble-list>
</template>

<script setup lang="ts">
// import { TrBubbleList, TrFeedback} from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig, TrFeedback } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const items: BubbleListProps['items'] = [
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
  {
    role: 'ai',
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。',
    slots: {
      default: ({ bubbleProps }) => {
        return h('div', { style: { color: 'green' } }, bubbleProps.content)
      },
    },
  },
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
  {
    role: 'ai',
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。',
  },
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
  {
    role: 'ai',
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。',
  },
]

const roles: Record<string, BubbleRoleConfig> = {
  ai: {
    placement: 'start',
    avatar: aiAvatar,
    maxWidth: '80%',
    slots: {
      default: ({ bubbleProps }) => {
        return h('div', { style: { color: 'red' } }, bubbleProps.content)
      },
      footer: ({ bubbleProps }) => {
        // 由于code-block插件问题，不能引入TrFeedback的值，这里使用as unknown as typeof TrFeedback来提供类型提示
        // 正常可以直接使用h(TrFeedback)
        return h('TrFeedback' as unknown as typeof TrFeedback, {
          actions: [
            { name: 'refresh', label: '刷新', icon: 'refresh' },
            { name: 'copy', label: '复制', icon: 'copy' },
          ],
          onAction(name) {
            console.log(name)
            console.log(bubbleProps.content)
          },
        })
      },
    },
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    maxWidth: '80%',
  },
}
</script>
