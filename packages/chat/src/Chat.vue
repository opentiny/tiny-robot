<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import Root from './Root.vue'
import Composer from './components/Composer.vue'
import Conversations from './components/Conversations.vue'
import Header from './components/Header.vue'
import Messages from './components/Messages.vue'
import ScrollToBottom from './components/ScrollToBottom.vue'
import type { ChatParts, ChatRuntime } from './types'

const props = withDefaults(
  defineProps<{
    runtime: ChatRuntime
    parts?: ChatParts
  }>(),
  {
    parts: () => ({}),
  },
)

const messagesRef = ref<InstanceType<typeof Messages> | null>(null)
const isEmpty = computed(() => props.runtime.messages.items.value.length === 0)
const messagesScrollTarget = computed(() => messagesRef.value?.scrollTarget ?? null)
</script>

<template>
  <Root :runtime="props.runtime" :parts="props.parts">
    <TrLayout v-bind="props.parts.layout">
      <template #left-aside="slotProps">
        <slot name="left-aside" v-bind="slotProps">
          <Conversations />
        </slot>
      </template>

      <template #header>
        <slot name="header">
          <Header />
        </slot>
      </template>

      <template #main>
        <div class="tr-chat__thread" :class="{ 'tr-chat__thread--empty': isEmpty }">
          <div class="tr-chat__main-inner">
            <slot name="main">
              <Messages ref="messagesRef" :is-empty="isEmpty" />
            </slot>
          </div>

          <div class="tr-chat__footer-inner">
            <ScrollToBottom :target="messagesScrollTarget" />
            <slot name="footer">
              <Composer />
            </slot>
          </div>

          <TrLayout.ProxyScrollbar :scroll-target="messagesScrollTarget" />
        </div>
      </template>
    </TrLayout>
  </Root>
</template>

<style lang="less" scoped>
.tr-chat__thread {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.tr-chat__thread--empty {
  justify-content: center;
}

.tr-chat__main-inner,
.tr-chat__footer-inner {
  width: 100%;
  max-width: var(--tr-chat-content-max-width, 760px);
  margin-inline: auto;
}

.tr-chat__footer-inner {
  position: relative;
}

.tr-chat__main-inner {
  min-height: 0;
}

.tr-chat__thread:not(.tr-chat__thread--empty) .tr-chat__main-inner {
  flex: 1;
}

.tr-chat__thread:not(.tr-chat__thread--empty) .tr-chat__footer-inner {
  flex-shrink: 0;
}
</style>
