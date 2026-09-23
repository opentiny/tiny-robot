<script setup lang="ts">
import { ref } from 'vue'
import { useAutoScroll } from '../../../components/src/shared/composables/useAutoScroll'

const scrollRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const enabled = ref(true)
const blockHeight = ref(520)

const { scrollToBottom } = useAutoScroll({
  scrollRef,
  contentRef,
  enabled,
  bottomThreshold: 20,
})

const legacyScrollRef = Object.assign(ref<HTMLElement | null>(null), {
  scrollRef: 'legacy target marker',
})
const legacySignal = ref(0)
const legacyBlockHeight = ref(520)

useAutoScroll(legacyScrollRef, legacySignal)

const noMountScrollRef = ref<HTMLElement | null>(null)
const noMountContentRef = ref<HTMLElement | null>(null)

useAutoScroll({
  scrollRef: noMountScrollRef,
  contentRef: noMountContentRef,
  scrollOnMount: false,
})

const growObservedContent = () => {
  blockHeight.value += 320
}

const growLegacyContent = () => {
  legacyBlockHeight.value += 320
  legacySignal.value += 1
}
</script>

<template>
  <section>
    <button type="button" @click="growObservedContent">Grow observed content</button>
    <button type="button" @click="enabled = !enabled">Toggle auto scroll</button>
    <button type="button" @click="scrollToBottom('smooth')">Smooth scroll to bottom</button>
    <div ref="scrollRef" data-testid="observed-scroll" class="scroll-host">
      <div ref="contentRef" :style="{ height: `${blockHeight}px` }" />
    </div>

    <button type="button" @click="growLegacyContent">Grow legacy content</button>
    <div ref="legacyScrollRef" data-testid="legacy-scroll" class="scroll-host">
      <div :style="{ height: `${legacyBlockHeight}px` }" />
    </div>

    <div ref="noMountScrollRef" data-testid="no-mount-scroll" class="scroll-host">
      <div ref="noMountContentRef" :style="{ height: `${blockHeight}px` }" />
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
