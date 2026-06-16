import { loadSkill } from '../loader/node'
import type { SkillLoadOptions } from '../loader/node'
import type { SkillStorage as SkillStorageBase } from './types'
import { createImportSkill } from './importSkill'
import { createMemorySkillStorage as createMemorySkillStorageBase } from './memory'

export type { SkillImportJob, SkillImportResult } from './types'
export type SkillImportOptions = SkillLoadOptions
export type SkillStorage = SkillStorageBase<SkillImportOptions>
export { MemorySkillStorage } from './memory'

export const importSkill = createImportSkill<SkillImportOptions>(loadSkill)

export function createMemorySkillStorage() {
  return createMemorySkillStorageBase<SkillImportOptions>(importSkill)
}
export { createFsSkillStorage, FsSkillStorage } from './fs'
export type { FsSkillStorageOptions } from './fs'
