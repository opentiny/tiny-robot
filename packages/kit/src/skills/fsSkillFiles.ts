import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type { SkillFile } from './types'
import { isTextSkillFilePath, normalizeSkillPath } from './utils'

export interface FsSkillFilesOptions {
  /**
   * 遍历时排除的目录名。
   */
  ignoredDirectories?: string[]
}

/**
 * Node.js 目录适配器，将本地 skill 目录读取为 SkillFile 记录。
 */
export const loadSkillFilesFromFs = async (root: string, options: FsSkillFilesOptions = {}): Promise<SkillFile[]> => {
  const ignoredDirectories = new Set(options.ignoredDirectories ?? ['.git', 'node_modules'])
  const result: SkillFile[] = []

  const walk = async (directory: string) => {
    const entries = await readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(directory, entry.name)

      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) {
          await walk(fullPath)
        }
        continue
      }

      if (!entry.isFile()) {
        continue
      }

      const fileStat = await stat(fullPath)
      if (!fileStat.isFile()) {
        continue
      }

      const path = normalizeSkillPath(relative(root, fullPath))
      if (!path) {
        continue
      }

      if (isTextSkillFilePath(path)) {
        result.push({
          path,
          kind: 'text',
          content: await readFile(fullPath, 'utf-8'),
          size: fileStat.size,
          lastModified: fileStat.mtimeMs,
        })
      } else {
        result.push({
          path,
          kind: 'binary',
          content: await readFile(fullPath),
          size: fileStat.size,
          lastModified: fileStat.mtimeMs,
        })
      }
    }
  }

  await walk(root)
  return result.sort((a, b) => a.path.localeCompare(b.path))
}
