import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cacheDirectory = join(__dirname, '../src/skills/test/.cache')
const maxRetries = 5
const retryBaseDelay = 200
const requestTimeout = 30_000

const fixtures = [
  {
    repo: 'openclaw/openclaw',
    commit: '58672075219d09495de6489ad0821d276ac84f13',
    sourcePath: 'skills/weather',
  },
  {
    repo: 'vuejs-ai/skills',
    commit: 'b9d14d022da6a0a8bdcb824557f40bca6fbc1845',
    sourcePath: 'skills/vue-best-practices',
  },
]

const getFixtureTargetPath = (fixture) => {
  const normalizedSourcePath = fixture.sourcePath.split('\\').join('/')
  const targetName = normalizedSourcePath.split('/').filter(Boolean).at(-1)

  if (!targetName) {
    throw new Error(`Invalid fixture source path: ${fixture.sourcePath}`)
  }

  return join(cacheDirectory, targetName)
}

const waitForRetry = (retryCount) =>
  new Promise((resolve) => {
    setTimeout(resolve, retryBaseDelay * 2 ** retryCount)
  })

const isRetryableStatus = (status) => status === 429 || status >= 500

const fetchWithRetry = async (url, init, errorPrefix) => {
  let lastError

  for (let retryCount = 0; retryCount < maxRetries; retryCount += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort(new Error(`Request timeout after ${requestTimeout}ms`))
    }, requestTimeout)

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      })

      if (response.ok) {
        return response
      }

      const message = `${errorPrefix} ${url}: ${response.status} ${response.statusText}`
      if (!isRetryableStatus(response.status) || retryCount === maxRetries - 1) {
        throw new Error(message)
      }

      lastError = new Error(message)
    } catch (error) {
      lastError = error
      if (retryCount === maxRetries - 1) {
        throw error
      }
    } finally {
      clearTimeout(timeout)
    }

    await waitForRetry(retryCount)
  }

  throw lastError ?? new Error(`${errorPrefix} ${url}: retry budget exhausted`)
}

const fetchJson = async (url) => {
  const response = await fetchWithRetry(
    url,
    {
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': '@opentiny/tiny-robot-kit skill fixture downloader',
      },
    },
    'Failed to fetch',
  )

  return response.json()
}

const fetchBytes = async (url) => {
  const response = await fetchWithRetry(
    url,
    {
      headers: {
        'user-agent': '@opentiny/tiny-robot-kit skill fixture downloader',
      },
    },
    'Failed to download',
  )

  return new Uint8Array(await response.arrayBuffer())
}

const getMarkerPath = (targetPath) => join(targetPath, '.fixture-source.json')

const hasCurrentFixture = async (fixture) => {
  const targetPath = getFixtureTargetPath(fixture)

  try {
    const marker = JSON.parse(await readFile(getMarkerPath(targetPath), 'utf8'))
    return (
      marker.repo === fixture.repo &&
      marker.commit === fixture.commit &&
      marker.sourcePath === fixture.sourcePath
    )
  } catch {
    return false
  }
}

const downloadDirectory = async (fixture, sourcePath, targetPath) => {
  const url = new URL(`https://api.github.com/repos/${fixture.repo}/contents/${sourcePath}`)
  url.searchParams.set('ref', fixture.commit)

  const entries = await fetchJson(url)
  if (!Array.isArray(entries)) {
    throw new Error(`Expected directory listing for ${sourcePath}`)
  }

  for (const entry of entries) {
    const entryTargetPath = join(targetPath, entry.name)

    if (entry.type === 'dir') {
      await downloadDirectory(fixture, entry.path, entryTargetPath)
      continue
    }

    if (entry.type !== 'file' || !entry.download_url) {
      continue
    }

    await mkdir(dirname(entryTargetPath), { recursive: true })
    await writeFile(entryTargetPath, await fetchBytes(entry.download_url))
  }
}

for (const fixture of fixtures) {
  const targetPath = getFixtureTargetPath(fixture)

  if (await hasCurrentFixture(fixture)) {
    console.log(`Skill fixture already cached: ${fixture.sourcePath}@${fixture.commit}`)
    continue
  }

  console.log(`Downloading skill fixture: ${fixture.sourcePath}@${fixture.commit}`)
  await rm(targetPath, { recursive: true, force: true })
  await mkdir(targetPath, { recursive: true })
  await downloadDirectory(fixture, fixture.sourcePath, targetPath)
  await writeFile(
    getMarkerPath(targetPath),
    `${JSON.stringify(
      {
        repo: fixture.repo,
        commit: fixture.commit,
        sourcePath: fixture.sourcePath,
      },
      null,
      2,
    )}\n`,
  )
}
