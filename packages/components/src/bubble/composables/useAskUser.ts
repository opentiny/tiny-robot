import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type {
  AskUserContent,
  AskUserQuestionOption,
  AskUserState,
  BubbleEvent,
  ChatMessageContent,
  ToolCall,
} from '../index.type'

type AskUserEventEmitter = (event: BubbleEvent) => void

type AskUserRenderStepType = 'single' | 'multiple' | 'text'

interface AskUserRenderOption {
  label: string
  value: string
  description?: string
  disabled?: boolean
  custom?: boolean
}

interface AskUserRenderChoiceAnswer {
  selected: string[]
  additionalCustomValues?: string[]
  other?: {
    selected: boolean
    text: string
  }
}

interface AskUserRenderStep {
  id: string
  title: string
  summary?: string
  description?: string
  type: AskUserRenderStepType
  options?: AskUserRenderOption[]
}

interface AskUserRenderContent {
  type: 'ask_user'
  id: string
  steps: AskUserRenderStep[]
}

const QUESTION_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,99}$/
const MAX_HEADING_LENGTH = 200
const MAX_QUESTION_SUMMARY_LENGTH = 100
const MAX_QUESTION_LENGTH = 1000
const MAX_QUESTION_COUNT = 20
const MAX_OPTION_COUNT = 50
const MAX_OPTION_LABEL_LENGTH = 200
const MAX_OPTION_DESCRIPTION_LENGTH = 500

const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]) => {
  const allowed = new Set(keys)
  return Object.keys(value).every((key) => allowed.has(key))
}

const isChoiceAnswer = (value: unknown): value is AskUserRenderChoiceAnswer => {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as AskUserRenderChoiceAnswer).selected))
}

const setOwnRecordValue = (record: Record<string, unknown>, key: string, value: unknown) => {
  Object.defineProperty(record, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  })
}

const cloneAnswer = (value: unknown) => {
  if (Array.isArray(value)) {
    return [...value]
  }

  if (isChoiceAnswer(value)) {
    return {
      selected: [...value.selected],
      ...(value.additionalCustomValues ? { additionalCustomValues: [...value.additionalCustomValues] } : {}),
      ...(value.other ? { other: { ...value.other } } : {}),
    }
  }

  return value
}

const cloneAnswers = (answers: Record<string, unknown> = {}) => {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(answers)) {
    setOwnRecordValue(result, key, cloneAnswer(value))
  }

  return result
}

const answersEqual = (left: Record<string, unknown>, right: Record<string, unknown>): boolean => {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)

  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  return leftKeys.every((key) => {
    const leftValue = left[key]
    const rightValue = right[key]

    if (Array.isArray(leftValue) || Array.isArray(rightValue)) {
      return (
        Array.isArray(leftValue) &&
        Array.isArray(rightValue) &&
        leftValue.length === rightValue.length &&
        leftValue.every((item, index) => Object.is(item, rightValue[index]))
      )
    }

    if (isChoiceAnswer(leftValue) || isChoiceAnswer(rightValue)) {
      return (
        isChoiceAnswer(leftValue) &&
        isChoiceAnswer(rightValue) &&
        answersEqual({ selected: leftValue.selected }, { selected: rightValue.selected }) &&
        answersEqual(
          { values: leftValue.additionalCustomValues ?? [] },
          { values: rightValue.additionalCustomValues ?? [] },
        ) &&
        leftValue.other?.selected === rightValue.other?.selected &&
        leftValue.other?.text === rightValue.other?.text
      )
    }

    return Object.is(leftValue, rightValue)
  })
}

const isFilled = (value: unknown) => {
  if (isChoiceAnswer(value)) {
    return (
      value.selected.length > 0 ||
      Boolean(value.other?.selected && value.other.text.trim()) ||
      Boolean(value.additionalCustomValues?.some((item) => item.trim()))
    )
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  return value !== undefined && value !== null
}

const unwrapProtocolAnswer = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return value
  }

  const answer = value as { status?: unknown; value?: unknown }
  if (answer.status === 'skipped') {
    return null
  }
  if (answer.status === 'answered') {
    return answer.value
  }

  return value
}

