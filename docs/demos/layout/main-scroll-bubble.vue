<script setup lang="ts">
import { ref } from 'vue'
import { BubbleList, TrLayout } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'

const props = defineProps<{
  centered: boolean
}>()

const scrollTargetRef = ref<HTMLElement | null>(null)

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
      <div ref="scrollTargetRef" class="layout-main-scroll-bubble-host">
        <div class="layout-main-scroll-bubble-host__content" :class="{ 'is-centered': props.centered }">
          <BubbleList class="layout-main-scroll-bubble" :messages="messages" :role-configs="roles" />
        </div>
      </div>
      <TrLayout.ProxyScrollbar :scroll-target="scrollTargetRef" />
    </template>
  </TrLayout>
</template>

<style scoped>
.layout-main-scroll-bubble-host {
  height: 100%;
  overflow: auto;
}

.layout-main-scroll-bubble-host__content.is-centered {
  max-width: 450px;
  margin: 0 auto;
}

.layout-main-scroll-bubble {
  --tr-bubble-list-padding: 16px;
  overflow: visible;
}

:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
