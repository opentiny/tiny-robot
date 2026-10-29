import { loadBrowserSkillFiles } from './browser'
import { createSkillDefinition } from './definition'
import { loadGithubSkillFiles } from './github'
import type { BrowserSkillLoadOptions, GithubSkillLoadOptions, SkillLoadJob, SkillLoadResult } from './type'
import { createSkillLoadJob, throwIfSkillLoadCancelled } from './utils'

export type SkillLoadOptions = BrowserSkillLoadOptions | GithubSkillLoadOptions

export function loadSkillWithDetails(options: SkillLoadOptions): SkillLoadJob<SkillLoadResult> {
  return createSkillLoadJob(async (context) => {
    const files = await (async () => {
      switch (options.source) {
        case 'browser':
          return loadBrowserSkillFiles(options, context)
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
  FsSkillLoadOptions,
  GithubSkillLoadOptions,
  SkillLoadJob,
  SkillLoadProgressEvent,
  SkillLoadResult,
} from './type'
