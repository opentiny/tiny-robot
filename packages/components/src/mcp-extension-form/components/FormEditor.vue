<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStableId } from '../../shared/composables'
import type { McpExtensionFormDraft } from '../internal.type'
import defaultImageUrl from '../default-thumbnail.svg'

const formData = defineModel<McpExtensionFormDraft>('formData', { required: true })
const props = defineProps<{
  errors?: Partial<Record<keyof McpExtensionFormDraft, string>>
}>()
const fieldIdPrefix = `mcp-extension-form-${useStableId()}`
const fieldIds = {
  name: `${fieldIdPrefix}-name`,
  description: `${fieldIdPrefix}-description`,
  type: `${fieldIdPrefix}-type`,
  url: `${fieldIdPrefix}-url`,
  headers: `${fieldIdPrefix}-headers`,
  thumbnail: `${fieldIdPrefix}-thumbnail`,
}
const thumbnailValue = computed(() => formData.value.thumbnail?.trim() ?? '')
const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
const thumbnailLoadFailed = ref(false)
const thumbnailErrorIds = computed(() => {
  const ids = []
  if (props.errors?.thumbnail) ids.push(`${fieldIds.thumbnail}-error`)
  if (thumbnailLoadFailed.value) ids.push(`${fieldIds.thumbnail}-load-error`)
  return ids.join(' ') || undefined
})
const previewImageUrl = computed(() =>
  thumbnailValue.value && isHttpUrl(thumbnailValue.value) && !thumbnailLoadFailed.value
    ? thumbnailValue.value
    : defaultImageUrl,
)
const nameInput = ref<HTMLInputElement>()
const descriptionInput = ref<HTMLTextAreaElement>()
const urlInput = ref<HTMLInputElement>()
const headersInput = ref<HTMLTextAreaElement>()
const thumbnailInput = ref<HTMLInputElement>()

watch(
  () => formData.value.thumbnail,
  () => {
    thumbnailLoadFailed.value = false
  },
)

defineExpose({
  focusField(field: keyof McpExtensionFormDraft) {
    if (field === 'name') nameInput.value?.focus()
    if (field === 'description') descriptionInput.value?.focus()
    if (field === 'url') urlInput.value?.focus()
    if (field === 'headers') headersInput.value?.focus()
    if (field === 'thumbnail') thumbnailInput.value?.focus()
  },
})

const updateField = <K extends keyof McpExtensionFormDraft>(key: K, value: McpExtensionFormDraft[K]) => {
  formData.value = { ...formData.value, [key]: value }
}

const getInputValue = (event: Event) => (event.target as HTMLInputElement | HTMLTextAreaElement).value

const handleThumbnailInput = (event: Event) => {
  const value = getInputValue(event)
  thumbnailLoadFailed.value = false
  updateField('thumbnail', value || null)
}

const handleThumbnailError = () => {
  if (thumbnailValue.value && isHttpUrl(thumbnailValue.value)) thumbnailLoadFailed.value = true
}

// 类型选项
const typeOptions = [
  { label: 'sse', text: '服务器发送事件（SSE）' },
  { label: 'streamableHttp', text: '流式HTTP（Streamable HTTP）' },
] as const
</script>

