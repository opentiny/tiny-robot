<script lang="ts" setup>
import { IconClose, IconDelete, IconEditPen, IconSearch } from '@opentiny/tiny-robot-svgs'
import TinyInput from '@opentiny/vue-input'
import TinyTooltip from '@opentiny/vue-tooltip'
import { computed } from 'vue'
import IconButton from '../icon-button'
import { ItemTag, SearchEmpty } from './components'
import { useEditItemTitle } from './composables'
import type {
  HistoryData,
  HistoryEvents,
  HistoryGroup,
  HistoryItem,
  HistoryProps,
  MultiTabHistoryProps,
  SingleTabHistoryProps,
} from './index.type'

const props = withDefaults(defineProps<HistoryProps>(), {
  searchFn: (query: string, { title }: HistoryItem) => {
    if (!query) {
      return true
    }

    return title.toLowerCase().includes(query.toLowerCase())
  },
})

const activeTab = defineModel<HistoryProps['activeTab']>('activeTab')
const searchQuery = defineModel<HistoryProps['searchQuery']>('searchQuery')

const emit = defineEmits<HistoryEvents>()

const computedTabs = computed(() => {
  if (Array.isArray((props as MultiTabHistoryProps).tabs)) {
    return (props as MultiTabHistoryProps).tabs
  }

  return [{ title: (props as SingleTabHistoryProps).tabTitle, id: '0' }]
})

const computedActiveTab = computed(() => {
  return activeTab.value || computedTabs.value[0].id
})

const enableTabBottomBorder = computed(() => {
  return computedTabs.value.length > 1
})

const isGroup = (data: HistoryData): data is HistoryGroup[] => {
  const typeOfGroup = typeof (data[0] as HistoryGroup)?.group
  return typeOfGroup === 'string' || typeOfGroup === 'symbol'
}

const data = computed(() => {
  if (Array.isArray(props.data)) {
    return props.data || []
  }

  return props.data[computedActiveTab.value] || []
})

const NO_GROUP = Symbol('NO_GROUP')

const groups = computed(() => {
  const value = data.value

  if (isGroup(value)) {
    return value
  }

  return [{ group: NO_GROUP, items: value }]
})

const filteredGroups = computed(() => {
  if (!props.searchBar) {
    return groups.value
  }

  const groupsWithFilteredItems = groups.value.map((group) => {
    return {
      ...group,
      items: group.items.filter((item) => props.searchFn(searchQuery.value || '', item)),
    } as HistoryGroup
  })

  return groupsWithFilteredItems.filter((group) => group.items.length > 0)
})

const notEmpty = computed(() => {
  if (filteredGroups.value.length === 0) {
    return false
  }

  if (filteredGroups.value[0].group === NO_GROUP) {
    return filteredGroups.value[0].items.length > 0
  }

  return true
})

const handleItemClick = (item: HistoryItem) => {
  if (item.id === editingItem.value?.id) {
    return
  }

  emit('item-click', item)
}

const handleClose = () => {
  emit('close')
}

const handleDelete = (item: HistoryItem) => {
  // TODO 删除确认弹窗
  emit('item-delete', item)
}

const { editingItem, handleEdit, handleEditorInputRef, handleKeyDown } = useEditItemTitle(emit)
</script>

<template>
  <div class="tr-history">
    <div class="tr-history__tabs">
      <div
        v-for="tab in computedTabs"
        :key="tab.id"
        :class="['tr-history__tab', { active: computedActiveTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.title }}
      </div>
    </div>
    <div v-if="props.searchBar" class="tr-history__search">
      <tiny-input
        v-model="searchQuery"
        :placeholder="props.searchPlaceholder || '搜索对话名称'"
        :prefix-icon="IconSearch"
        clearable
      />
    </div>
    <div class="tr-history__content">
      <template v-if="notEmpty">
        <div v-for="group in filteredGroups" :key="group.group" class="tr-history__group">
          <div v-if="group.group !== NO_GROUP" class="tr-history__group-title">
            <span>{{ group.group }}</span>
          </div>
          <div
            v-for="item in group.items"
            :key="`${item.id}-${item.title}`"
            :class="['tr-history__item', { selected: props.selected === item.id }]"
            @click="handleItemClick(item)"
          >
            <template v-if="editingItem?.id !== item.id">
              <span class="tr-history__item-title">{{ item.title }}</span>
              <ItemTag v-if="item.tag" class="tr-history__item-tag" v-bind="item.tag" />
              <div class="tr-history__item-actions">
                <tiny-tooltip content="编辑" effect="dark" placement="top" :open-delay="500">
                  <icon-button :icon="IconEditPen" @click.stop="handleEdit(item)"></icon-button>
                </tiny-tooltip>
                <tiny-tooltip content="删除" effect="dark" placement="top" :open-delay="500">
                  <icon-button :icon="IconDelete" @click.stop="handleDelete(item)"></icon-button>
                </tiny-tooltip>
              </div>
            </template>
            <template v-else>
              <input
                v-model="editingItem.title"
                class="tr-history__item-edit"
                :ref="handleEditorInputRef"
                v-on:keydown="handleKeyDown"
              />
            </template>
          </div>
        </div>
      </template>
      <SearchEmpty v-else :text="searchQuery ? '暂无搜索结果' : '暂无内容'" />
    </div>
    <div class="tr-history__close">
      <icon-button :icon="IconClose" rounded @click="handleClose"></icon-button>
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
    border-bottom: v-bind("enableTabBottomBorder ? '1px solid rgb(240, 240, 240)': 'none'");

    .tr-history__tab {
      cursor: pointer;
      padding-bottom: 8px;

      &.active {
        font-weight: 600;
        border-bottom: v-bind("enableTabBottomBorder ? '2px solid rgb(25, 25, 25)': 'none'");
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
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    padding: 0 20px;
    margin: 0 -20px;
    margin-bottom: 12px;

    .tr-history__group-title {
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
      --tr-history-item-bg: rgb(255, 255, 255);

      display: flex;
      align-items: center;
      height: 44px;
      padding: 0 12px;
      font-size: 14px;
      line-height: 24px;
      border-radius: 12px;
      background-color: var(--tr-history-item-bg);
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tr-history__item-tag {
        flex-shrink: 0;
        margin-right: 12px;
      }

      .tr-history__item-actions {
        display: flex;
        gap: 8px;
        opacity: 0;
        position: absolute;
        right: 12px;
        background-color: var(--tr-history-item-bg);

        &::before {
          content: '';
          position: absolute;
          right: 100%;
          width: 40px;
          height: 100%;

          background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, var(--tr-history-item-bg) 100%);
        }
      }

      .tr-history__item-edit {
        width: 100%;
        font-size: 14px;
        line-height: 24px;
        background-color: rgba(0, 0, 0, 0.04);
        border-radius: 4px;
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
