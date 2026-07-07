<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'

const props = defineProps<{
  centered: boolean
}>()

const scrollTargetRef = ref<HTMLElement | null>(null)

const sections = Array.from({ length: 12 }, (_, index) => index + 1)
</script>

<template>
  <TrLayout>
    <template #main>
      <div ref="scrollTargetRef" class="layout-main-scroll-div">
        <div class="layout-main-scroll-div__content" :class="{ 'is-centered': props.centered }">
          <section v-for="section in sections" :key="section" class="layout-main-scroll-div__item">
            <strong>Section {{ section }}</strong>
            <p>普通内容区也可以把滚动容器交给 Layout.ProxyScrollbar。</p>
          </section>
        </div>
      </div>
      <TrLayout.ProxyScrollbar :scroll-target="scrollTargetRef" />
    </template>
  </TrLayout>
</template>

<style scoped>
.layout-main-scroll-div {
  height: 100%;
  overflow: auto;
}

.layout-main-scroll-div__content {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.layout-main-scroll-div__content.is-centered {
  max-width: 550px;
  margin: 0 auto;
}

.layout-main-scroll-div__item {
  padding: 16px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 12px;
  background: var(--vp-c-bg, #ffffff);
}

.layout-main-scroll-div__item p {
  margin: 8px 0 0;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}
</style>
