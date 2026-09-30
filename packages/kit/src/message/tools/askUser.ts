import type { ChatCompletionFunctionTool, ChatCompletionMessageFunctionToolCall } from 'openai/resources'
import type { RuntimeTool } from '../plugins/toolPlugin'

export const ASK_USER_TOOL_NAME = 'ask_user'

/** Default model instructions for the AskUser runtime tool. */
export const ASK_USER_SYSTEM_PROMPT = [
  'When you need information from the user before continuing, use the `ask_user` tool instead of asking a plain-text question.',
  'Put all related questions in one complete form and provide stable, unique step ids.',
  'Every step must include `summary`. `summary` and `title` should express the same meaning at different levels of detail: make `summary` a concise label for the step, preferably no more than 20 characters, and use `title` for the full natural-language question. Never omit `summary`, copy the full question into it, or make `summary` identical to `title`.',
  'For single and multiple steps, a free-text "Other" choice is supported. If you include it in the options, use value `other`.',
  'When the user skips a step, interpret an empty selection as skipped, an empty string as skipped, and null confirmation as skipped.',
  'Call `ask_user` at most once in a single assistant response. After the tool returns the submitted answers, continue the task using those answers.',
].join('\n')

/** Markers keep automatic prompt injection idempotent without altering stored message history. */
export const ASK_USER_SYSTEM_PROMPT_START = '<tiny-robot-ask-user-instructions>'
export const ASK_USER_SYSTEM_PROMPT_END = '</tiny-robot-ask-user-instructions>'

export type AskUserStepType = 'single' | 'multiple' | 'text' | 'confirm'

export interface AskUserToolOption {
  label: string
  value: string
  description?: string
  disabled?: boolean
}

export interface AskUserToolStep {
  id: string
  title: string
  /** Short label for the current step UI. */
  summary: string
  description?: string
  type: AskUserStepType
  required?: boolean
  options?: AskUserToolOption[]
  placeholder?: string
}

export interface AskUserToolArguments {
  id: string
  title?: string
  description?: string
  steps: AskUserToolStep[]
  submitLabel?: string
}

export interface AskUserContent extends AskUserToolArguments {
  type: 'ask_user'
}

export type AskUserStatus = 'active' | 'submitting' | 'submitted' | 'error'

export interface AskUserState {
  status: AskUserStatus
  currentStep: number
  answers: Record<string, unknown>
  completedStepIds: string[]
  expanded?: boolean
  error?: string
  updatedAt?: number
}

export interface AskUserChoiceAnswer {
  selected: string[]
  other?: {
    selected: boolean
    text: string
  }
}

export interface AskUserRuntimeMeta {
  interactionId: string
  toolCallId: string
}

export interface AskUserMessageState {
  askUser?: AskUserState
  askUserRuntime?: AskUserRuntimeMeta
  [key: string]: unknown
}

export interface AskUserToolResult {
  type: 'ask_user_result'
  interactionId: string
  status: 'submitted'
  answers: Record<string, unknown>
}

export type AskUserProtocolErrorCode = 'invalid_arguments' | 'invalid_answer' | 'invalid_state'

export class AskUserProtocolError extends Error {
  readonly code: AskUserProtocolErrorCode

  constructor(code: AskUserProtocolErrorCode, message: string) {
    super(message)
    this.name = 'AskUserProtocolError'
    this.code = code
  }
}

const MAX_ID_LENGTH = 100
const MAX_TITLE_LENGTH = 200
const MAX_SUMMARY_LENGTH = 80
const MAX_DESCRIPTION_LENGTH = 1000
const MAX_SUBMIT_LABEL_LENGTH = 40
const MAX_STEP_COUNT = 20
const MAX_OPTION_COUNT = 50
const MAX_OPTION_VALUE_LENGTH = 100
const MAX_OPTION_DESCRIPTION_LENGTH = 500
const MAX_PLACEHOLDER_LENGTH = 200

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

const invalidArguments = (message: string): never => {
  throw new AskUserProtocolError('invalid_arguments', message)
}

const invalidAnswer = (message: string): never => {
  throw new AskUserProtocolError('invalid_answer', message)
}

const invalidState = (message: string): never => {
  throw new AskUserProtocolError('invalid_state', message)
}

const assertKnownKeys = (value: Record<string, unknown>, allowedKeys: readonly string[], path: string) => {
  const allowed = new Set(allowedKeys)
  const unknownKey = Object.keys(value).find((key) => !allowed.has(key))

  if (unknownKey) {
    invalidArguments(`${path}.${unknownKey} is not supported`)
  }
}

const readRequiredString = (value: Record<string, unknown>, key: string, path: string, maxLength: number) => {
  const rawValue = value[key]
  const result = typeof rawValue === 'string' ? rawValue.trim() : invalidArguments(`${path}.${key} must be a string`)
  if (result.length === 0) {
    invalidArguments(`${path}.${key} must be a non-empty string`)
  }
  if (result.length > maxLength) {
    invalidArguments(`${path}.${key} must be at most ${maxLength} characters`)
  }

  return result
}

