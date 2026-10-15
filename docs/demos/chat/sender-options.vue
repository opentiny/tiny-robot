<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrSender, type MentionItem, type TemplateItem } from '@opentiny/tiny-robot'
import { TrChat, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { useChatCaseRuntime } from './shared/createChatRuntime'

const showHelp = shallowRef(false)
const currentTemplate = shallowRef<TemplateItem[]>([])
const mentions: MentionItem[] = [
  { label: '产品组', value: 'product' },
  { label: '研发组', value: 'engineering' },
  { label: '测试组', value: 'qa' },
]
const extensions = [TrSender.mention(mentions), TrSender.template(currentTemplate)]
const runtime = useChatCaseRuntime({ storageKey: 'tiny-robot-demo-sender-options-v1' })
const inputDisabled = computed(() =>
  Boolean(runtime.composer.disabled?.value || runtime.composer.submitDisabled?.value),
)

const ui: ChatUIOptions = {
  layout: { leftAside: false },
  welcome: { title: '输入区配置', description: '输入 @ 选择对象，或使用下方按钮填入内容。' },
  sender: {
    placeholder: '输入 @ 选择对象，或点击“写报告”插入模板...',
    mode: 'multiple',
    maxLength: 300,
    showWordLimit: true,
    clearable: true,
    extensions,
    defaultActions: {
      submit: { tooltip: '发送给项目助手' },
      clear: { tooltip: '清空输入内容' },
    },
  },
}

function fillReportTemplate() {
  currentTemplate.value = [
    { type: 'text', content: '请帮我写一份关于' },
    { type: 'block', content: '项目进展' },
    { type: 'text', content: '的报告，面向' },
    {
      type: 'select',
      content: '',
      placeholder: '选择读者',
      options: [
        { label: '项目成员', value: '项目成员' },
        { label: '项目负责人', value: '项目负责人' },
      ],
    },
    { type: 'text', content: '，重点说明' },
    { type: 'block', content: '已完成工作和下一步计划' },
    { type: 'text', content: '。' },
  ]
}

function fillCommonQuestion() {
  currentTemplate.value = [{ type: 'text', content: '请列出项目周报中需要包含的内容。' }]
}
</script>

<template>
  <section class="sender-options-demo">
    <p class="sender-options-demo__tip">
      输入 @ 选择对象；点击“写报告”编辑模板字段；点击“常用问题”填入文本。所有内容均可编辑后发送。
    </p>
    <div class="sender-options-demo__chat">
      <TrChat :runtime="runtime" :ui="ui">
        <template v-if="showHelp" #sender-header>
          <p id="sender-options-help" class="sender-options-demo__help">
            @ 用于插入对象名称，不会切换模型；模板中的文本块可以编辑，下拉字段可以选择。内容超过 300 字时无法提交。
          </p>
        </template>
        <template #sender-footer>
          <div class="sender-options-demo__actions">
            <button
              class="sender-options-demo__button"
              type="button"
              :disabled="inputDisabled"
              @click="fillReportTemplate"
            >
              写报告
            </button>
            <button
              class="sender-options-demo__button"
              type="button"
              :disabled="inputDisabled"
              @click="fillCommonQuestion"
            >
              常用问题
            </button>
          </div>
        </template>
        <template #sender-footer-right>
          <button
            class="sender-options-demo__button"
            type="button"
            :aria-expanded="showHelp"
            aria-controls="sender-options-help"
            @click="showHelp = !showHelp"
          >
            使用说明
          </button>
        </template>
      </TrChat>
    </div>
  </section>
</template>

<style scoped>
.sender-options-demo__tip {
  margin: 0 0 12px;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.sender-options-demo__chat {
  --tr-layout-height: 100%;
  height: 640px;
}

.sender-options-demo__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sender-options-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.sender-options-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sender-options-demo__button {
  min-height: 30px;
  padding: 4px 8px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 16px;
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
  font: inherit;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}

.sender-options-demo__button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.sender-options-demo__help {
  margin: 0;
  padding: 8px 12px;
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}
</style>
