import { computed, ref, type ComputedRef } from 'vue'
import type { SkillDefinition, SkillResourceDescriptor } from '../skill-import-form/index.type'

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

export const normalizePath = (path: string) => path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')

export const getParentPath = (path: string) => {
  const normalizedPath = normalizePath(path)
  const separatorIndex = normalizedPath.lastIndexOf('/')
  return separatorIndex === -1 ? '' : normalizedPath.slice(0, separatorIndex)
}

export const hasSupportedSkillTextExtension = (name: string) => {
  const extension = name.slice(name.lastIndexOf('.')).toLowerCase()
  return ['.md', '.txt', '.json'].includes(extension)
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
  const selectedResourceId = ref<string>()
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
  const selectedResource = computed(() =>
    resources.value.find((resource) => resource.resourceId === selectedResourceId.value),
  )
  const selectedFileName = computed(() => selectedResource.value?.path ?? 'SKILL.md')
  const resourceFolderPaths = computed(() => {
    const paths = new Set<string>()

    for (const resource of resources.value) {
      let parentPath = getParentPath(resource.path)
      while (parentPath) {
        paths.add(parentPath)
        parentPath = getParentPath(parentPath)
      }
    }

    return paths
  })

  const createResourceId = (path: string) => {
    const resourceIds = new Set(resources.value.map((resource) => resource.resourceId))
    if (!resourceIds.has(path)) return path

    let index = 1
    let resourceId = `${path}#${index}`
    while (resourceIds.has(resourceId)) {
      index += 1
      resourceId = `${path}#${index}`
    }
    return resourceId
  }

  const isPathTaken = (path: string, ignoredPath?: string) => {
    const normalizedPath = normalizePath(path)
    const normalizedIgnoredPath = ignoredPath ? normalizePath(ignoredPath) : undefined
    if (normalizedPath.toLowerCase() === 'skill.md' && normalizedIgnoredPath?.toLowerCase() !== 'skill.md') {
      return true
    }

    return (
      resources.value.some(
        (resource) =>
          normalizePath(resource.path) === normalizedPath && normalizePath(resource.path) !== normalizedIgnoredPath,
      ) ||
      [...resourceFolderPaths.value].some(
        (folderPath) => folderPath === normalizedPath && folderPath !== normalizedIgnoredPath,
      ) ||
      directories.value.some(
        (folderPath) =>
          normalizePath(folderPath) === normalizedPath && normalizePath(folderPath) !== normalizedIgnoredPath,
      )
    )
  }

  return {
    selectedResourceId,
    collapsedFolders,
    resources,
    directories,
    treeRows,
    selectedResource,
    selectedFileName,
    createResourceId,
    isPathTaken,
  }
}
