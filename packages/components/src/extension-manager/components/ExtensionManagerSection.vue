<script setup lang="ts">
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import { type VNode } from 'vue'
import ExtensionCardGrid from './ExtensionCardGrid.vue'
import type { ExtensionCardGridActionEvent, ExtensionCardGridNameClickEvent } from '../index.type'
import type { ExtensionManagerSectionState } from './ExtensionManagerSection.types'

defineOptions({ name: 'ExtensionManagerSection' })

const props = defineProps<{
  tabId: string
  section: ExtensionManagerSectionState
  expanded: boolean
}>()

const slots = defineSlots<{
  item?: (props: { item: ExtensionManagerSectionState['items'][number]; index: number }) => VNode[]
  empty?: () => VNode[]
}>()

const emit = defineEmits<{
  (e: 'section-toggle', expanded: boolean): void
  (e: 'action', event: ExtensionCardGridActionEvent): void
  (e: 'name-click', event: ExtensionCardGridNameClickEvent): void
}>()

const toggle = () => emit('section-toggle', !props.expanded)

const handleAction = (event: ExtensionCardGridActionEvent) => emit('action', event)

const handleNameClick = (event: ExtensionCardGridNameClickEvent) => emit('name-click', event)
</script>

<template>
  <section class="extension-manager-section" :data-tab-id="props.tabId" :data-section-key="props.section.key">
    <div class="extension-manager-section__header">
      <button class="extension-manager-section__title" type="button" :aria-expanded="props.expanded" @click="toggle">
        <IconArrowDown class="extension-manager-section__arrow" :class="{ 'is-expanded': props.expanded }" />
        <span>{{ props.section.title }}</span>
      </button>
    </div>

    <div v-if="props.expanded" class="extension-manager-section__body">
      <ExtensionCardGrid
        v-if="props.section.items.length > 0"
        :items="props.section.items"
        :primary-actions-limit="1"
        :name-clickable="true"
        @action="handleAction"
        @name-click="handleNameClick"
      >
        <template v-if="slots.item" #item="{ item, index }">
          <slot name="item" :item="item" :index="index" />
        </template>
      </ExtensionCardGrid>

      <div v-else class="extension-manager-section__state">
        <slot name="empty">暂无内容</slot>
      </div>
    </div>
  </section>
</template>

<style lang="less" scoped>
.extension-manager-section {
  min-width: 0;
}

.extension-manager-section__header {
  min-height: 24px;
}

.extension-manager-section__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--tr-text-primary);
  font-size: 14px;
  line-height: 22px;
  text-align: left;
  cursor: pointer;
}

.extension-manager-section__arrow {
  display: inline-block;
  color: var(--tr-text-tertiary);
  font-size: 16px;
  transform: rotate(-90deg);
  transition: transform 0.2s ease;
}

.extension-manager-section__arrow.is-expanded {
  transform: rotate(0);
}

.extension-manager-section__body {
  min-width: 0;
}

.extension-manager-section__state {
  padding: 28px 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
  text-align: center;
}
</style>
