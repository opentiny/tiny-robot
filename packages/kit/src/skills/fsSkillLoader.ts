import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type { SkillFile } from './types'
import { isTextSkillFilePath, normalizeSkillPath } from './utils'

export interface FsSkillFileLoaderOptions {
  /**
   * 忽略的目录名。
   */
  ignoredDirectories?: string[]
}

/**
 * 后端/Node 侧目录适配器。
 *
 * 只负责把本地目录读取为 SkillFile[]，不解析 skill 语义。
 */
export const loadSkillFilesFromFs = async (
  root: string,
  options: FsSkillFileLoaderOptions = {},
): Promise<SkillFile[]> => {
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
