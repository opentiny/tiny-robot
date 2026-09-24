import type { SkillImportFormInput } from './index.type'

export interface SkillAddBrowserSelectionValidationOptions {
  maxUploadSize?: number
}

export const DEFAULT_SKILL_ADD_MAX_UPLOAD_SIZE = 10 * 1024 * 1024

export const DEFAULT_SKILL_ADD_RESOLVE_TIMEOUT = 30 * 1000

const GITHUB_SKILL_URL_ERROR = '请输入有效的 GitHub Skill 地址'
const GITHUB_SKILL_FILE_ERROR = '请粘贴 Skill 目录链接，或指向 SKILL.md 的文件链接'

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

interface SkillAddGithubLink {
  url: string
  repo: string
  /** `tree` / `blob` 之后的路径段，第一段是 ref 的开头；GitHub 用仓库真实 refs 决定 ref 与目录的边界。 */
  segments: string[]
}

const parseSkillAddGithubLink = (value: string): SkillAddGithubLink => {
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
  const [owner, repo, linkType, ref, ...linkParts] = parts
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
    !ref ||
    (linkType !== 'tree' && linkType !== 'blob')
  ) {
    throw new Error(GITHUB_SKILL_URL_ERROR)
  }

  const isSkillEntryBlobLink = linkType === 'blob' && linkParts.length >= 2 && linkParts.at(-1) === 'SKILL.md'

  if (linkType === 'blob' && !isSkillEntryBlobLink) throw new Error(GITHUB_SKILL_FILE_ERROR)

  const pathParts = isSkillEntryBlobLink ? linkParts.slice(0, -1) : linkParts
  if (!pathParts.length) throw new Error(GITHUB_SKILL_URL_ERROR)

  return {
    url: urlValue,
    repo: `${owner}/${repo}`,
    segments: [ref, ...pathParts].map(decodeSkillAddGithubSegment),
  }
}

export function parseSkillAddGithubUrl(value: string): Extract<SkillImportFormInput, { source: 'github' }> {
  const { url, repo, segments } = parseSkillAddGithubLink(value)

  return { source: 'github', url, repo, ref: segments[0], path: segments.slice(1).join('/') }
}

export function getSkillAddGithubSegments(value: string): string[] {
  return parseSkillAddGithubLink(value).segments
}
