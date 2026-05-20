import {
  SkillManager,
  compileSkillInstructions,
  createSkillRuntimeTools,
  loadSkillFilesFromFileList,
} from '@opentiny/tiny-robot-kit/core'
import type { SkillDefinition, SkillFile } from '@opentiny/tiny-robot-kit/core'
import { computed, ref, watch } from 'vue'
import { exampleSkillFiles } from './exampleSkillFiles'

export const compilerOutputTabs = [
  { label: 'Instructions', value: 'instructions' },
  { label: 'Runtime tools', value: 'tools' },
] as const

type CompilerOutputTab = (typeof compilerOutputTabs)[number]['value']

export const useSkillInspector = () => {
  const manager = new SkillManager()
  const skills = ref<SkillDefinition[]>([])
  const selectedSkillNames = ref<string[]>([])
  const inspectedSkillName = ref('')
  const compilerTab = ref<CompilerOutputTab>('instructions')
  const rightTab = ref<'skill' | 'compiler'>('skill')
  const errorMessage = ref('')
  const compiledInstructionsText = ref('')

  const syncManagerState = () => {
    skills.value = manager.list()
    selectedSkillNames.value = manager.getSelectedSkillNames()
  }

  const importSkillFiles = (files: SkillFile[]) => {
    errorMessage.value = ''

    try {
      const result = manager.import(files)
      manager.select(result.skill.name)
      inspectedSkillName.value = result.skill.name
      syncManagerState()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : String(error)
    }
  }

  const loadExampleSkill = () => {
    importSkillFiles(exampleSkillFiles)
  }

  const handleDirectoryChange = async (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) {
      return
    }

    try {
      importSkillFiles(await loadSkillFilesFromFileList(input.files))
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : String(error)
    } finally {
      input.value = ''
    }
  }

  const toggleSkill = (skillName: string, checked: boolean) => {
    if (checked) {
      manager.select(skillName)
    } else {
      manager.unselect(skillName)
    }

    syncManagerState()
  }

  const inspectSkill = (skillName: string) => {
    inspectedSkillName.value = skillName
  }

  const toggleSkillFromEvent = (skillName: string, event: Event) => {
    toggleSkill(skillName, (event.target as HTMLInputElement).checked)
  }

  const selectedSkills = computed(() =>
    selectedSkillNames.value.flatMap((skillName) => {
      const skill = manager.get(skillName)
      return skill ? [skill] : []
    }),
  )

  const inspectedSkill = computed(() => {
    return manager.get(inspectedSkillName.value) ?? skills.value[0]
  })

  const inspectedDefinitionJson = computed(() => JSON.stringify(inspectedSkill.value ?? null, null, 2))

  const compiledToolsJson = computed(() => {
    const tools = createSkillRuntimeTools(selectedSkills.value).map((runtimeTool) => runtimeTool.tool)
    return JSON.stringify(tools, null, 2)
  })

  watch(
    selectedSkills,
    async (currentSkills) => {
      const message = await compileSkillInstructions(currentSkills)
      compiledInstructionsText.value = message ? JSON.stringify(message, null, 2) : 'undefined'
    },
    { immediate: true },
  )

  loadExampleSkill()

  return {
    compilerTab,
    compilerTabs: compilerOutputTabs,
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
