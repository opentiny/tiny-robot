import type { SkillImportFormInput, SkillDefinition, SkillResolver } from './index.type'
import { parseSkillAddGithubUrlCandidates } from './validation'

let kitModulePromise: Promise<typeof import('@opentiny/tiny-robot-kit')> | undefined

const loadKit = () => {
  kitModulePromise ??= import('@opentiny/tiny-robot-kit')
  return kitModulePromise
}

export const resolveSkillWithKit: SkillResolver = async (input: SkillImportFormInput): Promise<SkillDefinition> => {
  const { loadSkillWithDetails } = await loadKit()

  if (input.source === 'local') {
    const { skill } = await loadSkillWithDetails({ source: 'browser', fileList: input.files })
    return skill
  }

  const candidates = getGithubCandidates(input)
  let firstError: unknown

  for (const candidate of candidates) {
    try {
      const { skill } = await loadSkillWithDetails({
        source: 'github',
        repo: candidate.repo,
        ref: candidate.ref,
        path: candidate.path,
      })
      return skill
    } catch (error) {
      firstError ??= error
      // A 404 can mean the branch/directory split was wrong, e.g. `tree/feature/demo/skills`.
      // Other failures are real, so they stop the fallback instead of multiplying requests.
      if (!(error instanceof Error) || !error.message.includes('404')) break
    }
  }

  throw firstError
}

const getGithubCandidates = (
  input: Extract<SkillImportFormInput, { source: 'github' }>,
): Array<Extract<SkillImportFormInput, { source: 'github' }>> => {
  try {
    return parseSkillAddGithubUrlCandidates(input.url)
  } catch {
    return [input]
  }
}
