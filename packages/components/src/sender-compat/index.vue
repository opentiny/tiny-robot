<script setup lang="ts">
import { computed, ref } from 'vue'
import Sender, { TemplateItem } from '../sender/index'
import { UploadButton, VoiceButton } from '../sender-actions/index'
import type { SenderProps, SenderEmits, UserTemplateItem } from './index.type'

const props = withDefaults(defineProps<SenderProps>(), {
  mode: 'single',
  placeholder: '请输入内容...',
  submitType: 'enter',
})

const emit = defineEmits<SenderEmits>()

// 双向绑定
const modelValue = computed({
  get: () => props.modelValue ?? '',
  set: (value: string) => {
    emit('update:modelValue', value)
  },
})

const defaultValue = computed(() => props.defaultValue as string)

// 暴露方法
const senderRef = ref<InstanceType<typeof Sender>>()
const voiceRef = ref<InstanceType<typeof VoiceButton>>()

// 转换 extensions
const extensions = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exts: any[] = []

  // 转换 suggestions
  if (props.suggestions?.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Suggestion = (Sender as any).Suggestion
    if (Suggestion) {
      exts.push(
        Suggestion.configure({
          items: props.suggestions,
          popupWidth: props.suggestionPopupWidth,
          activeSuggestionKeys: props.activeSuggestionKeys,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSelect: (item: any) => {
            emit('suggestion-select', item.content)
          },
        }),
      )
    }
  }

  // 添加 Template 扩展（空配置，通过 setTemplateData 方法手动设置）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Template = (Sender as any).Template
  if (Template) {
    exts.push(Template.configure({}))
  }

  return exts
})

// 转换 defaultActions
const defaultActions = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actions: any = {}

  if (props.buttonGroup?.submit) {
    actions.submit = props.buttonGroup.submit
  }

  return Object.keys(actions).length > 0 ? actions : undefined
})

// 转换语音配置
const voiceConfig = computed(() => {
  if (typeof props.speech === 'boolean') {
    return undefined
  }
  return props.speech
})

const setTemplateData = (templateData: UserTemplateItem[]) => {
  const editor = senderRef.value?.editor

  if (!editor) {
    console.warn('[sender-compat] Editor not ready, cannot set template data')
    return
  }

  // 如果没有模板数据，清空编辑器
  if (!templateData || templateData.length === 0) {
    editor.commands.clearContent()
    return
  }

  // 转换数据：template → block
  const convertedData = templateData.map((item) =>
    item.type === 'template' ? { ...item, type: 'block' } : item,
  ) as TemplateItem[]

  // 调用 editor 的 setTemplateData 命令
  editor.commands.setTemplateData(convertedData)
  editor.commands.focusFirstTemplate()
}

// 处理 submit 事件
const handleSubmit = (textContent: string) => {
  emit('submit', textContent)
}

// 处理 clear 事件
const handleClear = () => {
  emit('clear')
}

// 处理 cancel 事件
const handleCancel = () => {
  emit('cancel')
}

// 处理 focus 事件
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

// 处理 blur 事件
const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

// 处理文件选择
const handleFilesSelected = (files: File[]) => {
  emit('files-selected', files)
}

// 处理语音事件
const handleSpeechStart = () => {
  emit('speech-start')
}

const handleSpeechEnd = (transcript?: string) => {
  emit('speech-end', transcript)
}

const handleSpeechInterim = (transcript: string) => {
  emit('speech-interim', transcript)
}

const handleSpeechError = (error: Error) => {
  emit('speech-error', error)
}

const startSpeech = () => {
  voiceRef.value?.start()
}

const stopSpeech = () => {
  voiceRef.value?.stop()
}

const focus = () => {
  senderRef.value?.focus?.()
}

const blur = () => {
  senderRef.value?.blur?.()
}

const clear = () => {
  senderRef.value?.clear?.()
}

const submit = () => {
  senderRef.value?.submit?.()
}

defineExpose({
  focus,
  blur,
  clear,
  submit,
  setTemplateData,
  startSpeech,
  stopSpeech,
})
</script>

<template>
  <Sender
    ref="senderRef"
    v-model="modelValue"
    :default-value="defaultValue"
    :mode="mode"
    :placeholder="placeholder"
    :disabled="disabled"
    :loading="loading"
    :submit-type="submitType"
    :max-length="maxLength"
    :show-word-limit="showWordLimit"
    :auto-size="autoSize"
    :clearable="clearable"
    :autofocus="autofocus"
    :extensions="extensions"
    :default-actions="defaultActions"
    :stop-text="stopText"
    @submit="handleSubmit"
    @clear="handleClear"
    @cancel="handleCancel"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- 透传插槽 -->
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>

    <template v-if="$slots.content" #content="slotProps">
      <slot name="content" v-bind="slotProps" />
    </template>

    <!-- 映射 actions -> actions-inline -->
    <template #actions-inline="slotProps">
      <!-- 单行模式：根据 allowFiles 自动注入 -->
      <UploadButton
        v-if="allowFiles && mode === 'single'"
        v-bind="{
          ...buttonGroup?.file,
          tooltip: buttonGroup?.file?.tooltips,
        }"
        @select="handleFilesSelected"
      />

      <!-- 单行模式：根据 allowSpeech 自动注入 -->
      <VoiceButton
        v-if="allowSpeech && mode === 'single'"
        ref="voiceRef"
        :speech-config="voiceConfig"
        :icon="buttonGroup?.voice?.icon"
        @speech-start="handleSpeechStart"
        @speech-end="handleSpeechEnd"
        @speech-interim="handleSpeechInterim"
        @speech-error="handleSpeechError"
      />

      <slot v-if="$slots.actions" name="actions" v-bind="slotProps" />
    </template>

    <!-- 底部插槽 + 自动注入按钮 -->
    <template #footer="slotProps">
      <slot name="footer-left" v-bind="slotProps" />

      <slot name="footer" v-bind="slotProps" />
    </template>

    <!-- 映射 footer-right -->
    <template #footer-right="slotProps">
      <slot v-if="$slots['footer-right']" name="footer-right" v-bind="slotProps" />

      <!-- 多行模式：根据 allowFiles 自动注入 -->
      <UploadButton
        v-if="allowFiles && mode === 'multiple'"
        v-bind="{
          ...buttonGroup?.file,
          tooltip: buttonGroup?.file?.tooltips,
        }"
        @select="handleFilesSelected"
      />

      <!-- 多行模式：根据 allowSpeech 自动注入 -->
      <VoiceButton
        v-if="allowSpeech && mode === 'multiple'"
        ref="voiceRef"
        :speech-config="voiceConfig"
        :icon="buttonGroup?.voice?.icon"
        @speech-start="handleSpeechStart"
        @speech-end="handleSpeechEnd"
        @speech-interim="handleSpeechInterim"
        @speech-error="handleSpeechError"
      />
    </template>
  </Sender>
</template>
