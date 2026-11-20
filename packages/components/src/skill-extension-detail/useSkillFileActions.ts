import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { SkillDefinition } from '../skill-import-form/index.type'
import type { SkillFileAction } from './index.type'
import {
  getParentPath,
  hasSupportedSkillTextExtension,
  normalizePath,
  type SkillFileNode,
  type SkillFolderNode,
} from './useSkillFileTree'

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

type SkillResource = NonNullable<SkillDefinition['resources']>[number]

interface UseSkillFileActionsOptions {
  mode: ComputedRef<'view' | 'edit' | undefined>
  currentDefinition: ComputedRef<SkillDefinition>
  resources: ComputedRef<SkillResource[]>
  directories: ComputedRef<string[]>
  selectedResourceId: Ref<string | undefined>
  selectedResource: ComputedRef<SkillResource | undefined>
  collapsedFolders: Ref<Set<string>>
  isEditing: Ref<boolean>
  draftContent: Ref<string>
  textContent: Ref<string>
  createResourceId: (path: string) => string
  isPathTaken: (path: string, ignoredPath?: string) => boolean
  onSave: (definition: SkillDefinition) => void
  onFileAction: (action: SkillFileAction) => void
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

  const saveDefinition = (definition: SkillDefinition) => {
    options.onSave(definition)
  }

  const emitResourceDefinition = (
    nextResources: SkillDefinition['resources'],
    nextDirectories: string[] = options.directories.value,
  ) => {
    const resourceDirectories = new Set<string>()
    for (const resource of nextResources ?? []) {
      let parentPath = getParentPath(resource.path)
      while (parentPath) {
        resourceDirectories.add(parentPath)
        parentPath = getParentPath(parentPath)
      }
    }

    const normalizedDirectories = [...new Set(nextDirectories.map(normalizePath).filter(Boolean))]
      .filter((directory) => !resourceDirectories.has(directory))
      .sort()
    saveDefinition({
      ...options.currentDefinition.value,
      resources: nextResources,
      directories: normalizedDirectories.length ? normalizedDirectories : undefined,
    })
  }

  const updateResourcePath = (resource: SkillResource, path: string) => ({
    ...resource,
    path,
  })

  const clearSelectionIfPathMatches = (path: string, includeChildren = false) => {
    const selectedPath = options.selectedResource.value?.path
    if (!selectedPath) return

    const normalizedPath = normalizePath(path)
    const normalizedSelectedPath = normalizePath(selectedPath)
    if (
      normalizedSelectedPath === normalizedPath ||
      (includeChildren && normalizedSelectedPath.startsWith(normalizedPath + '/'))
    ) {
      options.selectedResourceId.value = undefined
      options.isEditing.value = false
    }
  }

  const selectResource = (resourceId: string | null) => {
    openActionMenuKey.value = undefined
    options.selectedResourceId.value = resourceId ?? undefined
  }

  const toggleActionMenu = (rowKey: string) => {
    openActionMenuKey.value = openActionMenuKey.value === rowKey ? undefined : rowKey
  }

  const startInlineRename = (row: SkillFileNode | SkillFolderNode) => {
    inlineRename.value = {
      row,
      value: row.name,
      error: '',
    }
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
    nameDialog.value = {
      action,
      row,
      value: '',
      error: '',
    }
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
    const normalizedPath = normalizePath(currentPath)
    const nextResources = options.resources.value.filter((resource) => {
      const resourcePath = normalizePath(resource.path)
      return resourcePath !== normalizedPath && (!isFolder || !resourcePath.startsWith(normalizedPath + '/'))
    })
    const parentPath = getParentPath(currentPath)
    const nextDirectories = parentPath ? [...options.directories.value, parentPath] : options.directories.value

    if (isFolder) {
      const directoriesAfterDelete = nextDirectories.filter(
        (folderPath) =>
          normalizePath(folderPath) !== normalizedPath && !normalizePath(folderPath).startsWith(normalizedPath + '/'),
      )
      emitResourceDefinition(nextResources, directoriesAfterDelete)
    } else {
      emitResourceDefinition(nextResources, nextDirectories)
    }

    clearSelectionIfPathMatches(currentPath, isFolder)
    closeDeleteDialog()
    options.onFileAction({ type: action, target: isFolder ? 'folder' : 'file', path: currentPath })
  }

  const handleTreeAction = (action: SkillTreeAction, row: SkillFileNode | SkillFolderNode, providedName?: string) => {
    if (options.mode.value !== 'edit') return
    openActionMenuKey.value = undefined

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
        emitResourceDefinition(options.resources.value, [...options.directories.value, path])
        options.onFileAction({ type: action, target: 'folder', path })
        options.collapsedFolders.value = new Set(
          [...options.collapsedFolders.value].filter((folderKey) => folderKey !== 'folder:' + row.path),
        )
        return
      }

      const resource: SkillResource = {
        path,
        kind: 'text',
        resourceId: options.createResourceId(path),
        text: '',
      }
      options.onFileAction({ type: action, target: 'file', path })
      emitResourceDefinition([...options.resources.value, resource])
      options.draftContent.value = ''
      options.textContent.value = ''
      options.isEditing.value = false
      selectResource(resource.resourceId)
      return
    }

    const currentPath = row.path
    const isFolder = row.type === 'folder'
    const actionTarget = isFolder ? 'folder' : 'file'

    if (action === 'delete-file' || action === 'delete-folder') {
      if (action === 'delete-file' && isFolder) return
      if (action === 'delete-folder' && !isFolder) return
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

    if (isFolder) {
      const normalizedPath = normalizePath(currentPath)
      const nextResources = options.resources.value.map((resource) => {
        const resourcePath = normalizePath(resource.path)
        if (resourcePath === normalizedPath) return updateResourcePath(resource, nextPath)
        if (resourcePath.startsWith(normalizedPath + '/')) {
          return updateResourcePath(resource, nextPath + resourcePath.slice(normalizedPath.length))
        }
        return resource
      })
      const nextDirectories = options.directories.value.map((folderPath) => {
        const folderPathValue = normalizePath(folderPath)
        if (folderPathValue === normalizedPath) return nextPath
        if (folderPathValue.startsWith(normalizedPath + '/')) {
          return nextPath + folderPathValue.slice(normalizedPath.length)
        }
        return folderPath
      })
      emitResourceDefinition(nextResources, nextDirectories)
    } else {
      emitResourceDefinition(
        options.resources.value.map((resource) =>
          normalizePath(resource.path) === normalizePath(currentPath)
            ? updateResourcePath(resource, nextPath)
            : resource,
        ),
      )
    }

    options.onFileAction({ type: 'rename', target: actionTarget, path: currentPath, nextPath })
  }

  const submitInlineRename = () => {
    const draft = inlineRename.value
    if (!draft) return

    const name = draft.value.trim()
    if (!name || !/^[A-Za-z0-9_.-]+$/.test(name) || name === '.' || name === '..') {
      draft.error = '名称只能包含英文字母、数字、下划线、中划线和点号。'
      return
    }
    if (draft.row.type === 'file' && draft.row.resource.kind === 'text' && !hasSupportedSkillTextExtension(name)) {
      draft.error = '仅支持 .md、.txt、.json 文件。'
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
    if (!name || !/^[A-Za-z0-9_.-]+$/.test(name) || name === '.' || name === '..') {
      dialog.error = '名称只能包含英文字母、数字、下划线、中划线和点号。'
      return
    }
    if (dialog.action === 'create-file' && !hasSupportedSkillTextExtension(name)) {
      dialog.error = '仅支持 .md、.txt、.json 文件。'
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
    selectResource,
  }
}
