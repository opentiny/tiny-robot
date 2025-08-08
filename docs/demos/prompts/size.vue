<template>
  <tr-prompts :items="items" vertical></tr-prompts>
</template>

<script setup lang="ts">
import { PromptProps, TrPrompts } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const iconStyle: CSSProperties = {
  fontSize: '18px',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const items: PromptProps[] = [
  {
    label: '日常助理场景(small)',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: iconStyle }, '🧠'),
    size: 'small',
  },
  {
    label: '日常助理场景(medium)',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: iconStyle }, '🧠'),
    size: 'medium',
  },
  {
    label: '日常助理场景(large)',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: iconStyle }, '🧠'),
    size: 'large',
  },
]
</script>
