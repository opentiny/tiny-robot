import type { ChatCompletionFunctionTool, ChatCompletionMessageFunctionToolCall } from 'openai/resources'
import type { RuntimeTool } from '../plugins/toolPlugin'

export const ASK_USER_TOOL_NAME = 'ask_user'

/** Model-facing rules for the AskUser protocol. */
export const ASK_USER_SYSTEM_PROMPT = [
  'When you need explicit information from the user before continuing, use the `ask_user` tool instead of asking a plain-text question.',
  'Combine questions into one `ask_user` call only when each can be answered independently and remains meaningful if any other question is skipped.',
  'Ask dependent follow-up questions in a later `ask_user` call after receiving the earlier answers.',
  'Do not call `ask_user` in parallel with another `ask_user` call.',
  'A tool whose arguments or execution depend on an `ask_user` answer must wait until that answer is returned.',
  'A tool that is independent of every possible `ask_user` answer may run in parallel with `ask_user`.',
  'If an answer is skipped, do not ask dependent follow-up questions or call tools that require that answer.',
  'When `allowCustom` is true, do not add an "Other" or "Custom" option; the client provides custom input automatically.',
  'Every question may be skipped by the user. After the tool returns its answers, continue the task using those answers.',
].join('\n')

/** Markers keep automatic prompt injection idempotent without altering stored message history. */
export const ASK_USER_SYSTEM_PROMPT_START = '<tiny-robot-ask-user-instructions>'
export const ASK_USER_SYSTEM_PROMPT_END = '</tiny-robot-ask-user-instructions>'

export interface AskUserToolOption {
  /** User-visible choice text, returned unchanged when selected. */
  label: string
  /** Optional explanation shown with the choice and omitted from the answer. */
  description?: string
}

export interface AskUserQuestionBase {
  /** Stable identifier used as the answer key for this question. */
  id: string
  /** Complete user-facing question. */
  question: string
}

export interface AskUserTextQuestion extends AskUserQuestionBase {
  options?: never
  multiSelect?: never
  allowCustom?: never
}

export interface AskUserChoiceQuestion extends AskUserQuestionBase {
  options: AskUserToolOption[]
  multiSelect: boolean
  allowCustom: boolean
}

export type AskUserQuestion = AskUserTextQuestion | AskUserChoiceQuestion

export interface AskUserToolArguments {
  /** Optional short heading shared by the questions. */
  heading?: string
  questions: AskUserQuestion[]
}

export interface AskUserContent extends AskUserToolArguments {
  type: 'ask_user'
}

export type AskUserStatus = 'active' | 'submitting' | 'submitted' | 'cancelled' | 'error'

export interface AskUserState {
  status: AskUserStatus
  currentStep: number
  answers: Record<string, unknown>
  completedStepIds: string[]
  /** Whether the current error can be retried with the existing pending tool call. */
  retryable?: boolean
  expanded?: boolean
  error?: string
  updatedAt?: number
}

export interface AskUserRuntimeMeta {
  toolCallId: string
}

export interface AskUserMessageState {
  askUser?: AskUserState
  askUserRuntime?: AskUserRuntimeMeta
  [key: string]: unknown
}

export type AskUserAnswer = { status: 'answered'; value: string | string[] } | { status: 'skipped' }

export type AskUserToolResult =
  | { outcome: 'completed'; answers: Record<string, AskUserAnswer> }
  | { outcome: 'cancelled'; reason?: string }
  | {
      outcome: 'failed'
      error: {
        code: AskUserProtocolErrorCode | 'internal_error'
        message: string
        retryable: boolean
      }
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
const MAX_HEADING_LENGTH = 200
const MAX_QUESTION_LENGTH = 1000
const MAX_QUESTION_COUNT = 20
const MAX_OPTION_COUNT = 50
const MAX_OPTION_LABEL_LENGTH = 200
const MAX_OPTION_DESCRIPTION_LENGTH = 500
const MAX_ANSWER_LENGTH = 4000
const MAX_MULTI_SELECT_COUNT = 50
const MAX_TOTAL_ANSWER_LENGTH = 20000
const QUESTION_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,99}$/

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

