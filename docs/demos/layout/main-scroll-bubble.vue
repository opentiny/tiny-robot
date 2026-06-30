<script setup lang="ts">
import { ref } from 'vue'
import { BubbleList, TrLayout } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig, LayoutScrollTarget } from '@opentiny/tiny-robot'

const props = defineProps<{
  centered: boolean
}>()

const scrollTargetRef = ref<LayoutScrollTarget>(null)

const roles: Record<string, BubbleRoleConfig> = {
  user: { placement: 'end' },
  assistant: { placement: 'start' },
}

const messages: BubbleListProps['messages'] = Array.from({ length: 12 }, (_, index) => [
  {
    role: 'user',
    content: `第 ${index + 1} 轮：帮我整理一下当前布局的滚动区。`,
  },
  {
    role: 'assistant',
    content: '可以。内容区可以居中显示，滚动条仍然贴着 Layout 主区右侧。',
  },
]).flat()
</script>

<template>
  <TrLayout>
    <template #main>
      <BubbleList
        ref="scrollTargetRef"
        class="layout-main-scroll-bubble"
        :class="{ 'is-centered': props.centered }"
        :messages="messages"
        :role-configs="roles"
      />
      <TrLayout.ProxyScrollbar :scroll-target="scrollTargetRef" />
    </template>
  </TrLayout>
</template>

<style scoped>
.layout-main-scroll-bubble {
  --tr-bubble-list-padding: 16px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
}

.layout-main-scroll-bubble.is-centered {
  max-width: 450px;
  margin: 0 auto;
}

:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
