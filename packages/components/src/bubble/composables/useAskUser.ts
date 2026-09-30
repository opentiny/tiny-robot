import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { AskUserChoiceAnswer, AskUserContent, AskUserState, AskUserStep, BubbleEvent } from '../index.type'

type AskUserEventEmitter = (event: BubbleEvent) => void

const isChoiceAnswer = (value: unknown): value is AskUserChoiceAnswer => {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as AskUserChoiceAnswer).selected))
}

const cloneAnswer = (value: unknown) => {
  if (Array.isArray(value)) {
    return [...value]
  }

  if (isChoiceAnswer(value)) {
    return {
      selected: [...value.selected],
      ...(value.other ? { other: { ...value.other } } : {}),
    }
  }

  return value
}

const cloneAnswers = (answers: Record<string, unknown> = {}) => {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(answers)) {
    result[key] = cloneAnswer(value)
  }

  return result
}

const isFilled = (value: unknown) => {
  if (isChoiceAnswer(value)) {
    return value.selected.length > 0 || Boolean(value.other?.selected && value.other.text.trim())
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  return value !== undefined && value !== null
}

const normalizeState = (content: AskUserContent | undefined, state: AskUserState | undefined): AskUserState => {
  const stepCount = content?.steps.length ?? 0
  const currentStep = Math.min(Math.max(state?.currentStep ?? 0, 0), Math.max(stepCount - 1, 0))
  const stepIds = new Set(content?.steps.map((step) => step.id) ?? [])

  return {
    status: state?.status ?? 'active',
    currentStep,
    answers: cloneAnswers(state?.answers),
    completedStepIds: (state?.completedStepIds ?? []).filter((stepId) => stepIds.has(stepId)),
    ...(typeof state?.expanded === 'boolean' ? { expanded: state.expanded } : {}),
    ...(state?.error ? { error: state.error } : {}),
    ...(state?.updatedAt ? { updatedAt: state.updatedAt } : {}),
  }
}

export const isAskUserContent = (value: unknown): value is AskUserContent => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const content = value as Partial<AskUserContent>
  return content.type === 'ask_user' && typeof content.id === 'string' && Array.isArray(content.steps)
}

export const useAskUser = (
  contentSource: MaybeRefOrGetter<AskUserContent | undefined>,
  stateSource: MaybeRefOrGetter<AskUserState | undefined>,
  emitEvent: AskUserEventEmitter,
) => {
  const content = computed(() => toValue(contentSource))
  const state = computed(() => normalizeState(content.value, toValue(stateSource)))
  const draftAnswers = ref<Record<string, unknown>>({})
  const validationError = ref('')
  const expanded = ref(true)

  watch(
    state,
    (nextState) => {
      draftAnswers.value = cloneAnswers(nextState.answers)
      validationError.value = ''
      expanded.value = nextState.expanded ?? true
    },
    { immediate: true, deep: true },
  )

  const steps = computed(() => content.value?.steps ?? [])
  const currentStepIndex = computed(() => state.value.currentStep)
  const currentStep = computed<AskUserStep | undefined>(() => steps.value[currentStepIndex.value])
  const status = computed(() => state.value.status)
  const isLocked = computed(() => status.value === 'submitting' || status.value === 'submitted')
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
      return cloneAnswer(value) as AskUserChoiceAnswer
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
      answers: cloneAnswers(draftAnswers.value),
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
      emitState(
        { status: 'active', currentStep: currentStepIndex.value + 1, completedStepIds, error: undefined },
        'ask-user:step-change',
        { stepId: step.id },
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
        answers[step.id] = null
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

  const skip = () => {
    if (isLocked.value || !currentStep.value) {
      return false
    }

    const step = currentStep.value
    const answers = cloneAnswers(draftAnswers.value)
    answers[step.id] = null
    draftAnswers.value = answers

    const completedStepIds = state.value.completedStepIds.filter((stepId) => stepId !== step.id)
    const isLastStep = currentStepIndex.value >= steps.value.length - 1

    if (isLastStep) {
      emitState({ status: 'submitted', completedStepIds, error: undefined }, 'ask-user:submit', {
        stepId: step.id,
      })
    } else {
      emitState(
        { status: 'active', currentStep: currentStepIndex.value + 1, completedStepIds, error: undefined },
        'ask-user:step-change',
        { stepId: step.id },
      )
    }

    return true
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
    if (status.value !== 'error') {
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
    skip,
    goToStep,
    retry,
    setExpanded,
  }
}
