import { describe, expect, it } from 'vitest'
import type { ToolCallContext } from '../../message/plugins/toolPlugin'
import type { SkillDefinition } from '../types'
import { createSessionSkillResourceRuntimeTools } from '../capabilities/resources'

const context = { abortSignal: new AbortController().signal } as ToolCallContext
const call = (name: string, args: object) => ({
  id: 'read',
  type: 'function' as const,
  function: { name, arguments: JSON.stringify(args) },
})

describe('session resources', () => {
  it('reads current resources and rejects a source removed after a successful read', async () => {
    let current: SkillDefinition | undefined = {
      name: 'A',
      description: 'summary',
      instructions: 'guide',
      resources: [{ path: 'guide.md', kind: 'text', resourceId: 'guide.md', readText: async () => 'Current guide' }],
    }
    const [list, read] = createSessionSkillResourceRuntimeTools(() => current)
    expect(await list.handler(call('list_skill_files', { skillName: 'A' }), context)).toMatchObject({
      files: [{ path: 'guide.md', kind: 'text' }],
    })
    expect(await read.handler(call('read_skill_file', { skillName: 'A', path: 'guide.md' }), context)).toMatchObject({
      content: 'Current guide',
    })
    current = undefined
    expect(await read.handler(call('read_skill_file', { skillName: 'A', path: 'guide.md' }), context)).toMatchObject({
      error: 'skill_unavailable',
    })
    current = {
      name: 'A',
      description: 'new',
      instructions: 'new',
      resources: [{ path: 'guide.md', kind: 'text', resourceId: 'guide.md', text: 'Replacement' }],
    }
    expect(await read.handler(call('read_skill_file', { skillName: 'A', path: 'guide.md' }), context)).toMatchObject({
      content: 'Replacement',
    })
  })

  it('reports missing files, binary files, and source errors', async () => {
    const [, read] = createSessionSkillResourceRuntimeTools(() => ({
      name: 'A',
      description: '',
      instructions: '',
      resources: [{ path: 'asset.bin', resourceId: 'asset.bin', kind: 'binary', binary: new Uint8Array() }],
    }))
    expect(await read.handler(call('read_skill_file', { skillName: 'A', path: 'missing' }), context)).toMatchObject({
      error: 'file_not_found',
    })
    expect(await read.handler(call('read_skill_file', { skillName: 'A', path: 'asset.bin' }), context)).toMatchObject({
      error: 'binary_file_not_readable',
    })
    const [list] = createSessionSkillResourceRuntimeTools(() => {
      throw new Error('offline')
    })
    expect(await list.handler(call('list_skill_files', { skillName: 'A' }), context)).toMatchObject({
      error: 'skill_load_failed',
    })
  })
})