const readOptionalString = (
  value: Record<string, unknown>,
  key: string,
  path: string,
  maxLength: number,
): string | undefined => {
  const rawValue = value[key]
  if (rawValue === undefined) {
    return undefined
  }

  const result = typeof rawValue === 'string' ? rawValue.trim() : invalidArguments(`${path}.${key} must be a string`)
  if (result.length > maxLength) {
    invalidArguments(`${path}.${key} must be at most ${maxLength} characters`)
  }

  return result || undefined
}

const readOptionalBoolean = (value: Record<string, unknown>, key: string, path: string) => {
  const rawValue = value[key]
  if (rawValue === undefined) {
    return undefined
  }

  return typeof rawValue === 'boolean' ? rawValue : invalidArguments(`${path}.${key} must be a boolean`)
}

const normalizeOption = (value: unknown, path: string): AskUserToolOption => {
  if (!isRecord(value)) {
    invalidArguments(`${path} must be an object`)
  }
  const optionValue = value as Record<string, unknown>

  assertKnownKeys(optionValue, ['label', 'value', 'description', 'disabled'], path)

  const option: AskUserToolOption = {
    label: readRequiredString(optionValue, 'label', path, MAX_TITLE_LENGTH),
    value: readRequiredString(optionValue, 'value', path, MAX_OPTION_VALUE_LENGTH),
  }
  const description = readOptionalString(optionValue, 'description', path, MAX_OPTION_DESCRIPTION_LENGTH)
  const disabled = readOptionalBoolean(optionValue, 'disabled', path)

  if (description !== undefined) {
    option.description = description
  }
  if (disabled !== undefined) {
    option.disabled = disabled
  }

  return option
}

const normalizeStep = (value: unknown, index: number): AskUserToolStep => {
  const path = `steps[${index}]`
  if (!isRecord(value)) {
    invalidArguments(`${path} must be an object`)
  }
  const stepValue = value as Record<string, unknown>

  assertKnownKeys(
    stepValue,
    ['id', 'title', 'summary', 'description', 'type', 'required', 'options', 'placeholder'],
    path,
  )

  const type: AskUserStepType =
    stepValue.type === 'single' ||
    stepValue.type === 'multiple' ||
    stepValue.type === 'text' ||
    stepValue.type === 'confirm'
      ? stepValue.type
      : invalidArguments(`${path}.type must be single, multiple, text, or confirm`)

  const step: AskUserToolStep = {
    id: readRequiredString(stepValue, 'id', path, MAX_ID_LENGTH),
    title: readRequiredString(stepValue, 'title', path, MAX_TITLE_LENGTH),
    summary: readRequiredString(stepValue, 'summary', path, MAX_SUMMARY_LENGTH),
    type,
  }
  const description = readOptionalString(stepValue, 'description', path, MAX_DESCRIPTION_LENGTH)
  const required = readOptionalBoolean(stepValue, 'required', path)
  const placeholder = readOptionalString(stepValue, 'placeholder', path, MAX_PLACEHOLDER_LENGTH)

  if (description !== undefined) {
    step.description = description
  }
  if (required !== undefined) {
    step.required = required
  }
  if (placeholder !== undefined) {
    step.placeholder = placeholder
  }

  if (stepValue.options !== undefined) {
    if (type !== 'single' && type !== 'multiple') {
      invalidArguments(`${path}.options is only supported for single and multiple steps`)
    }
    if (!Array.isArray(stepValue.options)) {
      invalidArguments(`${path}.options must be an array`)
    }
    const rawOptions = stepValue.options as unknown[]
    if (rawOptions.length > MAX_OPTION_COUNT) {
      invalidArguments(`${path}.options must contain at most ${MAX_OPTION_COUNT} items`)
    }

    const options = rawOptions.map((option, optionIndex) => normalizeOption(option, `${path}.options[${optionIndex}]`))
    const optionValues = new Set<string>()
    for (const option of options) {
      if (optionValues.has(option.value)) {
        invalidArguments(`${path}.options contains duplicate value "${option.value}"`)
      }
      optionValues.add(option.value)
    }
    step.options = options
  }

  return step
}

