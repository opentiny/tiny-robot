import type { SkillImportFormInput, SkillDefinition, SkillResolver } from './index.type'
import { getSkillAddGithubSegments } from './validation'

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

  const target = await resolveGithubTarget(input)
  const { skill } = await loadSkillWithDetails({
    source: 'github',
    repo: target.repo,
    ref: target.ref,
    path: target.path,
  })

  return skill
}

const githubApiBase = 'https://api.github.com'
const githubRefPageSize = 100
const githubRefPageLimit = 10
const githubRequestRetryCount = 5
const githubRequestRetryBaseDelay = 200
const githubCommitShaPattern = /^[0-9a-f]{40}$/i

/** refs 查询失败时携带 HTTP 状态，便于组件按状态映射用户提示。 */
export class SkillGithubRequestError extends Error {
  readonly status: number

  constructor(status: number) {
    super('GitHub API request failed')
    this.name = 'SkillGithubRequestError'
    this.status = status
  }
}

const shouldRetryGithubStatus = (status: number) => status === 429 || status >= 500

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchGithubJson = async <T>(url: URL): Promise<T> => {
  let lastError: unknown

  for (let attempt = 1; attempt <= githubRequestRetryCount; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { accept: 'application/vnd.github+json' } })

      if (response.ok) return (await response.json()) as T

      lastError = new SkillGithubRequestError(response.status)
      if (!shouldRetryGithubStatus(response.status)) break
    } catch (error) {
      lastError = error
    }

    if (attempt < githubRequestRetryCount) {
      await delay(githubRequestRetryBaseDelay * 2 ** (attempt - 1))
    }
  }

  throw lastError
}

const fetchGithubMatchingRefs = async (repo: string, namespace: 'heads' | 'tags', prefix: string) => {
  const namespacePrefix = `refs/${namespace}/`
  const refs: string[] = []

  for (let page = 1; page <= githubRefPageLimit; page += 1) {
    const url = new URL(`${githubApiBase}/repos/${repo}/git/matching-refs/${namespace}/${prefix}`)
    url.searchParams.set('per_page', String(githubRefPageSize))
    url.searchParams.set('page', String(page))

    const batch = await fetchGithubJson<Array<{ ref?: string }>>(url)

    refs.push(
      ...batch
        .map((entry) => entry.ref ?? '')
        .filter((ref) => ref.startsWith(namespacePrefix))
        .map((ref) => ref.slice(namespacePrefix.length)),
    )

    if (batch.length < githubRefPageSize) return { refs, truncated: false }
  }

  return { refs, truncated: true }
}

/**
 * GitHub 解析 `tree/<ref>/<path>` 时，是把 URL 路径前缀与仓库真实 refs 匹配并取最长的一个，分支与标签都
 * 参与匹配（例如分支 `probe` 与标签 `probe/deep` 同时存在时取 `probe/deep`）。commit SHA 不在 refs 里，
 * 但 GitHub 同样支持 `tree/<sha>/<path>`，因此 40 位 SHA 直接按 URL 首段使用；其余情况不再猜测：
 * refs 查询失败或没有匹配项都会直接报错，避免用未经验证的拆分去加载。
 */
const resolveGithubTarget = async (
  input: Extract<SkillImportFormInput, { source: 'github' }>,
): Promise<{ repo: string; ref: string; path: string }> => {
  const segments = getSkillAddGithubSegments(input.url)
  const [prefix] = segments

  if (githubCommitShaPattern.test(prefix)) {
    return { repo: input.repo, ref: prefix, path: segments.slice(1).join('/') }
  }

  const [heads, tags] = await Promise.all([
    fetchGithubMatchingRefs(input.repo, 'heads', prefix),
    fetchGithubMatchingRefs(input.repo, 'tags', prefix),
  ])
  const matched = [...heads.refs, ...tags.refs]
    .filter((ref) => segments.slice(0, ref.split('/').length).join('/') === ref)
    .sort((left, right) => right.length - left.length)
  const [ref] = matched

  if (!ref) {
    if (heads.truncated || tags.truncated) {
      throw new Error('该仓库同前缀的分支或标签过多，暂时无法确定引用，请改用指向 commit SHA 的链接')
    }

    throw new Error('未找到与该链接匹配的分支或标签，请检查链接是否正确')
  }

  return { repo: input.repo, ref, path: segments.slice(ref.split('/').length).join('/') }
}
