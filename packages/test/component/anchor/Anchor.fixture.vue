<script setup lang="ts">
import { computed, ref } from 'vue'
import Anchor from '../../../components/src/anchor/index.vue'
import type { AnchorPlacement } from '../../../components/src/anchor/index.type'

const props = withDefaults(
  defineProps<{
    count?: number
    height?: number
    placement?: AnchorPlacement
    manual?: boolean
    search?: boolean
    activeIndex?: number
  }>(),
  { count: 22, height: 300, placement: 'right' },
)
const container = ref<HTMLElement | null>(null)
const active = ref('item-0')
const expanded = ref(false)
const selected = ref('')
const items = computed(() =>
  Array.from({ length: props.count }, (_, index) => ({
    id: `item-${index}`,
    label: `Question ${index + 1}: 发布检查内容、验证记录与回退方案`,
  })),
)
</script>

<template>
  <main>
    <button data-testid="toggle" @click="expanded = !expanded">Toggle</button>
    <button data-testid="activate-last" @click="active = `item-${count - 1}`">Activate last</button>
    <output data-testid="selected">{{ selected }}</output>
    <div data-testid="frame" class="anchor-frame" :style="{ height: `${height}px` }">
      <div ref="container" data-testid="messages" class="anchor-messages">
        <section v-for="item in items" :id="item.id" :key="item.id" class="target">{{ item.label }}</section>
      </div>
      <Anchor
        :items="items"
        :scroll-container="container"
        :active-id="activeIndex === undefined ? active : `item-${activeIndex}`"
        :placement="placement"
        :expand-trigger="manual ? 'manual' : 'hover'"
        :expanded="expanded"
        :search-options="search ? {} : undefined"
        @select="selected = $event.id"
      />
    </div>
  </main>
</template>

<style scoped>
.anchor-frame {
  position: relative;
  width: 600px;
  overflow: hidden;
}
.anchor-messages {
  height: 100%;
  overflow: auto;
}
.target {
  height: 180px;
}
</style>
