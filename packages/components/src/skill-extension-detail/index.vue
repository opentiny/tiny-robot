<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { IconSkill } from '@opentiny/tiny-robot-svgs'
import type { SkillDefinition } from '../skill-import-form/index.type'
import { useStableId } from '../shared/composables'
import type {
  SkillExtensionDetailEmits,
  SkillExtensionDetailProps,
  SkillExtensionDetailSlots,
  SkillFileAction,
} from './index.type'
import SkillDeleteDialog from './SkillDeleteDialog.vue'
import SkillFileTree from './SkillFileTree.vue'
import SkillFileSwitchDialog from './SkillFileSwitchDialog.vue'
import SkillNameDialog from './SkillNameDialog.vue'
import SkillContentViewer from './SkillContentViewer.vue'
import { rootFolder, useSkillFileTree } from './useSkillFileTree'
import { useSkillContent } from './useSkillContent'
import { useSkillFileActions } from './useSkillFileActions'
import { useSkillFileNavigation } from './useSkillFileNavigation'

defineOptions({ name: 'SkillExtensionDetail' })

const props = defineProps<SkillExtensionDetailProps>()
const emit = defineEmits<SkillExtensionDetailEmits>()
defineSlots<SkillExtensionDetailSlots>()

const localDefinition = shallowRef<SkillDefinition | null>(null)
const currentDefinition = computed(() => localDefinition.value ?? props.definition)
const fileTreeId = 'skill-extension-detail-' + useStableId() + '-files'

const saveDefinition = (definition: SkillDefinition) => {
  localDefinition.value = definition
  emit('save', definition)
}

const {
  selectedResourceId,
  collapsedFolders,
  resources,
  directories,
  treeRows,
  selectedResource,
  selectedFileName,
  createResourceId,
  isPathTaken,
} = useSkillFileTree(currentDefinition)

const {
  draftContent,
  isEditing,
  contentKind,
  editingMode,
  textContent,
  contentLoading,
  contentError,
  resourceUrl,
  renderedMarkdown,
  canEditSelectedFile,
  hasUnsavedChanges,
  startEditing,
  updateDraftContent,
  cancelEditing,
  saveEditing,
} = useSkillContent({
  currentDefinition,
  selectedResource,
  mode: computed(() => props.mode),
  onSave: saveDefinition,
})

const emitFileAction = (action: SkillFileAction) => {
  emit('file-action', action)
}

const {
  openActionMenuKey,
  inlineRename,
  nameDialog,
  deleteDialog,
  nameDialogTitle,
  toggleActionMenu,
  cancelInlineRename,
  clearInlineRenameError,
  updateInlineRename,
  closeNameDialog,
  closeDeleteDialog,
  confirmDelete,
  handleTreeAction,
  submitInlineRename,
  submitNameDialog,
  getTreeActionLabel,
  selectResource,
} = useSkillFileActions({
  mode: computed(() => props.mode),
  currentDefinition,
  resources,
  directories,
  selectedResourceId,
  selectedResource,
  collapsedFolders,
  isEditing,
  draftContent,
  textContent,
  createResourceId,
  isPathTaken,
  onSave: saveDefinition,
  onFileAction: emitFileAction,
})

const {
  switchingFile,
  fileSwitchDialog,
  closeFileSwitchDialog,
  requestTreeAction,
  handleFileSwitchDecision,
  requestSelectResource,
} = useSkillFileNavigation({
  mode: computed(() => props.mode),
  selectedResourceId,
  selectedResource,
  resources,
  openActionMenuKey,
  isEditing,
  draftContent,
  textContent,
  hasUnsavedChanges,
  saveEditing,
  selectResource,
  handleTreeAction,
  getTreeActionLabel,
})

const toggleFolder = (folderKey: string) => {
  openActionMenuKey.value = undefined
  const next = new Set(collapsedFolders.value)
  if (next.has(folderKey)) next.delete(folderKey)
  else next.add(folderKey)
  collapsedFolders.value = next
}

const openRootCreateDialog = (action: 'create-file' | 'create-folder') => {
  requestTreeAction(action, rootFolder)
}

const handleModeChange = (mode: 'view' | 'edit' | undefined) => {
  if (mode !== 'edit') {
    openActionMenuKey.value = undefined
    inlineRename.value = undefined
    isEditing.value = false
    closeFileSwitchDialog()
  }
}

watch(() => props.mode, handleModeChange)

