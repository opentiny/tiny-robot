import type { SkillDefinition, SkillFile } from './types'
import { SkillLoader } from './skillLoader'
import type { SkillLoaderOptions, SkillLoaderResult } from './skillLoader'

export type SkillManagerOptions = {
  /**
   * 初始化时写入 manager 的 skill 列表。
   */
  skills?: SkillDefinition[]
  /**
   * 初始化时选中的 skill 名称。
   */
  selectedSkillNames?: string[]
}

/**
 * 管理 skill 集合和选择状态。
 *
 * manager 不编译 prompt 或 tools，也不接入 message 生命周期。
 */
export class SkillManager {
  private skills = new Map<string, SkillDefinition>()
  private selectedSkillNames = new Set<string>()

  constructor(options: SkillManagerOptions = {}) {
    for (const skill of options.skills ?? []) {
      this.set(skill)
    }

    this.select(options.selectedSkillNames ?? [])
  }

  set(skill: SkillDefinition) {
    this.skills.set(skill.name, skill)
    return skill
  }

  remove(name: string) {
    const skill = this.get(name)

    this.skills.delete(name)
    this.selectedSkillNames.delete(name)

    return skill
  }

  clear() {
    this.skills.clear()
    this.selectedSkillNames.clear()
  }

  get(name: string) {
    return this.skills.get(name)
  }

  has(name: string) {
    return this.skills.has(name)
  }

  list() {
    return Array.from(this.skills.values())
  }

  select(names: string | string[]) {
    for (const name of Array.isArray(names) ? names : [names]) {
      if (!this.skills.has(name)) {
        throw new Error(`Skill "${name}" does not exist.`)
      }

      this.selectedSkillNames.add(name)
    }
  }

  unselect(names: string | string[]) {
    for (const name of Array.isArray(names) ? names : [names]) {
      this.selectedSkillNames.delete(name)
    }
  }

  getSelectedSkillNames() {
    return Array.from(this.selectedSkillNames)
  }

  getSelectedSkills() {
    return this.getSelectedSkillNames().flatMap((name) => {
      const skill = this.skills.get(name)
      return skill ? [skill] : []
    })
  }

  import(files: SkillFile[], options: SkillLoaderOptions = {}): SkillLoaderResult {
    const result = new SkillLoader(options).load(files)

    this.set(result.skill)
    return result
  }
}
