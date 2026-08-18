<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { IconArrowDown, IconCheck, IconPlus, IconVoice } from '@opentiny/tiny-robot-svgs'
import type { ChatModelRuntime, ChatStructuredData } from '@opentiny/tiny-robot-chat'
import { geminiModelOptions } from './config'

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
}

const props = defineProps<GeminiComposerProps>()
const modelMenuOpen = shallowRef(false)
const modelSelecting = shallowRef(false)
const modelMenuRef = useTemplateRef<HTMLElement>('modelMenu')
const selectedModel = computed(
  () => geminiModelOptions.find((option) => option.id === props.model.selectedId.value) ?? geminiModelOptions[1],
)
const extendedThinking = computed(() => Boolean(props.model.features.value.thinking))

function handleDocumentPointerDown(event: PointerEvent) {
  if (!modelMenuOpen.value || modelMenuRef.value?.contains(event.target as Node)) return
  modelMenuOpen.value = false
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    modelMenuOpen.value = false
  }
}

async function handleModelSelect(id: string) {
  if (modelSelecting.value || id === props.model.selectedId.value) {
    modelMenuOpen.value = false
    return
  }

  modelSelecting.value = true
  try {
    await props.model.select(id)
    modelMenuOpen.value = false
  } finally {
    modelSelecting.value = false
  }
}

async function toggleExtendedThinking() {
  await props.model.setFeature('thinking', !extendedThinking.value)
  modelMenuOpen.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <TrSender
    mode="single"
    :model-value="props.value"
    placeholder="问问 Gemini"
    :loading="props.loading"
    :disabled="props.disabled"
    :default-actions="{ submit: { disabled: props.submitDisabled } }"
    @update:model-value="props.setInputValue"
    @submit="(text, structuredData) => props.submit({ text, structuredData })"
    @cancel="props.cancel"
    @clear="props.clear"
  >
    <template #prefix>
      <button class="gemini-composer__add" type="button" aria-label="添加内容" title="添加内容">
        <IconPlus :size="22" />
      </button>
    </template>
    <template #actions-inline>
      <div ref="modelMenu" class="gemini-composer__model-menu">
        <button
          class="gemini-composer__model"
          type="button"
          aria-label="选择模型"
          title="选择模型"
          :aria-expanded="modelMenuOpen"
          :disabled="modelSelecting"
          @click.stop="modelMenuOpen = !modelMenuOpen"
        >
          <span>{{ selectedModel.label }}</span>
          <IconArrowDown :size="16" />
        </button>
        <div v-if="modelMenuOpen" class="gemini-composer__dropdown" role="menu">
          <button
            v-for="option in geminiModelOptions"
            :key="option.id"
            class="gemini-composer__option"
            type="button"
            role="menuitemradio"
            :aria-checked="option.id === props.model.selectedId.value"
            @click="handleModelSelect(option.id)"
          >
            <span class="gemini-composer__option-check">
              <IconCheck v-if="option.id === props.model.selectedId.value" :size="14" />
            </span>
            <span class="gemini-composer__option-copy">
              <span>{{ option.label }}</span>
              <small>{{ option.description }}</small>
            </span>
          </button>
          <div class="gemini-composer__divider" />
          <button
            class="gemini-composer__option"
            :class="{ 'is-active': extendedThinking }"
            type="button"
            role="menuitemcheckbox"
            :aria-checked="extendedThinking"
            @click="toggleExtendedThinking"
          >
            <span class="gemini-composer__option-check">
              <IconCheck v-if="extendedThinking" :size="14" />
            </span>
            <span class="gemini-composer__option-copy">
              <span>扩展思考</span>
              <small>擅长解决复杂问题</small>
            </span>
          </button>
        </div>
      </div>
      <button class="gemini-composer__voice" type="button" aria-label="语音输入" title="语音输入">
        <IconVoice :size="22" />
      </button>
    </template>
  </TrSender>
</template>

<style scoped>
.gemini-composer__add,
.gemini-composer__model,
.gemini-composer__voice {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  color: #1f1f1f;
  background: transparent;
  cursor: pointer;
  font-size: 26px;
}

.gemini-composer__add {
  width: 28px;
  height: 28px;
}

.gemini-composer__model {
  gap: 6px;
  height: 30px;
  padding: 0 6px;
  border-radius: 8px;
  font: inherit;
  font-size: 13px;
}

.gemini-composer__model-menu {
  position: relative;
}

.gemini-composer__model:disabled {
  cursor: wait;
  opacity: 0.7;
}

.gemini-composer__dropdown {
  position: absolute;
  z-index: 30;
  top: calc(100% + 8px);
  right: 0;
  box-sizing: border-box;
  width: 192px;
  padding: 8px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(31 35 41 / 14%);
}

.gemini-composer__option {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  width: 100%;
  min-height: 52px;
  padding: 7px 8px;
  border: 0;
  border-radius: 10px;
  color: #1f1f1f;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.gemini-composer__option:hover,
.gemini-composer__option.is-active {
  background: #f5f6f7;
}

.gemini-composer__option-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.gemini-composer__option-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
  font-size: 13px;
  line-height: 18px;
}

.gemini-composer__option-copy small {
  color: #777b82;
  font-size: 12px;
  line-height: 16px;
}

.gemini-composer__divider {
  height: 1px;
  margin: 8px 0;
  background: #e5e7eb;
}

.gemini-composer__voice {
  width: 30px;
  height: 30px;
  margin-left: 2px;
  border-radius: 50%;
}

.gemini-composer__add:hover,
.gemini-composer__model:hover,
.gemini-composer__voice:hover {
  background: #f1f3f4;
}

:deep(.tr-sender) {
  --tr-sender-bg-color: #fff;
  --tr-sender-border-radius: 32px;
  --tr-sender-box-shadow: 0 4px 12px rgb(31 35 41 / 12%);
  --tr-sender-padding: 0 8px 0 12px;
  --tr-sender-prefix-padding-right: 8px;
  --tr-sender-actions-padding-right: 2px;
  --tr-sender-gap: 2px;
  --tr-sender-line-height: 26px;
  --tr-sender-button-size-submit: 32px;
}
</style>
