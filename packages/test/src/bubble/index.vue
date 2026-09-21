<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useAutoScroll } from '@opentiny/tiny-robot'

const scrollTarget = ref<HTMLElement | null>(null)
const contentTarget = ref<HTMLElement | null>(null)
const enabled = ref(true)
const blockHeight = ref(520)

useAutoScroll(scrollTarget, undefined, {
  contentTarget,
  enabled,
  bottomThreshold: 20,
})

const legacyScrollTarget = ref<HTMLElement | null>(null)
const legacySignal = ref(0)
const legacyBlockHeight = ref(520)
useAutoScroll(legacyScrollTarget, legacySignal)

const noMountScrollTarget = ref<HTMLElement | null>(null)
const noMountContentTarget = ref<HTMLElement | null>(null)
useAutoScroll(noMountScrollTarget, undefined, {
  contentTarget: noMountContentTarget,
  scrollOnMount: false,
})

async function growObservedContent() {
  blockHeight.value += 320
  await nextTick()
}

async function growLegacyContent() {
  legacyBlockHeight.value += 320
  legacySignal.value += 1
  await nextTick()
}
</script>

<template>
  <section>
    <h2>Bubble 自动滚动测试</h2>
    <button data-testid="grow-observed" @click="growObservedContent">增高观察内容</button>
    <button data-testid="toggle-enabled" @click="enabled = !enabled">切换自动滚动</button>
    <div ref="scrollTarget" data-testid="observed-scroll" class="scroll-host">
      <div ref="contentTarget" data-testid="observed-content" :style="{ height: `${blockHeight}px` }" />
    </div>
    <button data-testid="grow-legacy" @click="growLegacyContent">增高旧接口内容</button>
    <div ref="legacyScrollTarget" data-testid="legacy-scroll" class="scroll-host">
      <div :style="{ height: `${legacyBlockHeight}px` }" />
    </div>
    <div ref="noMountScrollTarget" data-testid="no-mount-scroll" class="scroll-host">
      <div ref="noMountContentTarget" :style="{ height: `${blockHeight}px` }" />
    </div>
  </section>
</template>

<style scoped>
.scroll-host {
  width: 320px;
  height: 220px;
  overflow-y: auto;
}
</style>
