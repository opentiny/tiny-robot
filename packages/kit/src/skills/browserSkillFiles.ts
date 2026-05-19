import type { SkillFile } from './types'
import { isTextSkillFilePath, normalizeSkillPath } from './utils'

export type BrowserFile = Pick<File, 'arrayBuffer' | 'lastModified' | 'name' | 'size' | 'text' | 'type'> & {
  webkitRelativePath?: string
}

export type BrowserFileHandle = {
  kind: 'file'
  name: string
  getFile: () => Promise<BrowserFile>
}

export type BrowserDirectoryHandle = {
  kind: 'directory'
  name: string
  entries: () => AsyncIterable<[string, BrowserFileHandle | BrowserDirectoryHandle]>
}

/**
 * Browser FileList 适配器，用于读取文件选择器选中的 skill 目录。
 */
export const loadSkillFilesFromFileList = async (fileList: ArrayLike<BrowserFile>): Promise<SkillFile[]> => {
  const files = Array.from({ length: fileList.length }, (_, index) => fileList[index]).filter(
    (file): file is BrowserFile => Boolean(file),
  )

  return Promise.all(
    files.map((file) => {
      const path = file.webkitRelativePath || file.name
      return browserFileToSkillFile(file, stripRootDirectory(path))
    }),
  )
}

/**
 * Browser FileSystemDirectoryHandle 适配器，用于读取 window.showDirectoryPicker() 选中的目录。
 */
export const loadSkillFilesFromDirectoryHandle = async (
  directoryHandle: BrowserDirectoryHandle,
): Promise<SkillFile[]> => {
  const result: SkillFile[] = []

  const walk = async (directory: BrowserDirectoryHandle, parentPath = '') => {
    for await (const [name, handle] of directory.entries()) {
      const path = parentPath ? `${parentPath}/${name}` : name

      if (handle.kind === 'directory') {
        await walk(handle, path)
        continue
      }

      result.push(await browserFileToSkillFile(await handle.getFile(), path))
    }
  }

  await walk(directoryHandle)
  return result.sort((a, b) => a.path.localeCompare(b.path))
}

const browserFileToSkillFile = async (file: BrowserFile, rawPath: string): Promise<SkillFile> => {
  const path = normalizeSkillPath(rawPath)

  if (!path) {
    throw new Error(`Invalid skill file path: ${rawPath}`)
  }

  if (isTextSkillFilePath(path)) {
    return {
      path,
      kind: 'text',
      content: await file.text(),
      mimeType: file.type,
      size: file.size,
      lastModified: file.lastModified,
    }
  }

  return {
    path,
    kind: 'binary',
    content: await file.arrayBuffer(),
    mimeType: file.type,
    size: file.size,
    lastModified: file.lastModified,
  }
}

const stripRootDirectory = (path: string) => {
  const normalized = path.split('\\').join('/')
  const parts = normalized.split('/').filter(Boolean)

  if (parts.length <= 1) {
    return normalized
  }

  return parts.slice(1).join('/')
}
