<script setup lang="ts">
import type { HistoryMenuItem } from '@opentiny/tiny-robot'
import { TrHistory, TrIconButton } from '@opentiny/tiny-robot'
import { IconClose, IconEnterFullScreen, IconHistory, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'
import type { ChatHistoryItem } from '@opentiny/tiny-robot-chat'
import type { DisplayMode } from '../useWindow'
import dockRightIcon from '../icons/dock-right.svg'
import floatWindowIcon from '../icons/float-window.svg'

const props = defineProps<{
  displayMode: DisplayMode
  showHistory: boolean
  historyData: readonly ChatHistoryItem[]
  activeConversationId?: string
}>()

const emit = defineEmits<{
  newSession: []
  selectHistory: [item: ChatHistoryItem]
  renameHistory: [title: string, item: ChatHistoryItem]
  historyAction: [action: HistoryMenuItem, item: ChatHistoryItem]
  'update:showHistory': [value: boolean]
  changeMode: [mode: DisplayMode]
  close: []
}>()

const IconDockRight = h('img', { src: dockRightIcon, alt: '' })
const IconFloatWindow = h('img', { src: floatWindowIcon, alt: '' })
</script>

<template>
  <div class="chat-add-header">
    <h1 class="chat-add-header__title">OpenTiny NEXT</h1>
    <div class="chat-add-header__actions">
      <TrIconButton :icon="IconNewSession" size="28" svg-size="20" title="新会话" @click="emit('newSession')" />
      <span class="chat-add-header__history-trigger">
        <TrIconButton
          :icon="IconHistory"
          size="28"
          svg-size="20"
          title="历史会话"
          @click="emit('update:showHistory', !props.showHistory)"
        />
        <div v-if="props.showHistory" class="chat-add-header__history-panel">
          <div class="chat-add-header__history-head">
            <h2>历史对话</h2>
            <TrIconButton
              :icon="IconClose"
              size="28"
              svg-size="20"
              title="关闭历史对话"
              @click="emit('update:showHistory', false)"
            />
          </div>
          <!-- @vue-generic {ChatHistoryItem} -->
          <TrHistory
            class="chat-add-header__history"
            :selected="props.activeConversationId"
            :search-bar="true"
            :data="props.historyData as ChatHistoryItem[]"
            @item-title-change="(title, item) => emit('renameHistory', title, item)"
            @item-click="(item) => emit('selectHistory', item)"
            @item-action="(action, item) => emit('historyAction', action, item)"
          />
        </div>
      </span>
      <TrIconButton
        v-if="props.displayMode !== 'floating'"
        :icon="IconFloatWindow"
        size="28"
        svg-size="20"
        title="切换为悬浮窗口"
        aria-label="切换为悬浮窗口"
        @click="emit('changeMode', 'floating')"
      />
      <TrIconButton
        v-if="props.displayMode !== 'side'"
        :icon="IconDockRight"
        size="28"
        svg-size="20"
        title="切换为侧边面板"
        aria-label="切换为侧边面板"
        @click="emit('changeMode', 'side')"
      />
      <TrIconButton
        v-if="props.displayMode !== 'fullscreen'"
        :icon="IconEnterFullScreen"
        size="28"
        svg-size="20"
        title="切换为全屏模式"
        aria-label="切换为全屏模式"
        @click="emit('changeMode', 'fullscreen')"
      />
      <TrIconButton :icon="IconClose" size="28" svg-size="20" title="关闭" @click="emit('close')" />
    </div>
  </div>
</template>

<style scoped>
.chat-add-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  min-width: 0;
  height: 56px;
  padding: 0 16px;
  background: var(--tr-layout-bg-default);
}
.chat-add-header__title {
  overflow: hidden;
  margin: 0;
  color: var(--tr-text-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chat-add-header__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
}
.chat-add-header__history-trigger {
  position: relative;
  display: inline-flex;
  line-height: 0;
}
.chat-add-header__history-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: var(--tr-z-index-popover);
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  gap: 12px;
  width: 320px;
  height: 560px;
  padding: 16px;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 12px;
  background: var(--tr-container-bg-default);
  box-shadow: var(--tr-shadow-sm);
}
.chat-add-header__history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.chat-add-header__history-head h2 {
  margin: 0;
  color: var(--tr-text-primary);
  font-size: 16px;
  line-height: 24px;
}
.chat-add-header__history {
  min-height: 0;
  overflow-y: auto;
  flex: 1;
}
.chat-add-header__history {
  --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
  --tr-history-item-selected-color: var(--tr-color-primary);
  --tr-history-item-space-y: 4px;
}
@media (max-width: 640px) {
  .chat-add-header {
    height: 52px;
    padding: 0 10px;
  }
  .chat-add-header__history-panel {
    position: fixed;
    top: 52px;
    right: 8px;
    left: 8px;
    width: auto;
    height: min(560px, calc(100dvh - 68px));
  }
}
</style>