<template>
  <div class="form-editor__container">
    <!-- 名称 -->
    <div class="form-editor__item">
      <label class="form-editor__label" :for="fieldIds.name">
        <span class="form-editor__required" aria-hidden="true">*</span>名称
      </label>
      <input
        :id="fieldIds.name"
        ref="nameInput"
        :value="formData.name"
        class="form-editor__input"
        type="text"
        placeholder="请输入插件名称"
        required
        :aria-invalid="Boolean(props.errors?.name)"
        :aria-describedby="props.errors?.name ? `${fieldIds.name}-error` : undefined"
        @input="updateField('name', getInputValue($event))"
      />
      <span v-if="props.errors?.name" :id="`${fieldIds.name}-error`" class="form-editor__error">
        {{ props.errors.name }}
      </span>
    </div>

    <!-- 描述 -->
    <div class="form-editor__item">
      <label class="form-editor__label" :for="fieldIds.description">描述</label>
      <div class="form-editor__field">
        <textarea
          :id="fieldIds.description"
          ref="descriptionInput"
          :value="formData.description"
          class="form-editor__textarea"
          placeholder="请输入插件描述"
          :aria-invalid="Boolean(props.errors?.description)"
          :aria-describedby="
            props.errors?.description
              ? `${fieldIds.description}-counter ${fieldIds.description}-error`
              : `${fieldIds.description}-counter`
          "
          @input="updateField('description', getInputValue($event))"
        ></textarea>
        <span :id="`${fieldIds.description}-counter`" class="form-editor__counter">
          {{ formData.description.length }}/1000
        </span>
      </div>
      <span v-if="props.errors?.description" :id="`${fieldIds.description}-error`" class="form-editor__error">
        {{ props.errors.description }}
      </span>
    </div>

    <!-- 类型 -->
    <div class="form-editor__item">
      <label class="form-editor__label custom-label">
        <span class="form-editor__required" aria-hidden="true">*</span>类型
      </label>
      <div class="form-editor__radio-group" role="radiogroup" aria-label="类型" aria-required="true">
        <label v-for="option in typeOptions" :key="option.label" class="form-editor__radio-option">
          <input
            class="form-editor__radio-input"
            type="radio"
            :name="fieldIds.type"
            :value="option.label"
            :checked="formData.type === option.label"
            @change="updateField('type', option.label)"
          />
          <span>{{ option.text }}</span>
        </label>
      </div>
    </div>

    <!-- URL -->
    <div class="form-editor__item">
      <label class="form-editor__label" :for="fieldIds.url">
        <span class="form-editor__required" aria-hidden="true">*</span>URL
      </label>
      <input
        :id="fieldIds.url"
        ref="urlInput"
        :value="formData.url"
        class="form-editor__input"
        type="url"
        placeholder="请输入插件URL"
        required
        :aria-invalid="Boolean(props.errors?.url)"
        :aria-describedby="props.errors?.url ? `${fieldIds.url}-error` : undefined"
        @input="updateField('url', getInputValue($event))"
      />
      <span v-if="props.errors?.url" :id="`${fieldIds.url}-error`" class="form-editor__error">
        {{ props.errors.url }}
      </span>
    </div>

    <!-- 请求头 -->
    <div class="form-editor__item">
      <label class="form-editor__label" :for="fieldIds.headers">请求头</label>
      <textarea
        :id="fieldIds.headers"
        ref="headersInput"
        :value="formData.headers"
        class="form-editor__textarea"
        placeholder="请输入请求头，格式为JSON"
        :aria-invalid="Boolean(props.errors?.headers)"
        :aria-describedby="props.errors?.headers ? `${fieldIds.headers}-error` : undefined"
        @input="updateField('headers', getInputValue($event))"
      ></textarea>
      <span v-if="props.errors?.headers" :id="`${fieldIds.headers}-error`" class="form-editor__error">
        {{ props.errors.headers }}
      </span>
    </div>

    <!-- 缩略图 URL 与预览 -->
    <div class="form-editor__item">
      <label class="form-editor__label" :for="fieldIds.thumbnail">缩略图</label>
      <input
        :id="fieldIds.thumbnail"
        ref="thumbnailInput"
        :value="formData.thumbnail ?? ''"
        class="form-editor__input"
        type="url"
        aria-label="缩略图 URL"
        placeholder="请输入缩略图 URL"
        :aria-invalid="Boolean(props.errors?.thumbnail || thumbnailLoadFailed)"
        :aria-describedby="thumbnailErrorIds"
        @input="handleThumbnailInput"
      />
      <span v-if="props.errors?.thumbnail" :id="`${fieldIds.thumbnail}-error`" class="form-editor__error">
        {{ props.errors.thumbnail }}
      </span>
      <div class="form-editor__thumbnail-preview">
        <img
          :src="previewImageUrl"
          alt="MCP 缩略图"
          class="form-editor__thumbnail-image"
          @error="handleThumbnailError"
        />
        <span v-if="thumbnailLoadFailed" :id="`${fieldIds.thumbnail}-load-error`" class="form-editor__thumbnail-error">
          图片加载失败，已显示默认缩略图
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.form-editor {
  &__container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__item {
    display: grid;
    grid-template-columns: 56px minmax(0, 1fr);
    align-items: flex-start;
    gap: 8px 20px;
  }

  &__error {
    grid-column: 2;
    color: var(--tr-color-error, #f23030);
    font-size: 12px;
    line-height: 18px;
  }

  &__field {
    position: relative;
    grid-column: 2;
  }

  &__counter {
    position: absolute;
    right: 8px;
    bottom: 4px;
    color: var(--tr-text-tertiary);
    font-size: 12px;
    line-height: 18px;
    pointer-events: none;
  }

  &__label {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 32px;
    font-size: 14px;
    font-weight: 500;
    color: var(--tr-text-primary);
    line-height: 20px;
    width: 56px;

    &.custom-label {
      width: 48px;
    }
  }

  &__required {
    position: absolute;
    right: 100%;
    margin-right: 2px;
    color: var(--tr-color-error, #f23030);
  }

  &__input {
    grid-column: 2;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--tr-border-color-disabled);
    border-radius: 6px;
    height: 32px;
    font-size: 14px;
    line-height: 22px;
    color: var(--tr-text-primary);
    background-color: var(--tr-container-bg-default);
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: var(--tr-color-primary);
    }

    &::placeholder {
      color: var(--tr-text-tertiary);
    }
  }

  &__radio-group {
    grid-column: 2;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  &__radio-option {
    display: flex;
    align-items: center;
    height: 32px;
    color: var(--tr-text-primary);
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;
    box-sizing: border-box;
  }

  &__radio-input {
    display: grid;
    flex: 0 0 auto;
    place-content: center;
    width: 16px;
    height: 16px;
    margin: 0 8px 0 0;
    border: 1px solid var(--tr-border-color-disabled);
    border-radius: 50%;
    appearance: none;
    background: var(--tr-container-bg-default);
    cursor: pointer;

    &::before {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--tr-color-primary);
      content: '';
      transform: scale(0);
      transition: transform 0.15s ease;
    }

    &:checked {
      border-color: var(--tr-color-primary);
    }

    &:checked::before {
      transform: scale(1);
    }

    &:focus-visible {
      outline: 2px solid var(--tr-color-primary);
      outline-offset: 2px;
    }
  }

  &__textarea {
    grid-column: 2;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--tr-border-color-disabled);
    border-radius: 6px;
    font-size: 14px;
    line-height: 22px;
    color: var(--tr-text-primary);
    background-color: var(--tr-container-bg-default);
    height: 64px;
    min-height: 64px;
    max-height: 240px;
    resize: vertical;
    font-family: inherit;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: var(--tr-color-primary);
    }

    &::placeholder {
      color: var(--tr-text-tertiary);
    }
  }

  &__thumbnail-preview {
    grid-column: 2;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__thumbnail-image {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 8px;
  }

  &__thumbnail-error {
    color: var(--tr-color-error, #f23030);
    font-size: 12px;
    line-height: 18px;
  }

  @media (max-width: 768px) {
    &__item {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    &__input,
    &__textarea,
    &__field,
    &__radio-group,
    &__thumbnail-preview,
    &__error {
      grid-column: 1;
    }

    .plugin-editor__footer > .button {
      flex: 1;
    }
  }
}
</style>
