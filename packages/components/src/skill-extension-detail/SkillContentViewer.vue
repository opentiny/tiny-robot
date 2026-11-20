<script setup lang="ts">
import { TinyButton } from '@opentiny/vue'
import { IconFile } from '@opentiny/tiny-robot-svgs'
import type { SkillResourceDescriptor } from '../skill-import-form/index.type'
import SkillMarkdownEditor from './SkillMarkdownEditor.vue'

const props = defineProps<{
  selectedResource?: SkillResourceDescriptor
  selectedFileName: string
  isEditing: boolean
  contentKind: 'markdown' | 'text' | 'binary'
  editingMode: 'visual' | 'source'
  draftContent: string
  textContent: string
  contentLoading: boolean
  contentError: boolean
  resourceUrl: string
  renderedMarkdown: string
  canEditSelectedFile: boolean
  switchingFile: boolean
}>()

const emit = defineEmits<{
  startEditing: []
  cancelEditing: []
  saveEditing: []
  updateDraftContent: [content: string]
  updateEditingMode: [mode: 'visual' | 'source']
}>()

defineSlots<{
  'visual-editor'?: (props: { content: string; filePath: string; updateContent: (content: string) => void }) => unknown
}>()

const updateDraftContent = (event: Event) => {
  emit('updateDraftContent', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <section class="skill-extension-detail__viewer" :aria-label="props.selectedFileName">
    <div class="skill-extension-detail__viewer-heading">
      <IconFile
        v-if="!props.selectedResource || props.selectedResource.kind === 'text'"
        class="skill-extension-detail__file-icon"
        aria-hidden="true"
      />
      <span>{{ props.selectedFileName }}</span>
      <div class="skill-extension-detail__edit-actions">
        <template v-if="props.isEditing">
          <TinyButton
            v-if="props.canEditSelectedFile"
            class="skill-extension-detail__action-button"
            type="default"
            size="small"
            round
            :reset-time="0"
            :disabled="props.switchingFile"
            @click="emit('cancelEditing')"
          >
            取消
          </TinyButton>
          <TinyButton
            class="skill-extension-detail__action-button"
            type="primary"
            size="small"
            round
            :reset-time="0"
            :disabled="props.switchingFile"
            @click="emit('saveEditing')"
          >
            保存
          </TinyButton>
        </template>
        <template v-else>
          <a
            v-if="props.selectedResource && props.resourceUrl"
            class="skill-extension-detail__download"
            :href="props.resourceUrl"
            :download="props.selectedResource.path.split('/').pop()"
          >
            下载
          </a>
          <TinyButton
            v-if="props.canEditSelectedFile"
            class="skill-extension-detail__action-button"
            type="default"
            size="small"
            round
            :reset-time="0"
            :disabled="props.contentLoading || props.contentError || props.selectedResource?.kind === 'binary'"
            @click="emit('startEditing')"
          >
            编辑
          </TinyButton>
        </template>
      </div>
    </div>

    <div
      v-if="props.isEditing && props.contentKind === 'markdown'"
      class="skill-extension-detail__mode-switch"
      role="tablist"
    >
      <button
        type="button"
        role="tab"
        class="skill-extension-detail__mode-tab"
        :class="{ 'is-active': props.editingMode === 'visual' }"
        :aria-selected="props.editingMode === 'visual'"
        @click="emit('updateEditingMode', 'visual')"
      >
        可视化编辑
      </button>
      <button
        type="button"
        role="tab"
        class="skill-extension-detail__mode-tab"
        :class="{ 'is-active': props.editingMode === 'source' }"
        :aria-selected="props.editingMode === 'source'"
        @click="emit('updateEditingMode', 'source')"
      >
        源码编辑
      </button>
    </div>

    <div
      class="skill-extension-detail__content"
      :class="{ 'skill-extension-detail__content--editing': props.isEditing }"
      :tabindex="props.isEditing ? undefined : 0"
      aria-live="polite"
    >
      <p v-if="props.contentLoading" class="skill-extension-detail__status">正在读取文件…</p>
      <p v-else-if="props.contentError" class="skill-extension-detail__status skill-extension-detail__status--error">
        文件读取失败，请稍后重试。
      </p>
      <div
        v-else-if="props.isEditing && props.contentKind === 'markdown' && props.editingMode === 'visual'"
        class="skill-extension-detail__visual-editor"
      >
        <slot
          name="visual-editor"
          :content="props.draftContent"
          :file-path="props.selectedFileName"
          :update-content="(content) => emit('updateDraftContent', content)"
        >
          <SkillMarkdownEditor
            :model-value="props.draftContent"
            @update:model-value="emit('updateDraftContent', $event)"
          />
        </slot>
      </div>
      <textarea
        v-else-if="props.isEditing && props.contentKind !== 'binary'"
        :value="props.draftContent"
        class="skill-extension-detail__editor"
        :aria-label="(props.contentKind === 'markdown' ? '源码编辑' : '编辑') + ' ' + props.selectedFileName"
        spellcheck="false"
        @input="updateDraftContent"
      ></textarea>
      <img
        v-else-if="
          props.selectedResource?.kind === 'binary' &&
          props.selectedResource.mimeType?.startsWith('image/') &&
          props.resourceUrl
        "
        class="skill-extension-detail__image-preview"
        :src="props.resourceUrl"
        :alt="props.selectedResource.path"
      />
      <div
        v-else-if="props.contentKind === 'markdown' && props.renderedMarkdown"
        class="skill-extension-detail__markdown"
        v-html="props.renderedMarkdown"
      ></div>
      <pre
        v-else-if="props.contentKind === 'markdown' || props.contentKind === 'text'"
        class="skill-extension-detail__plain-text"
        >{{ props.textContent }}</pre>
      <p v-else-if="props.resourceUrl" class="skill-extension-detail__status">
        此二进制文件无法直接预览。<a :href="props.resourceUrl" :download="props.selectedResource?.path.split('/').pop()"
          >下载文件</a
        >
      </p>
    </div>
  </section>
</template>

<style lang="less" scoped>
.skill-extension-detail__viewer {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.skill-extension-detail__viewer-heading {
  display: flex;
  box-sizing: border-box;
  min-height: 42px;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  border-bottom: 1px solid color-mix(in srgb, var(--tr-border-color-default) 55%, transparent);
  color: var(--tr-text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.skill-extension-detail__file-icon {
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.25;
}

.skill-extension-detail__edit-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.skill-extension-detail__action-button {
  flex: none;
}

.skill-extension-detail__action-button:focus-visible,
.skill-extension-detail__download:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 2px;
}

.skill-extension-detail__download {
  color: var(--tr-text-secondary);
  font-size: 12px;
  text-decoration: none;
}

.skill-extension-detail__download:hover {
  color: var(--tr-text-primary);
  text-decoration: underline;
}

.skill-extension-detail__mode-switch {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 40px;
  padding: 0 20px;
  border-bottom: 1px solid var(--tr-border-color-default);
}

.skill-extension-detail__mode-tab {
  position: relative;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--tr-text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.skill-extension-detail__mode-tab:hover,
.skill-extension-detail__mode-tab.is-active {
  color: var(--tr-text-primary);
}

.skill-extension-detail__mode-tab.is-active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--tr-text-primary);
  content: '';
}

.skill-extension-detail__content {
  min-height: 0;
  flex: 1;
  padding: 20px 24px;
  overflow: auto;
}

.skill-extension-detail__content--editing {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.skill-extension-detail__visual-editor {
  min-height: 0;
  flex: 1;
}

.skill-extension-detail__editor {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 55%, transparent);
  border-radius: 6px;
  background: var(--tr-container-bg-default);
  color: var(--tr-text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.65;
  resize: vertical;
  white-space: pre-wrap;
}

.skill-extension-detail__editor:focus-visible {
  outline: none;
}

.skill-extension-detail__markdown {
  color: var(--tr-text-primary);
  font-size: 14px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.skill-extension-detail__markdown :deep(:first-child) {
  margin-top: 0;
}

.skill-extension-detail__markdown :deep(h1),
.skill-extension-detail__markdown :deep(h2),
.skill-extension-detail__markdown :deep(h3),
.skill-extension-detail__markdown :deep(h4) {
  margin: 1.25em 0 0.55em;
  font-weight: 650;
  line-height: 1.35;
}

.skill-extension-detail__markdown :deep(h1) {
  font-size: 1.55em;
}

.skill-extension-detail__markdown :deep(h2) {
  font-size: 1.3em;
}

.skill-extension-detail__markdown :deep(h3) {
  font-size: 1.12em;
}

.skill-extension-detail__markdown :deep(p) {
  margin: 0.7em 0;
}

.skill-extension-detail__markdown :deep(ul),
.skill-extension-detail__markdown :deep(ol) {
  padding-left: 1.6em;
}

.skill-extension-detail__markdown :deep(li) {
  margin: 0.25em 0;
}

.skill-extension-detail__markdown :deep(code) {
  padding: 0.12em 0.35em;
  border-radius: 4px;
  background: var(--tr-page-bg-default);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
}

.skill-extension-detail__markdown :deep(pre) {
  padding: 12px 14px;
  overflow: auto;
  border-radius: 6px;
  background: var(--tr-page-bg-default);
}

.skill-extension-detail__markdown :deep(pre code) {
  padding: 0;
  background: transparent;
}

.skill-extension-detail__markdown :deep(blockquote) {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 3px solid var(--tr-border-color-default);
  color: var(--tr-text-secondary);
}

.skill-extension-detail__markdown :deep(table) {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  border-collapse: collapse;
}

.skill-extension-detail__markdown :deep(th),
.skill-extension-detail__markdown :deep(td) {
  padding: 6px 10px;
  border: 1px solid var(--tr-border-color-default);
  text-align: left;
}

.skill-extension-detail__markdown :deep(a) {
  color: var(--tr-color-primary);
}

.skill-extension-detail__plain-text {
  margin: 0;
  color: var(--tr-text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.skill-extension-detail__status {
  margin: 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.skill-extension-detail__status--error {
  color: var(--tr-color-error);
}

.skill-extension-detail__status a {
  color: var(--tr-color-primary);
}

.skill-extension-detail__image-preview {
  display: block;
  max-width: 100%;
  max-height: 100%;
  margin: auto;
  object-fit: contain;
}

@media (max-width: 640px) {
  .skill-extension-detail__viewer {
    min-height: 320px;
  }

  .skill-extension-detail__content {
    padding: 16px;
  }
}
</style>
