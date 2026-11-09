<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { IconAddFile, IconAddFolder, IconFile, IconFolder, IconMore, IconSkill } from '@opentiny/tiny-robot-svgs'
import { TinyButton } from '@opentiny/vue'
import type { SkillDefinition, SkillResourceDescriptor } from '../skill-import-form/index.type'
import { useStableId } from '../shared/composables'
import { getMarkdownItAndDompurify } from '../bubble/utils'
import type {
  SkillExtensionDetailEmits,
  SkillExtensionDetailProps,
  SkillExtensionDetailSlots,
  SkillFileAction,
  SkillFileSwitchDecision,
} from './index.type'
import SkillDeleteDialog from './SkillDeleteDialog.vue'
import SkillFileSwitchDialog from './SkillFileSwitchDialog.vue'
import SkillMarkdownEditor from './SkillMarkdownEditor.vue'
import SkillNameDialog from './SkillNameDialog.vue'

defineOptions({ name: 'SkillExtensionDetail' })

const props = defineProps<SkillExtensionDetailProps>()
const emit = defineEmits<SkillExtensionDetailEmits>()
defineSlots<SkillExtensionDetailSlots>()
const localDefinition = shallowRef<SkillDefinition | null>(null)
const currentDefinition = computed(() => localDefinition.value ?? props.definition)
const draftContent = ref('')
const isEditing = ref(false)
const contentKind = ref<'markdown' | 'text' | 'binary'>('markdown')
const editingMode = ref<'visual' | 'source'>('visual')
const switchingFile = ref(false)
const openActionMenuKey = ref<string>()
const customFolderPaths = ref<string[]>([])
const nameDialog = ref<NameDialogState>()
const deleteDialog = ref<DeleteDialogState>()
const fileSwitchDialog = ref<{
  currentFile: string
  nextFile: string
  resourceId: string | null
}>()
const pendingTreeAction = ref<PendingTreeAction>()

const supportedSkillTextExtensions = ['.md', '.txt', '.json'] as const

interface SkillFileNode {
  type: 'file'
  key: string
  name: string
  path: string
  depth: number
  resource: SkillResourceDescriptor
}

interface SkillFolderNode {
  type: 'folder'
  key: string
  name: string
  path: string
  depth: number
  children: SkillTreeNode[]
}

type SkillTreeNode = SkillFileNode | SkillFolderNode
type SkillTreeRow = SkillTreeNode | { type: 'skill'; key: 'skill'; name: 'SKILL.md'; depth: 0 }
type TreeAction = 'create-file' | 'create-folder' | 'delete-file' | 'delete-folder' | 'rename'
type NameAction = 'create-file' | 'create-folder' | 'rename'

interface NameDialogState {
  action: NameAction
  row: SkillFileNode | SkillFolderNode
  value: string
  error: string
}

interface DeleteDialogState {
  action: 'delete-file' | 'delete-folder'
  row: SkillFileNode | SkillFolderNode
}

interface PendingTreeAction {
  action: TreeAction
  row: SkillFileNode | SkillFolderNode
}

const rootFolder: SkillFolderNode = {
  type: 'folder',
  key: 'folder:root',
  name: '根目录',
  path: '',
  depth: -1,
  children: [],
}

const selectedResourceId = ref<string>()
const collapsedFolders = ref(new Set<string>())
const fileTreeId = `skill-extension-detail-${useStableId()}-files`
const resources = computed(() => currentDefinition.value.resources ?? [])

