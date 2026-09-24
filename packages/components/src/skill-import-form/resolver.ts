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

const fetchGithubMatchingRefs = async (repo: string, namespace: 'heads' | 'tags', prefix: string) => {
  const namespacePrefix = `refs/${namespace}/`
  const refs: string[] = []

  // matching-refs 按字符串前缀匹配且分页返回，这里最多取 3 页（300 个同前缀 ref）。
  for (let page = 1; page <= 3; page += 1) {
    const url = new URL(`${githubApiBase}/repos/${repo}/git/matching-refs/${namespace}/${prefix}`)
    url.searchParams.set('per_page', '100')
    url.searchParams.set('page', String(page))

    const response = await fetch(url, { headers: { accept: 'application/vnd.github+json' } })

    // 查询失败（限流、无权限）时交出已拿到的结果，由调用方决定是否回退到 URL 首段解析。
    if (!response.ok) return refs

    const batch = (await response.json()) as Array<{ ref?: string }>

    refs.push(
      ...batch
        .map((entry) => entry.ref ?? '')
        .filter((ref) => ref.startsWith(namespacePrefix))
        .map((ref) => ref.slice(namespacePrefix.length)),
    )

    if (batch.length < 100) break
  }

  return refs
}

/**
 * GitHub 解析 `tree/<ref>/<path>` 时，是把 URL 路径前缀与仓库真实 refs 匹配并取最长的一个，
 * 分支与标签都参与匹配（例如分支 `probe` 与标签 `probe/deep` 同时存在时取 `probe/deep`）。
 * 查不到匹配 ref 时（例如 URL 直接使用 commit SHA）沿用解析出的首段，保持原有行为。
 */
const resolveGithubTarget = async (
  input: Extract<SkillImportFormInput, { source: 'github' }>,
): Promise<{ repo: string; ref: string; path: string }> => {
  const segments = getSkillAddGithubSegments(input.url)
  const [prefix] = segments

  try {
    const [heads, tags] = await Promise.all([
      fetchGithubMatchingRefs(input.repo, 'heads', prefix),
      fetchGithubMatchingRefs(input.repo, 'tags', prefix),
    ])
    const matched = [...heads, ...tags]
      .filter((ref) => segments.slice(0, ref.split('/').length).join('/') === ref)
      .sort((left, right) => right.length - left.length)
    const [ref] = matched

    if (ref) {
      return { repo: input.repo, ref, path: segments.slice(ref.split('/').length).join('/') }
    }
  } catch {
    // refs 查询失败（限流、网络）时退回首段解析，尽量保持既有导入能力。
  }

  return { repo: input.repo, ref: input.ref, path: input.path }
}
