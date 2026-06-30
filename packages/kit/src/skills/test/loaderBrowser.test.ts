import { describe, expect, it } from 'vitest'
import { loadSkill, loadSkillWithDetails } from '../loader'
import { loadBrowserSkillFiles } from '../loader/browser'

type TestFile = File & {
  webkitRelativePath?: string
}

type TestDirectoryHandle = {
  kind: 'directory'
  entries(): AsyncIterable<[string, TestDirectoryHandle | TestFileHandle]>
}

type TestFileHandle = {
  kind: 'file'
  getFile(): Promise<File>
}

const createTestFile = (path: string, content: string | Uint8Array, type = 'text/plain'): TestFile => {
  const fileContent: BlobPart = typeof content === 'string' ? content : new Uint8Array(content)
  const file = new File([fileContent], path.split('/').at(-1) ?? path, {
    type,
    lastModified: 123,
  }) as TestFile

  file.webkitRelativePath = path
  return file
}

const createDirectoryHandle = (entries: Record<string, TestDirectoryHandle | File>): TestDirectoryHandle =>
  ({
    kind: 'directory',
    async *entries() {
      for (const [name, entry] of Object.entries(entries)) {
        if ('kind' in entry && entry.kind === 'directory') {
          yield [name, entry]
          continue
        }

        yield [
          name,
          {
            kind: 'file',
            getFile: async () => entry as File,
          },
        ]
      }
    },
  }) as TestDirectoryHandle

describe('browser loadSkill', () => {
  it('loads fileList skills and strips the root directory from resource paths', async () => {
    const loadedSkill = await loadSkill({
      source: 'browser',
      fileList: [
        createTestFile(
          'weather/SKILL.md',
          ['---', 'name: weather', 'description: Weather skill', '---', '', '# Weather Skill'].join('\n'),
          'text/markdown',
        ),
        createTestFile('weather/references/usage.md', '# Usage', 'text/markdown'),
      ],
    })

    expect(loadedSkill.name).toBe('weather')
    expect(loadedSkill.instructions).toContain('# Weather Skill')
    expect(loadedSkill.resources?.map((resource) => resource.path)).toEqual(['references/usage.md'])
    await expect(loadedSkill.resources?.[0]?.readText?.()).resolves.toBe('# Usage')
  })

  it('uses directoryHandle entries as paths relative to the selected skill root', async () => {
    const directoryHandle = createDirectoryHandle({
      'SKILL.md': createTestFile(
        'SKILL.md',
        ['---', 'name: weather', 'description: Weather skill', '---', '', '# Weather Skill'].join('\n'),
        'text/markdown',
      ),
      references: createDirectoryHandle({
        'usage.md': createTestFile('usage.md', '# Usage', 'text/markdown'),
      }),
    })

    const files = await loadBrowserSkillFiles(
      {
        source: 'browser',
        directoryHandle: directoryHandle as unknown as FileSystemDirectoryHandle,
      },
      {
        signal: new AbortController().signal,
      },
    )

    expect(files.map((file) => file.path)).toEqual(['SKILL.md', 'references/usage.md'])
  })

  it('loads binary browser resources', async () => {
    const image = new Uint8Array([1, 2, 3])
    const loadedSkill = await loadSkill({
      source: 'browser',
      fileList: [
        createTestFile(
          'binary-skill/SKILL.md',
          ['---', 'name: binary-skill', 'description: Binary skill', '---', '', '# Binary Skill'].join('\n'),
          'text/markdown',
        ),
        createTestFile('binary-skill/assets/icon.png', image, 'image/png'),
      ],
    })

    expect(loadedSkill.resources).toEqual([
      expect.objectContaining({
        path: 'assets/icon.png',
        kind: 'binary',
        mimeType: 'image/png',
        binary: image,
      }),
    ])
  })

  it('uses file names when webkitRelativePath is not available', async () => {
    const file = createTestFile(
      'SKILL.md',
      ['---', 'name: single-file', 'description: Single file skill', '---', '', '# Single'].join('\n'),
      'text/markdown',
    )
    file.webkitRelativePath = ''

    const loadedSkill = await loadSkill({
      source: 'browser',
      fileList: [file],
    })

    expect(loadedSkill.name).toBe('single-file')
    expect(loadedSkill.resources).toBeUndefined()
  })

  it('loads skill details with warnings', async () => {
    const loadedSkill = await loadSkillWithDetails({
      source: 'browser',
      fileList: [
        createTestFile(
          'weather/SKILL.md',
          ['---', 'name: weather', 'description: Weather skill', '---', '', '# Weather Skill'].join('\n'),
          'text/markdown',
        ),
      ],
    })

    expect(loadedSkill.skill.name).toBe('weather')
    expect(loadedSkill.warnings).toEqual([])
  })

  it('returns a cancellable load job', async () => {
    let releaseWait!: () => void
    const waitForText = new Promise<string>((resolve) => {
      releaseWait = () => resolve('# Cancelled')
    })
    const file = createTestFile(
      'cancelled/SKILL.md',
      ['---', 'name: cancelled', 'description: Cancelled skill', '---', '', '# Cancelled'].join('\n'),
      'text/markdown',
    )

    file.text = async () => waitForText

    const job = loadSkill({
      source: 'browser',
      fileList: [file],
    })

    job.cancel()
    releaseWait()

    await expect(job).rejects.toMatchObject({
      name: 'SkillLoadCancelledError',
    })
  })
})