watch(
  () => props.definition,
  (nextDefinition, previousDefinition) => {
    if (nextDefinition !== previousDefinition) {
      localDefinition.value = null
    }
    if (nextDefinition.name !== previousDefinition?.name) {
      collapsedFolders.value = new Set()
      openActionMenuKey.value = undefined
      inlineRename.value = undefined
      nameDialog.value = undefined
      deleteDialog.value = undefined
      isEditing.value = false
      closeFileSwitchDialog()
    }
    if (
      selectedResourceId.value &&
      !resources.value.some((resource) => resource.resourceId === selectedResourceId.value)
    ) {
      selectedResourceId.value = undefined
    }
  },
)

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target
  const clickedActionMenu =
    target instanceof Element &&
    target.closest('.skill-extension-detail__tree-action-trigger, .skill-extension-detail__tree-action-menu')
  if (clickedActionMenu) return

  const clickedInlineRename = target instanceof Element && target.closest('.skill-extension-detail__tree-inline-editor')

  if (inlineRename.value && !clickedInlineRename) {
    const renameDraft = inlineRename.value
    submitInlineRename()
    if (inlineRename.value === renameDraft) cancelInlineRename()
  }

  if (!openActionMenuKey.value) return
  openActionMenuKey.value = undefined
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div class="skill-extension-detail">
    <header class="skill-extension-detail__summary">
      <div class="skill-extension-detail__title-row">
        <div class="skill-extension-detail__icon" aria-hidden="true">
          <IconSkill aria-hidden="true" />
        </div>
        <h2 class="skill-extension-detail__name">{{ props.definition.name }}</h2>
      </div>
      <p class="skill-extension-detail__description">描述：{{ props.definition.description || '暂无描述' }}</p>
      <p v-if="props.updatedAt" class="skill-extension-detail__updated-at">更新时间：{{ props.updatedAt }}</p>
    </header>

    <div class="skill-extension-detail__browser" :aria-labelledby="fileTreeId">
      <SkillFileTree
        :skill-name="props.definition.name"
        :tree-id="fileTreeId"
        :rows="treeRows"
        :selected-resource-id="selectedResourceId"
        :collapsed-folders="collapsedFolders"
        :open-action-menu-key="openActionMenuKey"
        :inline-rename="inlineRename"
        :mode="props.mode"
        :switching-file="switchingFile"
        @create-root-file="openRootCreateDialog('create-file')"
        @create-root-folder="openRootCreateDialog('create-folder')"
        @toggle-folder="toggleFolder"
        @toggle-action-menu="toggleActionMenu"
        @select-resource="requestSelectResource"
        @tree-action="requestTreeAction"
        @update-inline-rename="updateInlineRename"
        @submit-inline-rename="submitInlineRename"
        @cancel-inline-rename="cancelInlineRename"
        @clear-inline-rename-error="clearInlineRenameError"
      />

      <SkillContentViewer
        :selected-resource="selectedResource"
        :selected-file-name="selectedFileName"
        :is-editing="isEditing"
        :content-kind="contentKind"
        :editing-mode="editingMode"
        :draft-content="draftContent"
        :text-content="textContent"
        :content-loading="contentLoading"
        :content-error="contentError"
        :resource-url="resourceUrl"
        :rendered-markdown="renderedMarkdown"
        :can-edit-selected-file="canEditSelectedFile"
        :switching-file="switchingFile"
        @start-editing="startEditing"
        @cancel-editing="cancelEditing"
        @save-editing="saveEditing"
        @update-draft-content="updateDraftContent"
        @update-editing-mode="editingMode = $event"
      >
        <template v-if="$slots['visual-editor']" #visual-editor="slotProps">
          <slot name="visual-editor" v-bind="slotProps" />
        </template>
      </SkillContentViewer>
    </div>

    <SkillNameDialog
      v-if="nameDialog"
      :title="nameDialogTitle"
      :model-value="nameDialog.value"
      :error="nameDialog.error"
      :hint="nameDialog.action === 'create-file' ? '支持 .md、.txt、.json 文件' : undefined"
      @update:model-value="nameDialog.value = $event"
      @submit="submitNameDialog"
      @cancel="closeNameDialog"
    />
    <SkillDeleteDialog
      v-if="deleteDialog"
      :title="deleteDialog.action === 'delete-folder' ? '删除文件夹' : '删除文件'"
      :message="
        deleteDialog.action === 'delete-folder'
          ? `确定删除文件夹“${deleteDialog.row.name}”及其中的所有文件吗？`
          : `确定删除文件“${deleteDialog.row.name}”吗？`
      "
      @confirm="confirmDelete"
      @cancel="closeDeleteDialog"
    />
    <SkillFileSwitchDialog
      v-if="fileSwitchDialog"
      :current-file="fileSwitchDialog.currentFile"
      :next-file="fileSwitchDialog.nextFile"
      @decision="handleFileSwitchDecision"
    />
  </div>
</template>

<style lang="less" scoped>
@detail-divider-color: color-mix(in srgb, var(--tr-border-color-default) 55%, transparent);

.skill-extension-detail {
  min-width: 0;
  color: var(--tr-text-primary);
}

.skill-extension-detail__summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 8px 0 16px;
}

.skill-extension-detail__icon {
  box-sizing: border-box;
  display: grid;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 8px;
  color: var(--tr-text-primary);
}

.skill-extension-detail__icon svg {
  width: 16px;
  height: 16px;
}

.skill-extension-detail__action-button {
  flex: none;
}

.skill-extension-detail__action-button:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 2px;
}

.skill-extension-detail__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.skill-extension-detail__name {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  overflow-wrap: anywhere;
}

.skill-extension-detail__description,
.skill-extension-detail__updated-at {
  margin: 0;
  color: var(--tr-text-secondary);
  font-size: 14px;
  line-height: 22px;
  overflow-wrap: anywhere;
}

.skill-extension-detail__description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.skill-extension-detail__updated-at {
  color: var(--tr-text-tertiary);
}

.skill-extension-detail__browser {
  display: flex;
  box-sizing: border-box;
  min-height: var(
    --tr-skill-extension-detail-content-min-height,
    var(--tr-skill-extension-detail-content-height, 500px)
  );
  max-height: var(--tr-skill-extension-detail-content-max-height, 600px);
  overflow: hidden;
  border: 1px solid @detail-divider-color;
  border-radius: 8px;
  background: var(--tr-container-bg-default);
}

@media (max-width: 640px) {
  .skill-extension-detail__browser {
    min-height: 0;
    height: auto;
    max-height: none;
    flex-direction: column;
  }

  .skill-extension-detail__sidebar {
    flex: 0 0 auto;
    width: 100%;
    max-height: 180px;
    border-right: 0;
    border-bottom: 1px solid @detail-divider-color;
  }

  .skill-extension-detail__viewer {
    min-height: 320px;
  }

  .skill-extension-detail__content {
    padding: 16px;
  }
}
</style>
