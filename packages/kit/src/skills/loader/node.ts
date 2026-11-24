import { createSkillDefinition } from './definition'
import { loadArchiveSkillFiles } from './archive'
import { loadFsSkillFiles } from './fs'
import { loadGithubSkillFiles } from './github'
import type {
  ArchiveSkillLoadOptions,
  FsSkillLoadOptions,
  GithubSkillLoadOptions,
  SkillLoadJob,
  SkillLoadResult,
} from './type'
import { createSkillLoadJob, throwIfSkillLoadCancelled } from './utils'

export type SkillLoadOptions = FsSkillLoadOptions | ArchiveSkillLoadOptions | GithubSkillLoadOptions

export function loadSkillWithDetails(options: SkillLoadOptions): SkillLoadJob<SkillLoadResult> {
  return createSkillLoadJob(async (context) => {
    const loadableFiles = await (async () => {
      switch (options.source) {
        case 'fs':
          return loadFsSkillFiles(options, context)
        case 'archive':
          return loadArchiveSkillFiles(options, context)
        case 'github':
          return loadGithubSkillFiles(options, context)
        default:
          throw new Error(`Unsupported skill source: ${(options as { source?: string }).source}`)
      }
    })()

    throwIfSkillLoadCancelled(context.signal)
    return createSkillDefinition(loadableFiles, options)
  })
}

export function loadSkill(options: SkillLoadOptions): SkillLoadJob {
  const detailsJob = loadSkillWithDetails(options)
  const job = detailsJob.then((result) => result.skill) as SkillLoadJob

  job.cancel = () => {
    detailsJob.cancel()
  }

  return job
}

export type {
  ArchiveSkillLoadOptions,
  FsSkillLoadOptions,
  GithubSkillLoadOptions,
  SkillLoadJob,
  SkillLoadProgressEvent,
  SkillLoadResult,
} from './type'
