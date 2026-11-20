import { ref, type ComputedRef, type Ref } from 'vue'
import type { SkillResourceDescriptor } from '../skill-import-form/index.type'
import type { SkillFileSwitchDecision } from './index.type'
import type { SkillFileNode, SkillFolderNode } from './useSkillFileTree'
import type { SkillTreeAction } from './useSkillFileActions'

export interface SkillFileSwitchDialogState {
  currentFile: string
  nextFile: string
  resourceId: string | null
}

interface PendingTreeAction {
  action: SkillTreeAction
  row: SkillFileNode | SkillFolderNode
}

interface UseSkillFileNavigationOptions {
  mode: ComputedRef<'view' | 'edit' | undefined>
  selectedResourceId: Ref<string | undefined>
  selectedResource: ComputedRef<SkillResourceDescriptor | undefined>
  resources: ComputedRef<SkillResourceDescriptor[]>
  openActionMenuKey: Ref<string | undefined>
  isEditing: Ref<boolean>
  draftContent: Ref<string>
  textContent: Ref<string>
  hasUnsavedChanges: ComputedRef<boolean>
  saveEditing: () => void
  selectResource: (resourceId: string | null) => void
  handleTreeAction: (action: SkillTreeAction, row: SkillFileNode | SkillFolderNode) => void
  getTreeActionLabel: (action: SkillTreeAction, row: SkillFileNode | SkillFolderNode) => string
}

export function useSkillFileNavigation(options: UseSkillFileNavigationOptions) {
  const switchingFile = ref(false)
  const fileSwitchDialog = ref<SkillFileSwitchDialogState>()
  const pendingTreeAction = ref<PendingTreeAction>()

  const closeFileSwitchDialog = () => {
    fileSwitchDialog.value = undefined
    pendingTreeAction.value = undefined
    switchingFile.value = false
  }

  const requestTreeAction = (action: SkillTreeAction, row: SkillFileNode | SkillFolderNode) => {
    if (options.mode.value !== 'edit' || switchingFile.value) return
    options.openActionMenuKey.value = undefined

    if (options.hasUnsavedChanges.value) {
      pendingTreeAction.value = { action, row }
      switchingFile.value = true
      fileSwitchDialog.value = {
        currentFile: options.selectedResource.value?.path ?? 'SKILL.md',
        nextFile: options.getTreeActionLabel(action, row),
        resourceId: options.selectedResourceId.value ?? null,
      }
      return
    }

    options.handleTreeAction(action, row)
  }

  const handleFileSwitchDecision = (decision: SkillFileSwitchDecision) => {
    const pendingSwitch = fileSwitchDialog.value
    const pendingAction = pendingTreeAction.value
    if (!pendingSwitch) return

    if (decision === 'cancel') {
      closeFileSwitchDialog()
      return
    }

    if (decision === 'save') options.saveEditing()
    else {
      options.draftContent.value = options.textContent.value
      options.isEditing.value = false
    }

    fileSwitchDialog.value = undefined
    pendingTreeAction.value = undefined
    switchingFile.value = false

    if (pendingAction) {
      options.handleTreeAction(pendingAction.action, pendingAction.row)
      return
    }

    options.selectResource(pendingSwitch.resourceId)
  }

  const requestSelectResource = (resourceId: string | null) => {
    if (switchingFile.value) return

    const currentResourceId = options.selectedResourceId.value ?? null
    if (resourceId === currentResourceId) return

    if (options.hasUnsavedChanges.value) {
      const currentFile = options.selectedResource.value?.path ?? 'SKILL.md'
      const nextFile =
        options.resources.value.find((resource) => resource.resourceId === resourceId)?.path ?? 'SKILL.md'

      switchingFile.value = true
      fileSwitchDialog.value = { currentFile, nextFile, resourceId }
      return
    }

    options.isEditing.value = false
    options.selectResource(resourceId)
  }

  return {
    switchingFile,
    fileSwitchDialog,
    closeFileSwitchDialog,
    requestTreeAction,
    handleFileSwitchDecision,
    requestSelectResource,
  }
}
