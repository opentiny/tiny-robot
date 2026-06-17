import type { SkillDefinition, SkillFileKind } from '../types'

export type SkillLoadWarning = {
  code: string
  message: string
  path?: string
}

export type SkillLoadResult = {
  skill: SkillDefinition
  warnings: SkillLoadWarning[]
}

export type SkillLoadJob<T = SkillDefinition> = Promise<T> & {
  cancel(): void
}

export type SkillLoadContext = {
  signal: AbortSignal
}

export type SkillLoadProgressPhase = 'discover' | 'read' | 'download' | 'parse' | 'store' | 'complete'

export interface SkillLoadProgressEvent {
  /**
   * 当前加载阶段。不同 source 可按自身能力选择上报阶段。
   */
  phase: SkillLoadProgressPhase
  /**
   * 当前阶段已处理的数量。
   */
  loaded: number
  /**
   * 当前阶段总数量；目录遍历或远端下载时可能未知。
   */
  total?: number
  /**
   * 当前处理的 skill 内相对路径。
   */
  path?: string
  /**
   * 面向调用方展示或记录的补充说明。
   */
  message?: string
}

export type SkillLoadBaseOptions = {
  /**
   * skill 入口文件名。
   */
  entryFile?: string
  /**
   * 启用后，非致命问题会直接抛出为错误。
   */
  strict?: boolean
  /**
   * @experimental
   *
   * 加载进度回调预留。当前 loader 暂未实现进度事件上报。
   */
  onProgress?: (event: SkillLoadProgressEvent) => void
}

export type LoadableSkillFile = {
  path: string
  kind: SkillFileKind
  content: string | Uint8Array
  mimeType?: string
  size?: number
  lastModified?: number
  metadata?: Record<string, unknown>
}

export type BrowserSkillLoadOptions = SkillLoadBaseOptions &
  (
    | {
        source: 'browser'
        fileList: ArrayLike<File>
        directoryHandle?: never
      }
    | {
        source: 'browser'
        directoryHandle: FileSystemDirectoryHandle
        fileList?: never
      }
  )

export type FsSkillLoadOptions = SkillLoadBaseOptions & {
  source: 'fs'
  root: string
  ignoredDirectories?: string[]
}

export type GithubSkillLoadOptions = SkillLoadBaseOptions & {
  source: 'github'
  /**
   * GitHub 仓库，格式为 `owner/repo`。
   */
  repo: string
  /**
   * 分支、标签或 commit SHA。省略时使用仓库默认分支。
   */
  ref?: string
  /**
   * 仓库内 skill 根目录（含 SKILL.md），例如 `skills/weather`。
   */
  path: string
}
