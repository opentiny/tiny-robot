<script setup lang="ts">
import { FormEditor, CodeEditor } from './components'
import { computed, nextTick, ref, watch } from 'vue'
import type {
  McpExtensionFormEmits,
  McpExtensionFormMode,
  McpExtensionFormProps,
  McpExtensionFormValue,
} from './index.type'
import type { McpExtensionFormDraft } from './internal.type'
import {
  parseMcpExtensionCode,
  serializeMcpExtensionCode,
  toMcpExtensionFormDraft,
  toMcpExtensionFormValue,
  validateMcpExtensionCode,
  validateMcpExtensionField,
  validateMcpExtensionForm,
} from './validation'
import type { McpExtensionFormErrors } from './validation'

const props = withDefaults(defineProps<Omit<McpExtensionFormProps, 'modelValue'>>(), {
  defaultMode: 'form',
})
const emit = defineEmits<McpExtensionFormEmits>()
const model = defineModel<McpExtensionFormValue>({ required: true })
const internalMode = ref<McpExtensionFormMode>(props.defaultMode)
const activeMode = computed(() => props.mode ?? internalMode.value)
const createCodeDraft = (value: McpExtensionFormValue) => (value.name.trim() ? serializeMcpExtensionCode(value) : '')
const formDraft = ref(toMcpExtensionFormDraft(model.value))
const codeDraft = ref(createCodeDraft(model.value))
const skipNextModelSync = ref(false)
const formEditor = ref<{ focusField: (field: keyof McpExtensionFormDraft) => void }>()
const codeEditor = ref<{ focus: () => void }>()
const errors = ref<McpExtensionFormErrors>({})
const codeError = ref('')

const modeOptions = [
  { label: 'form', text: '表单添加' },
  { label: 'code', text: '代码添加' },
] as const

const updateModel = (value: McpExtensionFormValue) => {
  skipNextModelSync.value = true
  model.value = value
  void nextTick(() => {
    skipNextModelSync.value = false
  })
}

const handleConfirm = () => {
  if (activeMode.value === 'form') {
    const nextErrors = validateMcpExtensionForm(formDraft.value)
    const firstError = Object.keys(nextErrors)[0] as keyof McpExtensionFormDraft | undefined

    if (firstError) {
      errors.value = nextErrors
      void nextTick(() => formEditor.value?.focusField(firstError))
      return
    }

    errors.value = {}
    const value = toMcpExtensionFormValue(formDraft.value)
    updateModel(value)
    emit('submit', value, { source: 'form' })
  } else {
    const nextCodeError = validateMcpExtensionCode(codeDraft.value)

    if (nextCodeError) {
      codeError.value = nextCodeError
      void nextTick(() => codeEditor.value?.focus())
      return
    }

    codeError.value = ''
    const value = parseMcpExtensionCode(codeDraft.value)
    updateModel(value)
    emit('submit', value, { source: 'code' })
  }
}

const syncDraftForMode = (mode: McpExtensionFormMode) => {
  if (mode === 'form') {
    const invalidHeaders = validateMcpExtensionField('headers', formDraft.value) ? formDraft.value.headers : undefined
    formDraft.value = {
      ...toMcpExtensionFormDraft(model.value),
      ...(invalidHeaders === undefined ? {} : { headers: invalidHeaders }),
    }
  } else codeDraft.value = createCodeDraft(model.value)
}

const handleUpdateMode = (mode: McpExtensionFormMode) => {
  if (props.mode === undefined) internalMode.value = mode
  emit('update:mode', mode)
}

const handleUpdateForm = (form: McpExtensionFormDraft) => {
  formDraft.value = form
  let value: McpExtensionFormValue
  try {
    value = toMcpExtensionFormValue(form)
  } catch {
    value = toMcpExtensionFormValue({ ...form, headers: '' })
    if (model.value.headers) value.headers = model.value.headers
  }
  updateModel(value)
}

const handleUpdateCode = (code: string) => {
  codeDraft.value = code
  try {
    updateModel(parseMcpExtensionCode(code))
  } catch {
    // Keep an invalid code draft local until it can be represented by modelValue.
  }
}

watch(
  model,
  (value) => {
    if (skipNextModelSync.value) {
      skipNextModelSync.value = false
      return
    }
    formDraft.value = toMcpExtensionFormDraft(value)
    codeDraft.value = createCodeDraft(value)
  },
  { deep: true },
)

watch(activeMode, syncDraftForMode)

