/** SkillDefinition 继续由 kit SkillStorage 管理；应用配置按 Skill 名称另存。 */
export interface SkillOptionsStorage {
  get(name: string): Promise<{ enabled: boolean } | undefined>
  set(name: string, options: { enabled: boolean }): Promise<void>
}

export const createMemorySkillOptionsStorage = (): SkillOptionsStorage => {
  const values = new Map<string, { enabled: boolean }>()
  return {
    async get(name) {
      const value = values.get(name)
      return value && { ...value }
    },
    async set(name, options) {
      values.set(name, { ...options })
    },
  }
}