const hasOwn = (value: Record<string, unknown>, key: string) => Object.prototype.hasOwnProperty.call(value, key)

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
  if (result.length === 0) {
    invalidArguments(`${path}.${key} must be non-empty when provided`)
  }

  return result
}

const readQuestionId = (value: Record<string, unknown>, path: string) => {
  const id = readRequiredString(value, 'id', path, MAX_ID_LENGTH)
  if (!QUESTION_ID_PATTERN.test(id)) {
    invalidArguments(`${path}.id must match ${QUESTION_ID_PATTERN}`)
  }
  return id
}

const readRequiredBoolean = (value: Record<string, unknown>, key: string, path: string) => {
  return typeof value[key] === 'boolean' ? value[key] : invalidArguments(`${path}.${key} must be a boolean`)
}

const normalizeOption = (value: unknown, path: string): AskUserToolOption => {
  if (!isRecord(value)) {
    invalidArguments(`${path} must be an object`)
  }
  const optionValue = value as Record<string, unknown>
  assertKnownKeys(optionValue, ['label', 'description'], path)

  const option: AskUserToolOption = {
    label: readRequiredString(optionValue, 'label', path, MAX_OPTION_LABEL_LENGTH),
  }
  const description = readOptionalString(optionValue, 'description', path, MAX_OPTION_DESCRIPTION_LENGTH)
  if (description !== undefined) {
    option.description = description
  }

  return option
}

