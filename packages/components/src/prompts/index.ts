import { App } from 'vue'
import PromptComp from './prompt.vue'
import PromptsComp from './prompts.vue'

// TinyPrompt
PromptComp.name = 'TinyPrompt'

const installPrompt = function <T>(app: App<T>) {
  app.component(PromptComp.name!, PromptComp)
}

PromptComp.install = installPrompt

export const Prompt = PromptComp as typeof PromptComp & { install: typeof installPrompt }

// TinyPrompts
PromptsComp.name = 'TinyPrompts'

const installPrompts = function <T>(app: App<T>) {
  app.component(PromptsComp.name!, PromptsComp)
}

PromptsComp.install = installPrompts

export const Prompts = PromptsComp as typeof PromptsComp & { install: typeof installPrompts }
