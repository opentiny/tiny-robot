import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type { FsSkillLoadOptions, LoadableSkillFile, LoadableSkillFiles, SkillLoadContext } from './type'
import { isTextSkillFilePath, normalizeSkillPath, throwIfSkillLoadCancelled } from './utils'

export async function loadFsSkillFiles(
  options: FsSkillLoadOptions,
  context: SkillLoadContext,
): Promise<LoadableSkillFiles> {
  const ignored = new Set(options.ignoredDirectories ?? ['node_modules'])
  const files: LoadableSkillFile[] = []
  const directories = new Set<string>()

  const walk = async (directory: string) => {
    throwIfSkillLoadCancelled(context.signal)
    const entries = await readdir(directory, {
      withFileTypes: true,
    })

    for (const entry of entries) {
      const fullPath = join(directory, entry.name)

      if (entry.isDirectory()) {
        if (!ignored.has(entry.name) && !entry.name.startsWith('.')) {
          const path = normalizeSkillPath(relative(options.root, fullPath))
          if (path) directories.add(path)
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

      files.push({
        path,
        kind,
        content,
        size: fileStat.size,
        lastModified: fileStat.mtimeMs,
      })
    }
  }

  await walk(options.root)
  return {
    files,
    directories: [...directories].sort(),
  }
}
