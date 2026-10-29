import { isTextSkillFilePath, normalizeSkillPath, stripRootDirectory, throwIfSkillLoadCancelled } from './utils'
import type { BrowserSkillLoadOptions, LoadableSkillFile, SkillLoadContext } from './type'

type FileWithRelativePath = File & {
  webkitRelativePath?: string
}

export async function loadBrowserSkillFiles(
  options: BrowserSkillLoadOptions,
  context: SkillLoadContext,
): Promise<LoadableSkillFile[]> {
  if ('fileList' in options && options.fileList) {
    const files: LoadableSkillFile[] = []

    for (const file of Array.from(options.fileList)) {
      if (!file) {
        continue
      }

      throwIfSkillLoadCancelled(context.signal)
      const fileWithRelativePath = file as FileWithRelativePath
      const path = stripRootDirectory(fileWithRelativePath.webkitRelativePath || file.name)

      files.push(await loadBrowserFile(file, path, context))
    }

    return files
  }

  const result: LoadableSkillFile[] = []

  const walk = async (directory: FileSystemDirectoryHandle, parentPath = '') => {
    throwIfSkillLoadCancelled(context.signal)
    const entries = (
      directory as FileSystemDirectoryHandle & {
        entries(): AsyncIterable<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>
      }
    ).entries()

    for await (const [name, handle] of entries) {
      const path = parentPath ? `${parentPath}/${name}` : name

      if (handle.kind === 'directory') {
        await walk(handle, path)
        continue
      }

      result.push(await loadBrowserFile(await handle.getFile(), path, context))
    }
  }

  await walk(options.directoryHandle)
  return result
}

async function loadBrowserFile(file: File, rawPath: string, context: SkillLoadContext): Promise<LoadableSkillFile> {
  const path = normalizeSkillPath(rawPath)

  if (!path) {
    throw new Error(`Invalid skill file path: ${rawPath}`)
  }

  const kind = isTextSkillFilePath(path) ? 'text' : 'binary'
  const content = kind === 'text' ? await file.text() : new Uint8Array(await file.arrayBuffer())

  throwIfSkillLoadCancelled(context.signal)

  return {
    path,
    kind,
    content,
    mimeType: file.type,
    size: file.size,
    lastModified: file.lastModified,
  }
}
