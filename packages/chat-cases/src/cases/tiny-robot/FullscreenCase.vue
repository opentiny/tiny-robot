<script setup lang="ts">
import type { HistoryMenuItem, LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'
import { TrHistory, TrIconButton, TrLayout } from '@opentiny/tiny-robot'
import type { ChatConversationInfo } from '@opentiny/tiny-robot-chat'
import {
  IconClose,
  IconEnterFullScreen,
  IconExitFullScreen,
  IconHistory,
  IconNewSession,
} from '@opentiny/tiny-robot-svgs'
import { computed, ref } from 'vue'
import TinyRobotAssistant from './TinyRobotAssistant.vue'
import { useTinyRobotRuntime } from '../../shared/runtime/createChatRuntime'

const runtime = useTinyRobotRuntime()
const show = ref(true)
const fullscreen = ref(false)
const showHistory = ref(false)
const floatingState = ref<LayoutFloatingState>({
  placement: 'center',
  offsetX: 24,
  offsetY: 24,
  width: 640,
  height: 760,
})
const restoreState = ref<LayoutFloatingState | null>(null)

const floatingOptions = computed<LayoutFloatingOptions>(() => ({
  draggable: !fullscreen.value,
  resizable: !fullscreen.value,
  minWidth: 360,
  minHeight: 480,
}))

const activeConversationId = computed(() => runtime.activeConversation.value?.id)
const historyData = computed(() => runtime.conversations.value.map((item) => ({ ...item, title: item.title || '' })))

function handleNewSession() {
  void runtime.actions.createConversation()
  showHistory.value = false
}

function handleHistorySelect(item: ChatConversationInfo) {
  void runtime.actions.switchConversation(item.id)
  showHistory.value = false
}

function handleHistoryTitleChange(title: string, item: ChatConversationInfo) {
  void runtime.actions.renameConversation(item.id, title)
}

function handleHistoryAction(action: HistoryMenuItem, item: ChatConversationInfo) {
  if (action.id === 'delete') {
    void runtime.actions.deleteConversation(item.id)
  }
}

function enterFullscreen() {
  restoreState.value = { ...floatingState.value }
  fullscreen.value = true
  floatingState.value = {
    placement: 'top-left',
    offsetX: 0,
    offsetY: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function exitFullscreen() {
  fullscreen.value = false
  if (restoreState.value) {
    floatingState.value = restoreState.value
    restoreState.value = null
  }
}

function toggleFullscreen() {
  if (fullscreen.value) {
    exitFullscreen()
    return
  }

  enterFullscreen()
}

function handleClose() {
  showHistory.value = false
  show.value = false
}
</script>

<template>
  <TrLayout
    v-if="show"
    v-model:floating-state="floatingState"
    class="tiny-robot-window"
    mode="floating"
    fit="parent"
    :floating-options="floatingOptions"
  >
    <template #header>
      <div class="tiny-robot-window__header">
        <h1 class="tiny-robot-window__title">OpenTiny NEXT</h1>
        <div class="tiny-robot-window__operations">
          <TrIconButton :icon="IconNewSession" size="28" svg-size="20" title="新会话" @click="handleNewSession" />
          <span class="tiny-robot-window__history-trigger">
            <TrIconButton
              :icon="IconHistory"
              size="28"
              svg-size="20"
              title="历史会话"
              @click="showHistory = !showHistory"
            />
            <div v-if="showHistory" class="tiny-robot-window__history-panel">
              <div class="tiny-robot-window__history-head">
                <h2>历史对话</h2>
                <TrIconButton
                  :icon="IconClose"
                  size="28"
                  svg-size="20"
                  title="关闭历史对话"
                  @click="showHistory = false"
                />
              </div>
              <TrHistory
                class="tiny-robot-window__history"
                :selected="activeConversationId"
                :search-bar="true"
                :data="historyData"
                @item-title-change="handleHistoryTitleChange"
                @item-click="handleHistorySelect"
                @item-action="handleHistoryAction"
              />
            </div>
          </span>
          <TrIconButton
            :icon="fullscreen ? IconExitFullScreen : IconEnterFullScreen"
            size="28"
            svg-size="20"
            :title="fullscreen ? '退出全屏' : '全屏'"
            @click="toggleFullscreen"
          />
          <TrIconButton :icon="IconClose" size="28" svg-size="20" title="关闭" @click="handleClose" />
        </div>
      </div>
    </template>

    <template #main>
      <TinyRobotAssistant :runtime="runtime" />
    </template>
  </TrLayout>
</template>

<style scoped>
.tiny-robot-window {
  --tr-layout-main-min-width: 0;
  --tr-layout-floating-radius: 12px;
  --tr-layout-floating-shadow: 0 18px 48px rgb(0 0 0 / 18%);
}

.tiny-robot-window__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  min-width: 0;
  height: 56px;
  padding: 0 16px;
  background: var(--tr-container-bg-default);
}

.tiny-robot-window__title {
  overflow: hidden;
  margin: 0;
  color: var(--tr-text-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tiny-robot-window__operations {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
}

.tiny-robot-window__history-trigger {
  position: relative;
  display: inline-flex;
  line-height: 0;
}

.tiny-robot-window__history-panel {
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

.tiny-robot-window__history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.tiny-robot-window__history-head h2 {
  margin: 0;
  color: var(--tr-text-primary);
  font-size: 16px;
  line-height: 24px;
}

.tiny-robot-window__history {
  min-height: 0;
  overflow-y: auto;
  flex: 1;
  --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
  --tr-history-item-selected-color: var(--tr-color-primary);
  --tr-history-item-space-y: 4px;
}

@media (max-width: 640px) {
  .tiny-robot-window {
    --tr-layout-floating-radius: 0;
  }

  .tiny-robot-window__header {
    height: 52px;
    padding: 0 10px;
  }

  .tiny-robot-window__history-panel {
    position: fixed;
    top: 52px;
    right: 8px;
    left: 8px;
    width: auto;
    height: min(560px, calc(100dvh - 68px));
  }
}
</style>
