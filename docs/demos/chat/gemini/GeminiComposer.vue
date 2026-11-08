<script setup lang="ts">
import { computed } from 'vue'
import { TrModelSelector, TrSender, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconPlus, IconVoice } from '@opentiny/tiny-robot-svgs'
import type { ChatModelRuntime, ChatStructuredData } from '@opentiny/tiny-robot-chat'

interface GeminiComposerProps {
  readonly value: string
  readonly loading: boolean
  readonly disabled: boolean
  readonly submitDisabled: boolean
  readonly setInputValue: (value: string) => void
  readonly submit: (payload: { text: string; structuredData?: ChatStructuredData }) => void
  readonly cancel: () => void
  readonly clear: () => void
  readonly model: ChatModelRuntime
  readonly selectModel: (id: string | null) => Promise<void>
}

const props = defineProps<GeminiComposerProps>()
const modelOptions = computed<ModelSelectorOption[]>(() =>
  props.model.options.value.map((option) => ({ value: option.id, label: option.label, icon: option.icon })),
)
</script>

<template>
  <TrSender
    mode="single"
    :model-value="value"
    placeholder="问问 Gemini"
    :loading="loading"
    :disabled="disabled"
    :default-actions="{ submit: { disabled: submitDisabled } }"
    @update:model-value="setInputValue"
    @submit="(text, structuredData) => submit({ text, structuredData })"
    @cancel="cancel"
    @clear="clear"
  >
    <template #prefix>
      <button class="gemini-composer__add" type="button" aria-label="添加内容" title="添加内容" disabled>
        <IconPlus :size="22" />
      </button>
    </template>
    <template #actions-inline>
      <TrModelSelector
        class="gemini-composer__model-selector"
        :models="modelOptions"
        :model-value="model.selectedId.value"
        placeholder="选择模型"
        aria-label="选择模型"
        variant="ghost"
        @update:model-value="selectModel"
      />
      <button class="gemini-composer__voice" type="button" aria-label="语音输入" title="语音输入" disabled>
        <IconVoice :size="22" />
      </button>
    </template>
  </TrSender>
</template>

<style scoped>
.gemini-composer__add,
.gemini-composer__voice {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  color: var(--tr-text-primary);
  background: transparent;
  cursor: pointer;
  font-size: 26px;
}

.gemini-composer__add:disabled,
.gemini-composer__voice:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.gemini-composer__add {
  width: 28px;
  height: 28px;
}

.gemini-composer__voice {
  width: 30px;
  height: 30px;
  margin-left: 2px;
  border-radius: 50%;
}

.gemini-composer__add:hover,
.gemini-composer__voice:hover {
  background: var(--tr-container-bg-hover);
}

.gemini-composer__add:focus-visible,
.gemini-composer__voice:focus-visible,
.gemini-composer__model-selector:focus-within {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 2px;
}

:deep(.tr-sender) {
  --tr-sender-bg-color: var(--tr-container-bg-default);
  --tr-sender-border-radius: 32px;
  --tr-sender-box-shadow: 0 4px 12px color-mix(in srgb, var(--tr-text-primary) 12%, transparent);
  --tr-sender-padding: 0 8px 0 12px;
  --tr-sender-prefix-padding-right: 8px;
  --tr-sender-actions-padding-right: 2px;
  --tr-sender-gap: 2px;
  --tr-sender-line-height: 26px;
  --tr-sender-button-size-submit: 32px;
}
</style>
