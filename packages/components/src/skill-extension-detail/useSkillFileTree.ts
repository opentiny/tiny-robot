import { computed, ref, type ComputedRef } from 'vue'
import type { SkillDefinition, SkillResourceDescriptor } from '../skill-import-form/index.type'
import { isSkillPathTaken, normalizePath } from './skillFileOperations'

export { getParentPath, hasSupportedSkillTextExtension, normalizePath } from './skillFileOperations'

export interface SkillFileNode {
  type: 'file'
  key: string
  name: string
  path: string
  depth: number
  resource: SkillResourceDescriptor
}

export interface SkillFolderNode {
  type: 'folder'
  key: string
  name: string
  path: string
  depth: number
  children: SkillTreeNode[]
}

export type SkillTreeNode = SkillFileNode | SkillFolderNode
export type SkillTreeRow = SkillTreeNode | { type: 'skill'; key: 'skill'; name: 'SKILL.md'; depth: 0 }
export type SkillTreeAction = 'create-file' | 'create-folder' | 'delete-file' | 'delete-folder' | 'rename'

export interface SkillInlineRenameState {
  row: SkillFileNode | SkillFolderNode
  value: string
  error: string
}

export const rootFolder: SkillFolderNode = {
  type: 'folder',
  key: 'folder:root',
  name: '根目录',
  path: '',
  depth: -1,
  children: [],
}

const makeResourceTree = (items: SkillResourceDescriptor[], extraFolders: string[] = []): SkillTreeNode[] => {
  const root: SkillTreeNode[] = []

  const ensureFolder = (folderPath: string) => {
    const segments = normalizePath(folderPath).split('/').filter(Boolean)
    let siblings = root
    let parentPath = ''

    for (const [index, segment] of segments.entries()) {
      const path = parentPath ? `${parentPath}/${segment}` : segment
      let folder = siblings.find((node): node is SkillFolderNode => node.type === 'folder' && node.path === path)
      if (!folder) {
        folder = { type: 'folder', key: `folder:${path}`, name: segment, path, depth: index, children: [] }
        siblings.push(folder)
      }
      parentPath = path
      siblings = folder.children
    }
  }

  extraFolders.forEach(ensureFolder)

  for (const resource of items) {
    const segments = normalizePath(resource.path).split('/').filter(Boolean)
    if (segments.length === 0) segments.push(resource.resourceId)

    let siblings = root
    let parentPath = ''
    for (const [index, segment] of segments.entries()) {
      const path = parentPath ? `${parentPath}/${segment}` : segment
      if (index === segments.length - 1) {
        siblings.push({
          type: 'file',
          key: `file:${resource.resourceId}`,
          name: segment,
          path: resource.path,
          depth: index,
          resource,
        })
        continue
      }

      let folder = siblings.find((node): node is SkillFolderNode => node.type === 'folder' && node.path === path)
      if (!folder) {
        folder = { type: 'folder', key: `folder:${path}`, name: segment, path, depth: index, children: [] }
        siblings.push(folder)
      }
      parentPath = path
      siblings = folder.children
    }
  }

  const sortNodes = (nodes: SkillTreeNode[]) => {
    nodes.sort((left, right) => {
      if (left.type !== right.type) return left.type === 'folder' ? -1 : 1
      return left.name.localeCompare(right.name)
    })
    for (const node of nodes) if (node.type === 'folder') sortNodes(node.children)
  }
  sortNodes(root)
  return root
}

export function useSkillFileTree(currentDefinition: ComputedRef<SkillDefinition>) {
  const collapsedFolders = ref(new Set<string>())
  const resources = computed(() => currentDefinition.value.resources ?? [])
  const directories = computed(() => currentDefinition.value.directories ?? [])
  const resourceTree = computed(() => makeResourceTree(resources.value, directories.value))
  const treeRows = computed<SkillTreeRow[]>(() => {
    const rows: SkillTreeRow[] = [{ type: 'skill', key: 'skill', name: 'SKILL.md', depth: 0 }]
    const appendVisible = (nodes: SkillTreeNode[]) => {
      for (const node of nodes) {
        rows.push(node)
        if (node.type === 'folder' && !collapsedFolders.value.has(node.key)) appendVisible(node.children)
      }
    }
    appendVisible(resourceTree.value)
    return rows
  })
  const toggleFolder = (folderKey: string) => {
    const next = new Set(collapsedFolders.value)
    if (next.has(folderKey)) next.delete(folderKey)
    else next.add(folderKey)
    collapsedFolders.value = next
  }

  const expandFolder = (folderPath: string) => {
    const next = new Set(collapsedFolders.value)
    next.delete('folder:' + normalizePath(folderPath))
    collapsedFolders.value = next
  }

  const resetCollapsedFolders = () => {
    collapsedFolders.value = new Set()
  }

  const isPathTaken = (path: string, ignoredPath?: string) =>
    isSkillPathTaken(path, resources.value, directories.value, ignoredPath)

  return {
    collapsedFolders,
    resources,
    directories,
    treeRows,
    toggleFolder,
    expandFolder,
    resetCollapsedFolders,
    isPathTaken,
  }
}
