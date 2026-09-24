import type { SkillImportFormInput } from './index.type'

export interface SkillAddBrowserSelectionValidationOptions {
  maxUploadSize?: number
}

export const DEFAULT_SKILL_ADD_MAX_UPLOAD_SIZE = 10 * 1024 * 1024

const GITHUB_SKILL_URL_ERROR = '请输入有效的 GitHub Skill 地址'

export function formatSkillAddMaxUploadSize(maxUploadSize: number): string {
  return `${maxUploadSize / 1024 / 1024}`
}

const decodeSkillAddGithubSegment = (segment: string) => {
  try {
    return decodeURIComponent(segment)
  } catch {
    throw new Error(GITHUB_SKILL_URL_ERROR)
  }
}

/**
 * A GitHub `tree` URL does not delimit the branch and the directory, so every split of the
 * path after `tree` is a candidate. Shorter refs come first, which keeps the common
 * `tree/<branch>/<directory>` form as the first attempt.
 */
export function getSkillAddGithubCandidates(segments: string[]): Array<{ ref: string; path: string }> {
  const candidates: Array<{ ref: string; path: string }> = []

  for (let refLength = 1; refLength < segments.length; refLength += 1) {
    candidates.push({
      ref: segments.slice(0, refLength).map(decodeSkillAddGithubSegment).join('/'),
      path: segments.slice(refLength).map(decodeSkillAddGithubSegment).join('/'),
    })
  }

  return candidates
}

export function validateSkillAddBrowserSelection(
  files: File[],
  options: SkillAddBrowserSelectionValidationOptions = {},
): string {
  const maxUploadSize = options.maxUploadSize ?? DEFAULT_SKILL_ADD_MAX_UPLOAD_SIZE
  if (!files.length) return '请选择要上传的 Skill 包'

  const paths = files.map((file) => (file.webkitRelativePath || '').replace(/\\/g, '/'))
  const roots = new Set(paths.map((path) => path.split('/').filter(Boolean)[0]).filter(Boolean))

  if (paths.some((path) => path.split('/').filter(Boolean).length < 2) || roots.size !== 1) {
    return '请拖入一个 Skill 文件夹'
  }

  const [root] = roots
  if (!paths.includes(`${root}/SKILL.md`)) return 'Skill 包必须包含 SKILL.md 文件'

  const totalSize = files.reduce((total, file) => total + file.size, 0)
  if (totalSize > maxUploadSize) {
    return `Skill 包大小不能超过 ${formatSkillAddMaxUploadSize(maxUploadSize)} MB`
  }

  return ''
}

export function parseSkillAddGithubUrlCandidates(
  value: string,
): Array<Extract<SkillImportFormInput, { source: 'github' }>> {
  const urlValue = value.trim()
  let url: URL

  try {
    url = new URL(urlValue)
  } catch {
    throw new Error(GITHUB_SKILL_URL_ERROR)
  }

  const parts = url.pathname.split('/')
  if (parts.at(-1) === '') parts.pop()
  parts.shift()
  const [owner, repo, tree, ref, ...pathParts] = parts
  const authority = urlValue.match(/^[^:/]+:\/\/([^/]+)/)?.[1]

  if (
    url.protocol !== 'https:' ||
    url.port !== '' ||
    url.username !== '' ||
    url.password !== '' ||
    !authority ||
    authority.includes(':') ||
    !['github.com', 'www.github.com'].includes(url.hostname.toLowerCase()) ||
    parts.some((part) => part === '') ||
    !owner ||
    !repo ||
    tree !== 'tree' ||
    !ref ||
    !pathParts.length
  ) {
    throw new Error(GITHUB_SKILL_URL_ERROR)
  }

  return getSkillAddGithubCandidates([ref, ...pathParts]).map((candidate) => ({
    source: 'github' as const,
    url: urlValue,
    repo: `${owner}/${repo}`,
    ref: candidate.ref,
    path: candidate.path,
  }))
}

export function parseSkillAddGithubUrl(value: string): Extract<SkillImportFormInput, { source: 'github' }> {
  const [candidate] = parseSkillAddGithubUrlCandidates(value)

  return candidate
}
