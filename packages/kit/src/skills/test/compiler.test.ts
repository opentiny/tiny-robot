import { describe, expect, it } from 'vitest'
import { compileSkillInstructions, createSkillFileRuntimeTools } from '../compiler'

describe('skill compiler', () => {
  it('creates file runtime tools when skills have files', () => {
    const runtimeTools = createSkillFileRuntimeTools([
      {
        name: 'docs',
        description: 'Docs skill',
        instructions: 'Use docs.',
        files: [
          {
            id: 'guide.md',
            path: 'guide.md',
            kind: 'text',
            content: '# Guide',
          },
        ],
      },
      {
        name: 'plain',
        description: 'Plain skill',
        instructions: 'Use plain skill.',
      },
    ])

    expect(runtimeTools.map((runtimeTool) => runtimeTool.tool.function.name)).toEqual([
      'list_skill_files',
      'read_skill_file',
    ])
  })

  it('returns no runtime file tools when skills have no files', () => {
    expect(
      createSkillFileRuntimeTools([{ name: 'plain', description: 'Plain skill', instructions: 'Use plain skill.' }]),
    ).toEqual([])
  })

  it('compiles instructions into a system message', async () => {
    const message = await compileSkillInstructions([
      {
        name: 'weather',
        description: 'Weather skill',
        instructions: 'Use wttr.in.',
      },
      {
        name: 'vue',
        description: 'Vue skill',
        instructions: 'Use Vue best practices.',
      },
      {
        name: 'empty',
        description: 'Empty skill',
        instructions: '   ',
      },
    ])

    expect(message).toMatchObject({ role: 'system' })
    expect(message?.content).toContain('Apply these skill instructions')
    expect(message?.content).toContain('## weather\n\nUse wttr.in.')
    expect(message?.content).toContain('## vue\n\nUse Vue best practices.')
    expect(message?.content).not.toContain('## empty')
  })

  it('does not compile an instruction message when no skill has instructions', async () => {
    await expect(
      compileSkillInstructions([{ name: 'plain', description: 'Plain skill', instructions: '   ' }]),
    ).resolves.toBeUndefined()
  })

  it('lists and reads files through built-in runtime tools', () => {
    const [listFiles, readFile] = createSkillFileRuntimeTools([
      {
        name: 'docs',
        description: 'Docs skill',
        instructions: 'Use docs.',
        files: [
          {
            id: 'guide.md',
            path: 'guide.md',
            kind: 'text',
            content: '# Guide',
            mimeType: 'text/markdown',
          },
          {
            id: 'icon.png',
            path: 'icon.png',
            kind: 'binary',
            content: new Uint8Array([1, 2, 3]),
          },
        ],
      },
    ])

    expect(listFiles.handler(createToolCall('list_skill_files', {}), {} as never)).toMatchObject({
      files: [
        {
          skillName: 'docs',
          path: 'guide.md',
          kind: 'text',
        },
        {
          skillName: 'docs',
          path: 'icon.png',
          kind: 'binary',
        },
      ],
    })

    expect(
      readFile.handler(createToolCall('read_skill_file', { skillName: 'docs', path: 'guide.md' }), {} as never),
    ).toMatchObject({
      file: {
        skillName: 'docs',
        path: 'guide.md',
        kind: 'text',
      },
      content: '# Guide',
    })

    expect(
      readFile.handler(createToolCall('read_skill_file', { skillName: 'docs', path: 'icon.png' }), {} as never),
    ).toMatchObject({
      error: 'binary_file_not_readable',
      file: {
        skillName: 'docs',
        path: 'icon.png',
        kind: 'binary',
      },
    })
  })

  it('filters listed files by skill name', () => {
    const [listFiles] = createSkillFileRuntimeTools([
      {
        name: 'docs',
        description: 'Docs skill',
        instructions: 'Use docs.',
        files: [
          {
            id: 'guide.md',
            path: 'guide.md',
            kind: 'text',
            content: '# Guide',
          },
        ],
      },
      {
        name: 'vue',
        description: 'Vue skill',
        instructions: 'Use Vue.',
        files: [
          {
            id: 'sfc.md',
            path: 'sfc.md',
            kind: 'text',
            content: '# SFC',
          },
        ],
      },
    ])

    expect(listFiles.handler(createToolCall('list_skill_files', { skillName: 'vue' }), {} as never)).toMatchObject({
      files: [
        {
          skillName: 'vue',
          path: 'sfc.md',
        },
      ],
    })
  })

  it('returns stable errors when reading skill files with invalid arguments', () => {
    const [, readFile] = createSkillFileRuntimeTools([
      {
        name: 'docs',
        description: 'Docs skill',
        instructions: 'Use docs.',
        files: [
          {
            id: 'guide.md',
            path: 'guide.md',
            kind: 'text',
            content: '# Guide',
          },
        ],
      },
    ])

    expect(readFile.handler(createToolCallWithArguments('read_skill_file', '{'), {} as never)).toEqual({
      error: 'skill_not_found',
    })
    expect(readFile.handler(createToolCall('read_skill_file', { skillName: 'docs' }), {} as never)).toEqual({
      error: 'file_path_required',
      skillName: 'docs',
    })
    expect(
      readFile.handler(createToolCall('read_skill_file', { skillName: 'docs', path: 'missing.md' }), {} as never),
    ).toEqual({
      error: 'file_not_found',
      skillName: 'docs',
      path: 'missing.md',
    })
  })
})

const createToolCall = (name: string, args: Record<string, unknown>) => ({
  ...createToolCallWithArguments(name, JSON.stringify(args)),
})

const createToolCallWithArguments = (name: string, args: string) => ({
  id: `call_${name}`,
  type: 'function' as const,
  function: {
    name,
    arguments: args,
  },
})
