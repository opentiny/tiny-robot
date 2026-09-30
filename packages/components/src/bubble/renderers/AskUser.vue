<script setup lang="ts">
import { IconArrowDown, IconCheckedSur } from '@opentiny/tiny-robot-svgs'
import { TinyButton } from '@opentiny/vue'
import { computed, reactive } from 'vue'
import { isAskUserContent, useAskUser, useBubbleEventFn, useMessageContent } from '../composables'
import type {
  AskUserChoiceAnswer,
  AskUserContent,
  AskUserOption,
  AskUserState,
  BubbleContentRendererProps,
} from '../index.type'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<BubbleContentRendererProps>()
const { content } = useMessageContent(props)
const emitEvent = useBubbleEventFn()

const askUserContent = computed(() => (isAskUserContent(content.value) ? (content.value as AskUserContent) : undefined))
const askUserState = computed(() => props.message.state?.askUser as AskUserState | undefined)
const askUser = reactive(useAskUser(askUserContent, askUserState, emitEvent))

const stepLabel = (step: AskUserContent['steps'][number]) => step.summary || step.title

type SelectableOption = Omit<AskUserOption, 'value'> & { value: string | boolean }
const OTHER_OPTION_VALUE = 'other'

const confirmOptions: SelectableOption[] = [
  { label: '确认', value: true },
  { label: '不确认', value: false },
]

const stepAnswer = (step: AskUserContent['steps'][number]) => {
  const value = askUser.draftAnswers[step.id]

  if (value === 'ignored') {
    return '已忽略'
  }

  if (Array.isArray(value)) {
    return value.map((item) => step.options?.find((option) => option.value === item)?.label ?? String(item)).join('、')
  }

  if (value && typeof value === 'object' && Array.isArray((value as AskUserChoiceAnswer).selected)) {
    const answer = value as AskUserChoiceAnswer
    const labels = answer.selected.map(
      (item) => step.options?.find((option) => option.value === item)?.label ?? String(item),
    )

    if (answer.other?.selected && answer.other.text.trim()) {
      labels.push(`其他：${answer.other.text}`)
    }

    return labels.length ? labels.join('、') : '已忽略'
  }

  if (typeof value === 'boolean') {
    return value ? '确认' : '不确认'
  }

  if (typeof value === 'string' && step.options) {
    return step.options.find((option) => option.value === value)?.label ?? value
  }

  return value === undefined || value === null || value === '' ? '已忽略' : String(value)
}

const currentOptions = computed<SelectableOption[]>(() => {
  const step = askUser.currentStep

  if (!step) {
    return []
  }

  return step.type === 'confirm'
    ? confirmOptions
    : (step.options ?? []).filter((option) => option.value !== OTHER_OPTION_VALUE)
})

const otherOption = computed(() => askUser.currentStep?.options?.find((option) => option.value === OTHER_OPTION_VALUE))

const selectOption = (value: SelectableOption['value']) => {
  if (askUser.currentStep?.type === 'confirm') {
    askUser.setAnswer(value)
  } else {
    askUser.selectOption(value as string)
  }
}

const isOptionSelected = (value: SelectableOption['value']) => {
  if (askUser.currentStep?.type === 'confirm') {
    return askUser.currentAnswer === value
  }

  return askUser.isOptionSelected(value as string)
}

const answersExpanded = computed(() => askUser.expanded)
const answersId = computed(() => `ask-user-answers-${askUserContent.value?.id ?? ''}`)

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
  }
}

const handleOtherInputClick = () => {
  if (!otherOption.value?.disabled && !askUser.isOtherSelected) {
    askUser.setOtherSelected(true)
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
      <h3 class="tr-bubble__ask-user-prompt">{{ askUserContent.title || '提供详细的问题' }}</h3>
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

    <section
      v-else-if="askUser.currentStep"
      class="tr-bubble__ask-user-step"
      :aria-labelledby="`ask-user-step-${askUser.currentStep.id}`"
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
            :id="`ask-user-step-${askUser.currentStep.id}`"
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
          :placeholder="askUser.currentStep.placeholder"
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
              :name="`ask-user-${askUserContent.id}-${askUser.currentStep.id}`"
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
          v-if="askUser.supportsOther"
          class="tr-bubble__ask-user-option tr-bubble__ask-user-other-option"
          :class="{ 'is-selected': askUser.isOtherSelected }"
          @click="handleOtherOptionClick"
        >
          <label class="tr-bubble__ask-user-option-trigger" @click.stop>
            <input
              :type="askUser.currentStep.type === 'multiple' ? 'checkbox' : 'radio'"
              :name="`ask-user-${askUserContent.id}-${askUser.currentStep.id}`"
              :checked="askUser.isOtherSelected"
              :disabled="askUser.isLocked || otherOption?.disabled"
              @change="askUser.setOtherSelected(!askUser.isOtherSelected)"
            />
            <span class="tr-bubble__ask-user-option-mark" aria-hidden="true">
              <IconCheckedSur v-if="askUser.currentStep.type === 'multiple' && askUser.isOtherSelected" />
            </span>
            <span class="tr-bubble__ask-user-option-label">{{ otherOption?.label || '其他' }}</span>
          </label>
          <input
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

    <div v-if="askUser.steps.length && askUser.status !== 'submitted'" class="tr-bubble__ask-user-actions">
      <tiny-button
        v-if="askUser.canGoBack"
        size="mini"
        :reset-time="0"
        round
        class="tr-bubble__ask-user-button"
        @click="askUser.back"
      >
        上一步
      </tiny-button>
      <div class="tr-bubble__ask-user-actions-right">
        <tiny-button
          v-if="askUser.status === 'error'"
          size="mini"
          :reset-time="0"
          round
          class="tr-bubble__ask-user-button"
          @click="askUser.retry"
        >
          重试
        </tiny-button>
        <tiny-button
          v-if="askUser.status === 'active'"
          size="mini"
          round
          class="tr-bubble__ask-user-button"
          @click="askUser.skip"
        >
          跳过
        </tiny-button>
        <tiny-button
          v-if="askUser.status === 'active' && askUser.currentStepIndex < askUser.steps.length - 1"
          size="mini"
          round
          class="tr-bubble__ask-user-button"
          @click="askUser.next"
        >
          下一步
        </tiny-button>
        <tiny-button
          v-if="askUser.status === 'active'"
          type="primary"
          size="mini"
          round
          class="tr-bubble__ask-user-button"
          @click="askUser.submit"
        >
          <span>{{ askUserContent.submitLabel || '提交' }}</span>
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
  align-items: center;
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
