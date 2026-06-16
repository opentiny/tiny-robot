import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadSkill } from '../loader/node'

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
    const { skill } = loadedSkill

    expect(skill.name).toBe('weather')
    expect(skill.description).toContain('weather')
    expect(skill.instructions).toContain('# Weather Skill')
    expect(skill.metadata?.homepage).toBe('https://wttr.in/:help')
    expect(loadedSkill.warnings).toEqual([])
  })

  it('loads multi-file skill references as resources', async () => {
    const root = fileURLToPath(new URL('./.cache/vue-best-practices', import.meta.url))
    const loadedSkill = await loadSkill({ source: 'fs', root })
    const { skill } = loadedSkill

    expect(skill.name).toBe('vue-best-practices')
    expect(skill.description).toContain('Vue.js tasks')
    expect(skill.instructions).toContain('# Vue Best Practices Workflow')
    expect(skill.metadata).toMatchObject({
      author: 'github.com/vuejs-ai',
      version: '18.0.0',
    })
    expect(skill.resources).toBeDefined()
    expect(skill.resources?.map((file) => file.path)).toEqual(
      expect.arrayContaining([
        'references/reactivity.md',
        'references/sfc.md',
        'references/component-data-flow.md',
        'references/composables.md',
      ]),
    )
    expect(skill.resources?.find((file) => file.path === 'references/reactivity.md')).toMatchObject({
      path: 'references/reactivity.md',
      kind: 'text',
      text: expect.stringContaining('# Reactivity'),
    })
    expect(loadedSkill.warnings).toEqual([])
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

    expect(loadedSkill.skill.name).toBe(expectedSkill.skill.name)
    expect(loadedSkill.skill.description).toBe(expectedSkill.skill.description)
    expect(loadedSkill.skill.instructions).toBe(expectedSkill.skill.instructions)
    expect(loadedSkill.skill.metadata).toEqual(expectedSkill.skill.metadata)
    const expectedResources = expectedSkill.skill.resources?.filter(
      (resource) => resource.path !== '.fixture-source.json',
    )
    expect(loadedSkill.skill.resources).toEqual(expectedResources?.length ? expectedResources : undefined)
    expect(loadedSkill.warnings).toEqual([])
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
      skill: {
        name: 'retry-weather',
        description: 'Retry weather skill',
        instructions: expect.stringContaining('# Retry'),
      },
      warnings: [],
    })
    expect(fetch).toHaveBeenCalledTimes(5)
  })
})
