import { describe, expect, it, vi } from 'vitest'
import { createSkillSelectionRuntimeTools } from '../capabilities/selection'

const candidates = [{ name: 'weather', description: 'Weather skill' }]

describe('skill selection capability', () => {
  it.each([
    [-1, 0],
    [0, 0],
    [0.9, 0],
    [1.9, 1],
    [2, 1],
    [Number.NaN, 1],
    [Number.POSITIVE_INFINITY, 1],
  ])('normalizes maxSelectedSkills value %s to %s', (maxSelectedSkills, expectedMaxSelectedSkills) => {
    const [runtimeTool] = createSkillSelectionRuntimeTools(candidates, { maxSelectedSkills })
    const parameters = runtimeTool.tool.function.parameters as {
      properties: { skillNames: { maxItems: number } }
    }

    expect(parameters.properties.skillNames.maxItems).toBe(expectedMaxSelectedSkills)
  })

  it('resolves only the first concurrent valid select_skills call', async () => {
    let releaseSelection: (() => void) | undefined
    const selectionBlocked = new Promise<void>((resolve) => {
      releaseSelection = resolve
    })
    const resolveSelection = vi.fn(async () => {
      await selectionBlocked
      return { enabledSkillNames: ['weather'] }
    })
    const [runtimeTool] = createSkillSelectionRuntimeTools(candidates, { resolveSelection })

    const firstResult = runtimeTool.handler(createToolCall(['weather'], 'call-1'), {} as never)
    const secondResult = runtimeTool.handler(createToolCall(['weather'], 'call-2'), {} as never)

    await Promise.resolve()
    expect(resolveSelection).toHaveBeenCalledTimes(1)

    releaseSelection?.()
    await expect(firstResult).resolves.toMatchObject({ enabledSkillNames: ['weather'] })
    await expect(secondResult).resolves.toEqual({ error: 'skill_selection_already_resolved' })
  })
})

const createToolCall = (skillNames: string[], id: string) => ({
  id,
  type: 'function' as const,
  function: {
    name: 'select_skills',
    arguments: JSON.stringify({ skillNames }),
  },
})
