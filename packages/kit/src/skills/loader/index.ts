import { loadBrowserSkillFiles } from './browser'
import { loadArchiveSkillFiles } from './archive'
import { createSkillDefinition } from './definition'
import { loadGithubSkillFiles } from './github'
import type {
  ArchiveSkillLoadOptions,
  BrowserSkillLoadOptions,
  GithubSkillLoadOptions,
  SkillLoadJob,
  SkillLoadResult,
} from './type'
import { createSkillLoadJob, throwIfSkillLoadCancelled } from './utils'

export type SkillLoadOptions = BrowserSkillLoadOptions | ArchiveSkillLoadOptions | GithubSkillLoadOptions

export function loadSkillWithDetails(options: SkillLoadOptions): SkillLoadJob<SkillLoadResult> {
  return createSkillLoadJob(async (context) => {
    const loadableFiles = await (async () => {
      switch (options.source) {
        case 'browser':
          return loadBrowserSkillFiles(options, context)
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
  BrowserSkillLoadOptions,
  ArchiveSkillLoadOptions,
  FsSkillLoadOptions,
  GithubSkillLoadOptions,
  SkillLoadJob,
  SkillLoadProgressEvent,
  SkillLoadResult,
} from './type'
