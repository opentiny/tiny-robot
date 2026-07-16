import type { MaybePromise } from '../../types'
import type { SkillDefinition } from '../types'

export type SkillCommandRequest = {
  skillName: string
  command: string
  args: string[]
  skill: SkillDefinition
}

export type SkillCommandResult = string | Record<string, unknown>

export type SkillCommandExecutor = (request: SkillCommandRequest) => MaybePromise<SkillCommandResult>
