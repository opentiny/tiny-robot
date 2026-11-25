import { computed, ref, type ComputedRef } from 'vue'
import type { SkillDefinition } from '../skill-import-form/index.type'
import type { SkillFileAction } from './index.type'
import {
  createTextResourceDefinition,
  deletePathDefinition,
  getParentPath,
  normalizePath,
  renamePathDefinition,
  validateSkillEntryName,
  withResources,
  type SkillResource,
} from './skillFileOperations'
import type { SkillFileNode, SkillFolderNode } from './useSkillFileTree'

export type SkillTreeAction = SkillFileAction['type']
export type SkillNameAction = 'create-file' | 'create-folder'

export interface SkillNameDialogState {
  action: SkillNameAction
  row: SkillFileNode | SkillFolderNode
  value: string
  error: string
}

export interface SkillDeleteDialogState {
  action: 'delete-file' | 'delete-folder'
  row: SkillFileNode | SkillFolderNode
}

interface UseSkillFileActionsOptions {
  mode: ComputedRef<'view' | 'edit' | undefined>
  currentDefinition: ComputedRef<SkillDefinition>
  resources: ComputedRef<SkillResource[]>
  directories: ComputedRef<string[]>
  isPathTaken: (path: string, ignoredPath?: string) => boolean
  expandFolder: (path: string) => void
  onSave: (definition: SkillDefinition) => void
  onFileAction: (action: SkillFileAction) => void
  onResourceCreated: (resourceId: string) => void
}

export function useSkillFileActions(options: UseSkillFileActionsOptions) {
  const openActionMenuKey = ref<string>()
  const inlineRename = ref<{
    row: SkillFileNode | SkillFolderNode
    value: string
    error: string
  }>()
  const nameDialog = ref<SkillNameDialogState>()
  const deleteDialog = ref<SkillDeleteDialogState>()

  const nameDialogTitle = computed(() => {
    if (!nameDialog.value) return ''
    return nameDialog.value.action === 'create-folder' ? '新增文件夹' : '新增文件'
  })

  const closeActionMenu = () => {
    openActionMenuKey.value = undefined
  }

  const toggleActionMenu = (rowKey: string) => {
    openActionMenuKey.value = openActionMenuKey.value === rowKey ? undefined : rowKey
  }

  const startInlineRename = (row: SkillFileNode | SkillFolderNode) => {
    inlineRename.value = { row, value: row.name, error: '' }
  }

  const cancelInlineRename = () => {
    inlineRename.value = undefined
  }

  const clearInlineRenameError = () => {
    if (inlineRename.value) inlineRename.value.error = ''
  }

  const updateInlineRename = (value: string) => {
    if (inlineRename.value) inlineRename.value.value = value
  }

  const closeNameDialog = () => {
    nameDialog.value = undefined
  }

  const openNameDialog = (action: SkillNameAction, row: SkillFileNode | SkillFolderNode) => {
    nameDialog.value = { action, row, value: '', error: '' }
  }

  const closeDeleteDialog = () => {
    deleteDialog.value = undefined
  }

  const confirmDelete = () => {
    if (options.mode.value !== 'edit') return
    const pendingDelete = deleteDialog.value
    if (!pendingDelete) return

    const { action, row } = pendingDelete
    const currentPath = row.path
    const isFolder = action === 'delete-folder'
    options.onSave(deletePathDefinition(options.currentDefinition.value, currentPath, isFolder))
    closeDeleteDialog()
    options.onFileAction({ type: action, target: isFolder ? 'folder' : 'file', path: currentPath })
  }

  const handleTreeAction = (action: SkillTreeAction, row: SkillFileNode | SkillFolderNode, providedName?: string) => {
    if (options.mode.value !== 'edit') return
    closeActionMenu()

    if (action === 'create-folder' || action === 'create-file') {
      if (row.type !== 'folder') return
      if (!providedName) {
        openNameDialog(action, row)
        return
      }

      const path = normalizePath(row.path + '/' + providedName)
      if (options.isPathTaken(path)) {
        window.alert('该名称已存在。')
        return
      }

      if (action === 'create-folder') {
        options.onSave(
          withResources(options.currentDefinition.value, options.resources.value, [...options.directories.value, path]),
        )
        options.expandFolder(row.path)
        options.onFileAction({ type: action, target: 'folder', path })
        return
      }

      const created = createTextResourceDefinition(options.currentDefinition.value, path)
      options.onSave(created.definition)
      options.onFileAction({ type: action, target: 'file', path })
      options.onResourceCreated(created.resource.resourceId)
      return
    }

    const currentPath = row.path
    const isFolder = row.type === 'folder'
    const actionTarget = isFolder ? 'folder' : 'file'

    if (action === 'delete-file' || action === 'delete-folder') {
      if ((action === 'delete-file' && isFolder) || (action === 'delete-folder' && !isFolder)) return
      deleteDialog.value = { action, row }
      return
    }

    if (!providedName) {
      startInlineRename(row)
      return
    }

    const nextPath = normalizePath(getParentPath(currentPath) + '/' + providedName)
    if (nextPath === normalizePath(currentPath)) return
    if (options.isPathTaken(nextPath, currentPath)) {
      window.alert('该名称已存在。')
      return
    }

    options.onSave(renamePathDefinition(options.currentDefinition.value, currentPath, nextPath, isFolder))
    options.onFileAction({ type: 'rename', target: actionTarget, path: currentPath, nextPath })
  }

  const submitInlineRename = () => {
    const draft = inlineRename.value
    if (!draft) return

    const name = draft.value.trim()
    const error = validateSkillEntryName(name, {
      kind: draft.row.type === 'file' ? 'file' : 'folder',
      action: 'rename',
      resourceKind: draft.row.type === 'file' ? draft.row.resource.kind : undefined,
    })
    if (error) {
      draft.error = error
      return
    }

    const nextPath = normalizePath(getParentPath(draft.row.path) + '/' + name)
    if (options.isPathTaken(nextPath, draft.row.path)) {
      draft.error = '该名称已存在。'
      return
    }

    inlineRename.value = undefined
    handleTreeAction('rename', draft.row, name)
  }

  const submitNameDialog = () => {
    const dialog = nameDialog.value
    if (!dialog) return

    const name = dialog.value.trim()
    const error = validateSkillEntryName(name, {
      kind: dialog.action === 'create-file' ? 'file' : 'folder',
      action: 'create',
    })
    if (error) {
      dialog.error = error
      return
    }

    const path = normalizePath(dialog.row.path + '/' + name)
    if (options.isPathTaken(path)) {
      dialog.error = '该名称已存在。'
      return
    }

    const { action, row } = dialog
    nameDialog.value = undefined
    handleTreeAction(action, row, name)
  }

  const getTreeActionLabel = (action: SkillTreeAction, row: SkillFileNode | SkillFolderNode) => {
    const target = row.path || '根目录'
    if (action === 'create-file') return `新建文件（${target}）`
    if (action === 'create-folder') return `新建文件夹（${target}）`
    if (action === 'delete-file') return `删除文件“${target}”`
    if (action === 'delete-folder') return `删除文件夹“${target}”`
    return `重命名“${target}”`
  }

  return {
    openActionMenuKey,
    inlineRename,
    nameDialog,
    deleteDialog,
    nameDialogTitle,
    closeActionMenu,
    toggleActionMenu,
    startInlineRename,
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
  }
}
