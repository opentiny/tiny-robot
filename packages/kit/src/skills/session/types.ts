import type { SkillResourceDescriptor } from '../types'

export type SkillDeduplication = 'none' | 'context'
export type SkillResourceSummary = Pick<SkillResourceDescriptor, 'path' | 'kind' | 'mimeType' | 'size' | 'lastModified'>

export type SessionSkillLoadItem =
  | { name: string; status: 'loaded'; instructions: string; resources?: SkillResourceSummary[] }
  | { name: string; status: 'already_loaded'; message: string }
  | { name: string; status: 'failed'; error: { code: 'skill_unavailable' | 'skill_load_failed'; message?: string } }

export interface SessionSkillLoadResult {
  skills: SessionSkillLoadItem[]
  error?: { code: 'invalid_skill_names'; message: string }
}

export interface SkillRequestMetadata {
  tinyRobotSkill: { requestedSkillNames: string[] }
}

export interface SkillProtocolMarker {
  version: 1
  kind: 'catalog' | 'load-result'
  sessionId?: string
  source?: 'auto' | 'explicit'
}