export const parseAskUserArguments = (rawArguments: unknown): AskUserToolArguments => {
  let value = rawArguments
  if (typeof rawArguments === 'string') {
    try {
      value = JSON.parse(rawArguments || '{}')
    } catch {
      invalidArguments('ask_user arguments must be valid JSON')
    }
  }

  if (!isRecord(value)) {
    invalidArguments('ask_user arguments must be an object')
  }
  const argumentsValue = value as Record<string, unknown>

  assertKnownKeys(argumentsValue, ['id', 'title', 'description', 'steps', 'submitLabel'], 'arguments')

  if (!Array.isArray(argumentsValue.steps)) {
    invalidArguments('arguments.steps must be an array')
  }
  const rawSteps = argumentsValue.steps as unknown[]
  if (rawSteps.length === 0 || rawSteps.length > MAX_STEP_COUNT) {
    invalidArguments(`arguments.steps must contain between 1 and ${MAX_STEP_COUNT} items`)
  }

  const steps = rawSteps.map(normalizeStep)
  const stepIds = new Set<string>()
  for (const step of steps) {
    if (stepIds.has(step.id)) {
      invalidArguments(`arguments.steps contains duplicate id "${step.id}"`)
    }
    stepIds.add(step.id)
  }

  const result: AskUserToolArguments = {
    id: readRequiredString(argumentsValue, 'id', 'arguments', MAX_ID_LENGTH),
    steps,
  }
  const title = readOptionalString(argumentsValue, 'title', 'arguments', MAX_TITLE_LENGTH)
  const description = readOptionalString(argumentsValue, 'description', 'arguments', MAX_DESCRIPTION_LENGTH)
  const submitLabel = readOptionalString(argumentsValue, 'submitLabel', 'arguments', MAX_SUBMIT_LABEL_LENGTH)

  if (title !== undefined) {
    result.title = title
  }
  if (description !== undefined) {
    result.description = description
  }
  if (submitLabel !== undefined) {
    result.submitLabel = submitLabel
  }

  return result
}

export const parseAskUserToolCallArguments = (
  toolCall: Pick<ChatCompletionMessageFunctionToolCall, 'function'>,
): AskUserToolArguments => {
  return parseAskUserArguments(toolCall.function.arguments)
}

export const toAskUserContent = (args: AskUserToolArguments): AskUserContent => ({
  type: 'ask_user',
  ...args,
})

export const appendAskUserContent = (current: unknown, askUserContent: AskUserContent): unknown => {
  if (Array.isArray(current)) {
    return [...current, askUserContent]
  }

  if (typeof current === 'string' && current.length > 0) {
    return [{ type: 'text', text: current }, askUserContent]
  }

  return [askUserContent]
}

export const stripAskUserContent = (content: unknown): unknown => {
  if (!Array.isArray(content)) {
    return content
  }

  const visibleItems = content.filter((item) => !(isRecord(item) && item.type === 'ask_user'))
  return visibleItems.length > 0 ? visibleItems : ''
}

const getChoiceOptions = (step: AskUserToolStep) => {
  const options = new Map<string, AskUserToolOption>()
  for (const option of step.options ?? []) {
    options.set(option.value, option)
  }
  return options
}

const normalizeChoiceAnswer = (step: AskUserToolStep, value: unknown): AskUserChoiceAnswer => {
  if (!isRecord(value)) {
    invalidAnswer(`Answer for step "${step.id}" must be a choice object`)
  }
  const answerValue = value as Record<string, unknown>
  assertKnownKeys(answerValue, ['selected', 'other'], `answers.${step.id}`)

  if (!Array.isArray(answerValue.selected) || answerValue.selected.some((item) => typeof item !== 'string')) {
    invalidAnswer(`Answer for step "${step.id}".selected must be an array of strings`)
  }

  const selected = answerValue.selected as string[]
  if (new Set(selected).size !== selected.length) {
    invalidAnswer(`Answer for step "${step.id}" contains duplicate selected values`)
  }
  if (step.type === 'single' && selected.length > 1) {
    invalidAnswer(`Answer for single step "${step.id}" may contain at most one selected value`)
  }

  const options = getChoiceOptions(step)
  for (const optionValue of selected) {
    const option = options.get(optionValue)
    if (!option) {
      invalidAnswer(`Answer for step "${step.id}" contains unknown option "${optionValue}"`)
    }
    if (option?.disabled) {
      invalidAnswer(`Answer for step "${step.id}" contains disabled option "${optionValue}"`)
    }
  }

  let other: AskUserChoiceAnswer['other']
  const rawOther = answerValue.other
  if (rawOther !== undefined) {
    if (!isRecord(rawOther)) {
      invalidAnswer(`Answer for step "${step.id}".other must be an object`)
    }
    const otherValue = rawOther as Record<string, unknown>
    assertKnownKeys(otherValue, ['selected', 'text'], `answers.${step.id}.other`)
    if (typeof otherValue.selected !== 'boolean' || typeof otherValue.text !== 'string') {
      invalidAnswer(`Answer for step "${step.id}".other has an invalid shape`)
    }

    const text = (otherValue.text as string).trim()
    if (otherValue.selected && text.length === 0) {
      invalidAnswer(`Answer for step "${step.id}".other.text is required when other is selected`)
    }
    if (otherValue.selected) {
      other = { selected: true, text }
    }
  }

  if (selected.length === 0 && !other) {
    return { selected: [] }
  }

  return {
    selected: [...selected],
    ...(other ? { other } : {}),
  }
}

