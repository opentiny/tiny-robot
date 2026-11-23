import type { SkillDefinition, SkillResourceDescriptor } from '../skill-import-form/index.type'

export type SkillResource = NonNullable<SkillDefinition['resources']>[number]

export type SkillEditTarget =
  | { kind: 'skill' }
  | {
      kind: 'resource'
      resourceId: string
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

export const isTextSkillFilePath = (path: string) => hasSupportedSkillTextExtension(path)

export const validateSkillEntryName = (
  value: string,
  options: {
    kind: 'file' | 'folder'
    action: 'create' | 'rename'
    resourceKind?: SkillResourceDescriptor['kind']
  },
) => {
  const name = value.trim()
  if (!name || !/^[A-Za-z0-9_.-]+$/.test(name) || name === '.' || name === '..') {
    return '名称只能包含英文字母、数字、下划线、中划线和点号。'
  }
  if (name.startsWith('.')) {
    return '名称不能以点号开头。'
  }
  if (options.kind === 'file' && options.action === 'create' && !hasSupportedSkillTextExtension(name)) {
    return '仅支持 .md、.txt、.json 文件。'
  }
  if (options.kind === 'file' && options.action === 'rename') {
    if (options.resourceKind === 'text' && !hasSupportedSkillTextExtension(name)) {
      return '仅支持 .md、.txt、.json 文件。'
    }
    if (options.resourceKind === 'binary' && isTextSkillFilePath(name)) {
      return '二进制文件不能重命名为文本文件。'
    }
  }
  return undefined
}

const getResourceDirectoryPaths = (resources: SkillResource[]) => {
  const paths = new Set<string>()
  for (const resource of resources) {
    let parentPath = getParentPath(resource.path)
    while (parentPath) {
      paths.add(parentPath)
      parentPath = getParentPath(parentPath)
    }
  }
  return paths
}

export const isSkillPathTaken = (
  path: string,
  resources: SkillResource[],
  directories: string[],
  ignoredPath?: string,
) => {
  const normalizedPath = normalizePath(path)
  const normalizedIgnoredPath = ignoredPath ? normalizePath(ignoredPath) : undefined
  if (normalizedPath.toLowerCase() === 'skill.md' && normalizedIgnoredPath?.toLowerCase() !== 'skill.md') return true

  return (
    resources.some(
      (resource) =>
        normalizePath(resource.path) === normalizedPath && normalizePath(resource.path) !== normalizedIgnoredPath,
    ) ||
    [...getResourceDirectoryPaths(resources)].some(
      (folderPath) => folderPath === normalizedPath && folderPath !== normalizedIgnoredPath,
    ) ||
    directories.some(
      (folderPath) =>
        normalizePath(folderPath) === normalizedPath && normalizePath(folderPath) !== normalizedIgnoredPath,
    )
  )
}

const normalizeDirectories = (resources: SkillResource[], directories: string[]) => {
  const resourceDirectories = getResourceDirectoryPaths(resources)
  return [...new Set(directories.map(normalizePath).filter(Boolean))]
    .filter((directory) => !resourceDirectories.has(directory))
    .sort()
}

export const withResources = (
  definition: SkillDefinition,
  resources: SkillResource[],
  directories: string[] = definition.directories ?? [],
): SkillDefinition => {
  const normalizedDirectories = normalizeDirectories(resources, directories)
  return {
    ...definition,
    resources,
    directories: normalizedDirectories.length ? normalizedDirectories : undefined,
  }
}

export const createResourceId = (path: string, resources: SkillResource[]) => {
  const resourceIds = new Set(resources.map((resource) => resource.resourceId))
  if (!resourceIds.has(path)) return path

  let index = 1
  let resourceId = `${path}#${index}`
  while (resourceIds.has(resourceId)) {
    index += 1
    resourceId = `${path}#${index}`
  }
  return resourceId
}

export const createTextResourceDefinition = (definition: SkillDefinition, path: string) => {
  const resources = definition.resources ?? []
  const resource: SkillResource = {
    path,
    kind: 'text',
    resourceId: createResourceId(path, resources),
    text: '',
  }
  return {
    resource,
    definition: withResources(definition, [...resources, resource]),
  }
}

export const renamePathDefinition = (
  definition: SkillDefinition,
  currentPath: string,
  nextPath: string,
  isFolder: boolean,
) => {
  const normalizedPath = normalizePath(currentPath)
  const resources = (definition.resources ?? []).map((resource) => {
    const resourcePath = normalizePath(resource.path)
    if (resourcePath === normalizedPath) return { ...resource, path: nextPath }
    if (isFolder && resourcePath.startsWith(normalizedPath + '/')) {
      return { ...resource, path: nextPath + resourcePath.slice(normalizedPath.length) }
    }
    return resource
  })
  const directories = (definition.directories ?? []).map((folderPath) => {
    const folderPathValue = normalizePath(folderPath)
    if (folderPathValue === normalizedPath) return nextPath
    if (isFolder && folderPathValue.startsWith(normalizedPath + '/')) {
      return nextPath + folderPathValue.slice(normalizedPath.length)
    }
    return folderPath
  })
  return withResources(definition, resources, directories)
}

export const deletePathDefinition = (definition: SkillDefinition, currentPath: string, isFolder: boolean) => {
  const normalizedPath = normalizePath(currentPath)
  const resources = (definition.resources ?? []).filter((resource) => {
    const resourcePath = normalizePath(resource.path)
    return resourcePath !== normalizedPath && (!isFolder || !resourcePath.startsWith(normalizedPath + '/'))
  })
  const parentPath = getParentPath(currentPath)
  const directories = parentPath ? [...(definition.directories ?? []), parentPath] : (definition.directories ?? [])
  const directoriesAfterDelete = isFolder
    ? directories.filter(
        (folderPath) =>
          normalizePath(folderPath) !== normalizedPath && !normalizePath(folderPath).startsWith(normalizedPath + '/'),
      )
    : directories
  return withResources(definition, resources, directoriesAfterDelete)
}

const copyBytes = (bytes: Uint8Array) => new Uint8Array(bytes)

export const updateTextContentDefinition = (definition: SkillDefinition, target: SkillEditTarget, content: string) => {
  if (target.kind === 'skill') return { ...definition, instructions: content }

  const bytes = new TextEncoder().encode(content)
  let found = false
  const resources = (definition.resources ?? []).map((resource) => {
    if (resource.resourceId !== target.resourceId) return resource
    found = true
    return {
      ...resource,
      text: content,
      binary: copyBytes(bytes),
      readText: async () => content,
      readBinary: async () => copyBytes(bytes),
      size: bytes.byteLength,
      lastModified: Date.now(),
    }
  })
  return found ? { ...definition, resources } : undefined
}

export const isEditTargetAvailable = (target: SkillEditTarget | undefined, resources: SkillResource[]) => {
  if (!target || target.kind === 'skill') return true
  return resources.some((resource) => resource.resourceId === target.resourceId)
}
