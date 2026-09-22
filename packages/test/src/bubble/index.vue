<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { TrBubbleList, useAutoScroll } from '@opentiny/tiny-robot'
import type { BubbleListProps } from '@opentiny/tiny-robot'

const scrollTarget = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const enabled = ref(true)
const blockHeight = ref(520)

useAutoScroll({
  scrollRef: scrollTarget,
  contentRef,
  enabled,
  bottomThreshold: 20,
})

const legacyScrollTarget = Object.assign(ref<HTMLElement | null>(null), {
  scrollRef: 'legacy target marker',
})
const legacySignal = ref(0)
const legacyBlockHeight = ref(520)
useAutoScroll(legacyScrollTarget, legacySignal)

const noMountScrollTarget = ref<HTMLElement | null>(null)
const noMountContentTarget = ref<HTMLElement | null>(null)
useAutoScroll({
  scrollRef: noMountScrollTarget,
  contentRef: noMountContentTarget,
  scrollOnMount: false,
})

const bubbleListRef = ref<InstanceType<typeof TrBubbleList> | null>(null)
const bubbleAutoScroll = ref(true)
const lateBlockHeight = ref(16)
const messages: BubbleListProps['messages'] = Array.from({ length: 8 }, (_, index) => ({
  role: index % 2 === 0 ? 'user' : 'assistant',
  content: `第 ${index + 1} 条用于撑高列表的消息：${'rendered content '.repeat(8)}`,
}))

async function growObservedContent() {
  blockHeight.value += 320
  await nextTick()
}

async function growLegacyContent() {
  legacyBlockHeight.value += 320
  legacySignal.value += 1
  await nextTick()
}

async function growBubbleContent() {
  lateBlockHeight.value += 320
  await nextTick()
}
</script>

<template>
  <section>
    <h2>Bubble 自动滚动测试</h2>
    <button data-testid="grow-observed" @click="growObservedContent">增高观察内容</button>
    <button data-testid="toggle-enabled" @click="enabled = !enabled">切换自动滚动</button>
    <div ref="scrollTarget" data-testid="observed-scroll" class="scroll-host">
      <div ref="contentRef" data-testid="observed-content" :style="{ height: `${blockHeight}px` }" />
    </div>
    <button data-testid="grow-legacy" @click="growLegacyContent">增高旧接口内容</button>
    <div ref="legacyScrollTarget" data-testid="legacy-scroll" class="scroll-host">
      <div :style="{ height: `${legacyBlockHeight}px` }" />
    </div>
    <div ref="noMountScrollTarget" data-testid="no-mount-scroll" class="scroll-host">
      <div ref="noMountContentTarget" :style="{ height: `${blockHeight}px` }" />
    </div>
    <button data-testid="grow-bubble-content" @click="growBubbleContent">增高 BubbleList 内容</button>
    <button data-testid="toggle-bubble-auto-scroll" @click="bubbleAutoScroll = !bubbleAutoScroll">
      切换 BubbleList 自动滚动
    </button>
    <TrBubbleList
      ref="bubbleListRef"
      data-testid="bubble-list"
      :messages="messages"
      :auto-scroll="bubbleAutoScroll"
      style="width: 320px; max-height: 220px; padding: 12px"
    >
      <template #after="{ messageIndexes }">
        <div
          v-if="messageIndexes.at(-1) === messages.length - 1"
          data-testid="late-rendered-block"
          :style="{ height: `${lateBlockHeight}px` }"
        />
      </template>
    </TrBubbleList>
  </section>
</template>

<style scoped>
.scroll-host {
  width: 320px;
  height: 220px;
  overflow-y: auto;
}
</style>
