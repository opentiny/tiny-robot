import { createMemorySkillStorage, loadSkill } from '@opentiny/tiny-robot-kit'
import type { SkillDefinition } from '@opentiny/tiny-robot-kit'
import { computed, ref, watch } from 'vue'
import { exampleSkills } from './exampleSkillFiles'

type SkillFileNode = {
  path: string
  label: string
  kind: 'entry' | 'folder' | 'text' | 'binary'
  depth: number
}

export const useSkillInspector = () => {
  const storage = createMemorySkillStorage()
  const skills = ref<SkillDefinition[]>([])
  const inspectedSkillName = ref('')
  const selectedFilePath = ref('SKILL.md')
  const selectedFileText = ref('')
  const errorMessage = ref('')

  const syncStorageState = async () => {
    const summaries = await storage.list()
    const loadedSkills = await Promise.all(summaries.map((summary) => storage.get(summary.name)))
    skills.value = loadedSkills.filter((skill): skill is SkillDefinition => Boolean(skill))

    if (!skills.value.some((skill) => skill.name === inspectedSkillName.value)) {
      inspectedSkillName.value = skills.value[0]?.name ?? ''
    }

    if (!fileNodes.value.some((node) => node.path === selectedFilePath.value)) {
      selectedFilePath.value = 'SKILL.md'
    }
  }

  const runStorageAction = async (action: () => Promise<void>) => {
    errorMessage.value = ''

    try {
      await action()
      await syncStorageState()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : String(error)
    }
  }

  const resetExampleSkills = async () => {
    await runStorageAction(async () => {
      for (const skill of skills.value) {
        await storage.delete(skill.name)
      }
      for (const skill of exampleSkills) {
        await storage.add(skill)
      }
      inspectedSkillName.value = exampleSkills[0]?.name ?? ''
    })
  }

  const deleteInspectedSkill = async () => {
    const name = inspectedSkillName.value
    if (!name) {
      return
    }

    await runStorageAction(async () => {
      await storage.delete(name)
    })
  }

  const importDirectory = async (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) {
      return
    }

    await runStorageAction(async () => {
      const skill = await loadSkill({
        source: 'browser',
        fileList: input.files,
      })
      await storage.add(skill)
      inspectedSkillName.value = skill.name
    })

    input.value = ''
  }

  const inspectSkill = async (skillName: string) => {
    await runStorageAction(async () => {
      const skill = await storage.get(skillName)
      inspectedSkillName.value = skill?.name ?? ''
      selectedFilePath.value = 'SKILL.md'
    })
  }

  const selectFile = (path: string) => {
    selectedFilePath.value = path
  }

  const inspectedSkill = computed(() => {
    return skills.value.find((skill) => skill.name === inspectedSkillName.value)
  })

  const fileNodes = computed<SkillFileNode[]>(() => {
    const skill = inspectedSkill.value
    if (!skill) {
      return []
    }

    const nodes: SkillFileNode[] = [
      {
        path: 'SKILL.md',
        label: 'SKILL.md',
        kind: 'entry',
        depth: 0,
      },
    ]
    const folderPaths = new Set<string>()

    for (const resource of skill.resources ?? []) {
      const parts = resource.path.split('/').filter(Boolean)

      for (let index = 0; index < parts.length - 1; index += 1) {
        const folderPath = parts.slice(0, index + 1).join('/')
        if (folderPaths.has(folderPath)) {
          continue
        }

        folderPaths.add(folderPath)
        nodes.push({
          path: folderPath,
          label: parts[index],
          kind: 'folder',
          depth: index,
        })
      }

      nodes.push({
        path: resource.path,
        label: parts.at(-1) || resource.path,
        kind: resource.kind,
        depth: Math.max(0, parts.length - 1),
      })
    }

    return nodes
  })

  const loadSelectedFileText = async () => {
    const skill = inspectedSkill.value
    if (!skill) {
      selectedFileText.value = ''
      return
    }

    if (selectedFilePath.value === 'SKILL.md') {
      selectedFileText.value = skill.instructions
      return
    }

    const resource = skill.resources?.find((item) => item.path === selectedFilePath.value)
    if (!resource) {
      selectedFileText.value = ''
      return
    }

    if (resource.kind === 'binary') {
      selectedFileText.value = `Binary resource: ${resource.path}`
      return
    }

    selectedFileText.value = resource.text ?? (resource.readText ? await resource.readText() : '')
  }

  watch(
    [inspectedSkill, selectedFilePath],
    () => {
      void loadSelectedFileText()
    },
    { immediate: true },
  )

  void resetExampleSkills()

  return {
    deleteInspectedSkill,
    errorMessage,
    importDirectory,
    inspectSkill,
    inspectedSkill,
    inspectedSkillName,
    fileNodes,
    resetExampleSkills,
    selectFile,
    selectedFilePath,
    selectedFileText,
    skills,
  }
}
