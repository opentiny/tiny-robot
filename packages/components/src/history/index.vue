<script lang="ts" setup>
import { IconClose, IconDelete, IconEditPen, IconSearch } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinyInput } from '@opentiny/vue'
import { computed, ref } from 'vue'
import type { HistoryProps } from './index.type'

const props = defineProps<HistoryProps>()

const activeTab = defineModel<HistoryProps['activeTab']>('activeTab')

const computedActiveTab = computed(() => {
  return activeTab.value || props.tabs[0].value
})

const searchQuery = ref('')
</script>

<template>
  <div class="tr-history">
    <div class="tr-history__tabs">
      <div
        v-for="tab in props.tabs"
        :key="tab.value"
        :class="['tr-history__tab', { active: computedActiveTab === tab.value }]"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </div>
    </div>
    <div class="tr-history__search">
      <tiny-input v-model="searchQuery" placeholder="搜索对话名称" :prefix-icon="IconSearch" />
    </div>
    <div class="tr-history__content">
      <div v-for="group in props.data[computedActiveTab]" :key="group.date" class="tr-history__group">
        <div class="tr-history__date">
          <span>{{ group.date }}</span>
        </div>
        <div
          v-for="item in group.items"
          :key="item.title"
          :class="['tr-history__item', { selected: props.selected === item.id }]"
        >
          <span class="tr-history__item-title">{{ item.title }}</span>
          <div class="tr-history__item-actions">
            <tiny-button :icon="IconEditPen" type="text" size="mini" />
            <tiny-button :icon="IconDelete" type="text" size="mini" />
          </div>
        </div>
      </div>
    </div>
    <div class="tr-history__close">
      <tiny-button :icon="IconClose" type="text" size="mini" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-history {
  display: flex;
  gap: 16px;
  flex-direction: column;
  background: #fff;
  border-radius: 24px;
  padding: 0 20px;
  position: relative;
  color: rgb(25, 25, 25);

  .tr-history__tabs {
    flex-shrink: 0;
    display: flex;
    padding-top: 24px;
    gap: 32px;
    font-size: 16px;
    line-height: 1.5;
    border-bottom: 1px solid rgb(240, 240, 240);

    .tr-history__tab {
      cursor: pointer;
      padding-bottom: 8px;

      &.active {
        font-weight: 600;
        border-bottom: 2px solid rgb(25, 25, 25);
      }
    }
  }

  .tr-history__close {
    position: absolute;
    right: 16px;
    top: 16px;
  }

  .tr-history__search {
    flex-shrink: 0;

    :deep(.tiny-input__inner) {
      border-radius: 999px;
    }
  }

  .tr-history__content {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px;
    margin: 0 -20px;

    .tr-history__group {
      margin-bottom: 12px;
    }

    .tr-history__date {
      font-size: 12px;
      line-height: 20px;
      padding: 4px 12px;
      color: rgb(128, 128, 128);
      background-color: rgb(255, 255, 255);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .tr-history__item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      font-size: 14px;
      line-height: 24px;
      border-radius: 12px;
      background-color: rgb(255, 255, 255);
      cursor: pointer;
      position: relative;
      z-index: 1;
      transition: box-shadow 0.3s ease;

      &:hover {
        box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
        z-index: 20;

        .tr-history__item-actions {
          opacity: 1;
        }
      }

      &.selected {
        border: 1px solid rgb(20, 118, 255);
      }

      .tr-history__item-title {
        font-size: 14px;
      }

      .tr-history__item-actions {
        display: flex;
        gap: 8px;
        opacity: 0;
      }
    }
  }

  .tiny-button {
    --tv-Button-height: 20px;
    --tv-Button-border-radius-only-icon-ontext: 999px;
    margin: 0;
  }
}
</style>
