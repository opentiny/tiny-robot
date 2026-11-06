<script setup lang="ts">
import { IconArrowDown, IconCheckedSur } from '@opentiny/tiny-robot-svgs'
import { TinyButton } from '@opentiny/vue'
import { computed, nextTick, reactive, ref } from 'vue'
import {
  getAskUserInteractionId,
  isAskUserContent,
  useAskUser,
  useBubbleEventFn,
  useContentResolver,
  useMessageContent,
} from '../composables'
import { useStableId } from '../../shared/composables'
import type { AskUserState, AskUserStateMap, AskUserStateValue, BubbleContentRendererProps } from '../index.type'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<BubbleContentRendererProps>()
const askUserInstanceId = useStableId()
const { content } = useMessageContent(props)
const resolveContent = useContentResolver()
const emitEvent = useBubbleEventFn()

const askUserContent = computed(() => {
  if (!isAskUserContent(content.value)) {
    return undefined
  }

  const protocolContent = content.value
  const interactionId = getAskUserInteractionId(protocolContent, props.contentIndex, props.message.id)
  return {
    ...protocolContent,
    id: interactionId,
  }
})

const isAskUserState = (value: unknown): value is AskUserState => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const state = value as Partial<AskUserState>
  return (
    typeof state.status === 'string' &&
    typeof state.currentStep === 'number' &&
    !!state.answers &&
    typeof state.answers === 'object' &&
    Array.isArray(state.completedStepIds)
  )
}

const askUserIds = computed(() => {
  const messageContent = resolveContent(props.message)
  if (!Array.isArray(messageContent)) {
    return askUserContent.value ? [askUserContent.value.id] : []
  }

  return messageContent.flatMap((item, index) =>
    isAskUserContent(item) ? [getAskUserInteractionId(item, index, props.message.id)] : [],
  )
})

const hasMultipleAskUsers = computed(() => askUserIds.value.length > 1)
const stateOwnerId = computed(() => askUserIds.value[0])

const askUserState = computed<AskUserState | undefined>(() => {
  const storedState = props.message.state?.askUser as AskUserStateValue | undefined
  let state: AskUserState | undefined

  if (isAskUserState(storedState)) {
    state = askUserContent.value?.id === stateOwnerId.value ? storedState : undefined
  } else {
    const interactionId = askUserContent.value?.id
    state = interactionId && storedState ? (storedState as AskUserStateMap)[interactionId] : undefined
  }

  const runtime = props.message.state?.askUserRuntime as { toolCallId?: unknown } | undefined
  const runtimeToolCallId = typeof runtime?.toolCallId === 'string' ? runtime.toolCallId : undefined
  const interactionId = askUserContent.value?.id
  const matchingToolCall = props.message.tool_calls?.find(
    (call) => call.id === interactionId && call.function.name === 'ask_user',
  )
  const toolCallId = runtimeToolCallId ?? matchingToolCall?.id
  const toolCallStatus = toolCallId
    ? (props.message.state?.toolCall as Record<string, { status?: unknown }> | undefined)?.[toolCallId]?.status
    : undefined

  const initialState = { currentStep: 0, answers: {}, completedStepIds: [] }
  if (runtimeToolCallId || ['cancelled', 'denied', 'failed'].includes(String(toolCallStatus))) {
    if (toolCallStatus === 'cancelled' || toolCallStatus === 'denied') {
      return { ...(state ?? initialState), status: 'cancelled', retryable: false }
    }

    if (toolCallStatus === 'failed') {
      return { ...(state ?? initialState), status: 'error', retryable: false }
    }

    if (runtimeToolCallId && toolCallStatus !== 'awaiting-approval' && state?.status !== 'submitted') {
      return { ...(state ?? initialState), status: 'submitting', retryable: false }
    }
  }

  return state
})

