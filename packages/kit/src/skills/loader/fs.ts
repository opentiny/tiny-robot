import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type { FsSkillLoadOptions, LoadableSkillFile, SkillLoadContext } from './type'
import { isTextSkillFilePath, normalizeSkillPath, throwIfSkillLoadCancelled } from './utils'

export async function loadFsSkillFiles(
  options: FsSkillLoadOptions,
  context: SkillLoadContext,
): Promise<LoadableSkillFile[]> {
  const ignored = new Set(options.ignoredDirectories ?? ['node_modules'])
  const result: LoadableSkillFile[] = []

  const walk = async (directory: string) => {
    throwIfSkillLoadCancelled(context.signal)
    const entries = await readdir(directory, {
      withFileTypes: true,
    })

    for (const entry of entries) {
      const fullPath = join(directory, entry.name)

      if (entry.isDirectory()) {
        if (!ignored.has(entry.name) && !entry.name.startsWith('.')) {
          await walk(fullPath)
        }
        continue
      }

      if (!entry.isFile()) {
        continue
      }

      const path = normalizeSkillPath(relative(options.root, fullPath))

      if (!path) {
        continue
      }

      const fileStat = await stat(fullPath)
      const kind = isTextSkillFilePath(path) ? 'text' : 'binary'
      const content =
        kind === 'text'
          ? await readFile(fullPath, { encoding: 'utf8', signal: context.signal })
          : new Uint8Array(await readFile(fullPath, { signal: context.signal }))

      result.push({
        path,
        kind,
        content,
        size: fileStat.size,
        lastModified: fileStat.mtimeMs,
      })
    }
  }

  await walk(options.root)
  return result
}