const normalizeQuestion = (value: unknown, index: number): AskUserQuestion => {
  const path = `questions[${index}]`
  if (!isRecord(value)) {
    invalidArguments(`${path} must be an object`)
  }
  const questionValue = value as Record<string, unknown>
  assertKnownKeys(questionValue, ['id', 'question', 'options', 'multiSelect', 'allowCustom'], path)

  const base = {
    id: readQuestionId(questionValue, path),
    question: readRequiredString(questionValue, 'question', path, MAX_QUESTION_LENGTH),
  }

  if (!hasOwn(questionValue, 'options') || questionValue.options === undefined) {
    if (hasOwn(questionValue, 'multiSelect') || hasOwn(questionValue, 'allowCustom')) {
      invalidArguments(`${path}.multiSelect and ${path}.allowCustom require options`)
    }
    return base
  }

  if (!Array.isArray(questionValue.options)) {
    invalidArguments(`${path}.options must be an array with at least one option`)
  }
  const rawOptions = questionValue.options as unknown[]
  if (rawOptions.length === 0 || rawOptions.length > MAX_OPTION_COUNT) {
    invalidArguments(`${path}.options must contain between 1 and ${MAX_OPTION_COUNT} items`)
  }

  const options = rawOptions.map((option, optionIndex) => normalizeOption(option, `${path}.options[${optionIndex}]`))
  const labels = new Set<string>()
  for (const option of options) {
    if (labels.has(option.label)) {
      invalidArguments(`${path}.options contains duplicate label "${option.label}"`)
    }
    labels.add(option.label)
  }

  return {
    ...base,
    options,
    multiSelect: readRequiredBoolean(questionValue, 'multiSelect', path),
    allowCustom: readRequiredBoolean(questionValue, 'allowCustom', path),
  }
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
  assertKnownKeys(argumentsValue, ['heading', 'questions'], 'arguments')

  if (!Array.isArray(argumentsValue.questions)) {
    invalidArguments('arguments.questions must be an array')
  }
  const rawQuestions = argumentsValue.questions as unknown[]
  if (rawQuestions.length === 0 || rawQuestions.length > MAX_QUESTION_COUNT) {
    invalidArguments(`arguments.questions must contain between 1 and ${MAX_QUESTION_COUNT} items`)
  }

  const questions = rawQuestions.map(normalizeQuestion)
  const questionIds = new Set<string>()
  for (const question of questions) {
    if (questionIds.has(question.id)) {
      invalidArguments(`arguments.questions contains duplicate id "${question.id}"`)
    }
    questionIds.add(question.id)
  }

  const result: AskUserToolArguments = { questions }
  const heading = readOptionalString(argumentsValue, 'heading', 'arguments', MAX_HEADING_LENGTH)
  if (heading !== undefined) {
    result.heading = heading
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

const skippedAnswer = (): AskUserAnswer => ({ status: 'skipped' })

const unwrapAnswerValue = (value: unknown): { skipped: boolean; value?: unknown } => {
  if (value === undefined || value === null || value === '') {
    return { skipped: true }
  }
  if (Array.isArray(value) && value.length === 0) {
    return { skipped: true }
  }
  if (isRecord(value) && value.status === 'skipped') {
    return { skipped: true }
  }
  if (isRecord(value) && value.status === 'answered') {
    return { skipped: false, value: value.value }
  }
  return { skipped: false, value }
}

const normalizeTextAnswer = (question: AskUserTextQuestion, value: unknown): AskUserAnswer => {
  if (typeof value !== 'string') {
    invalidAnswer(`Answer for question "${question.id}" must be a string`)
  }
  const text = (value as string).trim()
  if (text.length > MAX_ANSWER_LENGTH) {
    invalidAnswer(`Answer for question "${question.id}" must be at most ${MAX_ANSWER_LENGTH} characters`)
  }
  return text ? { status: 'answered', value: text } : skippedAnswer()
}

const normalizeChoiceAnswer = (question: AskUserChoiceQuestion, value: unknown): AskUserAnswer => {
  const labels = new Set(question.options.map((option) => option.label))
  const validateLabel = (label: string) => {
    if (!question.allowCustom && !labels.has(label)) {
      invalidAnswer(`Answer for question "${question.id}" contains unknown option "${label}"`)
    }
  }

  if (question.multiSelect) {
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
      invalidAnswer(`Answer for question "${question.id}" must be an array of strings`)
    }
    const values = (value as string[]).map((item) => item.trim())
    if (values.length > MAX_MULTI_SELECT_COUNT) {
      invalidAnswer(`Answer for question "${question.id}" may contain at most ${MAX_MULTI_SELECT_COUNT} values`)
    }
    if (values.some((item) => item.length === 0)) {
      invalidAnswer(`Answer for question "${question.id}" contains an empty option`)
    }
    if (values.some((item) => item.length > MAX_ANSWER_LENGTH)) {
      invalidAnswer(`Answer for question "${question.id}" contains a value longer than ${MAX_ANSWER_LENGTH} characters`)
    }
    if (new Set(values).size !== values.length) {
      invalidAnswer(`Answer for question "${question.id}" contains duplicate options`)
    }
    values.forEach(validateLabel)
    return values.length > 0 ? { status: 'answered', value: values } : skippedAnswer()
  }

  if (typeof value !== 'string') {
    invalidAnswer(`Answer for question "${question.id}" must be a string`)
  }
  const text = (value as string).trim()
  if (!text) {
    return skippedAnswer()
  }
  if (text.length > MAX_ANSWER_LENGTH) {
    invalidAnswer(`Answer for question "${question.id}" must be at most ${MAX_ANSWER_LENGTH} characters`)
  }
  validateLabel(text)
  return { status: 'answered', value: text }
}

export const validateAndNormalizeAnswers = (
  questions: AskUserQuestion[],
  answers: Record<string, unknown>,
): Record<string, AskUserAnswer> => {
  if (!isRecord(answers)) {
    invalidAnswer('ask_user answers must be an object')
  }

  const normalized: Array<[string, AskUserAnswer]> = []
  let totalAnswerLength = 0
  for (const question of questions) {
    const value = Object.prototype.hasOwnProperty.call(answers, question.id) ? answers[question.id] : undefined
    const unwrapped = unwrapAnswerValue(value)
    if (unwrapped.skipped) {
      normalized.push([question.id, skippedAnswer()])
    } else if (question.options !== undefined) {
      const answer = normalizeChoiceAnswer(question as AskUserChoiceQuestion, unwrapped.value)
      normalized.push([question.id, answer])
      if (answer.status === 'answered') {
        totalAnswerLength += Array.isArray(answer.value)
          ? answer.value.reduce((total, value) => total + value.length, 0)
          : answer.value.length
      }
    } else {
      const answer = normalizeTextAnswer(question, unwrapped.value)
      normalized.push([question.id, answer])
      if (answer.status === 'answered') {
        totalAnswerLength += answer.value.length
      }
    }

    if (totalAnswerLength > MAX_TOTAL_ANSWER_LENGTH) {
      invalidAnswer(`ask_user answers must contain at most ${MAX_TOTAL_ANSWER_LENGTH} characters in total`)
    }
  }

  return Object.fromEntries(normalized)
}

const askUserOptionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['label'],
  properties: {
    label: {
      type: 'string',
      minLength: 1,
      maxLength: MAX_OPTION_LABEL_LENGTH,
      pattern: '\\S',
      description: 'Concise user-visible choice text. If selected, this exact label is returned as the answer.',
    },
    description: {
      type: 'string',
      minLength: 1,
      maxLength: MAX_OPTION_DESCRIPTION_LENGTH,
      pattern: '\\S',
      description: 'Optional explanation shown to the user but not returned as part of the answer.',
    },
  },
}

const askUserQuestionBaseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'question'],
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      maxLength: MAX_ID_LENGTH,
      pattern: '^[A-Za-z][A-Za-z0-9_-]{0,99}$',
      description: 'Stable identifier unique within this call and used as the answer key.',
    },
    question: {
      type: 'string',
      minLength: 1,
      maxLength: MAX_QUESTION_LENGTH,
      pattern: '\\S',
      description:
        'Complete user-facing question, including any context, constraints, and examples. Each question in a call must be independently answerable and remain meaningful if any other question is skipped.',
    },
  },
}

const askUserToolQuestionSchema = {
  anyOf: [
    {
      title: 'Free-text question',
      ...askUserQuestionBaseSchema,
    },
    {
      title: 'Choice question',
      type: 'object',
      additionalProperties: false,
      required: ['id', 'question', 'options', 'multiSelect', 'allowCustom'],
      properties: {
        ...askUserQuestionBaseSchema.properties,
        options: {
          type: 'array',
          minItems: 1,
          maxItems: MAX_OPTION_COUNT,
          description: 'Suggested choices. Labels must be unique within this question.',
          items: askUserOptionSchema,
        },
        multiSelect: {
          type: 'boolean',
          description: 'False for at most one choice; true when multiple choices are allowed.',
        },
        allowCustom: {
          type: 'boolean',
          description:
            'Whether the user may enter an answer outside the suggested options. When true, do not add an "Other" or "Custom" option.',
        },
      },
    },
  ],
}

export const askUserTool: ChatCompletionFunctionTool = {
  type: 'function',
  function: {
    name: ASK_USER_TOOL_NAME,
    description:
      'Ask the user for explicit input when it is needed before continuing. Combine questions into one call only when each can be answered independently and remains meaningful if any other question is skipped. Ask dependent follow-up questions in a later call after receiving earlier answers. Do not call ask_user in parallel with another ask_user call. A tool whose arguments or execution depend on an ask_user answer must wait for the result; tools independent of every possible answer may run in parallel. If an answer is skipped, do not ask dependent follow-ups or call tools that require it. When allowCustom is true, do not add an Other or Custom option. Every question may be skipped by the user.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        heading: {
          type: 'string',
          minLength: 1,
          maxLength: MAX_HEADING_LENGTH,
          pattern: '\\S',
          description: 'Optional short heading shared by the whole group; do not repeat a question here.',
        },
        questions: {
          type: 'array',
          minItems: 1,
          maxItems: MAX_QUESTION_COUNT,
          description:
            'Questions to present together. Include only independently answerable questions that remain meaningful when any other question is skipped.',
          items: askUserToolQuestionSchema,
        },
      },
      required: ['questions'],
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
    if (!runtime || runtime.toolCallId !== toolCall.id) {
      invalidState('ask_user state is missing or does not match the tool call')
    }
    const askUserState = state as AskUserState
    if (askUserState.status !== 'submitted') {
      invalidState('ask_user can only resume after the user submits valid answers')
    }

    return {
      outcome: 'completed',
      answers: validateAndNormalizeAnswers(args.questions, askUserState.answers),
    } satisfies AskUserToolResult
  },
})