const normalizeTextAnswer = (step: AskUserToolStep, value: unknown): string => {
  if (typeof value !== 'string') {
    invalidAnswer(`Answer for text step "${step.id}" must be a string`)
  }

  const text = (value as string).trim()
  return text
}

const normalizeSkippedAnswer = (step: AskUserToolStep): AskUserChoiceAnswer | string | null => {
  if (step.type === 'single' || step.type === 'multiple') {
    return { selected: [] }
  }
  if (step.type === 'text') {
    return ''
  }
  return null
}

export const validateAndNormalizeAnswers = (
  steps: AskUserToolStep[],
  answers: Record<string, unknown>,
): Record<string, unknown> => {
  if (!isRecord(answers)) {
    invalidAnswer('ask_user answers must be an object')
  }

  const normalized: Record<string, unknown> = {}
  for (const step of steps) {
    const value = answers[step.id]
    let normalizedValue: unknown

    if (value === undefined || value === null || (value === 'ignored' && step.type !== 'text')) {
      // `ignored` is accepted here only for states persisted by older versions.
      normalizedValue = normalizeSkippedAnswer(step)
    } else if (step.type === 'single' || step.type === 'multiple') {
      normalizedValue = normalizeChoiceAnswer(step, value)
    } else if (step.type === 'text') {
      normalizedValue = normalizeTextAnswer(step, value)
    } else {
      if (typeof value !== 'boolean') {
        invalidAnswer(`Answer for confirm step "${step.id}" must be a boolean or null`)
      }
      normalizedValue = value
    }

    normalized[step.id] = normalizedValue
  }

  return normalized
}

export const askUserTool: ChatCompletionFunctionTool = {
  type: 'function',
  function: {
    name: ASK_USER_TOOL_NAME,
    description: 'Ask the user for structured information before continuing.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'steps'],
      properties: {
        id: { type: 'string', minLength: 1, maxLength: MAX_ID_LENGTH },
        title: { type: 'string', maxLength: MAX_TITLE_LENGTH },
        description: { type: 'string', maxLength: MAX_DESCRIPTION_LENGTH },
        submitLabel: { type: 'string', maxLength: MAX_SUBMIT_LABEL_LENGTH },
        steps: {
          type: 'array',
          minItems: 1,
          maxItems: MAX_STEP_COUNT,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'title', 'summary', 'type'],
            properties: {
              id: { type: 'string', minLength: 1, maxLength: MAX_ID_LENGTH },
              title: { type: 'string', minLength: 1, maxLength: MAX_TITLE_LENGTH },
              summary: {
                type: 'string',
                minLength: 1,
                maxLength: MAX_SUMMARY_LENGTH,
                description: 'A concise label for this step, preferably no more than 20 characters.',
              },
              description: { type: 'string', maxLength: MAX_DESCRIPTION_LENGTH },
              type: { type: 'string', enum: ['single', 'multiple', 'text', 'confirm'] },
              required: { type: 'boolean' },
              options: {
                type: 'array',
                maxItems: MAX_OPTION_COUNT,
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['label', 'value'],
                  properties: {
                    label: { type: 'string', minLength: 1, maxLength: MAX_TITLE_LENGTH },
                    value: { type: 'string', minLength: 1, maxLength: MAX_OPTION_VALUE_LENGTH },
                    description: { type: 'string', maxLength: MAX_OPTION_DESCRIPTION_LENGTH },
                    disabled: { type: 'boolean' },
                  },
                },
              },
              placeholder: { type: 'string', maxLength: MAX_PLACEHOLDER_LENGTH },
            },
          },
        },
      },
    },
  },
}

export const createAskUserRuntimeTool = (): RuntimeTool => ({
  tool: askUserTool,
  handler: (toolCall, context) => {
    const args = parseAskUserToolCallArguments(toolCall)
    const messageState = context.assistantMessage.state as AskUserMessageState | undefined
    const state = messageState?.askUser
    const runtime = messageState?.askUserRuntime

    if (!state) {
      invalidState('ask_user state is missing')
    }
    if (!runtime || runtime.toolCallId !== toolCall.id || runtime.interactionId !== args.id) {
      invalidState('ask_user state is missing or does not match the tool call')
    }
    const askUserState = state as AskUserState
    if (askUserState.status !== 'submitted') {
      invalidState('ask_user can only resume after the user submits valid answers')
    }

    const answers = validateAndNormalizeAnswers(args.steps, askUserState.answers)
    const result: AskUserToolResult = {
      type: 'ask_user_result',
      interactionId: args.id,
      status: 'submitted',
      answers,
    }

    return result
  },
})
