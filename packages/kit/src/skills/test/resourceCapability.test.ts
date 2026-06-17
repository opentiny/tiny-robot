import { describe, expect, it } from 'vitest'
import { createSkillResourceRuntimeTools } from '../capabilities/resources'

describe('skill resource tools', () => {
  it('creates file runtime tools when skills have resources', () => {
    const runtimeTools = createSkillResourceRuntimeTools([
      {
        name: 'docs',
        description: 'Docs skill',
        instructions: 'Use docs.',
        resources: [
          {
            path: 'guide.md',
            kind: 'text',
            resourceId: 'guide.md',
            text: '# Guide',
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
      createSkillResourceRuntimeTools([
        { name: 'plain', description: 'Plain skill', instructions: 'Use plain skill.' },
      ]),
    ).toEqual([])
  })

  it('lists and reads files through built-in runtime tools', async () => {
    const [listFiles, readFile] = createSkillResourceRuntimeTools([
      {
        name: 'docs',
        description: 'Docs skill',
        instructions: 'Use docs.',
        resources: [
          {
            path: 'guide.md',
            kind: 'text',
            resourceId: 'guide.md',
            text: '# Guide',
            mimeType: 'text/markdown',
          },
          {
            path: 'icon.png',
            kind: 'binary',
            resourceId: 'icon.png',
            binary: new Uint8Array([1, 2, 3]),
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
      await readFile.handler(createToolCall('read_skill_file', { skillName: 'docs', path: 'guide.md' }), {} as never),
    ).toMatchObject({
      file: {
        skillName: 'docs',
        path: 'guide.md',
        kind: 'text',
      },
      content: '# Guide',
    })

    expect(
      await readFile.handler(createToolCall('read_skill_file', { skillName: 'docs', path: 'icon.png' }), {} as never),
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
    const [listFiles] = createSkillResourceRuntimeTools([
      {
        name: 'docs',
        description: 'Docs skill',
        instructions: 'Use docs.',
        resources: [
          {
            path: 'guide.md',
            kind: 'text',
            resourceId: 'guide.md',
            text: '# Guide',
          },
        ],
      },
      {
        name: 'vue',
        description: 'Vue skill',
        instructions: 'Use Vue.',
        resources: [
          {
            path: 'sfc.md',
            kind: 'text',
            resourceId: 'sfc.md',
            text: '# SFC',
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

  it('returns stable errors when reading skill files with invalid arguments', async () => {
    const [, readFile] = createSkillResourceRuntimeTools([
      {
        name: 'docs',
        description: 'Docs skill',
        instructions: 'Use docs.',
        resources: [
          {
            path: 'guide.md',
            kind: 'text',
            resourceId: 'guide.md',
            text: '# Guide',
          },
        ],
      },
    ])

    await expect(readFile.handler(createToolCallWithArguments('read_skill_file', '{'), {} as never)).resolves.toEqual({
      error: 'skill_not_found',
    })
    await expect(
      readFile.handler(createToolCall('read_skill_file', { skillName: 'docs' }), {} as never),
    ).resolves.toEqual({
      error: 'file_path_required',
      skillName: 'docs',
    })
    await expect(
      readFile.handler(createToolCall('read_skill_file', { skillName: 'docs', path: 'missing.md' }), {} as never),
    ).resolves.toEqual({
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
