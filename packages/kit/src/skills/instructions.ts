import type { ChatCompletionSystemMessageParam } from 'openai/resources'
import type { SkillDefinition } from './types'

export const compileSkillInstructions = async (
  skills: SkillDefinition[],
): Promise<ChatCompletionSystemMessageParam | undefined> => {
  const instructions: string[] = []

  for (const skill of skills) {
    const instruction = skill.instructions?.trim()
    if (instruction) {
      instructions.push(`## ${skill.name}\n\n${instruction}`)
    }
  }

  if (instructions.length === 0) {
    return undefined
  }

  return {
    role: 'system',
    content: ['Apply these skill instructions when generating the response.', ...instructions].join('\n\n'),
  }
}
