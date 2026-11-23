import { computed, ref, watch, type ComputedRef } from 'vue'
import type { SkillDefinition } from '../skill-import-form/index.type'
import type { SkillFileSwitchDecision } from './index.type'
import {
  isEditTargetAvailable,
  updateTextContentDefinition,
  type SkillEditTarget,
  type SkillResource,
} from './skillFileOperations'
import { useSkillContent } from './useSkillContent'

export interface SkillFileSwitchDialogState {
  currentFile: string
  nextFile: string
}

interface PendingOperation {
  kind: 'select' | 'action'
  resourceId?: string | null
  execute?: () => void
}

interface UseSkillEditorOptions {
  mode: ComputedRef<'view' | 'edit' | undefined>
  currentDefinition: ComputedRef<SkillDefinition>
  resources: ComputedRef<SkillResource[]>
  onSave: (definition: SkillDefinition) => void
}

export function useSkillEditor(options: UseSkillEditorOptions) {
  const selectedResourceId = ref<string>()
  const selectedResource = computed(() =>
    options.resources.value.find((resource) => resource.resourceId === selectedResourceId.value),
  )
  const selectedFileName = computed(() => selectedResource.value?.path ?? 'SKILL.md')
  const content = useSkillContent({
    currentDefinition: options.currentDefinition,
    selectedResource,
  })

  const draftContent = ref('')
  const isEditing = ref(false)
  const editingMode = ref<'visual' | 'source'>('visual')
  const editTarget = ref<SkillEditTarget>()
  const switchingFile = ref(false)
  const fileSwitchDialog = ref<SkillFileSwitchDialogState>()
  const pendingOperation = ref<PendingOperation>()

  const canEditSelectedFile = computed(() => options.mode.value === 'edit')

  const isCurrentEditTarget = computed(() => {
    const target = editTarget.value
    if (!target) return false
    if (target.kind === 'skill') return selectedResourceId.value === undefined
    return selectedResourceId.value === target.resourceId && isEditTargetAvailable(target, options.resources.value)
  })

  const hasUnsavedChanges = computed(
    () => isEditing.value && isCurrentEditTarget.value && draftContent.value !== content.textContent.value,
  )

  const closeFileSwitchDialog = () => {
    fileSwitchDialog.value = undefined
    pendingOperation.value = undefined
    switchingFile.value = false
  }

  const resetEditing = () => {
    draftContent.value = content.textContent.value
    isEditing.value = false
    editTarget.value = undefined
  }

  const startEditing = () => {
    if (
      !canEditSelectedFile.value ||
      content.contentKind.value === 'binary' ||
      content.contentLoading.value ||
      content.contentError.value
    )
      return
    draftContent.value = content.textContent.value
    editingMode.value = content.contentKind.value === 'markdown' ? 'visual' : 'source'
    editTarget.value = selectedResource.value
      ? { kind: 'resource', resourceId: selectedResource.value.resourceId }
      : { kind: 'skill' }
    isEditing.value = true
  }

  const updateDraftContent = (value: string) => {
    if (isEditing.value) draftContent.value = value
  }

  const cancelEditing = () => {
    resetEditing()
  }

  const discardEditing = () => {
    resetEditing()
  }

  const saveEditing = () => {
    if (!canEditSelectedFile.value || !isCurrentEditTarget.value || !editTarget.value) {
      resetEditing()
      return false
    }

    const nextDefinition = updateTextContentDefinition(
      options.currentDefinition.value,
      editTarget.value,
      draftContent.value,
    )
    if (!nextDefinition) {
      resetEditing()
      return false
    }

    content.textContent.value = draftContent.value
    draftContent.value = content.textContent.value
    isEditing.value = false
    editTarget.value = undefined
    options.onSave(nextDefinition)
    return true
  }

  const selectResource = (resourceId: string | null) => {
    if ((selectedResourceId.value ?? null) === resourceId) return
    resetEditing()
    selectedResourceId.value = resourceId ?? undefined
  }

  const requestSelectResource = (resourceId: string | null) => {
    if (switchingFile.value || (selectedResourceId.value ?? null) === resourceId) return

    const nextFile = options.resources.value.find((resource) => resource.resourceId === resourceId)?.path ?? 'SKILL.md'
    if (hasUnsavedChanges.value) {
      switchingFile.value = true
      pendingOperation.value = { kind: 'select', resourceId }
      fileSwitchDialog.value = {
        currentFile: selectedFileName.value,
        nextFile,
      }
      return
    }

    selectResource(resourceId)
  }

  const requestTreeAction = (nextFile: string, execute: () => void) => {
    if (options.mode.value !== 'edit' || switchingFile.value) return
    if (hasUnsavedChanges.value) {
      switchingFile.value = true
      pendingOperation.value = { kind: 'action', execute }
      fileSwitchDialog.value = {
        currentFile: selectedFileName.value,
        nextFile,
      }
      return
    }

    execute()
  }

  const handleFileSwitchDecision = (decision: SkillFileSwitchDecision) => {
    const pending = pendingOperation.value
    if (!pending || !fileSwitchDialog.value) return

    if (decision === 'cancel') {
      closeFileSwitchDialog()
      return
    }

    const completed = decision === 'save' ? saveEditing() : (discardEditing(), true)
    closeFileSwitchDialog()
    if (!completed) return

    if (pending.kind === 'action') pending.execute?.()
    else selectResource(pending.resourceId ?? null)
  }

  const handleResourceStateChange = () => {
    const selectedResourceStillExists =
      !selectedResourceId.value ||
      options.resources.value.some((resource) => resource.resourceId === selectedResourceId.value)
    const editTargetStillExists = isEditTargetAvailable(editTarget.value, options.resources.value)

    if (!selectedResourceStillExists || !editTargetStillExists) {
      if (!selectedResourceStillExists) selectedResourceId.value = undefined
      resetEditing()
      closeFileSwitchDialog()
    }
  }

  watch(
    [() => options.resources.value.map((resource) => resource.resourceId).join('\u0000'), () => options.mode.value],
    ([, mode]) => {
      if (mode !== 'edit') {
        resetEditing()
        closeFileSwitchDialog()
      }
      handleResourceStateChange()
    },
  )

  return {
    selectedResourceId,
    selectedResource,
    selectedFileName,
    ...content,
    draftContent,
    isEditing,
    editingMode,
    canEditSelectedFile,
    hasUnsavedChanges,
    switchingFile,
    fileSwitchDialog,
    startEditing,
    updateDraftContent,
    cancelEditing,
    saveEditing,
    selectResource,
    requestSelectResource,
    requestTreeAction,
    handleFileSwitchDecision,
    closeFileSwitchDialog,
    resetEditing,
  }
}
