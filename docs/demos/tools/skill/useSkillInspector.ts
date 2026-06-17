import { createMemorySkillStorage, loadSkill } from '@opentiny/tiny-robot-kit/core'
import type { SkillDefinition } from '@opentiny/tiny-robot-kit/core'
import { computed, ref, watch } from 'vue'
import { exampleSkills } from './exampleSkillFiles'

export const requestOutputTabs = [
  { label: 'Instructions', value: 'instructions' },
  { label: 'Runtime tools', value: 'tools' },
] as const

type RequestOutputTab = (typeof requestOutputTabs)[number]['value']

const createSkillInstructionsPreview = (skills: SkillDefinition[]) => {
  const instructions = skills
    .map((skill) => {
      const instruction = skill.instructions.trim()
      return instruction ? `## ${skill.name}\n\n${instruction}` : ''
    })
    .filter(Boolean)

  if (instructions.length === 0) {
    return undefined
  }

  return {
    role: 'system',
    content: ['Apply these skill instructions when generating the response.', ...instructions].join('\n\n'),
  }
}

export const useSkillInspector = () => {
  const storage = createMemorySkillStorage()
  const skills = ref<SkillDefinition[]>([])
  const selectedSkillNames = ref<string[]>([])
  const inspectedSkillName = ref('')
  const outputTab = ref<RequestOutputTab>('instructions')
  const rightTab = ref<'skill' | 'output'>('skill')
  const errorMessage = ref('')
  const compiledInstructionsText = ref('')

  const syncStorageState = async () => {
    const summaries = await storage.list()
    const loadedSkills = await Promise.all(summaries.map((summary) => storage.get(summary.name)))
    skills.value = loadedSkills.filter((skill): skill is SkillDefinition => Boolean(skill))
    selectedSkillNames.value = selectedSkillNames.value.filter((skillName) =>
      skills.value.some((skill) => skill.name === skillName),
    )
  }

  const addSkill = async (skill: SkillDefinition) => {
    await storage.add(skill)
    if (!selectedSkillNames.value.includes(skill.name)) {
      selectedSkillNames.value = [...selectedSkillNames.value, skill.name]
    }
    inspectedSkillName.value = skill.name
    await syncStorageState()
  }

  const loadExampleSkill = async () => {
    errorMessage.value = ''

    try {
      for (const skill of exampleSkills) {
        await addSkill(skill)
      }
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : String(error)
    }
  }

  const handleDirectoryChange = async (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) {
      return
    }

    try {
      errorMessage.value = ''
      const { skill } = await loadSkill({
        source: 'browser',
        fileList: input.files,
      })
      await addSkill(skill)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : String(error)
    } finally {
      input.value = ''
    }
  }

  const toggleSkill = (skillName: string, checked: boolean) => {
    if (checked) {
      selectedSkillNames.value = [...new Set([...selectedSkillNames.value, skillName])]
    } else {
      selectedSkillNames.value = selectedSkillNames.value.filter((name) => name !== skillName)
    }
  }

  const inspectSkill = (skillName: string) => {
    inspectedSkillName.value = skillName
  }

  const toggleSkillFromEvent = (skillName: string, event: Event) => {
    toggleSkill(skillName, (event.target as HTMLInputElement).checked)
  }

  const selectedSkills = computed(() =>
    selectedSkillNames.value.flatMap((skillName) => {
      const skill = skills.value.find((item) => item.name === skillName)
      return skill ? [skill] : []
    }),
  )

  const inspectedSkill = computed(() => {
    return skills.value.find((skill) => skill.name === inspectedSkillName.value) ?? skills.value[0]
  })

  const inspectedDefinitionJson = computed(() => JSON.stringify(inspectedSkill.value ?? null, null, 2))

  const compiledToolsJson = computed(() => {
    const hasResources = selectedSkills.value.some((skill) => skill.resources?.length)
    const tools = hasResources
      ? [
          {
            type: 'function',
            function: {
              name: 'list_skill_files',
              description: 'List files available from the current skills.',
            },
          },
          {
            type: 'function',
            function: {
              name: 'read_skill_file',
              description: 'Read a file from a current skill by skill name and relative path.',
            },
          },
        ]
      : []
    return JSON.stringify(tools, null, 2)
  })

  watch(
    selectedSkills,
    (currentSkills) => {
      const message = createSkillInstructionsPreview(currentSkills)
      compiledInstructionsText.value = message ? JSON.stringify(message, null, 2) : 'undefined'
    },
    { immediate: true },
  )

  loadExampleSkill()

  return {
    outputTab,
    outputTabs: requestOutputTabs,
    compiledInstructionsText,
    compiledToolsJson,
    errorMessage,
    handleDirectoryChange,
    inspectSkill,
    inspectedDefinitionJson,
    inspectedSkill,
    inspectedSkillName,
    loadExampleSkill,
    rightTab,
    selectedSkillNames,
    skills,
    toggleSkillFromEvent,
  }
}
