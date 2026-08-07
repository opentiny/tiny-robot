<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import ConfiguredCase from './ConfiguredCase.vue'
import DataCase from './DataCase.vue'
import DefaultCase from './DefaultCase.vue'

const cases = [
  { id: 'default', label: 'Default', component: DefaultCase },
  { id: 'configured', label: 'Configured', component: ConfiguredCase },
  { id: 'data', label: 'Data', component: DataCase },
] as const
const activeCaseId = shallowRef<(typeof cases)[number]['id']>('default')
const activeCase = computed(() => cases.find((item) => item.id === activeCaseId.value) ?? cases[0])
</script>

<template>
  <div class="chat-ui-cases">
    <div class="chat-ui-cases__tabs" role="tablist" aria-label="ChatUI cases">
      <button
        v-for="item in cases"
        :key="item.id"
        class="chat-ui-cases__tab"
        :class="{ 'chat-ui-cases__tab--active': item.id === activeCaseId }"
        type="button"
        role="tab"
        :aria-selected="item.id === activeCaseId"
        @click="activeCaseId = item.id"
      >
        {{ item.label }}
      </button>
    </div>

    <component :is="activeCase.component" />
  </div>
</template>

<style scoped>
.chat-ui-cases {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}

.chat-ui-cases__tabs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--tr-border-color-disabled);
  background: var(--tr-container-bg-default);
}

.chat-ui-cases__tab {
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--tr-text-secondary);
  font: inherit;
  cursor: pointer;
}

.chat-ui-cases__tab:hover,
.chat-ui-cases__tab--active {
  background: var(--tr-container-bg-hover);
  color: var(--tr-text-primary);
}
</style>
