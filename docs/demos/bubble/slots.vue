<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <label>加载中插槽</label>
    <tr-bubble :avatar="aiAvatar" :loading="true">
      <template #loading>
        <div style="display: flex; align-items: center">加载中。。。</div>
      </template>
    </tr-bubble>
    <hr />
    <label>默认 content 插槽 和 footer 插槽</label>
    <tr-bubble :avatar="aiAvatar" :actions="['refresh', 'copy']">
      <span style="color: orange"
        >TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。</span
      >
      <template #footer>
        <tr-feedback :operations="operations" :actions="actions" :sources="sources" />
      </template>
    </tr-bubble>
  </div>
</template>

<script setup lang="tsx">
import { FeedbackProps, TrBubble, TrFeedback } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const operations: FeedbackProps['operations'] = [
  {
    name: 'edit',
    label: '编辑',
    onClick: () => console.log('点击了编辑按钮'),
  },
  {
    name: 'delete',
    label: '删除',
  },
]

const actions: FeedbackProps['actions'] = [
  {
    name: 'copy',
    label: '复制',
    icon: 'copy',
  },
  {
    name: 'refresh',
    label: '刷新',
    icon: 'refresh',
  },
]

const sources: FeedbackProps['sources'] = [
  {
    label: '数据来源1',
    link: 'https://example.com/source1',
  },
  {
    label: '数据来源2',
    link: 'https://example.com/source2',
  },
]
</script>