const emitAskUserEvent = (event: Parameters<typeof emitEvent>[0]) => {
  const payload = event.payload
  const storedState = props.message.state?.askUser as AskUserStateValue | undefined
  const hasStoredStateMap = Boolean(storedState && typeof storedState === 'object' && !isAskUserState(storedState))

  if (
    event.name !== 'state:update' ||
    !payload ||
    typeof payload !== 'object' ||
    !('key' in payload) ||
    !('value' in payload) ||
    payload.key !== 'askUser' ||
    (!hasMultipleAskUsers.value && !hasStoredStateMap) ||
    !askUserContent.value
  ) {
    emitEvent(event)
    return
  }

  const stateUpdatePayload = payload as { key: string; value: unknown }
  const stateMap: AskUserStateMap = isAskUserState(storedState)
    ? stateOwnerId.value
      ? { [stateOwnerId.value]: storedState }
      : {}
    : ((storedState ?? {}) as AskUserStateMap)

  emitEvent({
    ...event,
    payload: {
      ...stateUpdatePayload,
      value: {
        ...stateMap,
        [askUserContent.value.id]: stateUpdatePayload.value as AskUserState,
      },
    },
  })
}

const askUser = reactive(useAskUser(askUserContent, askUserState, emitAskUserEvent))
const otherInputRef = ref<HTMLInputElement>()

type AskUserRenderStep = NonNullable<ReturnType<typeof useAskUser>['steps']['value'][number]>
type AskUserRenderOption = NonNullable<AskUserRenderStep['options']>[number]

const stepLabel = (step: AskUserRenderStep) => step.summary || step.title

type SelectableOption = Omit<AskUserRenderOption, 'value'> & { value: string }
const isCustomOption = (option: AskUserRenderOption) => option.custom === true

const stepAnswer = (step: AskUserRenderStep) => {
  const value = askUser.draftAnswers[step.id]

  if (value && typeof value === 'object' && 'status' in value) {
    const answer = value as { status?: unknown; value?: unknown }
    if (answer.status === 'skipped') {
      return '已跳过'
    }
    if (answer.status === 'answered') {
      return Array.isArray(answer.value)
        ? answer.value.map((item) => String(item)).join('、')
        : String(answer.value ?? '')
    }
  }

  if (value && typeof value === 'object' && Array.isArray((value as { selected?: unknown }).selected)) {
    const answer = value as {
      selected: string[]
      additionalCustomValues?: string[]
      other?: { selected: boolean; text: string }
    }
    const labels = [...answer.selected, ...(answer.additionalCustomValues ?? [])].map(
      (item) => step.options?.find((option) => option.value === item)?.label ?? String(item),
    )

    if (answer.other?.selected && answer.other.text.trim()) {
      labels.push(`其他：${answer.other.text}`)
    }

    return labels.length ? labels.join('、') : '已跳过'
  }

  if (Array.isArray(value)) {
    const labels = value.map((item) => step.options?.find((option) => option.value === item)?.label ?? String(item))
    return labels.length ? labels.join('、') : '已跳过'
  }

  if (typeof value === 'string' && step.options) {
    return step.options.find((option) => option.value === value)?.label ?? value
  }

  return value === undefined || value === null || value === '' ? '已跳过' : String(value)
}

const currentOptions = computed<SelectableOption[]>(() => {
  const step = askUser.currentStep

  if (!step) {
    return []
  }

  return (step.options ?? []).filter((option) => !isCustomOption(option))
})

const otherOption = computed(() => askUser.currentStep?.options?.find(isCustomOption))

const selectOption = (value: SelectableOption['value']) => {
  askUser.selectOption(value)
}

const isOptionSelected = (value: SelectableOption['value']) => {
  return askUser.isOptionSelected(value)
}

const answersExpanded = computed(() => askUser.expanded)
const answersId = computed(() => `ask-user-answers-${askUserInstanceId}`)
const stepHeadingId = (stepId: string) => `ask-user-step-${askUserInstanceId}-${stepId}`

const toggleAnswers = () => {
  askUser.setExpanded(!answersExpanded.value)
}

const handleTextInput = (event: Event) => {
  askUser.setAnswer((event.target as HTMLTextAreaElement).value)
}

const handleOtherInput = (event: Event) => {
  askUser.setOtherText((event.target as HTMLInputElement).value)
}

const handleOtherOptionClick = () => {
  if (!otherOption.value?.disabled && !askUser.isOtherSelected) {
    askUser.setOtherSelected(true)
    nextTick(() => otherInputRef.value?.focus())
  }
}

const handleOtherInputClick = () => {
  if (!otherOption.value?.disabled && !askUser.isOtherSelected) {
    askUser.setOtherSelected(true)
    nextTick(() => otherInputRef.value?.focus())
  }
}

const handleOtherOptionChange = (event: Event) => {
  const selected = (event.target as HTMLInputElement).checked
  askUser.setOtherSelected(selected)
  if (selected) {
    nextTick(() => otherInputRef.value?.focus())
  }
}

