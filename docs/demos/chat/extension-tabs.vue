<script setup lang="ts">
import { TrChatUI } from '@opentiny/tiny-robot-chat'
import { IconPlus } from '@opentiny/tiny-robot-svgs'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { useExtensionTabsDemo } from './useExtensionTabsDemo'

const {
  closeOverlay,
  data,
  handleExtensionAction,
  handleMcpAddServer,
  handleMcpCreateServer,
  handleMcpRemoveServer,
  handleMcpServerEnabledChange,
  handleMcpToolEnabledChange,
  handleTabChange,
  openImport,
  openSkillDetail,
  overlayDescription,
  overlayOpen,
  overlayTitle,
  status,
  ui,
} = useExtensionTabsDemo()
</script>

<template>
  <section class="extension-tabs-demo">
    <TrChatUI
      :data="data"
      :ui="ui"
      :default-right-aside-open="true"
      default-active-right-aside-panel-id="mcp"
      @extension-action="handleExtensionAction"
      @extension-name-click="openSkillDetail"
      @extension-tab-change="handleTabChange"
      @mcp-add-server="handleMcpAddServer"
      @mcp-create-server="handleMcpCreateServer"
      @mcp-remove-server="handleMcpRemoveServer"
      @mcp-server-enabled-change="handleMcpServerEnabledChange"
      @mcp-tool-enabled-change="handleMcpToolEnabledChange"
    >
      <template #extension-header-actions="{ activeTabId }">
        <button v-if="activeTabId === 'skills'" class="extension-tabs-demo__add" type="button" @click="openImport">
          <IconPlus class="extension-tabs-demo__add-icon" aria-hidden="true" />
          <span>导入 Skill</span>
        </button>
      </template>

      <template #extension-overlay="{ activeTabId }">
        <div v-if="activeTabId === 'skills' && overlayOpen" class="extension-tabs-demo__overlay">
          <h3>{{ overlayTitle }}</h3>
          <p>{{ overlayDescription }}</p>
          <button class="extension-tabs-demo__secondary-action" type="button" @click="closeOverlay">
            返回扩展列表
          </button>
        </div>
      </template>

      <template #composer-after>
        <output class="extension-tabs-demo__status">{{ status }}</output>
      </template>
    </TrChatUI>
  </section>
</template>

<style scoped>
.extension-tabs-demo {
  --tr-layout-height: 100%;
  --tr-layout-drawer-width: 100%;
  height: min(680px, calc(100vh - 240px));
  min-height: 520px;
}

.extension-tabs-demo__add {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-sizing: border-box;
  border: 1px solid var(--tr-mcp-server-picker-header-button-border-color);
  border-radius: 999px;
  padding: 4px 15px;
  color: var(--tr-mcp-server-picker-header-button-text-color);
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
}

.extension-tabs-demo__add:hover {
  border-color: var(--tr-mcp-server-picker-header-button-border-color-hover);
  background: transparent;
}

.extension-tabs-demo__add:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 2px;
}

.extension-tabs-demo__add-icon {
  width: 16px;
  height: 16px;
  color: var(--tr-mcp-server-picker-header-button-icon-color);
}

.extension-tabs-demo__secondary-action {
  border: 1px solid var(--tr-border-color-default);
  border-radius: 999px;
  padding: 5px 12px;
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}

.extension-tabs-demo__secondary-action:hover {
  border-color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-hover);
}

.extension-tabs-demo__overlay {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.extension-tabs-demo__overlay h3,
.extension-tabs-demo__overlay p {
  margin: 0;
}

.extension-tabs-demo__status {
  display: block;
  color: var(--tr-text-secondary);
  font-size: 12px;
  text-align: center;
}

:deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .extension-tabs-demo {
    height: 640px;
  }
}
</style>