watch(formDraft, (form, previousForm) => {
  const nextErrors = { ...errors.value }

  for (const field of Object.keys(nextErrors) as Array<keyof McpExtensionFormDraft>) {
    if (form[field] !== previousForm[field] && !validateMcpExtensionField(field, form)) {
      delete nextErrors[field]
    }
  }

  errors.value = nextErrors
})

watch(codeDraft, (code) => {
  if (codeError.value && !validateMcpExtensionCode(code)) codeError.value = ''
})
</script>

<template>
  <form class="mcp-extension-form" novalidate @submit.prevent="handleConfirm">
    <div class="mcp-extension-form__content">
      <!-- 添加插件方式-->
      <div class="mcp-extension-form__add-type">
        <span class="mcp-extension-form__add-type-label">添加方式</span>
        <div class="mcp-extension-form__add-type-options" role="radiogroup" aria-label="添加方式">
          <label
            v-for="option in modeOptions"
            :key="option.label"
            class="mcp-extension-form__add-type-option"
            :class="{
              'mcp-extension-form__add-type-option--active': activeMode === option.label,
            }"
          >
            <input
              class="mcp-extension-form__add-type-input"
              type="radio"
              name="mcp-extension-form-add-type"
              :value="option.label"
              :checked="activeMode === option.label"
              @change="handleUpdateMode(option.label)"
            />
            <span>{{ option.text }}</span>
          </label>
        </div>
      </div>

      <div v-if="activeMode === 'form'">
        <FormEditor ref="formEditor" :form-data="formDraft" :errors="errors" @update:form-data="handleUpdateForm" />
      </div>

      <div v-if="activeMode === 'code'">
        <CodeEditor ref="codeEditor" :code-data="codeDraft" :error="codeError" @update:code-data="handleUpdateCode" />
      </div>
    </div>

    <div class="mcp-extension-form__footer">
      <button class="button cancel" type="button" @click="emit('cancel')">取消</button>
      <button class="button confirm" type="submit">确定</button>
    </div>
  </form>
</template>

<style lang="less">
.tr-mcp-extension-form-vars() {
  @prefix: tr-mcp-extension-form;

  // 基础变量组
  @vars: {
    /* 内容区域变量 */
    content-padding: 20px 32px;

    /* 添加类型区域变量 */
    add-type-gap: 20px;
    add-type-margin: 0 0 16px 0;
    add-type-label-font-size: 14px;
    add-type-label-font-weight: 400;
    add-type-label-line-height: 20px;
    add-type-label-color: var(--tr-text-primary);

    /* 底部区域变量 */
    footer-padding: 0 32px 32px 32px;
    footer-gap: 8px;

    /* 按钮变量 */
    button-border-radius: 999px;
    button-padding: 5px 24px;
    button-font-size: 14px;
    button-height: 32px;
    button-line-height: 22px;
    button-min-width: 60px;
    button-transition: all 0.2s;

    /* 取消按钮变量 */
    cancel-bg-color: #ffffff;
    cancel-border-color: #595959;
    cancel-text-color: #191919;
    cancel-hover-border-color: #c2c2c2;

    /* 确认按钮变量 */
    confirm-bg-color: #000000;
    confirm-border-color: #000000;
    confirm-text-color: #ffffff;
    confirm-hover-bg-color: #333333;
    confirm-hover-border-color: #333333;
  };

  // 响应式变量组
  @mobile-vars: {
    add-type-gap-mobile: 8px;
    content-padding-mobile: 12px 16px 16px;
    footer-padding-mobile: 30px 16px 20px;
    footer-gap-mobile: 16px;
  };

  :root {
    each(@vars, {
      --@{prefix}-@{key}: @{value};
    });

    each(@mobile-vars, {
      --@{prefix}-@{key}: @{value};
    });
  }
}

.tr-mcp-extension-form-vars();
</style>