const toRenderAnswer = (step: AskUserRenderStep, value: unknown) => {
  const answer = unwrapProtocolAnswer(value)
  if (answer === undefined || answer === null || step.type === 'text') {
    return answer
  }

  const optionValues = new Set((step.options ?? []).filter((option) => !option.custom).map((option) => option.value))
  if (step.type === 'multiple' && Array.isArray(answer)) {
    const values = answer.filter((item): item is string => typeof item === 'string')
    const selected = values.filter((item) => optionValues.has(item))
    const customValues = values.filter((item) => !optionValues.has(item))
    if (!customValues.length) {
      return values
    }

    return {
      selected,
      other: { selected: true, text: customValues[0] },
      ...(customValues.length > 1 ? { additionalCustomValues: customValues.slice(1) } : {}),
    } satisfies AskUserRenderChoiceAnswer
  }

  if (
    step.type === 'single' &&
    typeof answer === 'string' &&
    !optionValues.has(answer) &&
    step.options?.some((option) => option.custom)
  ) {
    return { selected: [], other: { selected: true, text: answer } } satisfies AskUserRenderChoiceAnswer
  }

  return answer
}

const toProtocolAnswer = (step: AskUserRenderStep | undefined, value: unknown) => {
  if (!step || !isChoiceAnswer(value)) {
    return value
  }

  if (step.type === 'multiple') {
    const values = [
      ...value.selected,
      ...(value.additionalCustomValues ?? []),
      ...(value.other?.selected && value.other.text.trim() ? [value.other.text.trim()] : []),
    ]
    return Array.from(new Set(values))
  }

  if (step.type === 'single') {
    if (value.other?.selected && value.other.text.trim()) {
      return value.other.text.trim()
    }
    return value.selected[0] ?? null
  }

  return value
}

const toProtocolAnswers = (content: AskUserRenderContent | undefined, answers: Record<string, unknown>) => {
  const steps = new Map(content?.steps.map((step) => [step.id, step]) ?? [])
  return Object.fromEntries(Object.entries(answers).map(([id, value]) => [id, toProtocolAnswer(steps.get(id), value)]))
}

const normalizeState = (content: AskUserRenderContent | undefined, state: AskUserState | undefined): AskUserState => {
  const stepCount = content?.steps.length ?? 0
  const currentStep = Math.min(Math.max(state?.currentStep ?? 0, 0), Math.max(stepCount - 1, 0))
  const stepIds = new Set(content?.steps.map((step) => step.id) ?? [])

  return {
    status: state?.status ?? 'active',
    currentStep,
    answers: Object.fromEntries(
      Object.entries(state?.answers ?? {}).map(([id, value]) => {
        const step = content?.steps.find((item) => item.id === id)
        return [id, step ? toRenderAnswer(step, value) : cloneAnswer(value)]
      }),
    ),
    completedStepIds: (state?.completedStepIds ?? []).filter((stepId) => stepIds.has(stepId)),
    ...(typeof state?.expanded === 'boolean' ? { expanded: state.expanded } : {}),
    ...(state?.error ? { error: state.error } : {}),
    retryable: state?.retryable !== false,
    ...(state?.updatedAt ? { updatedAt: state.updatedAt } : {}),
  }
}

const isAskUserQuestion = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const question = value as Record<string, unknown>
  if (
    !hasOnlyKeys(question, ['id', 'summary', 'question', 'options', 'multiSelect', 'allowCustom']) ||
    typeof question.id !== 'string' ||
    !QUESTION_ID_PATTERN.test(question.id) ||
    (question.summary !== undefined &&
      (typeof question.summary !== 'string' ||
        question.summary.trim().length === 0 ||
        question.summary.trim().length > MAX_QUESTION_SUMMARY_LENGTH)) ||
    typeof question.question !== 'string' ||
    question.question.trim().length === 0 ||
    question.question.trim().length > MAX_QUESTION_LENGTH
  ) {
    return false
  }

  if (question.options === undefined) {
    return question.multiSelect === undefined && question.allowCustom === undefined
  }

  const optionLabels = new Set<string>()
  const hasValidOptions =
    Array.isArray(question.options) &&
    question.options.length > 0 &&
    question.options.length <= MAX_OPTION_COUNT &&
    question.options.every((option) => {
      if (!option || typeof option !== 'object') {
        return false
      }
      const choice = option as Record<string, unknown>
      if (
        !hasOnlyKeys(choice, ['label', 'description']) ||
        typeof choice.label !== 'string' ||
        choice.label.trim().length === 0 ||
        choice.label.trim().length > MAX_OPTION_LABEL_LENGTH ||
        (choice.description !== undefined &&
          (typeof choice.description !== 'string' ||
            choice.description.trim().length === 0 ||
            choice.description.trim().length > MAX_OPTION_DESCRIPTION_LENGTH))
      ) {
        return false
      }

      const normalizedLabel = choice.label.trim()
      if (optionLabels.has(normalizedLabel)) {
        return false
      }
      optionLabels.add(normalizedLabel)
      return true
    })

  return hasValidOptions && typeof question.multiSelect === 'boolean' && typeof question.allowCustom === 'boolean'
}

