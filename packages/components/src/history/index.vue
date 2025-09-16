<script lang="ts" setup generic="T extends HistoryItem">
import { IconCheck, IconClose, IconDelete, IconEditPen, IconMenu2 } from '@opentiny/tiny-robot-svgs'
import { computed, ref, type Ref } from 'vue'
import { useTouchDevice } from '../shared/composables'
import Empty from './components/Empty.vue'
import MenuList from './components/MenuList.vue'
import { useRenameEditor } from './composables/useRenameEditor'
import { NO_GROUP } from './constants'
import type { HistoryData, HistoryGroup, HistoryItem, HistoryMenuItem, HistoryProps } from './index.type'

const props = withDefaults(defineProps<HistoryProps<T>>(), {
  showRenameControls: false,
  renameControlOnClickOutside: 'confirm',
  menuItems: () => [
    { id: 'rename', text: '重命名', icon: IconEditPen },
    { id: 'delete', text: '删除', icon: IconDelete },
  ],
  menuListGap: 8,
})
const emit = defineEmits<{
  'item-click': [item: T]
  'item-title-change': [newTitle: string, item: T]
  'item-action': [action: HistoryMenuItem, item: T]
}>()

const isGroup = <T extends HistoryItem>(data: HistoryData<T>): data is HistoryGroup<T>[] => {
  const typeOfGroup = typeof (data[0] as HistoryGroup<T>)?.group
  return typeOfGroup === 'string' || typeOfGroup === 'symbol'
}

const groups = computed(() => {
  const value = props.data

  if (isGroup(value)) {
    return value
  }

  return [{ group: NO_GROUP, items: value }]
})

const isEmpty = computed(() => {
  return groups.value.length === 0 || groups.value.every((group) => group.items.length === 0)
})

const {
  editingItem,
  editorRefList,
  editorConfirmRefList,
  editorCancelRefList,
  editorValue,
  handleEdit,
  handleEditCancel,
  handleEditConfirm,
} = useRenameEditor<T>({
  renameControlOnClickOutside: props.renameControlOnClickOutside,
  onItemTitleChange: (newTitle, item) => {
    emit('item-title-change', newTitle, item)
  },
})

const { isTouchDevice } = useTouchDevice()

const menuTriggerEl = ref<HTMLButtonElement | null>(null)
const menuTriggerItem = ref<T | null>(null) as Ref<T | null>

const toggleMenu = (ev: MouseEvent, item: T) => {
  if (ev.currentTarget instanceof HTMLButtonElement) {
    if (menuTriggerItem.value === item) {
      menuTriggerEl.value = null
      menuTriggerItem.value = null
      return
    }

    menuTriggerEl.value = ev.currentTarget
    menuTriggerItem.value = item
  } else {
    menuTriggerEl.value = null
    menuTriggerItem.value = null
  }
}

const handleClickMenuItem = (action: HistoryMenuItem) => {
  const item = menuTriggerItem.value

  if (!item) {
    return
  }

  if (action.id === 'rename') {
    handleEdit(item)
  }
  emit('item-action', action, item)
}
</script>

<template>
  <div class="tr-history" :class="{ 'touch-device': isTouchDevice }">
    <template v-if="!isEmpty">
      <div class="tr-history__group" v-for="group in groups" :key="group.group">
        <div class="tr-history__group-title" v-if="group.group !== NO_GROUP">{{ group.group }}</div>
        <div class="tr-history__group-items">
          <div
            class="tr-history__item"
            :class="{
              selected: item.id && item.id === props.selected,
              editing: editingItem === item,
              active: menuTriggerItem === item,
            }"
            v-for="(item, index) in group.items"
            :key="item.id || index"
            @click="emit('item-click', item)"
          >
            <input
              class="tr-history__item-editor"
              v-if="editingItem === item"
              type="text"
              @click.stop
              ref="editorRefList"
              v-model="editorValue"
              @keydown.enter="handleEditConfirm"
              @keydown.escape="handleEditCancel"
            />
            <span class="text" v-else :title="item.title">{{ item.title }}</span>
            <span class="tr-history__item-actions" @click.stop>
              <button
                class="editor-confirm"
                v-if="props.showRenameControls && editingItem === item"
                ref="editorConfirmRefList"
                @click="handleEditConfirm"
              >
                <IconCheck></IconCheck>
              </button>
              <button
                class="editor-cancel"
                v-if="props.showRenameControls && editingItem === item"
                ref="editorCancelRefList"
                @click="handleEditCancel"
              >
                <IconClose></IconClose>
              </button>
              <button class="menu" :class="{ hidden: editingItem === item }" @click="(ev) => toggleMenu(ev, item)">
                <IconMenu2></IconMenu2>
              </button>
            </span>
          </div>
        </div>
      </div>
      <MenuList
        v-show="menuTriggerEl"
        v-model:trigger="menuTriggerEl"
        v-model:data="menuTriggerItem"
        :items="props.menuItems"
        :menu-list-gap="props.menuListGap"
        @item-click="handleClickMenuItem"
      />
    </template>
    <Empty v-else />
  </div>
</template>

<style lang="less" scoped>
.tr-history:not(.touch-device) {
  .tr-history__item:not(.active) {
    & > .tr-history__item-actions {
      & > .menu {
        position: absolute;
        visibility: hidden;
      }
    }
  }

  .tr-history__item:not(.editing):hover {
    & > .tr-history__item-actions {
      & > .menu {
        position: static;
        visibility: visible;
      }
    }
  }
}

.tr-history__group {
  margin-block: var(--tr-history-group-space-y);
}

.tr-history__group-title {
  font-size: var(--tr-history-group-title-font-size);
  line-height: var(--tr-history-group-title-line-height);
  padding: var(--tr-history-group-title-padding);
  color: var(--tr-history-group-title-color);
}

.tr-history__item {
  font-size: var(--tr-history-item-font-size);
  line-height: var(--tr-history-item-line-height);
  color: var(--tr-history-item-color);
  padding: var(--tr-history-item-padding);
  border-radius: var(--tr-history-item-border-radius);

  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover,
  &.active {
    background: var(--tr-history-item-hover-bg);
  }

  &.editing {
    padding: var(--tr-history-item-padding-editing);
    background: var(--tr-history-item-hover-bg);
  }

  &.selected {
    background: var(--tr-history-item-selected-bg);
  }

  & > .text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.tr-history__item-editor {
  flex: 1;
  font-size: var(--tr-history-item-font-size);
  line-height: var(--tr-history-item-line-height);
  border: var(--tr-history-item-editor-border-width) solid var(--tr-history-item-editor-border-color);
  border-radius: var(--tr-history-item-editor-border-radius);
  padding: var(--tr-history-item-editor-padding);
  outline: var(--tr-history-item-editor-outline);
}

.tr-history__item-actions {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: var(--tr-history-item-actions-gap);

  & > button {
    border: none;
    background: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    display: inline-flex;

    &:hover {
      background: var(--tr-history-item-action-bg-hover);
    }

    & > svg {
      font-size: 16px;
    }

    &.hidden {
      position: absolute;
      visibility: hidden;
    }
  }

  & > .editor-confirm {
    color: var(--tr-history-item-editor-confirm-color);
  }

  & > .editor-cancel {
    color: var(--tr-history-item-editor-cancel-color);
  }
}
</style>
