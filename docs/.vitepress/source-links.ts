import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

interface SourceLinksOptions {
  env?: Readonly<Record<string, string | undefined>>
  readGit?: (args: string[]) => string
}

function readLocalGit(args: string[]): string {
  try {
    return execFileSync('git', args, {
      cwd: fileURLToPath(new URL('../..', import.meta.url)),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

function githubRepository(remote: string): string {
  if (remote.startsWith('git@github.com:')) return remote.slice('git@github.com:'.length).replace(/\.git$/, '')
  try {
    const url = new URL(remote)
    return url.hostname === 'github.com'
      ? url.pathname
          .replace(/^\//, '')
          .replace(/\/?\.git$/, '')
          .replace(/\/$/, '')
      : ''
  } catch {
    return ''
  }
}

export function resolveSourceLinks({ env = process.env, readGit = readLocalGit }: SourceLinksOptions = {}) {
  const repository =
    env.DOCS_SOURCE_REPOSITORY?.trim() ||
    env.GITHUB_REPOSITORY?.trim() ||
    githubRepository(readGit(['remote', 'get-url', 'origin']))
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) {
    throw new Error('Set DOCS_SOURCE_REPOSITORY to a GitHub owner/repository, or configure a GitHub origin remote.')
  }
  const pullRequestMerge = env.GITHUB_REF?.startsWith('refs/pull/')
  const ref =
    env.DOCS_SOURCE_REF?.trim() ||
    (!pullRequestMerge && env.GITHUB_REF_NAME?.trim()) ||
    readGit(['branch', '--show-current']) ||
    readGit(['rev-parse', 'HEAD'])
  if (!ref) throw new Error('Set DOCS_SOURCE_REF or build inside a Git checkout.')
  const encodedRef = ref.split('/').map(encodeURIComponent).join('/')
  const base = `https://github.com/${repository}`
  return { repository, ref, treeBase: `${base}/tree/${encodedRef}`, blobBase: `${base}/blob/${encodedRef}` }
}
