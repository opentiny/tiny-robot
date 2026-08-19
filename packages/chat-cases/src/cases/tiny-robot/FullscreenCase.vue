<script setup lang="ts">
import type { HistoryMenuItem, LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'
import { TrHistory, TrIconButton, TrLayout } from '@opentiny/tiny-robot'
import { useChatHistoryItems, type ChatHistoryItem } from '@opentiny/tiny-robot-chat'
import { IconClose, IconEnterFullScreen, IconHistory, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { useEventListener, useWindowSize } from '@vueuse/core'
import { computed, h, ref, watch } from 'vue'
import dockRightIcon from './icons/dock-right.svg'
import floatWindowIcon from './icons/float-window.svg'
import TinyRobotAssistant from './TinyRobotAssistant.vue'
import { useTinyRobotRuntime } from '../../shared/runtime/createChatRuntime'

type AssistantDisplayMode = 'floating' | 'fullscreen' | 'side'
const runtime = useTinyRobotRuntime()
const show = ref(true)
const displayMode = ref<AssistantDisplayMode>('floating')
const restoreFloatingState = ref<LayoutFloatingState | null>(null)
const restoreDisplayMode = ref<'floating' | 'side'>('floating')
const showHistory = ref(false)
const IconDockRight = h('img', { src: dockRightIcon, alt: '' })
const IconFloatWindow = h('img', { src: floatWindowIcon, alt: '' })
const historyData = useChatHistoryItems({
  conversations: () => runtime.conversations.value,
  defaultTitle: '',
})
const floatingState = ref<LayoutFloatingState>({
  placement: 'center',
  offsetX: 24,
  offsetY: 24,
  width: 640,
  height: 760,
})

const { width: viewportWidth, height: viewportHeight } = useWindowSize()

const floatingOptions = computed<LayoutFloatingOptions>(() => ({
  draggable: displayMode.value === 'floating',
  resizable: displayMode.value === 'floating',
  minWidth: displayMode.value === 'floating' ? 360 : undefined,
  minHeight: displayMode.value === 'floating' ? 480 : undefined,
  maxWidth: displayMode.value === 'floating' ? undefined : undefined,
  maxHeight: undefined,
}))

const activeConversationId = computed(() => runtime.activeConversation.value?.id)

function handleNewSession() {
  void runtime.actions.createConversation()
  showHistory.value = false
}

function handleHistorySelect(item: ChatHistoryItem) {
  void runtime.actions.switchConversation(item.raw.id)
  showHistory.value = false
}

function handleHistoryTitleChange(title: string, item: ChatHistoryItem) {
  void runtime.actions.renameConversation(item.raw.id, title)
}

function handleHistoryAction(action: HistoryMenuItem, item: ChatHistoryItem) {
  if (action.id === 'delete') {
    void runtime.actions.deleteConversation(item.raw.id)
  }
}

function getModeFloatingState(mode: Exclude<AssistantDisplayMode, 'floating'>): LayoutFloatingState {
  if (mode === 'side') {
    return {
      placement: 'top-right',
      offsetX: 0,
      offsetY: 0,
      width: 440,
      height: viewportHeight.value,
    }
  }

  return {
    placement: 'top-left',
    offsetX: 0,
    offsetY: 0,
    width: viewportWidth.value,
    height: viewportHeight.value,
  }
}

function setDisplayMode(mode: AssistantDisplayMode): void {
  if (mode === displayMode.value) {
    return
  }

  if (displayMode.value === 'floating') {
    restoreFloatingState.value = { ...floatingState.value }
  }

  if (mode === 'floating') {
    displayMode.value = mode
    if (restoreFloatingState.value) {
      floatingState.value = { ...restoreFloatingState.value }
      restoreFloatingState.value = null
    }
    return
  }

  if (mode === 'fullscreen') {
    restoreDisplayMode.value = displayMode.value === 'side' ? 'side' : 'floating'
  }

  displayMode.value = mode
  floatingState.value = getModeFloatingState(mode)
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && displayMode.value === 'fullscreen') {
    setDisplayMode(restoreDisplayMode.value)
  }
}

useEventListener('keydown', handleEscape)

watch([displayMode, viewportWidth, viewportHeight], () => {
  if (displayMode.value === 'fullscreen' || displayMode.value === 'side') {
    floatingState.value = getModeFloatingState(displayMode.value)
  }
})

function handleClose() {
  showHistory.value = false
  show.value = false
}
</script>

<template>
  <TrLayout
    v-if="show"
    v-model:floating-state="floatingState"
    :class="['tiny-robot-window', `tiny-robot-window--${displayMode}`]"
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
              <!-- @vue-generic {ChatHistoryItem} -->
              <TrHistory
                class="tiny-robot-window__history"
                :selected="activeConversationId"
                :search-bar="true"
                :data="historyData as unknown as ChatHistoryItem[]"
                @item-title-change="handleHistoryTitleChange"
                @item-click="handleHistorySelect"
                @item-action="handleHistoryAction"
              />
            </div>
          </span>
          <TrIconButton
            v-if="displayMode !== 'floating'"
            :icon="IconFloatWindow"
            size="28"
            svg-size="20"
            title="切换为悬浮窗口"
            aria-label="切换为悬浮窗口"
            @click="setDisplayMode('floating')"
          />
          <TrIconButton
            v-if="displayMode !== 'side'"
            :icon="IconDockRight"
            size="28"
            svg-size="20"
            title="切换为侧边面板"
            aria-label="切换为侧边面板"
            @click="setDisplayMode('side')"
          />
          <TrIconButton
            v-if="displayMode !== 'fullscreen'"
            :icon="IconEnterFullScreen"
            size="28"
            svg-size="20"
            title="切换为全屏模式"
            aria-label="切换为全屏模式"
            @click="setDisplayMode('fullscreen')"
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
}

.tiny-robot-window--floating {
  --tr-layout-floating-radius: 12px;
  --tr-layout-floating-shadow: 0 18px 48px rgb(0 0 0 / 18%);
}

.tiny-robot-window--fullscreen,
.tiny-robot-window--side {
  --tr-layout-floating-radius: 0;
  --tr-layout-floating-shadow: none;
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
