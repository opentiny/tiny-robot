import type { SkillLoadJob } from '../loader/type'
import type { SkillImporter, SkillImportJob, SkillImportResult } from './types'

export function createImportSkill<TImportOptions>(
  loadSkill: (options: TImportOptions) => SkillLoadJob,
): SkillImporter<TImportOptions> {
  return (options) => {
    const loadJob = loadSkill(options)

    const task = (async (): Promise<SkillImportResult> => {
      const { skill, warnings } = await loadJob

      return {
        name: skill.name,
        skill,
        warnings,
      }
    })() as SkillImportJob

    task.cancel = () => {
      loadJob.cancel()
    }

    return task
  }
}