const makeResourceTree = (items: SkillResourceDescriptor[], extraFolders: string[] = []): SkillTreeNode[] => {
  const root: SkillTreeNode[] = []

  const ensureFolder = (folderPath: string) => {
    const segments = folderPath.replace(/\\/g, '/').split('/').filter(Boolean)
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
    const segments = resource.path.replace(/\\/g, '/').split('/').filter(Boolean)
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

const resourceTree = computed(() => makeResourceTree(resources.value, customFolderPaths.value))
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
const canEditSelectedFile = computed(() => props.mode === 'edit')
const textContent = ref('')
const contentLoading = ref(false)
const contentError = ref(false)
const resourceUrl = ref('')
const markdownRuntime = shallowRef<Awaited<ReturnType<typeof getMarkdownItAndDompurify>>>(null)
let readGeneration = 0

const renderedMarkdown = computed(() => {
  if (!markdownRuntime.value || contentKind.value !== 'markdown') return ''
  const rendered = markdownRuntime.value.markdown({ html: false, linkify: true }).render(textContent.value)
  return markdownRuntime.value.dompurify.sanitize(rendered)
})

const isMarkdownFile = (path: string) => /\.(md|markdown|mdx)$/i.test(path)

const releaseResourceUrl = () => {
  if (!resourceUrl.value) return
  URL.revokeObjectURL(resourceUrl.value)
  resourceUrl.value = ''
}

const toggleFolder = (folderKey: string) => {
  openActionMenuKey.value = undefined
  const next = new Set(collapsedFolders.value)
  if (next.has(folderKey)) next.delete(folderKey)
  else next.add(folderKey)
  collapsedFolders.value = next
}

const toggleActionMenu = (rowKey: string) => {
  openActionMenuKey.value = openActionMenuKey.value === rowKey ? undefined : rowKey
}

const normalizePath = (path: string) => path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')

const getParentPath = (path: string) => {
  const normalizedPath = normalizePath(path)
  const separatorIndex = normalizedPath.lastIndexOf('/')
  return separatorIndex === -1 ? '' : normalizedPath.slice(0, separatorIndex)
}

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

const isPathTaken = (path: string, ignoredPath?: string) => {
  const normalizedPath = normalizePath(path)
  const normalizedIgnoredPath = ignoredPath ? normalizePath(ignoredPath) : undefined
  return (
    resources.value.some(
      (resource) =>
        normalizePath(resource.path) === normalizedPath && normalizePath(resource.path) !== normalizedIgnoredPath,
    ) ||
    [...resourceFolderPaths.value].some(
      (folderPath) => folderPath === normalizedPath && folderPath !== normalizedIgnoredPath,
    ) ||
    customFolderPaths.value.some(
      (folderPath) =>
        normalizePath(folderPath) === normalizedPath && normalizePath(folderPath) !== normalizedIgnoredPath,
    )
  )
}

const hasSupportedTextExtension = (name: string) => {
  const extension = name.slice(name.lastIndexOf('.')).toLowerCase()
  return supportedSkillTextExtensions.includes(extension as (typeof supportedSkillTextExtensions)[number])
}

const nameDialogTitle = computed(() => {
  if (!nameDialog.value) return ''
  if (nameDialog.value.action === 'create-folder') return '新增文件夹'
  if (nameDialog.value.action === 'create-file') return '新增文件'
  return '重命名'
})

const closeNameDialog = () => {
  nameDialog.value = undefined
}

const openNameDialog = (action: NameAction, row: SkillFileNode | SkillFolderNode) => {
  nameDialog.value = {
    action,
    row,
    value: action === 'rename' ? row.name : '',
    error: '',
  }
}

const openRootCreateDialog = (action: 'create-file' | 'create-folder') => {
  requestTreeAction(action, rootFolder)
}

const emitResourceDefinition = (nextResources: SkillResourceDescriptor[]) => {
  const definition = { ...currentDefinition.value, resources: nextResources }
  localDefinition.value = definition
  emit('save', definition)
}

const emitFileAction = (action: SkillFileAction) => {
  emit('file-action', action)
}

const updateResourcePath = (resource: SkillResourceDescriptor, path: string): SkillResourceDescriptor => ({
  ...resource,
  path,
})

const clearSelectionIfPathMatches = (path: string, includeChildren = false) => {
  const selectedPath = selectedResource.value?.path
  if (!selectedPath) return
  const normalizedPath = normalizePath(path)
  const normalizedSelectedPath = normalizePath(selectedPath)
  if (
    normalizedSelectedPath === normalizedPath ||
    (includeChildren && normalizedSelectedPath.startsWith(`${normalizedPath}/`))
  ) {
    selectedResourceId.value = undefined
    isEditing.value = false
  }
}

const closeDeleteDialog = () => {
  deleteDialog.value = undefined
}

const confirmDelete = () => {
  if (props.mode !== 'edit') return
  const pendingDelete = deleteDialog.value
  if (!pendingDelete) return

  const { action, row } = pendingDelete
  const currentPath = row.path
  const isFolder = action === 'delete-folder'
  const normalizedPath = normalizePath(currentPath)
  const nextResources = resources.value.filter((resource) => {
    const resourcePath = normalizePath(resource.path)
    return resourcePath !== normalizedPath && (!isFolder || !resourcePath.startsWith(`${normalizedPath}/`))
  })
  if (isFolder) {
    customFolderPaths.value = customFolderPaths.value.filter(
      (folderPath) =>
        normalizePath(folderPath) !== normalizedPath && !normalizePath(folderPath).startsWith(`${normalizedPath}/`),
    )
  }
  clearSelectionIfPathMatches(currentPath, isFolder)
  closeDeleteDialog()
  emitFileAction({ type: action, target: isFolder ? 'folder' : 'file', path: currentPath })
  emitResourceDefinition(nextResources)
}

const handleTreeAction = (action: TreeAction, row: SkillFileNode | SkillFolderNode, providedName?: string) => {
  if (props.mode !== 'edit') return
  openActionMenuKey.value = undefined

  if (action === 'create-folder' || action === 'create-file') {
    if (row.type !== 'folder') return
    if (!providedName) {
      openNameDialog(action, row)
      return
    }
    const name = providedName
    const path = normalizePath(`${row.path}/${name}`)
    if (isPathTaken(path)) {
      window.alert('该名称已存在。')
      return
    }

    if (action === 'create-folder') {
      customFolderPaths.value = [...new Set([...customFolderPaths.value, path])]
      emitFileAction({ type: action, target: 'folder', path })
      collapsedFolders.value = new Set(
        [...collapsedFolders.value].filter((folderKey) => folderKey !== `folder:${row.path}`),
      )
      return
    }

    const resource: SkillResourceDescriptor = {
      path,
      kind: 'text',
      resourceId: path,
      text: '',
    }
    emitFileAction({ type: action, target: 'file', path })
    emitResourceDefinition([...resources.value, resource])
    selectedResourceId.value = resource.resourceId
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
    openNameDialog('rename', row)
    return
  }
  const name = providedName
  const nextPath = normalizePath(`${getParentPath(currentPath)}/${name}`)
  if (nextPath === normalizePath(currentPath)) return
  if (isPathTaken(nextPath, currentPath)) {
    window.alert('该名称已存在。')
    return
  }

  if (isFolder) {
    const normalizedPath = normalizePath(currentPath)
    const nextResources = resources.value.map((resource) => {
      const resourcePath = normalizePath(resource.path)
      if (resourcePath === normalizedPath) return updateResourcePath(resource, nextPath)
      if (resourcePath.startsWith(`${normalizedPath}/`)) {
        return updateResourcePath(resource, `${nextPath}${resourcePath.slice(normalizedPath.length)}`)
      }
      return resource
    })
    customFolderPaths.value = customFolderPaths.value.map((folderPath) => {
      const folderPathValue = normalizePath(folderPath)
      if (folderPathValue === normalizedPath) return nextPath
      if (folderPathValue.startsWith(`${normalizedPath}/`)) {
        return `${nextPath}${folderPathValue.slice(normalizedPath.length)}`
      }
      return folderPath
    })
    emitResourceDefinition(nextResources)
  } else {
    emitResourceDefinition(
      resources.value.map((resource) =>
        normalizePath(resource.path) === normalizePath(currentPath) ? updateResourcePath(resource, nextPath) : resource,
      ),
    )
  }
  emitFileAction({ type: 'rename', target: actionTarget, path: currentPath, nextPath })
}

const submitNameDialog = () => {
  const dialog = nameDialog.value
  if (!dialog) return

  const name = dialog.value.trim()
  if (!name || !/^[A-Za-z0-9_.-]+$/.test(name) || name === '.' || name === '..') {
    dialog.error = '名称只能包含英文字母、数字、下划线、中划线和点号。'
    return
  }

  const needsTextExtension =
    dialog.action === 'create-file' ||
    (dialog.action === 'rename' && dialog.row.type === 'file' && dialog.row.resource.kind === 'text')
  if (needsTextExtension && !hasSupportedTextExtension(name)) {
    dialog.error = '仅支持 .md、.txt、.json 文件。'
    return
  }

  const path =
    dialog.action === 'rename'
      ? normalizePath(`${getParentPath(dialog.row.path)}/${name}`)
      : normalizePath(`${dialog.row.path}/${name}`)
  if (isPathTaken(path, dialog.action === 'rename' ? dialog.row.path : undefined)) {
    dialog.error = '该名称已存在。'
    return
  }

  const { action, row } = dialog
  nameDialog.value = undefined
  handleTreeAction(action, row, name)
}

const hasUnsavedChanges = computed(() => isEditing.value && draftContent.value !== textContent.value)

const closeFileSwitchDialog = () => {
  fileSwitchDialog.value = undefined
  pendingTreeAction.value = undefined
  switchingFile.value = false
}

const getTreeActionLabel = (action: TreeAction, row: SkillFileNode | SkillFolderNode) => {
  const target = row.path || '根目录'
  if (action === 'create-file') return `新建文件（${target}）`
  if (action === 'create-folder') return `新建文件夹（${target}）`
  if (action === 'delete-file') return `删除文件“${target}”`
  if (action === 'delete-folder') return `删除文件夹“${target}”`
  return `重命名“${target}”`
}

const requestTreeAction = (action: TreeAction, row: SkillFileNode | SkillFolderNode) => {
  if (props.mode !== 'edit' || switchingFile.value) return
  openActionMenuKey.value = undefined

  if (hasUnsavedChanges.value) {
    pendingTreeAction.value = { action, row }
    switchingFile.value = true
    fileSwitchDialog.value = {
      currentFile: selectedResource.value?.path ?? 'SKILL.md',
      nextFile: getTreeActionLabel(action, row),
      resourceId: selectedResourceId.value ?? null,
    }
    return
  }

  handleTreeAction(action, row)
}

const handleFileSwitchDecision = (decision: SkillFileSwitchDecision) => {
  const pendingSwitch = fileSwitchDialog.value
  const pendingAction = pendingTreeAction.value
  if (!pendingSwitch) return

  if (decision === 'cancel') {
    closeFileSwitchDialog()
    return
  }

  if (decision === 'save') saveEditing()
  else {
    draftContent.value = textContent.value
    isEditing.value = false
  }

  fileSwitchDialog.value = undefined
  pendingTreeAction.value = undefined
  switchingFile.value = false

  if (pendingAction) {
    handleTreeAction(pendingAction.action, pendingAction.row)
    return
  }

  selectResource(pendingSwitch.resourceId)
}

const selectResource = (resourceId: string | null) => {
  openActionMenuKey.value = undefined
  selectedResourceId.value = resourceId ?? undefined
}

const requestSelectResource = (resourceId: string | null) => {
  if (switchingFile.value) return

  const currentResourceId = selectedResourceId.value ?? null
  if (resourceId === currentResourceId) return

  if (hasUnsavedChanges.value) {
    const currentFile = selectedResource.value?.path ?? 'SKILL.md'
    const nextFile = resources.value.find((resource) => resource.resourceId === resourceId)?.path ?? 'SKILL.md'

    switchingFile.value = true
    fileSwitchDialog.value = { currentFile, nextFile, resourceId }
    return
  }

  isEditing.value = false
  selectResource(resourceId)
}

const startEditing = () => {
  if (
    !canEditSelectedFile.value ||
    contentLoading.value ||
    contentError.value ||
    selectedResource.value?.kind === 'binary'
  )
    return
  draftContent.value = textContent.value
  editingMode.value = contentKind.value === 'markdown' ? 'visual' : 'source'
  isEditing.value = true
}

const updateDraftContent = (content: string) => {
  draftContent.value = content
}

const cancelEditing = () => {
  draftContent.value = textContent.value
  isEditing.value = false
}

const saveEditing = () => {
  if (!canEditSelectedFile.value || selectedResource.value?.kind === 'binary') return

  const content = draftContent.value

  const definition = selectedResource.value
    ? {
        ...currentDefinition.value,
        resources: resources.value.map((resource) =>
          resource.resourceId === selectedResource.value?.resourceId
            ? {
                ...resource,
                text: content,
                readText: async () => content,
                size: new Blob([content]).size,
                lastModified: Date.now(),
              }
            : resource,
        ),
      }
    : { ...currentDefinition.value, instructions: content }

  draftContent.value = content
  textContent.value = content
  localDefinition.value = definition
  emit('save', definition)
  isEditing.value = false
}

watch(
  () => props.mode,
  (mode) => {
    if (mode !== 'edit') {
      openActionMenuKey.value = undefined
      isEditing.value = false
      closeFileSwitchDialog()
    }
  },
)

watch(
  [selectedResource, () => currentDefinition.value.instructions],
  async ([resource, instructions]) => {
    const generation = ++readGeneration
    releaseResourceUrl()
    contentError.value = false
    contentLoading.value = Boolean(resource)
    contentKind.value =
      resource?.kind === 'binary' ? 'binary' : resource && !isMarkdownFile(resource.path) ? 'text' : 'markdown'
    textContent.value = resource ? '' : instructions

    if (!resource) return

    try {
      if (resource.kind === 'text') {
        const content = resource.text ?? (resource.readText ? await resource.readText() : '')
        if (generation !== readGeneration) return
        textContent.value = content
      } else {
        const binary = resource.binary ?? (resource.readBinary ? await resource.readBinary() : new Uint8Array())
        if (generation !== readGeneration) return
        const ownedBytes = new Uint8Array(binary.byteLength)
        ownedBytes.set(binary)
        const blob = new Blob([ownedBytes.buffer], { type: resource.mimeType || 'application/octet-stream' })
        resourceUrl.value = URL.createObjectURL(blob)
      }
    } catch {
      if (generation === readGeneration) contentError.value = true
    } finally {
      if (generation === readGeneration) contentLoading.value = false
    }
  },
  { immediate: true },
)

watch(
  () => props.definition,
  (nextDefinition, previousDefinition) => {
    if (nextDefinition !== previousDefinition) {
      localDefinition.value = null
    }
    if (nextDefinition.name !== previousDefinition?.name) {
      customFolderPaths.value = []
      collapsedFolders.value = new Set()
      openActionMenuKey.value = undefined
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

onMounted(async () => {
  markdownRuntime.value = await getMarkdownItAndDompurify()
})

onBeforeUnmount(() => {
  readGeneration += 1
  releaseResourceUrl()
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
      <nav class="skill-extension-detail__sidebar" :aria-label="props.definition.name + ' 文件'">
        <div
          :id="fileTreeId"
          class="skill-extension-detail__sidebar-title"
          role="heading"
          aria-level="3"
          aria-label="文件"
        >
          <span>文件</span>
          <div v-if="props.mode === 'edit'" class="skill-extension-detail__sidebar-actions">
            <button
              type="button"
              class="skill-extension-detail__sidebar-action"
              :disabled="switchingFile"
              aria-label="新增文件"
              title="新增文件"
              @click="openRootCreateDialog('create-file')"
            >
              <IconAddFile aria-hidden="true" />
            </button>
            <button
              type="button"
              class="skill-extension-detail__sidebar-action"
              :disabled="switchingFile"
              aria-label="新增文件夹"
              title="新增文件夹"
              @click="openRootCreateDialog('create-folder')"
            >
              <IconAddFolder aria-hidden="true" />
            </button>
          </div>
        </div>
        <ul class="skill-extension-detail__tree">
          <li v-for="row in treeRows" :key="row.key" class="skill-extension-detail__tree-item">
            <button
              v-if="row.type === 'skill'"
              type="button"
              class="skill-extension-detail__tree-button"
              :class="{ 'skill-extension-detail__tree-button--selected': selectedResourceId === undefined }"
              :aria-current="selectedResourceId === undefined ? 'page' : undefined"
              @click="requestSelectResource(null)"
            >
              <IconFile class="skill-extension-detail__file-icon" aria-hidden="true" />
              <span>SKILL.md</span>
            </button>

            <div v-else-if="row.type === 'folder'" class="skill-extension-detail__tree-node">
              <button
                type="button"
                class="skill-extension-detail__tree-button skill-extension-detail__tree-button--folder"
                :style="{ paddingLeft: `${8 + row.depth * 16}px` }"
                :aria-expanded="!collapsedFolders.has(row.key)"
                @click="toggleFolder(row.key)"
              >
                <span
                  class="skill-extension-detail__chevron"
                  :class="{ 'skill-extension-detail__chevron--collapsed': collapsedFolders.has(row.key) }"
                  aria-hidden="true"
                ></span>
                <IconFolder class="skill-extension-detail__folder-icon" aria-hidden="true" />
                <span>{{ row.name }}</span>
              </button>
              <button
                v-if="props.mode === 'edit'"
                type="button"
                class="skill-extension-detail__tree-action-trigger"
                :disabled="switchingFile"
                :aria-label="`${row.name} 操作`"
                :aria-expanded="openActionMenuKey === row.key"
                title="文件夹操作"
                @click.stop="toggleActionMenu(row.key)"
              >
                <IconMore aria-hidden="true" />
              </button>
              <div
                v-if="props.mode === 'edit' && openActionMenuKey === row.key"
                class="skill-extension-detail__tree-action-menu"
                role="menu"
              >
                <button type="button" role="menuitem" @click="requestTreeAction('create-folder', row)">
                  新增文件夹
                </button>
                <button type="button" role="menuitem" @click="requestTreeAction('create-file', row)">新增文件</button>
                <button type="button" role="menuitem" @click="requestTreeAction('rename', row)">重命名</button>
                <button
                  type="button"
                  role="menuitem"
                  class="skill-extension-detail__tree-action-menu-item--danger"
                  @click="requestTreeAction('delete-folder', row)"
                >
                  删除文件夹
                </button>
              </div>
            </div>

            <div v-else class="skill-extension-detail__tree-node">
              <button
                type="button"
                class="skill-extension-detail__tree-button"
                :class="{
                  'skill-extension-detail__tree-button--selected': selectedResourceId === row.resource.resourceId,
                }"
                :style="{ paddingLeft: `${24 + row.depth * 16}px` }"
                :aria-current="selectedResourceId === row.resource.resourceId ? 'page' : undefined"
                @click="requestSelectResource(row.resource.resourceId)"
              >
                <IconFile class="skill-extension-detail__file-icon" aria-hidden="true" />
                <span class="skill-extension-detail__tree-name">{{ row.name }}</span>
              </button>
              <button
                v-if="props.mode === 'edit'"
                type="button"
                class="skill-extension-detail__tree-action-trigger"
                :disabled="switchingFile"
                :aria-label="`${row.name} 操作`"
                :aria-expanded="openActionMenuKey === row.key"
                title="文件操作"
                @click.stop="toggleActionMenu(row.key)"
              >
                <IconMore aria-hidden="true" />
              </button>
              <div
                v-if="props.mode === 'edit' && openActionMenuKey === row.key"
                class="skill-extension-detail__tree-action-menu"
                role="menu"
              >
                <button type="button" role="menuitem" @click="requestTreeAction('rename', row)">重命名</button>
                <button
                  type="button"
                  role="menuitem"
                  class="skill-extension-detail__tree-action-menu-item--danger"
                  @click="requestTreeAction('delete-file', row)"
                >
                  删除文件
                </button>
              </div>
            </div>
          </li>
        </ul>
        <p v-if="resources.length === 0" class="skill-extension-detail__empty-tree">暂无资源文件</p>
      </nav>

      <section class="skill-extension-detail__viewer" :aria-label="selectedFileName">
        <div class="skill-extension-detail__viewer-heading">
          <IconFile
            v-if="!selectedResource || selectedResource.kind === 'text'"
            class="skill-extension-detail__file-icon"
            aria-hidden="true"
          />
          <span>{{ selectedFileName }}</span>
          <div class="skill-extension-detail__edit-actions">
            <template v-if="isEditing">
              <TinyButton
                v-if="canEditSelectedFile"
                class="skill-extension-detail__action-button"
                type="default"
                size="small"
                round
                :reset-time="0"
                :disabled="switchingFile"
                @click="cancelEditing"
              >
                取消
              </TinyButton>
              <TinyButton
                class="skill-extension-detail__action-button"
                type="primary"
                size="small"
                round
                :reset-time="0"
                :disabled="switchingFile"
                @click="saveEditing"
              >
                保存
              </TinyButton>
            </template>
            <template v-else>
              <a
                v-if="selectedResource && resourceUrl"
                class="skill-extension-detail__download"
                :href="resourceUrl"
                :download="selectedResource.path.split('/').pop()"
                >下载</a
              >
              <TinyButton
                v-if="canEditSelectedFile"
                class="skill-extension-detail__action-button"
                type="default"
                size="small"
                round
                :reset-time="0"
                :disabled="contentLoading || contentError || selectedResource?.kind === 'binary'"
                @click="startEditing"
              >
                编辑
              </TinyButton>
            </template>
          </div>
        </div>

        <div v-if="isEditing && contentKind === 'markdown'" class="skill-extension-detail__mode-switch" role="tablist">
          <button
            type="button"
            role="tab"
            class="skill-extension-detail__mode-tab"
            :class="{ 'is-active': editingMode === 'visual' }"
            :aria-selected="editingMode === 'visual'"
            @click="editingMode = 'visual'"
          >
            可视化编辑
          </button>
          <button
            type="button"
            role="tab"
            class="skill-extension-detail__mode-tab"
            :class="{ 'is-active': editingMode === 'source' }"
            :aria-selected="editingMode === 'source'"
            @click="editingMode = 'source'"
          >
            源码编辑
          </button>
        </div>

        <div
          class="skill-extension-detail__content"
          :class="{ 'skill-extension-detail__content--editing': isEditing }"
          tabindex="0"
          aria-live="polite"
        >
          <p v-if="contentLoading" class="skill-extension-detail__status">正在读取文件…</p>
          <p v-else-if="contentError" class="skill-extension-detail__status skill-extension-detail__status--error">
            文件读取失败，请稍后重试。
          </p>
          <div
            v-else-if="isEditing && contentKind === 'markdown' && editingMode === 'visual'"
            class="skill-extension-detail__visual-editor"
          >
            <slot
              name="visual-editor"
              :content="draftContent"
              :file-path="selectedFileName"
              :update-content="updateDraftContent"
            >
              <SkillMarkdownEditor v-model="draftContent" />
            </slot>
          </div>
          <textarea
            v-else-if="isEditing && contentKind !== 'binary'"
            v-model="draftContent"
            class="skill-extension-detail__editor"
            :aria-label="`${contentKind === 'markdown' ? '源码编辑' : '编辑'} ${selectedFileName}`"
            spellcheck="false"
          ></textarea>
          <img
            v-else-if="
              selectedResource?.kind === 'binary' && selectedResource.mimeType?.startsWith('image/') && resourceUrl
            "
            class="skill-extension-detail__image-preview"
            :src="resourceUrl"
            :alt="selectedResource.path"
          />
          <div
            v-else-if="contentKind === 'markdown' && renderedMarkdown"
            class="skill-extension-detail__markdown"
            v-html="renderedMarkdown"
          ></div>
          <pre
            v-else-if="contentKind === 'markdown' || contentKind === 'text'"
            class="skill-extension-detail__plain-text"
            >{{ textContent }}</pre>
          <p v-else-if="resourceUrl" class="skill-extension-detail__status">
            此二进制文件无法直接预览。<a :href="resourceUrl" :download="selectedResource?.path.split('/').pop()"
              >下载文件</a
            >
          </p>
        </div>
      </section>
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
  padding: 8px 12px 16px;
}

.skill-extension-detail__icon {
  box-sizing: border-box;
  display: grid;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 4px;
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
  min-height: 300px;
  max-height: var(--tr-skill-extension-detail-content-max-height, 520px);
  overflow: hidden;
  border: 1px solid @detail-divider-color;
  border-radius: 8px;
  background: var(--tr-container-bg-default);
}

.skill-extension-detail__sidebar {
  box-sizing: border-box;
  flex: 0 0 232px;
  width: 232px;
  overflow: auto;
  border-right: 1px solid @detail-divider-color;
}

.skill-extension-detail__sidebar-title,
.skill-extension-detail__viewer-heading {
  display: flex;
  box-sizing: border-box;
  min-height: 42px;
  flex-shrink: 0;
  align-items: center;
  border-bottom: 1px solid @detail-divider-color;
  color: var(--tr-text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.skill-extension-detail__sidebar-title {
  justify-content: space-between;
  gap: 8px;
  margin: 0;
  padding: 0 16px;
}

.skill-extension-detail__sidebar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.skill-extension-detail__sidebar-action {
  position: relative;
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
}

.skill-extension-detail__sidebar-action:hover,
.skill-extension-detail__sidebar-action:focus-visible {
  background: var(--tr-page-bg-default);
  color: var(--tr-text-primary);
}

.skill-extension-detail__sidebar-action:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 1px;
}

.skill-extension-detail__sidebar-action:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.skill-extension-detail__sidebar-action > svg {
  width: 16px;
  height: 16px;
}

.skill-extension-detail__tree {
  margin: 0;
  padding: 8px;
  list-style: none;
}

.skill-extension-detail__tree-item {
  min-width: 0;
}

.skill-extension-detail__tree-node {
  position: relative;
  min-width: 0;
}

.skill-extension-detail__tree-button {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 30px;
  align-items: center;
  gap: 7px;
  padding: 4px 8px;
  padding-right: 32px;
  overflow: hidden;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
}

.skill-extension-detail__tree-button:hover {
  background: var(--tr-page-bg-default);
}

.skill-extension-detail__tree-action-trigger {
  position: absolute;
  top: 3px;
  right: 4px;
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: var(--tr-page-bg-default);
  color: var(--tr-text-secondary);
  cursor: pointer;
  opacity: 0;
}

.skill-extension-detail__tree-node:hover .skill-extension-detail__tree-action-trigger,
.skill-extension-detail__tree-action-trigger:focus-visible,
.skill-extension-detail__tree-action-trigger[aria-expanded='true'] {
  opacity: 1;
}

.skill-extension-detail__tree-action-trigger:hover {
  color: var(--tr-text-primary);
}

.skill-extension-detail__tree-action-trigger:disabled {
  cursor: not-allowed;
  opacity: 0;
}

.skill-extension-detail__tree-action-trigger svg {
  width: 16px;
  height: 16px;
}

.skill-extension-detail__tree-action-menu {
  position: absolute;
  z-index: 3;
  top: 30px;
  right: 4px;
  display: flex;
  min-width: 120px;
  flex-direction: column;
  padding: 4px 0;
  border-radius: 6px;
  background: var(--tr-container-bg-default);
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}

.skill-extension-detail__tree-action-menu button {
  width: 100%;
  padding: 5px 12px;
  border: 0;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  white-space: nowrap;
}

.skill-extension-detail__tree-action-menu button:hover {
  background: var(--tr-page-bg-default);
}

.skill-extension-detail__tree-action-menu-item--danger {
  color: var(--tr-color-error, #f23030) !important;
}

.skill-extension-detail__tree-action-menu-item--danger:hover {
  background: var(--tr-page-bg-default) !important;
}

.skill-extension-detail__tree-button:disabled {
  cursor: default;
}

.skill-extension-detail__tree-button--selected,
.skill-extension-detail__tree-button--selected:hover {
  background: var(--tr-page-bg-default);
}

.skill-extension-detail__tree-button:focus-visible,
.skill-extension-detail__download:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 1px;
}

.skill-extension-detail__tree-button > span:not(.skill-extension-detail__chevron) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-extension-detail__tree-button small {
  flex: none;
  margin-left: auto;
  color: var(--tr-text-secondary);
  font-size: 11px;
}

.skill-extension-detail__file-icon,
.skill-extension-detail__folder-icon {
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.25;
}

.skill-extension-detail__chevron {
  flex: 0 0 7px;
  width: 7px;
  height: 7px;
  margin-right: 1px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: translateY(-2px) rotate(45deg);
}

.skill-extension-detail__chevron--collapsed {
  transform: translate(-2px, 0) rotate(-45deg);
}

.skill-extension-detail__empty-tree {
  margin: 8px;
  color: var(--tr-text-secondary);
  font-size: 12px;
}

.skill-extension-detail__viewer {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.skill-extension-detail__viewer-heading {
  gap: 8px;
  padding: 0 20px;
}

.skill-extension-detail__edit-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.skill-extension-detail__download {
  color: var(--tr-text-secondary);
  font-size: 12px;
  text-decoration: none;
}

.skill-extension-detail__download:hover {
  color: var(--tr-text-primary);
  text-decoration: underline;
}

.skill-extension-detail__content {
  min-height: 0;
  flex: 1;
  padding: 20px 24px;
  overflow: auto;
}

.skill-extension-detail__content--editing {
  display: flex;
  flex-direction: column;
}

.skill-extension-detail__mode-switch {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 40px;
  padding: 0 20px;
  border-bottom: 1px solid var(--tr-border-color-default);
}

.skill-extension-detail__mode-tab {
  position: relative;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--tr-text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.skill-extension-detail__mode-tab:hover,
.skill-extension-detail__mode-tab.is-active {
  color: var(--tr-text-primary);
}

.skill-extension-detail__mode-tab.is-active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--tr-text-primary);
  content: '';
}

.skill-extension-detail__visual-editor {
  min-height: 0;
  flex: 1;
}

.skill-extension-detail__editor {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 55%, transparent);
  border-radius: 6px;
  background: var(--tr-container-bg-default);
  color: var(--tr-text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.65;
  resize: vertical;
  white-space: pre-wrap;
}

.skill-extension-detail__editor:focus-visible {
  outline: none;
}

.skill-extension-detail__markdown {
  color: var(--tr-text-primary);
  font-size: 14px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.skill-extension-detail__markdown :deep(:first-child) {
  margin-top: 0;
}

.skill-extension-detail__markdown :deep(h1),
.skill-extension-detail__markdown :deep(h2),
.skill-extension-detail__markdown :deep(h3),
.skill-extension-detail__markdown :deep(h4) {
  margin: 1.25em 0 0.55em;
  font-weight: 650;
  line-height: 1.35;
}

.skill-extension-detail__markdown :deep(h1) {
  font-size: 1.55em;
}
.skill-extension-detail__markdown :deep(h2) {
  font-size: 1.3em;
}
.skill-extension-detail__markdown :deep(h3) {
  font-size: 1.12em;
}
.skill-extension-detail__markdown :deep(p) {
  margin: 0.7em 0;
}
.skill-extension-detail__markdown :deep(ul),
.skill-extension-detail__markdown :deep(ol) {
  padding-left: 1.6em;
}
.skill-extension-detail__markdown :deep(li) {
  margin: 0.25em 0;
}
.skill-extension-detail__markdown :deep(code) {
  padding: 0.12em 0.35em;
  border-radius: 4px;
  background: var(--tr-page-bg-default);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
}
.skill-extension-detail__markdown :deep(pre) {
  padding: 12px 14px;
  overflow: auto;
  border-radius: 6px;
  background: var(--tr-page-bg-default);
}
.skill-extension-detail__markdown :deep(pre code) {
  padding: 0;
  background: transparent;
}
.skill-extension-detail__markdown :deep(blockquote) {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 3px solid var(--tr-border-color-default);
  color: var(--tr-text-secondary);
}
.skill-extension-detail__markdown :deep(table) {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  border-collapse: collapse;
}
.skill-extension-detail__markdown :deep(th),
.skill-extension-detail__markdown :deep(td) {
  padding: 6px 10px;
  border: 1px solid var(--tr-border-color-default);
  text-align: left;
}
.skill-extension-detail__markdown :deep(a) {
  color: var(--tr-color-primary);
}

.skill-extension-detail__plain-text {
  margin: 0;
  color: var(--tr-text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.skill-extension-detail__status {
  margin: 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.skill-extension-detail__status--error {
  color: var(--tr-color-error);
}
.skill-extension-detail__status a {
  color: var(--tr-color-primary);
}

.skill-extension-detail__image-preview {
  display: block;
  max-width: 100%;
  max-height: 100%;
  margin: auto;
  object-fit: contain;
}

@media (max-width: 640px) {
  .skill-extension-detail__browser {
    min-height: 0;
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
