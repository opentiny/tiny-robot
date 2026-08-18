<script setup lang="ts">
import { IconArrowDown, IconClose } from '@opentiny/tiny-robot-svgs'
import type { ExtensionManagerTagOption } from '../index.type'

defineOptions({ name: 'ExtensionFilterControls' })

const props = defineProps<{
  tags: readonly ExtensionManagerTagOption[]
}>()

const selectedTag = defineModel<string>('selectedTag', { default: '' })
const searchValue = defineModel<string>('searchValue', { default: '' })
</script>

<template>
  <div class="extension-filter-controls" data-testid="extension-filter-controls">
    <div data-testid="filter-root" class="extension-filter-controls__fields">
      <div class="extension-filter-controls__select-wrapper">
        <select
          data-testid="filter-tag"
          class="extension-filter-controls__select"
          aria-label="标签"
          :disabled="props.tags.length === 0"
          v-model="selectedTag"
        >
          <option value="">全部标签</option>
          <option v-for="tag in props.tags" :key="tag.value" :value="tag.value">{{ tag.label }}</option>
        </select>
        <IconArrowDown class="extension-filter-controls__select-arrow" aria-hidden="true" />
      </div>
      <div class="extension-filter-controls__input-wrapper">
        <input
          data-testid="filter-search"
          class="extension-filter-controls__input"
          type="search"
          aria-label="搜索扩展"
          placeholder="请输入关键字搜索"
          v-model="searchValue"
        />
        <button
          v-if="searchValue"
          data-testid="filter-search-clear"
          class="extension-filter-controls__clear"
          type="button"
          aria-label="清空搜索"
          @click="searchValue = ''"
        >
          <IconClose class="extension-filter-controls__clear-icon" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.extension-filter-controls {
  container: extension-filter-controls / inline-size;
  padding: 16px 0;
}

.extension-filter-controls__select,
.extension-filter-controls__input {
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  border: 1px solid var(--tr-mcp-server-picker-field-border-color);
  border-radius: 8px;
  outline: none;
  background: var(--tr-container-bg-default);
  color: var(--tr-text-primary);
  font-size: 13px;
}

.extension-filter-controls__fields {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) minmax(0, 2fr);
  gap: 8px;
}

.extension-filter-controls__select-wrapper,
.extension-filter-controls__input-wrapper {
  position: relative;
  min-width: 0;
}

.extension-filter-controls__select,
.extension-filter-controls__input {
  min-width: 0;
  padding: 0 12px;
}

.extension-filter-controls__select {
  appearance: none;
  padding-right: 32px;
}

.extension-filter-controls__select-arrow {
  position: absolute;
  top: 50%;
  right: 10px;
  width: 16px;
  height: 16px;
  transform: translateY(-50%);
  color: var(--tr-text-secondary);
  pointer-events: none;
}

.extension-filter-controls__select:disabled + .extension-filter-controls__select-arrow {
  opacity: 0.5;
}

.extension-filter-controls__input {
  appearance: none;
  padding-right: 40px;
}

.extension-filter-controls__input::-webkit-search-cancel-button {
  appearance: none;
}

.extension-filter-controls__clear {
  position: absolute;
  top: 50%;
  right: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  transform: translateY(-50%);
  border: 0;
  border-radius: 6px;
  outline: none;
  background: transparent;
  color: var(--tr-text-secondary);
  cursor: pointer;
}

.extension-filter-controls__clear:hover {
  color: var(--tr-text-primary);
}

.extension-filter-controls__clear:focus-visible {
  outline: 2px solid var(--tr-mcp-server-picker-tabs-border-color-active);
  outline-offset: -2px;
}

.extension-filter-controls__clear-icon {
  width: 14px;
  height: 14px;
}

.extension-filter-controls__select:focus,
.extension-filter-controls__input:focus {
  border-color: var(--tr-mcp-server-picker-tabs-border-color-active);
}

@container extension-filter-controls (max-width: 480px) {
  .extension-filter-controls__fields {
    grid-template-columns: 1fr;
  }
}
</style>
