import type { GithubSkillLoadOptions, LoadableSkillFile, SkillLoadContext } from './type'
import { isTextSkillFilePath, normalizeSkillPath, throwIfSkillLoadCancelled } from './utils'

const userAgent = '@opentiny/tiny-robot-kit skill loader'
const maxGithubFetchRetries = 5
const githubFetchRetryBaseDelay = 200

type GithubContentEntry = {
  name: string
  path: string
  type: 'file' | 'dir' | 'symlink' | 'submodule'
  size?: number
  download_url?: string | null
}

type GithubRepository = {
  default_branch: string
}

export async function loadGithubSkillFiles(
  options: GithubSkillLoadOptions,
  context: SkillLoadContext,
): Promise<LoadableSkillFile[]> {
  const result: LoadableSkillFile[] = []
  const ref = await resolveGithubRef(options, context)
  const skillRoot = normalizeRepoPath(options.path)

  const walk = async (sourcePath: string) => {
    const url = new URL(`https://api.github.com/repos/${options.repo}/contents/${sourcePath}`)
    url.searchParams.set('ref', ref)

    const entries = await fetchGithubJson<GithubContentEntry[]>(url, context)

    if (!Array.isArray(entries)) {
      throw new Error(`Expected directory listing for ${sourcePath}`)
    }

    for (const entry of entries) {
      if (entry.type === 'dir') {
        if (entry.name.startsWith('.')) {
          continue
        }

        await walk(entry.path)
        continue
      }

      if (entry.type !== 'file' || !entry.download_url) {
        continue
      }

      const path = toSkillRelativePath(skillRoot, entry.path)

      if (!path) {
        continue
      }

      const kind = isTextSkillFilePath(path) ? 'text' : 'binary'
      const bytes = await fetchGithubBytes(entry.download_url, context)
      const content = kind === 'text' ? new TextDecoder().decode(bytes) : bytes

      result.push({
        path,
        kind,
        content,
        size: entry.size,
      })
    }
  }

  await walk(skillRoot)
  return result
}

async function resolveGithubRef(options: GithubSkillLoadOptions, context: SkillLoadContext) {
  if (options.ref) {
    return options.ref
  }

  const repository = await fetchGithubJson<GithubRepository>(`https://api.github.com/repos/${options.repo}`, context)

  if (!repository.default_branch) {
    throw new Error(`Repository "${options.repo}" does not expose a default branch.`)
  }

  return repository.default_branch
}

async function fetchGithubJson<T>(url: URL | string, context: SkillLoadContext): Promise<T> {
  const response = await fetchGithubWithRetry(url, context, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': userAgent,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${response}: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

async function fetchGithubBytes(url: string, context: SkillLoadContext) {
  const response = await fetchGithubWithRetry(url, context, {
    headers: {
      'user-agent': userAgent,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }

  const bytes = new Uint8Array(await response.arrayBuffer())
  return bytes
}

async function fetchGithubWithRetry(
  url: URL | string,
  context: SkillLoadContext,
  init: RequestInit,
): Promise<Response> {
  let lastError: unknown

  for (let retryCount = 0; retryCount <= maxGithubFetchRetries; retryCount += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: context.signal,
      })

      if (response.ok || !shouldRetryGithubResponse(response)) {
        return response
      }

      lastError = new Error(`GitHub request failed with ${response.status} ${response.statusText}`)
    } catch (error) {
      if (context.signal.aborted) {
        throw error
      }

      lastError = error
    }

    if (retryCount < maxGithubFetchRetries) {
      await waitForGithubFetchRetry(retryCount, context)
    }
  }

  throw lastError
}

function shouldRetryGithubResponse(response: Response) {
  return response.status === 429 || response.status >= 500
}

function waitForGithubFetchRetry(retryCount: number, context: SkillLoadContext) {
  throwIfSkillLoadCancelled(context.signal)
  const delay = githubFetchRetryBaseDelay * 2 ** retryCount

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      context.signal.removeEventListener('abort', onAbort)
      resolve()
    }, delay)

    const onAbort = () => {
      clearTimeout(timeout)
      reject(context.signal.reason)
    }

    context.signal.addEventListener('abort', onAbort, {
      once: true,
    })
  })
}

function normalizeRepoPath(path: string) {
  return path
    .split('\\')
    .join('/')
    .replace(/^\/+|\/+$/g, '')
}

function toSkillRelativePath(skillRoot: string, entryPath: string) {
  const normalizedEntry = normalizeRepoPath(entryPath)
  const prefix = `${skillRoot}/`

  if (normalizedEntry === skillRoot) {
    return normalizeSkillPath(normalizedEntry.split('/').at(-1) || normalizedEntry)
  }

  if (!normalizedEntry.startsWith(prefix)) {
    return normalizeSkillPath(normalizedEntry)
  }

  return normalizeSkillPath(normalizedEntry.slice(prefix.length))
}
