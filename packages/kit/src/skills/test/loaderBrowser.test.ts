import { describe, expect, it } from 'vitest'
import { loadSkill, loadSkillWithDetails } from '../loader'

type TestFile = File & {
  webkitRelativePath?: string
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
