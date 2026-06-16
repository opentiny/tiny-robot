import { createSkillDefinition } from './definition'
import { loadFsSkillFiles } from './fs'
import { loadGithubSkillFiles } from './github'
import type { FsSkillLoadOptions, GithubSkillLoadOptions, SkillLoadJob } from './type'
import { createSkillLoadJob, throwIfSkillLoadCancelled } from './utils'

export type SkillLoadOptions = FsSkillLoadOptions | GithubSkillLoadOptions

export function loadSkill(options: SkillLoadOptions): SkillLoadJob {
  return createSkillLoadJob(async (context) => {
    const files = await (async () => {
      switch (options.source) {
        case 'fs':
          return loadFsSkillFiles(options, context)
        case 'github':
          return loadGithubSkillFiles(options, context)
        default:
          throw new Error(`Unsupported skill source: ${(options as { source?: string }).source}`)
      }
    })()

    throwIfSkillLoadCancelled(context.signal)
    return createSkillDefinition(files, options)
  })
}

export type {
  FsSkillLoadOptions,
  GithubSkillLoadOptions,
  SkillLoadJob,
  SkillLoadProgressEvent,
  SkillLoadResult,
} from './type'