<style lang="less" scoped>
// 第二层：组件映射层 (Component Mapping Layer)
.mcp-extension-form {
  /* 内容区域变量 */
  --content-padding: var(--tr-mcp-extension-form-content-padding);

  /* 添加类型区域变量 */
  --add-type-gap: var(--tr-mcp-extension-form-add-type-gap);
  --add-type-margin: var(--tr-mcp-extension-form-add-type-margin);
  --add-type-label-font-size: var(--tr-mcp-extension-form-add-type-label-font-size);
  --add-type-label-font-weight: var(--tr-mcp-extension-form-add-type-label-font-weight);
  --add-type-label-line-height: var(--tr-mcp-extension-form-add-type-label-line-height);
  --add-type-label-color: var(--tr-mcp-extension-form-add-type-label-color);

  /* 底部区域变量 */
  --footer-padding: var(--tr-mcp-extension-form-footer-padding);
  --footer-gap: var(--tr-mcp-extension-form-footer-gap);

  /* 按钮变量 */
  --button-border-radius: var(--tr-mcp-extension-form-button-border-radius);
  --button-padding: var(--tr-mcp-extension-form-button-padding);
  --button-font-size: var(--tr-mcp-extension-form-button-font-size);
  --button-height: var(--tr-mcp-extension-form-button-height);
  --button-line-height: var(--tr-mcp-extension-form-button-line-height);
  --button-min-width: var(--tr-mcp-extension-form-button-min-width);
  --button-transition: var(--tr-mcp-extension-form-button-transition);

  /* 取消按钮变量 */
  --cancel-bg-color: var(--tr-mcp-extension-form-cancel-bg-color);
  --cancel-border-color: var(--tr-mcp-extension-form-cancel-border-color);
  --cancel-text-color: var(--tr-mcp-extension-form-cancel-text-color);
  --cancel-hover-border-color: var(--tr-mcp-extension-form-cancel-hover-border-color);

  /* 确认按钮变量 */
  --confirm-bg-color: var(--tr-mcp-extension-form-confirm-bg-color);
  --confirm-border-color: var(--tr-mcp-extension-form-confirm-border-color);
  --confirm-text-color: var(--tr-mcp-extension-form-confirm-text-color);
  --confirm-hover-bg-color: var(--tr-mcp-extension-form-confirm-hover-bg-color);
  --confirm-hover-border-color: var(--tr-mcp-extension-form-confirm-hover-border-color);
}

.mcp-extension-form {
  display: flex;
  flex-direction: column;

  &__content {
    flex: 1;
    padding: var(--content-padding);
  }

  &__add-type {
    display: flex;
    align-self: center;
    gap: var(--add-type-gap);
    margin: var(--add-type-margin);

    &-label {
      display: flex;
      align-items: center;
      font-size: var(--add-type-label-font-size);
      font-weight: var(--add-type-label-font-weight);
      line-height: var(--add-type-label-line-height);
      color: var(--add-type-label-color);
    }

    &-options {
      display: inline-flex;
      padding: 2px;
      border-radius: 6px;
      background: var(--tr-container-bg-disabled, #f5f5f5);
    }

    &-option {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 104px;
      height: 32px;
      padding: 0 16px;
      border-radius: 5px;
      color: var(--tr-text-secondary);
      font-size: 14px;
      line-height: 20px;
      cursor: pointer;
      box-sizing: border-box;
      transition:
        color 0.2s,
        background-color 0.2s;

      &--active {
        color: #fff;
        background: var(--tr-color-primary);
      }

      &:focus-within {
        outline: 2px solid var(--tr-color-primary);
        outline-offset: 2px;
      }
    }

    &-input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }
  }

  &__footer {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    padding: var(--footer-padding);
    gap: var(--footer-gap);

    & > .button {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: var(--button-border-radius);
      padding: var(--button-padding);
      font-size: var(--button-font-size);
      height: var(--button-height);
      line-height: var(--button-line-height);
      cursor: pointer;
      transition: var(--button-transition);
      min-width: var(--button-min-width);
      box-sizing: border-box;
      font: inherit;

      &:focus-visible {
        outline: 2px solid var(--tr-color-primary);
        outline-offset: 2px;
      }

      &.cancel {
        background-color: var(--cancel-bg-color);
        border: 1px solid var(--cancel-border-color);
        color: var(--cancel-text-color);

        &:hover {
          border-color: var(--cancel-hover-border-color);
        }
      }

      &.confirm {
        background-color: var(--confirm-bg-color);
        border: 1px solid var(--confirm-border-color);
        color: var(--confirm-text-color);

        &:hover {
          background-color: var(--confirm-hover-bg-color);
          border-color: var(--confirm-hover-border-color);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .mcp-extension-form {
    &__add-type {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--tr-mcp-extension-form-add-type-gap-mobile);
    }

    &__content {
      padding: var(--tr-mcp-extension-form-content-padding-mobile);
    }

    &__footer {
      padding: var(--tr-mcp-extension-form-footer-padding-mobile);
      justify-content: space-between;
      gap: var(--tr-mcp-extension-form-footer-gap-mobile);
    }

    &__footer > .button {
      flex: 1;
      height: 40px;
    }
  }
}
</style>
