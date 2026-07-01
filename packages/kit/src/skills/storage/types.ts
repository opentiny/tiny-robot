import type { SkillDefinition } from '../types'
import type { SkillLoadWarning } from '../loader/type'

/** skill 摘要，用于 list()。 */
export interface SkillSummary {
  name: string
  description: string
  resourceCount: number
  metadata?: Record<string, unknown>
}

/**
 * skill 持久化与导入。
 *
 * @example
 * await storage.add(skill)
 * const saved = await storage.get('weather')
 * const summaries = await storage.list()
 */
export interface SkillStorage<TImportOptions> {
  add(skill: SkillDefinition): Promise<SkillDefinition>
  get(name: string): Promise<SkillDefinition | undefined>
  has(name: string): Promise<boolean>
  delete(name: string): Promise<boolean>
  list(): Promise<SkillSummary[]>
  import(options: TImportOptions): SkillImportJob
}

export interface SkillImportResult {
  name: string
  skill: SkillDefinition
  warnings: SkillLoadWarning[]
}

/**
 * 进行中的导入操作；await 得到 SkillImportResult。
 *
 * @example
 * const job = storage.import({ source: 'browser', fileList: input.files })
 * job.cancel()
 * const { name, warnings } = await job
 */
export type SkillImportJob = Promise<SkillImportResult> & {
  /** 中止导入。 */
  cancel(): void
}

export type SkillImporter<TImportOptions> = (options: TImportOptions) => SkillImportJob
