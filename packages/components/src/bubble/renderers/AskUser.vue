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

const askUserState = computed(() => {
  const storedState = props.message.state?.askUser as AskUserStateValue | undefined

  if (isAskUserState(storedState)) {
    return askUserContent.value?.id === stateOwnerId.value ? storedState : undefined
  }

  const interactionId = askUserContent.value?.id
  return interactionId && storedState ? (storedState as AskUserStateMap)[interactionId] : undefined
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

<style scoped lang="less">
.tr-bubble__ask-user {
  width: 100%;
  color: var(--tr-text-primary);
  font-size: var(--tr-font-size-sm);
  line-height: 1.5;
  box-sizing: border-box;
}
.tr-bubble__ask-user.is-submitted {
  padding: var(--tr-spacing-xl) var(--tr-spacing-2xl) var(--tr-spacing-lg);
  border-radius: var(--tr-radius-md);
  background: var(--tr-container-bg-default-2);
}
.tr-bubble__ask-user.is-submitted .tr-bubble__ask-user-prompt,
.tr-bubble__ask-user.is-submitted .tr-bubble__ask-user-expand {
  color: #595959;
}

.tr-bubble__ask-user-header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: var(--tr-spacing-xs);
  margin-bottom: var(--tr-spacing-md);
}
.tr-bubble__ask-user-header.is-collapsed {
  margin-bottom: 0;
}
.tr-bubble__ask-user-prompt {
  min-width: 0;
  margin: 0;
  font-size: var(--tr-font-size-md);
  font-weight: var(--tr-font-weight-semibold);
  line-height: 24px;
}
.tr-bubble__ask-user-heading {
  flex: 1;
  min-width: 0;
}
.tr-bubble__ask-user-description {
  margin: var(--tr-spacing-2xs) 0 0;
  color: var(--tr-text-secondary);
  word-break: break-word;
}
.tr-bubble__ask-user-expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: var(--tr-radius-sm);
  background: transparent;
  color: var(--tr-text-secondary);
  cursor: pointer;
}
.tr-bubble__ask-user-expand svg {
  font-size: 16px;
  transition: transform 0.2s ease;
}
.tr-bubble__ask-user-expand svg.-rotate-90 {
  transform: rotate(-90deg);
}

.tr-bubble__ask-user-answers {
  width: 100%;
}
.tr-bubble__ask-user-answer-list {
  margin: 0;
  padding: 0 8px;
  list-style: none;
}
.tr-bubble__ask-user-answer {
  position: relative;
  padding-left: 13px;
}
.tr-bubble__ask-user-answer + .tr-bubble__ask-user-answer {
  margin-top: var(--tr-spacing-sm);
}
.tr-bubble__ask-user-answer::before {
  position: absolute;
  top: calc(0.75em + 1px);
  left: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #595959;
  content: '';
  transform: translateY(-50%);
}
.tr-bubble__ask-user-answer-question {
  display: inline;
  color: #595959;
  font-weight: var(--tr-font-weight-regular);
}
.tr-bubble__ask-user-answer-value {
  display: inline;
  margin-left: var(--tr-spacing-xs);
  color: #595959;
  word-break: break-word;
}

.tr-bubble__ask-user-actions,
.tr-bubble__ask-user-actions-right,
.tr-bubble__ask-user-step-heading {
  display: flex;
  align-items: center;
}

.tr-bubble__ask-user-step-title,
.tr-bubble__ask-user-step-description {
  margin: 0;
}

.tr-bubble__ask-user-step-description {
  color: var(--tr-text-secondary);
}

.tr-bubble__ask-user-progress {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: var(--tr-spacing-md);
  overflow-x: auto;
  padding-bottom: var(--tr-spacing-2xs);
}

.tr-bubble__ask-user-progress-step {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: var(--tr-spacing-xs) 0;
  color: var(--tr-text-secondary);
  cursor: pointer;
  user-select: none;
}
.tr-bubble__ask-user-progress-step.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.tr-bubble__ask-user-progress-step:focus-visible,
.tr-bubble__ask-user-option:has(input:focus-visible),
.tr-bubble__ask-user-button:focus-visible,
.tr-bubble__ask-user-expand:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 1px;
}
.tr-bubble__ask-user-progress-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 50%;
  font-size: var(--tr-font-size-xs);
}
.tr-bubble__ask-user-progress-step.is-active {
  color: var(--tr-color-primary);
}
.tr-bubble__ask-user-progress-step.is-active .tr-bubble__ask-user-progress-marker {
  border-color: var(--tr-color-primary);
  background: transparent;
  color: var(--tr-color-primary);
}
.tr-bubble__ask-user-progress-connector {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: 24px;
  height: 1px;
  margin: 0 8px;
  background: var(--tr-border-color-default);
}
.tr-bubble__ask-user-progress-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--tr-font-size-sm);
}
.tr-bubble__ask-user-step-heading {
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--tr-spacing-md);
  margin-bottom: var(--tr-spacing-md);
}
.tr-bubble__ask-user-step-title {
  font-size: var(--tr-font-size-sm);
  font-weight: var(--tr-font-weight-regular);
  line-height: 1.4;
}
.tr-bubble__ask-user-step-description {
  max-width: 48%;
  text-align: right;
  font-size: var(--tr-font-size-sm);
}

