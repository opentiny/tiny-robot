import type { ChatCompletionFunctionTool } from 'openai/resources'
import { parse as parseYaml } from 'yaml'
import type { SkillDefinition, SkillFile, SkillFileResource } from './types'
import { getExtension, isTextSkillFilePath, normalizeSkillPath } from './utils'

export interface SkillLoaderWarning {
  /**
   * 警告类型，便于 UI 或日志分类。
   */
  code: string
  /**
   * 人类可读的警告说明。
   */
  message: string
  /**
   * 关联文件路径。
   */
  path?: string
}

export interface LoadedSkill {
  /**
   * 从文件列表解析出的 SkillDefinition。
   */
  skill: SkillDefinition
  /**
   * 加载过程中的非致命问题。
   */
  warnings: SkillLoaderWarning[]
}

export interface SkillLoaderOptions {
  /**
   * Skill 入口文件名。
   */
  entryFile?: string
  /**
   * 严格模式。开启后，tools.json 等关键文件解析失败会直接抛错。
   */
  strict?: boolean
}

/**
 * 将标准化后的 skill 文件列表解析为 SkillDefinition。
 *
 * 该类不关心文件来自前端 FileSystemHandle、后端 fs、zip 还是远程接口；
 * 调用方只需要先把文件来源适配为 SkillFile[]。
 */
export class SkillLoader {
  private entryFile: string
  private strict: boolean

  constructor(options: SkillLoaderOptions = {}) {
    this.entryFile = options.entryFile ?? 'SKILL.md'
    this.strict = options.strict ?? false
  }

  load(files: SkillFile[]): LoadedSkill {
    const warnings: SkillLoaderWarning[] = []
    const normalizedFiles = this.normalizeFiles(files, warnings)
    const entryFile = normalizedFiles.find((file) => file.path === this.entryFile)

    if (!entryFile) {
      throw new Error(`Skill entry file "${this.entryFile}" is missing.`)
    }

    if (entryFile.kind !== 'text') {
      throw new Error(`Skill entry file "${this.entryFile}" must be a text file.`)
    }

    const { frontmatter, body } = parseMarkdownFrontmatter(entryFile.content)
    const frontmatterMetadata = getRecord(frontmatter.metadata)
    const skillFiles: SkillFileResource[] = []
    const tools: ChatCompletionFunctionTool[] = []

    for (const file of normalizedFiles) {
      if (file.path === this.entryFile) {
        continue
      }

      if (file.kind === 'binary') {
        skillFiles.push({
          ...file,
          id: file.path,
        })
        continue
      }

      if (!isTextSkillFilePath(file.path)) {
        warnings.push({
          code: 'unsupported-text-file-ignored',
          message: 'Only markdown, text, and json files are converted to text skill files.',
          path: file.path,
        })
        continue
      }

      if (isToolsFile(file.path)) {
        try {
          tools.push(...parseTools(file.content))
        } catch (error) {
          this.handleWarning(warnings, {
            code: 'tools-parse-failed',
            message: error instanceof Error ? error.message : String(error),
            path: file.path,
          })
        }
        continue
      }

      skillFiles.push({
        ...file,
        id: file.path,
      })
    }

    return {
      skill: {
        name: getString(frontmatter.name) || getFallbackSkillName(this.entryFile),
        description: getString(frontmatter.description) || '',
        instructions: body.trim(),
        tools: tools.length ? tools : undefined,
        files: skillFiles.length ? skillFiles : undefined,
        metadata: {
          ...frontmatterMetadata,
          homepage: getString(frontmatter.homepage),
          frontmatter,
        },
      },
      warnings,
    }
  }

  private normalizeFiles(files: SkillFile[], warnings: SkillLoaderWarning[]) {
    const result: SkillFile[] = []
    const seenPaths = new Set<string>()

    for (const file of files) {
      const path = normalizeSkillPath(file.path)

      if (!path) {
        this.handleWarning(warnings, {
          code: 'invalid-path',
          message: `Invalid skill file path: ${file.path}`,
          path: file.path,
        })
        continue
      }

      if (seenPaths.has(path)) {
        this.handleWarning(warnings, {
          code: 'duplicate-path',
          message: `Duplicate skill file path: ${path}`,
          path,
        })
        continue
      }

      seenPaths.add(path)
      result.push({ ...file, path } as SkillFile)
    }

    return result.sort((a, b) => a.path.localeCompare(b.path))
  }

  private handleWarning(warnings: SkillLoaderWarning[], warning: SkillLoaderWarning) {
    if (this.strict) {
      throw new Error(warning.path ? `${warning.path}: ${warning.message}` : warning.message)
    }

    warnings.push(warning)
  }
}

const parseMarkdownFrontmatter = (content: string) => {
  if (!content.startsWith('---')) {
    return {
      frontmatter: {} as Record<string, unknown>,
      body: content,
    }
  }

  const endIndex = content.indexOf('\n---', 3)
  if (endIndex === -1) {
    return {
      frontmatter: {} as Record<string, unknown>,
      body: content,
    }
  }

  const rawFrontmatter = content.slice(3, endIndex).trim()
  const body = content.slice(endIndex + 4)

  return {
    frontmatter: parseYamlFrontmatter(rawFrontmatter),
    body,
  }
}

const parseYamlFrontmatter = (rawFrontmatter: string) => {
  const parsed = parseYaml(rawFrontmatter)
  return getRecord(parsed) ?? {}
}

const getString = (value: unknown) => (typeof value === 'string' ? value : undefined)

const getRecord = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined

const isToolsFile = (path: string) => {
  const normalizedPath = path.toLowerCase()
  return normalizedPath === 'tools.json' || normalizedPath.startsWith('tools/')
}

const parseTools = (content: string): ChatCompletionFunctionTool[] => {
  const data = JSON.parse(content)
  const tools = Array.isArray(data) ? data : [data]
  return tools.map((tool, index) => {
    if (!isChatCompletionFunctionTool(tool)) {
      throw new Error(`Invalid function tool at index ${index}. Skill tools must be ChatCompletionFunctionTool.`)
    }

    return tool
  })
}

const isChatCompletionFunctionTool = (tool: unknown): tool is ChatCompletionFunctionTool => {
  if (!tool || typeof tool !== 'object') {
    return false
  }

  const candidate = tool as Partial<ChatCompletionFunctionTool>
  return (
    candidate.type === 'function' &&
    Boolean(candidate.function) &&
    typeof candidate.function === 'object' &&
    typeof candidate.function.name === 'string'
  )
}

const getResourceTitle = (path: string) => {
  const filename = path.split('/').at(-1) || path
  const ext = getExtension(filename)
  return ext ? filename.slice(0, -ext.length) : filename
}

const getFallbackSkillName = (entryFile: string) => getResourceTitle(entryFile)
