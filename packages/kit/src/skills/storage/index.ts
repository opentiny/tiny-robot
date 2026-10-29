import { loadSkillWithDetails } from '../loader'
import type { SkillLoadOptions } from '../loader'
import type { SkillStorage as SkillStorageBase } from './types'
import { createImportSkill } from './importSkill'
import { createMemorySkillStorage as createMemorySkillStorageBase } from './memory'

export type { SkillImportJob, SkillImportResult, SkillSummary } from './types'
export type SkillImportOptions = SkillLoadOptions
export type SkillStorage = SkillStorageBase<SkillImportOptions>
export { createIndexedDBSkillStorage, IndexedDBSkillStorage } from './indexedDB'
export type { IndexedDBSkillStorageOptions } from './indexedDB'
export { MemorySkillStorage } from './memory'

export const importSkill = createImportSkill<SkillImportOptions>(loadSkillWithDetails)

export function createMemorySkillStorage() {
  return createMemorySkillStorageBase<SkillImportOptions>(importSkill)
}