export const isAskUserContent = (value: unknown): value is AskUserContent => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const content = value as Record<string, unknown>
  return (
    content.type === 'ask_user' &&
    hasOnlyKeys(content, ['type', 'id', 'heading', 'questions']) &&
    (content.id === undefined || (typeof content.id === 'string' && content.id.trim().length > 0)) &&
    (content.heading === undefined ||
      (typeof content.heading === 'string' &&
        content.heading.trim().length > 0 &&
        content.heading.trim().length <= MAX_HEADING_LENGTH)) &&
    Array.isArray(content.questions) &&
    content.questions.length > 0 &&
    content.questions.length <= MAX_QUESTION_COUNT &&
    content.questions.every(isAskUserQuestion) &&
    new Set((content.questions as Array<{ id: string }>).map((question) => question.id)).size ===
      content.questions.length
  )
}

export const getAskUserContentFromToolCall = (toolCall: ToolCall | undefined): AskUserContent | undefined => {
  if (
    toolCall?.function?.name !== 'ask_user' ||
    typeof toolCall.id !== 'string' ||
    typeof toolCall.function.arguments !== 'string'
  ) {
    return undefined
  }

  try {
    const argumentsValue: unknown = JSON.parse(toolCall.function.arguments)
    if (
      !argumentsValue ||
      typeof argumentsValue !== 'object' ||
      Array.isArray(argumentsValue) ||
      !hasOnlyKeys(argumentsValue as Record<string, unknown>, ['heading', 'questions'])
    ) {
      return undefined
    }

    const content = { ...(argumentsValue as Record<string, unknown>), type: 'ask_user', id: toolCall.id }
    return isAskUserContent(content) ? content : undefined
  } catch {
    return undefined
  }
}

export const resolveBubbleMessageContent = (message: {
  content?: ChatMessageContent
  tool_calls?: ToolCall[]
}): ChatMessageContent | undefined => {
  const askUserContents =
    message.tool_calls?.flatMap((toolCall) => {
      const content = getAskUserContentFromToolCall(toolCall)
      return content ? [content] : []
    }) ?? []

  if (askUserContents.length === 0) {
    return message.content
  }

  if (Array.isArray(message.content) && message.content.some(isAskUserContent)) {
    return message.content
  }

  if (Array.isArray(message.content)) {
    return [...message.content, ...askUserContents]
  }

  if (typeof message.content === 'string' && message.content.length > 0) {
    return [{ type: 'text', text: message.content }, ...askUserContents]
  }

  return askUserContents
}

const toUniqueCustomOptionValue = (questionId: string, optionLabels: Set<string>) => {
  let value = `__ask_user_custom_${questionId}__`
  while (optionLabels.has(value)) {
    value += '_'
  }
  return value
}

/** Adapts protocol questions to the renderer's sequential question model. */
const normalizeAskUserViewContent = (value: unknown, fallbackId: string): AskUserRenderContent | undefined => {
  if (!isAskUserContent(value)) {
    return undefined
  }

  return {
    type: 'ask_user',
    id: value.id ?? fallbackId,
    steps: value.questions.map((question): AskUserRenderStep => {
      if (!question.options) {
        return { id: question.id, title: question.question, summary: question.summary, type: 'text' }
      }

      const options: AskUserRenderOption[] = question.options.map((option: AskUserQuestionOption) => ({
        label: option.label,
        value: option.label,
        ...(option.description ? { description: option.description } : {}),
      }))
      if (question.allowCustom) {
        options.push({
          label: '其他',
          value: toUniqueCustomOptionValue(question.id, new Set(options.map((option) => option.value))),
          custom: true,
        })
      }

      return {
        id: question.id,
        title: question.question,
        summary: question.summary,
        type: question.multiSelect ? 'multiple' : 'single',
        options,
      }
    }),
  }
}

export const getAskUserInteractionId = (
  content: Pick<AskUserContent, 'id'>,
  contentIndex: number,
  messageId?: string,
) => {
  return content.id ?? `ask-user-${messageId ?? 'message'}-${contentIndex}`
}

