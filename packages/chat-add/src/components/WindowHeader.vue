<script setup lang="ts">
import type { HistoryMenuItem } from '@opentiny/tiny-robot'
import { TrHistory, TrIconButton } from '@opentiny/tiny-robot'
import { IconClose, IconEnterFullScreen, IconHistory, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'
import type { ChatHistoryItem } from '@opentiny/tiny-robot-chat'
import type { DisplayMode } from '../composables/useWindow'

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

const IconFloatWindow = h(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 16,
    height: 16,
    fill: 'none',
    viewBox: '0 0 16 16',
    'aria-hidden': 'true',
  },
  [
    h('path', {
      fill: '#191919',
      'fill-rule': 'evenodd',
      d: 'M6.19 14.5H4q-.285 0-.54-.06c-.15-.04-.3-.08-.44-.14s-.27-.13-.4-.22c-.14-.09-.27-.2-.39-.32s-.23-.25-.32-.39c-.09-.13-.16-.26-.22-.4s-.1-.29-.14-.44c-.04-.17-.05-.35-.05-.53V4c0-.19.01-.37.05-.54.04-.15.08-.3.14-.44s.13-.27.22-.4c.09-.14.2-.27.32-.39s.25-.23.39-.32c.13-.09.26-.16.4-.22s.29-.1.44-.14c.17-.04.35-.05.54-.05h8c.18 0 .36.01.53.05.15.04.3.08.44.14s.27.13.4.22c.14.09.27.2.39.32s.23.25.32.39c.09.13.16.26.22.4s.1.29.14.44q.06.255.06.54v2.15c0 .28-.22.5-.5.5s-.5-.22-.5-.5V4c0-.12-.02-.23-.04-.35-.02-.08-.05-.16-.08-.24a2 2 0 0 0-.13-.23 1.5 1.5 0 0 0-.19-.25 1.5 1.5 0 0 0-.25-.19c-.07-.05-.15-.09-.23-.13a2 2 0 0 0-.24-.08c-.12-.02-.23-.03-.34-.03H4c-.12 0-.23.01-.35.03-.08.02-.16.05-.24.08-.08.04-.16.08-.23.13a1.5 1.5 0 0 0-.25.19 1.5 1.5 0 0 0-.19.25c-.05.07-.09.15-.13.23-.03.08-.06.16-.08.24-.02.12-.03.23-.03.35v8c0 .11.01.22.03.34.02.08.05.16.08.24.04.08.08.16.13.23.05.09.12.17.19.25.08.07.16.14.25.19.07.05.15.09.23.13.08.03.16.06.24.08.12.02.23.04.35.04h2.19c.28 0 .5.22.5.5s-.22.5-.5.5m7.12-6.97c-.1-.02-.21-.03-.31-.03H9c-.11 0-.22.01-.32.03-.09.02-.18.05-.27.08-.09.04-.17.08-.24.13-.09.06-.16.12-.24.19-.07.08-.13.15-.19.24-.05.07-.09.15-.13.24-.03.09-.06.18-.08.27-.02.1-.03.21-.03.32v4c0 .1.01.21.03.31.02.09.05.18.08.27.04.09.08.17.13.24.06.09.12.16.19.24.08.07.15.13.24.19.07.05.15.09.24.13.09.03.18.06.27.08.1.02.21.04.32.04h4c.1 0 .21-.02.31-.04.09-.02.18-.05.27-.08.09-.04.17-.08.24-.13.09-.06.16-.12.24-.19.07-.08.13-.15.19-.24.05-.07.09-.15.13-.24.03-.09.06-.18.08-.27.02-.1.04-.21.04-.31V9c0-.11-.02-.22-.04-.32-.02-.09-.05-.18-.08-.27-.04-.09-.08-.17-.13-.24-.06-.09-.12-.16-.19-.24-.08-.07-.15-.13-.24-.19-.07-.05-.15-.09-.24-.13-.09-.03-.18-.06-.27-.08M9 8.5h4c.06 0 .13.01.19.03.06.03.11.06.16.11s.08.1.11.16c.02.06.04.13.04.2v4c0 .06-.02.13-.04.19-.03.06-.06.11-.11.16s-.1.08-.16.11c-.06.02-.13.04-.19.04H9c-.07 0-.14-.02-.2-.04a.6.6 0 0 1-.16-.11.6.6 0 0 1-.11-.16.6.6 0 0 1-.03-.19V9c0-.07.01-.14.03-.2.03-.06.06-.11.11-.16s.1-.08.16-.11c.06-.02.13-.03.2-.03',
    }),
  ],
)
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
        v-if="props.displayMode === 'fullscreen'"
        :icon="IconFloatWindow"
        size="28"
        svg-size="20"
        title="切换为悬浮窗口"
        aria-label="切换为悬浮窗口"
        @click="emit('changeMode', 'floating')"
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
