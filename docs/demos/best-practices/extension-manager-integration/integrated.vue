<script setup lang="ts">
import { onMounted } from 'vue'
import {
  TrExtensionManager,
  TrIconButton,
  TrMcpExtensionDetail,
  TrMcpExtensionForm,
  TrSkillExtensionDetail,
  TrSkillImportForm,
} from '@opentiny/tiny-robot'
import { IconClose } from '@opentiny/tiny-robot-svgs'
import { resolveExampleSkill } from './mock-api'
import ExtensionAddMenu from './ExtensionAddMenu.vue'
import { useExtensionCatalog } from './use-extension-catalog'
import { useExtensionDialog } from './use-extension-dialog'

type AddAction = 'mcp' | 'skill-local' | 'skill-github'

const catalog = useExtensionCatalog()
const { activeTab, catalogError, handleAction, loadCatalog, loading, message, resetCatalog, saving, tabs } = catalog
const {
  closeDialog,
  handleBackdropClick,
  dialogError,
  dialogRef,
  dialogTitle,
  formKey,
  handleMcpSubmit,
  handleNameClick,
  handleSkillSubmit,
  handleToolToggle,
  mcpFormValue,
  onDialogClose,
  openDialog,
  panel,
  resetDialog,
  selectedMcp,
  selectedSkill,
  selectedTools,
} = useExtensionDialog(catalog)

const handleAddSelect = (action: AddAction, trigger: HTMLButtonElement) => {
  const nextPanel = action === 'mcp' ? 'mcp-add' : action === 'skill-local' ? 'skill-local-add' : 'skill-github-add'
  void openDialog(nextPanel, '', trigger)
}

const reset = () => {
  resetDialog()
  resetCatalog()
}

onMounted(() => void loadCatalog())
</script>

<template>
  <section class="integrated-demo">
    <div class="demo-aux-controls">
      <button type="button" class="demo-aux-control" :disabled="saving || loading" @click="reset">重置示例</button>
    </div>
    <p v-if="loading" role="status">正在加载远程目录…</p>
    <p v-if="catalogError" role="alert">
      {{ catalogError }}。已安装的远程扩展仍可使用存储快照。
      <button type="button" class="demo-aux-control" @click="loadCatalog">重试目录</button>
    </p>

    <tr-extension-manager
      v-model:active-tab="activeTab"
      title="扩展管理"
      :tabs="tabs"
      @action="handleAction"
      @name-click="handleNameClick"
    >
      <template #header-actions>
        <ExtensionAddMenu @select="handleAddSelect" />
      </template>
    </tr-extension-manager>

    <p aria-live="polite">{{ message }}</p>

    <dialog
      ref="dialogRef"
      class="integrated-demo__dialog"
      aria-labelledby="integrated-dialog-title"
      @click="handleBackdropClick"
      @close="onDialogClose"
    >
      <header class="integrated-demo__dialog-header">
        <h3 id="integrated-dialog-title" ref="dialogTitle" tabindex="-1">
          {{
            panel === 'mcp-add'
              ? '添加 MCP'
              : panel === 'skill-local-add'
                ? '上传 Skill 技能包'
                : panel === 'skill-github-add'
                  ? '从 GitHub 导入 Skill'
                  : panel === 'mcp-detail'
                    ? 'MCP 详情'
                    : 'Skill 详情'
          }}
        </h3>
        <TrIconButton
          :icon="IconClose"
          size="28"
          svg-size="20"
          type="button"
          aria-label="关闭弹窗"
          title="关闭"
          @click="closeDialog"
        />
      </header>
      <p v-if="dialogError" role="alert">{{ dialogError }}</p>
      <tr-mcp-extension-form
        v-if="panel === 'mcp-add'"
        :key="formKey"
        v-model="mcpFormValue"
        @submit="handleMcpSubmit"
        @cancel="closeDialog"
      />
      <tr-skill-import-form
        v-else-if="panel === 'skill-local-add' || panel === 'skill-github-add'"
        :key="formKey"
        :source="panel === 'skill-local-add' ? 'local' : 'github'"
        :resolve-skill="panel === 'skill-github-add' ? resolveExampleSkill : undefined"
        @submit="handleSkillSubmit"
        @cancel="closeDialog"
      />
      <tr-mcp-extension-detail
        v-else-if="panel === 'mcp-detail' && selectedMcp"
        :id="selectedMcp.id"
        :name="selectedMcp.data.value.name"
        :description="selectedMcp.data.value.description"
        :tools="selectedTools"
        @tool-toggle="handleToolToggle"
      />
      <tr-skill-extension-detail
        v-else-if="panel === 'skill-detail' && selectedSkill"
        :definition="selectedSkill.data"
      />
    </dialog>
  </section>
</template>

<style scoped>
.integrated-demo {
  display: grid;
  gap: 16px;
  container: integrated-demo / inline-size;
}

.integrated-demo > .demo-aux-controls {
  margin-bottom: 0;
}

.integrated-demo :deep(.tr-extension-card-grid) {
  grid-template-columns: minmax(0, 1fr);
}

@container integrated-demo (min-width: 656px) {
  .integrated-demo :deep(.tr-extension-card-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.integrated-demo__dialog-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.integrated-demo__dialog {
  width: min(680px, calc(100vw - 32px));
  max-height: min(85vh, 800px);
  overflow: auto;
  padding: 20px;
  border: 1px solid var(--tr-border-color, #ddd);
  border-radius: 10px;
}

.integrated-demo__dialog::backdrop {
  background: rgb(0 0 0 / 24%);
}

.integrated-demo__dialog-header {
  justify-content: space-between;
  margin-bottom: 16px;
}

.integrated-demo__dialog-header h3 {
  margin: 0;
}
</style>