const handleStepKeydown = (event: KeyboardEvent, index: number) => {
  if (askUser.isLocked || (event.key !== 'Enter' && event.key !== ' ')) {
    return
  }

  event.preventDefault()
  askUser.goToStep(index)
}
</script>

<template>
  <div
    v-if="askUserContent"
    class="tr-bubble__ask-user"
    :class="{ 'is-submitted': askUser.status === 'submitted' }"
    data-type="ask-user"
    v-bind="$attrs"
  >
    <div
      class="tr-bubble__ask-user-header"
      :class="{ 'is-collapsed': askUser.status === 'submitted' && !answersExpanded }"
    >
      <div class="tr-bubble__ask-user-heading">
        <h3 class="tr-bubble__ask-user-prompt">{{ askUserContent.heading || '提供详细的问题' }}</h3>
      </div>
      <tiny-button
        v-if="askUser.status === 'submitted' && askUser.steps.length"
        type="text"
        size="mini"
        circle
        :reset-time="0"
        native-type="button"
        class="tr-bubble__ask-user-expand"
        :aria-expanded="answersExpanded"
        :aria-controls="answersId"
        :aria-label="answersExpanded ? '收起所有问题' : '展开所有问题'"
        :title="answersExpanded ? '收起所有问题' : '展开所有问题'"
        @click="toggleAnswers"
      >
        <IconArrowDown :class="{ '-rotate-90': !answersExpanded }" />
      </tiny-button>
    </div>

    <section
      v-if="askUser.status === 'submitted'"
      v-show="answersExpanded"
      :id="answersId"
      class="tr-bubble__ask-user-answers"
      aria-label="提交结果"
    >
      <ul class="tr-bubble__ask-user-answer-list">
        <li v-for="step in askUser.steps" :key="step.id" class="tr-bubble__ask-user-answer">
          <span class="tr-bubble__ask-user-answer-question">{{ step.title }}：</span>
          <span class="tr-bubble__ask-user-answer-value">{{ stepAnswer(step) }}</span>
        </li>
      </ul>
    </section>

    <p v-else-if="askUser.status === 'cancelled'" class="tr-bubble__ask-user-error" role="status">
      已取消本次信息收集。
    </p>

    <section
      v-else-if="askUser.currentStep"
      class="tr-bubble__ask-user-step"
      :aria-labelledby="stepHeadingId(askUser.currentStep.id)"
    >
      <div v-if="askUser.steps.length > 1" class="tr-bubble__ask-user-progress" aria-label="确认进度">
        <template v-for="(step, index) in askUser.steps" :key="step.id">
          <span
            class="tr-bubble__ask-user-progress-step"
            :class="{ 'is-active': index === askUser.currentStepIndex, 'is-disabled': askUser.isLocked }"
            role="button"
            :tabindex="askUser.isLocked ? -1 : 0"
            :aria-disabled="askUser.isLocked ? 'true' : undefined"
            :aria-current="index === askUser.currentStepIndex ? 'step' : undefined"
            @click="askUser.goToStep(index)"
            @keydown="handleStepKeydown($event, index)"
          >
            <span class="tr-bubble__ask-user-progress-marker">
              {{ index + 1 }}
            </span>
            <span class="tr-bubble__ask-user-progress-label" :title="step.summary">{{ stepLabel(step) }}</span>
          </span>
          <span
            v-if="index < askUser.steps.length - 1"
            class="tr-bubble__ask-user-progress-connector"
            aria-hidden="true"
          ></span>
        </template>
      </div>

      <div class="tr-bubble__ask-user-step-heading">
        <div>
          <h4
            :id="stepHeadingId(askUser.currentStep.id)"
            class="tr-bubble__ask-user-step-title"
            :title="askUser.currentStep.title"
          >
            {{ askUser.currentStep.title }}
          </h4>
        </div>
        <p v-if="askUser.currentStep.description" class="tr-bubble__ask-user-step-description">
          {{ askUser.currentStep.description }}
        </p>
      </div>

      <div v-if="askUser.currentStep.type === 'text'" class="tr-bubble__ask-user-field">
        <textarea
          class="tr-bubble__ask-user-textarea"
          :value="typeof askUser.currentAnswer === 'string' ? askUser.currentAnswer : ''"
          :disabled="askUser.isLocked"
          rows="3"
          @input="handleTextInput"
        ></textarea>
      </div>

      <div v-else class="tr-bubble__ask-user-options" :class="`is-${askUser.currentStep.type}`">
        <div
          v-for="option in currentOptions"
          :key="String(option.value)"
          class="tr-bubble__ask-user-option"
          :class="{ 'is-selected': isOptionSelected(option.value) }"
        >
          <label class="tr-bubble__ask-user-option-trigger">
            <input
              :type="askUser.currentStep.type === 'multiple' ? 'checkbox' : 'radio'"
              :name="`ask-user-${askUserInstanceId}-${askUser.currentStep.id}`"
              :value="String(option.value)"
              :checked="isOptionSelected(option.value)"
              :disabled="askUser.isLocked || option.disabled"
              @change="selectOption(option.value)"
            />
            <span class="tr-bubble__ask-user-option-mark" aria-hidden="true">
              <IconCheckedSur v-if="askUser.currentStep.type === 'multiple' && isOptionSelected(option.value)" />
            </span>
            <span class="tr-bubble__ask-user-option-copy">
              <span class="tr-bubble__ask-user-option-label">{{ option.label }}</span>
              <span v-if="option.description" class="tr-bubble__ask-user-option-description">
                {{ option.description }}
              </span>
            </span>
          </label>
        </div>
        <div
          v-if="askUser.supportsOther && otherOption && !otherOption.disabled"
          class="tr-bubble__ask-user-option tr-bubble__ask-user-other-option"
          :class="{ 'is-selected': askUser.isOtherSelected }"
          @click="handleOtherOptionClick"
        >
          <label class="tr-bubble__ask-user-option-trigger" @click.stop>
            <input
              :type="askUser.currentStep.type === 'multiple' ? 'checkbox' : 'radio'"
              :name="`ask-user-${askUserInstanceId}-${askUser.currentStep.id}`"
              :checked="askUser.isOtherSelected"
              :disabled="askUser.isLocked || otherOption?.disabled"
              @change="handleOtherOptionChange"
            />
            <span class="tr-bubble__ask-user-option-mark" aria-hidden="true">
              <IconCheckedSur v-if="askUser.currentStep.type === 'multiple' && askUser.isOtherSelected" />
            </span>
            <span class="tr-bubble__ask-user-option-label">{{ otherOption?.label || '其他' }}</span>
          </label>
          <input
            ref="otherInputRef"
            class="tr-bubble__ask-user-other-input"
            :value="askUser.otherText"
            placeholder="请输入"
            :disabled="askUser.isLocked || otherOption?.disabled"
            :readonly="!askUser.isOtherSelected"
            @click.stop="handleOtherInputClick"
            @input="handleOtherInput"
          />
        </div>
      </div>

      <p v-if="askUser.validationError" class="tr-bubble__ask-user-validation" role="alert">
        {{ askUser.validationError }}
      </p>
      <p v-if="askUser.status === 'error' && askUser.state.error" class="tr-bubble__ask-user-error" role="alert">
        {{ askUser.state.error }}
      </p>
    </section>

    <div
      v-if="askUser.steps.length && askUser.status !== 'submitted' && askUser.status !== 'cancelled'"
      class="tr-bubble__ask-user-actions"
    >
      <div class="tr-bubble__ask-user-actions-right">
        <tiny-button
          v-if="askUser.status === 'error' && askUser.retryable"
          size="mini"
          :reset-time="0"
          round
          class="tr-bubble__ask-user-button"
          @click="askUser.retry"
        >
          重试
        </tiny-button>
        <tiny-button
          v-if="askUser.status === 'active' && askUser.steps.length > 1"
          size="mini"
          round
          class="tr-bubble__ask-user-button"
          @click="askUser.submit"
        >
          跳过
        </tiny-button>
        <tiny-button
          v-if="askUser.status === 'active' && askUser.currentStepIndex < askUser.steps.length - 1"
          type="primary"
          size="mini"
          round
          class="tr-bubble__ask-user-button"
          @click="askUser.next"
        >
          下一步
        </tiny-button>
        <tiny-button
          v-if="askUser.status === 'active' && askUser.currentStepIndex === askUser.steps.length - 1"
          type="primary"
          size="mini"
          round
          class="tr-bubble__ask-user-button"
          @click="askUser.submit"
        >
          <span>提交</span>
        </tiny-button>
      </div>
    </div>
  </div>
</template>
