import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadSkill, loadSkillWithDetails } from '../loader/node'

const createResponse = (
  status: number,
  body: unknown,
  statusText = status >= 200 && status < 300 ? 'OK' : 'Server Error',
) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => body,
    arrayBuffer: async () => {
      const bytes = new TextEncoder().encode(String(body))
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    },
  }) as Response

describe('node loadSkill', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('loads weather skill directory as SkillDefinition', async () => {
    const root = fileURLToPath(new URL('./.cache/weather', import.meta.url))
    const loadedSkill = await loadSkill({ source: 'fs', root })

    expect(loadedSkill.name).toBe('weather')
    expect(loadedSkill.description).toContain('weather')
    expect(loadedSkill.instructions).toContain('# Weather Skill')
    expect(loadedSkill.metadata?.homepage).toBe('https://wttr.in/:help')
  })

  it('loads multi-file skill references as resources', async () => {
    const root = fileURLToPath(new URL('./.cache/vue-best-practices', import.meta.url))
    const loadedSkill = await loadSkill({ source: 'fs', root })

    expect(loadedSkill.name).toBe('vue-best-practices')
    expect(loadedSkill.description).toContain('Vue.js tasks')
    expect(loadedSkill.instructions).toContain('# Vue Best Practices Workflow')
    expect(loadedSkill.metadata).toMatchObject({
      author: 'github.com/vuejs-ai',
      version: '18.0.0',
    })
    expect(loadedSkill.resources).toBeDefined()
    expect(loadedSkill.resources?.map((file) => file.path)).toEqual(
      expect.arrayContaining([
        'references/reactivity.md',
        'references/sfc.md',
        'references/component-data-flow.md',
        'references/composables.md',
      ]),
    )
    expect(loadedSkill.resources?.find((file) => file.path === 'references/reactivity.md')).toMatchObject({
      path: 'references/reactivity.md',
      kind: 'text',
      text: expect.stringContaining('# Reactivity'),
    })
  })

  it('loads weather skill from GitHub over the network', async () => {
    const expectedRoot = fileURLToPath(new URL('./.cache/weather', import.meta.url))
    const expectedSkill = await loadSkill({ source: 'fs', root: expectedRoot })
    const loadedSkill = await loadSkill({
      source: 'github',
      repo: 'openclaw/openclaw',
      ref: '58672075219d09495de6489ad0821d276ac84f13',
      path: 'skills/weather',
    })

    expect(loadedSkill.name).toBe(expectedSkill.name)
    expect(loadedSkill.description).toBe(expectedSkill.description)
    expect(loadedSkill.instructions).toBe(expectedSkill.instructions)
    expect(loadedSkill.metadata).toEqual(expectedSkill.metadata)
    const expectedResources = expectedSkill.resources?.filter((resource) => resource.path !== '.fixture-source.json')
    expect(loadedSkill.resources).toEqual(expectedResources?.length ? expectedResources : undefined)
  })

  it('retries transient GitHub fetch failures with exponential backoff', async () => {
    vi.useFakeTimers()
    const skillMarkdown = ['---', 'name: retry-weather', 'description: Retry weather skill', '---', '', '# Retry'].join(
      '\n',
    )
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(createResponse(500, { message: 'server error' }))
      .mockResolvedValueOnce(
        createResponse(200, [
          {
            name: 'SKILL.md',
            path: 'skills/weather/SKILL.md',
            type: 'file',
            size: skillMarkdown.length,
            download_url: 'https://raw.githubusercontent.com/openclaw/openclaw/SKILL.md',
          },
        ]),
      )
      .mockResolvedValueOnce(createResponse(502, 'bad gateway'))
      .mockResolvedValueOnce(createResponse(503, 'unavailable'))
      .mockResolvedValueOnce(createResponse(200, skillMarkdown))

    vi.stubGlobal('fetch', fetch)

    const job = loadSkill({
      source: 'github',
      repo: 'openclaw/openclaw',
      ref: '58672075219d09495de6489ad0821d276ac84f13',
      path: 'skills/weather',
    })

    await vi.advanceTimersByTimeAsync(200 + 200 + 400)

    await expect(job).resolves.toMatchObject({
      name: 'retry-weather',
      description: 'Retry weather skill',
      instructions: expect.stringContaining('# Retry'),
    })
    expect(fetch).toHaveBeenCalledTimes(5)
  })

  it('loads skill details with warnings', async () => {
    const root = fileURLToPath(new URL('./.cache/weather', import.meta.url))
    const loadedSkill = await loadSkillWithDetails({ source: 'fs', root })

    expect(loadedSkill.skill.name).toBe('weather')
    expect(loadedSkill.warnings).toEqual([])
  })
})