export const hasUniqueAskUserIds = (value: unknown, messageId?: string): boolean => {
  if (!Array.isArray(value)) {
    return true
  }

  const askUserIds = value.flatMap((content, index) =>
    isAskUserContent(content) ? [getAskUserInteractionId(content, index, messageId)] : [],
  )
  return new Set(askUserIds).size === askUserIds.length
}

const useAskUserView = (
  contentSource: MaybeRefOrGetter<AskUserContent | undefined>,
  fallbackId: string,
  stateSource: MaybeRefOrGetter<AskUserState | undefined>,
  emitEvent: AskUserEventEmitter,
) => {
  const content = computed(() => normalizeAskUserViewContent(toValue(contentSource), fallbackId))
  const state = computed(() => normalizeState(content.value, toValue(stateSource)))
  const draftAnswers = ref<Record<string, unknown>>({})
  const syncedAnswers = ref<Record<string, unknown>>({})
  const contentSignature = computed(() => JSON.stringify(content.value) ?? '')
  const syncedContentSignature = ref('')
  const validationError = ref('')
  const expanded = ref(true)

  watch(
    [state, contentSignature],
    ([nextState, nextContentSignature]) => {
      const answersChanged = !answersEqual(nextState.answers, syncedAnswers.value)
      const contentChanged = nextContentSignature !== syncedContentSignature.value

      if (answersChanged || contentChanged) {
        draftAnswers.value = cloneAnswers(nextState.answers)
        syncedAnswers.value = cloneAnswers(nextState.answers)
        validationError.value = ''
      }

      expanded.value = nextState.expanded ?? true
      syncedContentSignature.value = nextContentSignature
    },
    { immediate: true, deep: true },
  )

  const steps = computed(() => content.value?.steps ?? [])
  const currentStepIndex = computed(() => state.value.currentStep)
  const currentStep = computed<AskUserRenderStep | undefined>(() => steps.value[currentStepIndex.value])
  const status = computed(() => state.value.status)
  const retryable = computed(() => state.value.retryable !== false)
  const isLocked = computed(
    () => status.value === 'submitting' || status.value === 'submitted' || status.value === 'cancelled',
  )
  const canGoBack = computed(() => !isLocked.value && currentStepIndex.value > 0)
  const currentAnswer = computed(() => {
    const stepId = currentStep.value?.id
    return stepId ? draftAnswers.value[stepId] : undefined
  })
  const supportsOther = computed(() => {
    const type = currentStep.value?.type
    return type === 'single' || type === 'multiple'
  })

  const currentChoiceAnswer = () => {
    const step = currentStep.value
    const value = currentAnswer.value

    if (isChoiceAnswer(value)) {
      return cloneAnswer(value) as AskUserRenderChoiceAnswer
    }

    if (step?.type === 'multiple') {
      return { selected: Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [] }
    }

    return { selected: typeof value === 'string' ? [value] : [] }
  }

  const emitState = (patch: Partial<AskUserState>, eventName: string, eventPayload: Record<string, unknown> = {}) => {
    const nextState: AskUserState = {
      ...state.value,
      ...patch,
      answers: toProtocolAnswers(content.value, draftAnswers.value),
      updatedAt: Date.now(),
    }

    emitEvent({
      name: 'state:update',
      payload: { key: 'askUser', value: nextState },
    })
    emitEvent({
      name: eventName,
      payload: {
        interactionId: content.value?.id,
        currentStep: nextState.currentStep,
        answers: cloneAnswers(nextState.answers),
        status: nextState.status,
        ...eventPayload,
      },
    })
  }

  const setAnswer = (value: unknown) => {
    const stepId = currentStep.value?.id
    if (!stepId || isLocked.value) {
      return
    }

    draftAnswers.value = {
      ...draftAnswers.value,
      [stepId]: Array.isArray(value) ? [...value] : value,
    }
    validationError.value = ''
  }

  const toggleOption = (value: string) => {
    const current = Array.isArray(currentAnswer.value) ? [...currentAnswer.value] : []
    const index = current.indexOf(value)

    if (index === -1) {
      current.push(value)
    } else {
      current.splice(index, 1)
    }

    setAnswer(current)
  }

  const isOptionSelected = (value: string) => {
    if (supportsOther.value) {
      return currentChoiceAnswer().selected.includes(value)
    }

    if (currentStep.value?.type === 'multiple') {
      return Array.isArray(currentAnswer.value) && currentAnswer.value.includes(value)
    }

    return currentAnswer.value === value
  }

  const selectOption = (value: string) => {
    const answer = currentChoiceAnswer()

    if (currentStep.value?.type === 'multiple') {
      const index = answer.selected.indexOf(value)
      if (index === -1) {
        answer.selected.push(value)
      } else {
        answer.selected.splice(index, 1)
      }
    } else {
      answer.selected = [value]
      if (answer.other?.selected) {
        answer.other.selected = false
      }
    }

    setAnswer(answer)
  }

  const isOtherSelected = computed(() => supportsOther.value && Boolean(currentChoiceAnswer().other?.selected))
  const otherText = computed(() => currentChoiceAnswer().other?.text ?? '')

  const setOtherSelected = (selected: boolean) => {
    if (!supportsOther.value) {
      return
    }

    const answer = currentChoiceAnswer()
    if (selected && currentStep.value?.type === 'single') {
      answer.selected = []
    }
    if (!selected) {
      answer.additionalCustomValues = []
    }
    answer.other = { selected, text: answer.other?.text ?? '' }
    setAnswer(answer)
  }

  const setOtherText = (text: string) => {
    if (!supportsOther.value) {
      return
    }

    const answer = currentChoiceAnswer()
    if (currentStep.value?.type === 'single') {
      answer.selected = []
    }
    answer.other = { selected: true, text }
    setAnswer(answer)
  }

  const next = () => {
    if (isLocked.value || !currentStep.value) {
      return false
    }

    const step = currentStep.value
    const completedStepIds = Array.from(new Set([...state.value.completedStepIds, step.id]))
    const isLastStep = currentStepIndex.value >= steps.value.length - 1

    if (isLastStep) {
      emitState({ status: 'submitted', completedStepIds }, 'ask-user:submit', { stepId: step.id })
    } else {
      const nextStep = steps.value[currentStepIndex.value + 1]
      emitState(
        { status: 'active', currentStep: currentStepIndex.value + 1, completedStepIds, error: undefined },
        'ask-user:step-change',
        { stepId: nextStep.id },
      )
    }

    return true
  }

  const submit = () => {
    if (isLocked.value || !steps.value.length) {
      return false
    }

    const answers = cloneAnswers(draftAnswers.value)
    const completedStepIds = steps.value.reduce<string[]>((completed, step) => {
      if (isFilled(answers[step.id])) {
        completed.push(step.id)
      } else {
        setOwnRecordValue(answers, step.id, null)
      }
      return completed
    }, [])

    draftAnswers.value = answers
    emitState({ status: 'submitted', completedStepIds, error: undefined }, 'ask-user:submit', {
      stepId: currentStep.value?.id,
    })
    return true
  }

  const back = () => {
    if (!canGoBack.value) {
      return false
    }

    return goToStep(currentStepIndex.value - 1)
  }

  const goToStep = (targetStep: number) => {
    const target = steps.value[targetStep]

    if (
      isLocked.value ||
      targetStep < 0 ||
      targetStep >= steps.value.length ||
      targetStep === currentStepIndex.value ||
      !target
    ) {
      return false
    }

    emitState({ status: 'active', currentStep: targetStep, error: undefined }, 'ask-user:step-change', {
      stepId: target.id,
    })
    return true
  }

  const retry = () => {
    if (status.value !== 'error' || !retryable.value) {
      return false
    }

    emitState({ status: 'active', error: undefined }, 'ask-user:retry', { stepId: currentStep.value?.id })
    return true
  }

  const setExpanded = (value: boolean) => {
    expanded.value = value
    emitState({ expanded: value }, 'ask-user:toggle', { expanded: value })
  }

  return {
    content,
    state,
    steps,
    currentStep,
    currentStepIndex,
    currentAnswer,
    draftAnswers,
    validationError,
    expanded,
    supportsOther,
    isOtherSelected,
    otherText,
    status,
    retryable,
    isLocked,
    canGoBack,
    setAnswer,
    toggleOption,
    isOptionSelected,
    selectOption,
    setOtherSelected,
    setOtherText,
    next,
    submit,
    back,
    goToStep,
    retry,
    setExpanded,
  }
}

/** Manages the interactive state for a current-protocol AskUser question set. */
export const useAskUser = (
  contentSource: MaybeRefOrGetter<AskUserContent | undefined>,
  stateSource: MaybeRefOrGetter<AskUserState | undefined>,
  emitEvent: AskUserEventEmitter,
) => useAskUserView(contentSource, 'ask-user', stateSource, emitEvent)
