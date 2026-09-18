import type { SkillAddInput, SkillDefinition, SkillResolver } from './index.type'

let kitModulePromise: Promise<typeof import('@opentiny/tiny-robot-kit')> | undefined

const loadKit = () => {
  kitModulePromise ??= import('@opentiny/tiny-robot-kit')
  return kitModulePromise
}

export const resolveSkillWithKit: SkillResolver = async (input: SkillAddInput): Promise<SkillDefinition> => {
  const { loadSkillWithDetails } = await loadKit()
  const options =
    input.source === 'local'
      ? { source: 'browser' as const, fileList: input.files }
      : { source: input.source, repo: input.repo, ref: input.ref, path: input.path }
  const { skill } = await loadSkillWithDetails(options)

  return skill
}
