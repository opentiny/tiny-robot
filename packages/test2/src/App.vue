<script setup lang="ts">
import { BubbleList, Bubble, type BubbleMessage, type BubbleRoleConfig } from '@opentiny/tiny-robot'
import Avatar from './components/Avatar.vue'

const messages: BubbleMessage[] = [
  {
    role: 'user',
    content: [
      { type: 'text', text: 'Hello' },
      { type: 'image_url', image_url: 'https://picsum.photos/400' },
    ],
  },
  {
    role: 'assistant',
    content: '我来帮您同时计算这两个算式。',
    tool_calls: [
      {
        id: 'call_00_wy0r2VgGNvzUp1tIfCfSnGPO',
        type: 'function',
        function: { name: 'add', arguments: '{"a": 4, "b": 4}' },
      },
      {
        id: 'call_01_ZaQqGi3jCXr1iJ308Yu1hJkj',
        type: 'function',
        function: { name: 'multiply', arguments: '{"a": 4, "b": 4}' },
      },
    ],
  },
  {
    role: 'tool',
    tool_call_id: 'call_00_wy0r2VgGNvzUp1tIfCfSnGPO',
    content: '{"type":"text","text":"8"}',
  },
  {
    role: 'tool',
    tool_call_id: 'call_01_ZaQqGi3jCXr1iJ308Yu1hJkj',
    content: '{"type":"text","text":"16"}',
  },
  {
    role: 'assistant',
    content: '计算结果如下：\n\n1. 4 + 4 = 8\n2. 4 × 4 = 16\n\n两个算式的结果分别是 8 和 16。',
  },
]

const roleConfigs: Record<string, BubbleRoleConfig> = {
  user: {
    avatar: Avatar,
    placement: 'end',
    shape: 'corner',
  },
  assistant: {
    avatar: Avatar,
    placement: 'start',
    shape: 'rounded',
  },
}
</script>

<template>
  <Bubble role="user" content="Hello, world!" placement="end" :avatar="Avatar" />
  <hr />
  <div style="display: flex; flex-direction: column; gap: 16px">
    <Bubble
      :content="[
        { type: 'text', text: '图片描述的是什么' },
        { type: 'image_url', image_url: 'https://picsum.photos/400' },
      ]"
      :avatar="Avatar"
    />
  </div>
  <hr />
  <div style="display: flex; flex-direction: column; gap: 16px">
    <Bubble
      :content="[
        { type: 'text', text: '图片描述的是什么' },
        { type: 'image_url', image_url: 'https://picsum.photos/400' },
      ]"
      :avatar="Avatar"
      polymorphic-content-mode="merged"
    />
    <Bubble
      :content="[
        { type: 'image_url', image_url: 'https://picsum.photos/400' },
        { type: 'text', text: '图片描述的是什么' },
      ]"
      :avatar="Avatar"
      placement="end"
      polymorphic-content-mode="merged"
    />
  </div>
  <hr />
  <BubbleList :messages="messages" :role-configs="roleConfigs"></BubbleList>
</template>

<style>
:root {
  --tr-bubble-box-bg: #f0f0f0;
  --tr-bubble-gap: 16px;
}
</style>

<style scoped>
.bubbles {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 800px;
}
</style>
