<script setup lang="ts">
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import { MCP_MANAGER_KEY } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'
import type { PluginInfo } from '@opentiny/tiny-robot'
import { TrMcpAddForm, TrMcpServerPicker } from '@opentiny/tiny-robot'
import { IconClose, IconPlus } from '@opentiny/tiny-robot-svgs'
import type { UseMcpManagerReturn } from './useMcpManager'

defineOptions({ name: 'TrChatMcpPanel' })

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const mcpManager = inject<UseMcpManagerReturn>(MCP_MANAGER_KEY)
if (!mcpManager) {
  throw new Error('mcpManager not provided')
}

const { installedPlugins, handlePluginToggle, handleToolToggle, handlePluginCreate, handlePluginDelete, activeCount } =
  mcpManager

const chatMessages = useResolvedChatMessages()

const anchorElement = ref<HTMLElement | null>(null)
const panelHostElement = ref<HTMLElement | null>(null)
const showAddForm = ref(false)
const teleportTarget = computed(() => panelHostElement.value ?? 'body')

function resolvePanelHostElement() {
  panelHostElement.value = (anchorElement.value?.closest('.tr-chat') as HTMLElement | null) ?? null
}

watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      await nextTick()
      resolvePanelHostElement()
    }

    if (!visible) {
      showAddForm.value = false
    }
  },
)

onMounted(() => {
  resolvePanelHostElement()
})

function openAddForm() {
  showAddForm.value = true
}

function closeAddForm() {
  showAddForm.value = false
}

const handlePluginToggleEvent = (plugin: PluginInfo, enabled: boolean) => {
  handlePluginToggle(plugin, enabled)
}

const handleToolToggleEvent = (plugin: PluginInfo, toolId: string, enabled: boolean) => {
  handleToolToggle(plugin, toolId, enabled)
}

const handlePluginDeleteEvent = (plugin: PluginInfo) => {
  handlePluginDelete(plugin)
}

const handlePluginCreateEvent = async (type: 'form' | 'code', data: unknown) => {
  await handlePluginCreate(type, data)
  closeAddForm()
}
</script>

<template>
  <div ref="anchorElement" class="tr-chat-mcp-panel-anchor" aria-hidden="true" />

  <Teleport :to="teleportTarget" :disabled="!panelHostElement">
    <div class="tr-chat-mcp-panel-layer" :class="{ 'is-scoped': Boolean(panelHostElement) }">
      <Transition name="fade">
        <div v-if="visible" class="mcp-panel-overlay" @click="emit('update:visible', false)" />
      </Transition>

      <TrMcpServerPicker
        :visible="visible"
        :installed-plugins="installedPlugins"
        :active-count="activeCount"
        show-installed-tab
        :show-custom-add-button="false"
        :allow-plugin-toggle="true"
        :allow-tool-toggle="true"
        :allow-plugin-delete="true"
        :popup-config="{
          type: 'drawer',
          drawer: { direction: 'right' },
        }"
        @update:visible="emit('update:visible', $event)"
        @plugin-toggle="(plugin, enabled) => handlePluginToggleEvent(plugin, enabled)"
        @tool-toggle="(plugin, toolId, enabled) => handleToolToggleEvent(plugin, toolId, enabled)"
        @plugin-create="handlePluginCreateEvent"
        @plugin-delete="handlePluginDeleteEvent"
      >
        <template #header-actions>
          <button class="mcp-panel-add-trigger" type="button" @click="openAddForm">
            <IconPlus class="mcp-panel-add-trigger__icon" />
            <span>{{ chatMessages.mcp.addPlugin }}</span>
          </button>
        </template>
      </TrMcpServerPicker>

      <Transition name="fade">
        <div v-if="showAddForm" class="mcp-add-form-overlay" @click="closeAddForm" />
      </Transition>

      <Transition name="mcp-add-form-shell">
        <div v-if="showAddForm" class="mcp-add-form-shell">
          <div class="mcp-add-form-shell__header">
            <h3 class="mcp-add-form-shell__title">{{ chatMessages.mcp.installPlugin }}</h3>
            <IconClose class="mcp-add-form-shell__close" @click="closeAddForm" />
          </div>

          <TrMcpAddForm @confirm="handlePluginCreateEvent" @cancel="closeAddForm" />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.tr-chat-mcp-panel-anchor {
  display: none;
}

.tr-chat-mcp-panel-layer.is-scoped {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tr-chat-mcp-panel-layer.is-scoped :deep(.mcp-server-picker) {
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: auto !important;
  pointer-events: auto;
}

.tr-chat-mcp-panel-layer.is-scoped .mcp-panel-overlay,
.tr-chat-mcp-panel-layer.is-scoped .mcp-add-form-overlay,
.tr-chat-mcp-panel-layer.is-scoped .mcp-add-form-shell {
  position: absolute;
  pointer-events: auto;
}

.tr-chat-mcp-panel-layer.is-scoped .mcp-add-form-shell {
  width: min(570px, calc(100% - 24px));
  max-height: calc(100% - 24px);
}

.mcp-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--chat-mcp-overlay-bg);
  z-index: 999;
  cursor: pointer;
}

.mcp-panel-add-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 20px;
  border: 1px solid var(--tr-text-secondary);
  border-radius: 999px;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
  font-size: 12px;
  line-height: 18px;
  transition: border-color 0.2s ease;
}

.mcp-panel-add-trigger:hover {
  border-color: var(--tr-text-disabled);
}

.mcp-panel-add-trigger__icon {
  font-size: 16px;
}

.mcp-add-form-overlay {
  position: fixed;
  inset: 0;
  z-index: 1001;
  background: rgba(0, 0, 0, 0.2);
}

.mcp-add-form-shell {
  position: fixed;
  z-index: 1002;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(570px, calc(100vw - 24px));
  max-height: calc(100vh - 24px);
  overflow: auto;
  background: var(--tr-container-bg-default);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}

.mcp-add-form-shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 32px 0;
  box-sizing: border-box;
}

.mcp-add-form-shell__title {
  margin: 0;
  color: var(--tr-text-primary);
  font-size: 18px;
  line-height: 24px;
  font-weight: 700;
}

.mcp-add-form-shell__close {
  width: 28px;
  height: 28px;
  padding: 4px;
  box-sizing: border-box;
  cursor: pointer;
}

.mcp-add-form-shell__close:hover {
  background: var(--tr-container-bg-hover);
  border-radius: 8px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mcp-add-form-shell-enter-active,
.mcp-add-form-shell-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.mcp-add-form-shell-enter-from,
.mcp-add-form-shell-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.94);
}

@media (max-width: 768px) {
  .mcp-add-form-shell {
    top: 0;
    right: 0;
    left: auto;
    bottom: 0;
    width: min(420px, 100vw);
    max-height: none;
    border-radius: 0;
    transform: translateX(0);
  }

  .mcp-add-form-shell__header {
    padding: 20px 16px 0;
  }

  .mcp-add-form-shell-enter-from,
  .mcp-add-form-shell-leave-to {
    opacity: 1;
    transform: translateX(100%);
  }

  .tr-chat-mcp-panel-layer.is-scoped .mcp-add-form-shell {
    width: min(420px, 100%);
  }
}
</style>