.tr-bubble__ask-user-options {
  display: grid;
  gap: var(--tr-spacing-sm);
}
.tr-bubble__ask-user-option {
  display: flex;
  align-items: flex-start;
  gap: var(--tr-spacing-sm);
  min-width: 0;
  padding: var(--tr-spacing-md) var(--tr-spacing-lg);
  border: 1px solid var(--tr-border-color-default);
  border-radius: var(--tr-radius-md);
  background: var(--tr-container-bg-default-2);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}
.tr-bubble__ask-user-option-trigger {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  gap: var(--tr-spacing-sm);
  cursor: pointer;
}
.tr-bubble__ask-user-option:has(.tr-bubble__ask-user-option-trigger input:disabled) {
  cursor: not-allowed;
  opacity: 0.55;
}
.tr-bubble__ask-user-options .tr-bubble__ask-user-option {
  border: 0;
}
.tr-bubble__ask-user-option-trigger input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.tr-bubble__ask-user-option-mark {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 50%;
}
.tr-bubble__ask-user-options.is-multiple .tr-bubble__ask-user-option-mark {
  border-radius: var(--tr-radius-xs);
}
.tr-bubble__ask-user-option:has(.tr-bubble__ask-user-option-trigger input:checked) .tr-bubble__ask-user-option-mark {
  border-color: var(--tr-color-primary);
  background: var(--tr-color-primary);
  box-shadow: inset 0 0 0 3px var(--tr-container-bg-default);
}
.tr-bubble__ask-user-options.is-multiple
  .tr-bubble__ask-user-option:has(.tr-bubble__ask-user-option-trigger input:checked)
  .tr-bubble__ask-user-option-mark {
  border: 0;
  background: transparent;
  box-shadow: none;
}
.tr-bubble__ask-user-options.is-multiple .tr-bubble__ask-user-option-mark svg {
  display: block;
  width: 16px;
  height: 16px;
  color: var(--tr-color-primary);
}
.tr-bubble__ask-user-option-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tr-bubble__ask-user-option-label {
  word-break: break-word;
}
.tr-bubble__ask-user-option-description {
  color: var(--tr-text-tertiary);
  font-size: var(--tr-font-size-sm);
  word-break: break-word;
}
.tr-bubble__ask-user-other-option {
  align-items: center;
}
.tr-bubble__ask-user-other-option .tr-bubble__ask-user-option-trigger {
  flex: 0 0 auto;
}
.tr-bubble__ask-user-other-input {
  flex: 1;
  min-width: 0;
  height: 20px;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: inherit;
}
.tr-bubble__ask-user-other-input::placeholder {
  color: var(--tr-text-tertiary);
}
.tr-bubble__ask-user-other-input:read-only {
  color: var(--tr-text-tertiary);
  cursor: pointer;
}
.tr-bubble__ask-user-other-option:has(input:focus-visible) {
  outline: none;
}
.tr-bubble__ask-user-textarea {
  display: block;
  width: 100%;
  min-height: 84px;
  resize: vertical;
  box-sizing: border-box;
  padding: var(--tr-spacing-md) var(--tr-spacing-lg);
  border: 1px solid var(--tr-border-color-default);
  border-radius: var(--tr-radius-md);
  background: var(--tr-container-bg-default-2);
  color: inherit;
  font: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.tr-bubble__ask-user-textarea:focus-visible {
  border-color: var(--tr-text-primary);
  outline: none;
}
.tr-bubble__ask-user-validation,
.tr-bubble__ask-user-error {
  margin: var(--tr-spacing-sm) 0 0;
  color: var(--tr-color-error);
  font-size: var(--tr-font-size-sm);
}

.tr-bubble__ask-user-actions {
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--tr-spacing-sm);
  margin-top: var(--tr-spacing-xl);
}
.tr-bubble__ask-user-actions-right {
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--tr-spacing-md);
}
.tiny-button + .tiny-button {
  margin-left: 0;
}

@media (max-width: 520px) {
  .tr-bubble__ask-user-progress {
    flex-direction: column;
    overflow-x: visible;
  }
  .tr-bubble__ask-user-progress-step {
    width: 100%;
  }
  .tr-bubble__ask-user-step-heading {
    flex-direction: column;
  }
  .tr-bubble__ask-user-step-description {
    max-width: none;
    text-align: left;
  }
  .tr-bubble__ask-user-actions {
    align-items: center;
    flex-direction: row;
  }
  .tr-bubble__ask-user-actions-right {
    justify-content: flex-start;
  }
  .tr-bubble__ask-user-actions-right .tr-bubble__ask-user-button {
    flex: 0 0 auto;
  }
}
</style>
