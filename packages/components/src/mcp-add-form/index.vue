<script setup lang="ts">
import { TinyRadioGroup } from '@opentiny/vue'
import { FormEditor, CodeEditor } from './components'
import { ref } from 'vue'
import type { McpAddFormData, AddType, McpAddFormEmits, McpAddFormProps } from './index.type'

const props = withDefaults(defineProps<McpAddFormProps>(), {
  addType: 'form',
})

const emit = defineEmits<McpAddFormEmits>()

const formData = ref<McpAddFormData>(
  props.formData || {
    name: '',
    description: '',
    type: 'streamableHttp',
    url: '',
    headers: '',
    thumbnail: null,
  },
)

const codeData = ref<string>(props.codeData || '')
const addType = ref<AddType>(props.addType)

const addTypeOptions = [
  { label: 'form', text: '表单添加' },
  { label: 'code', text: '代码添加' },
]

const handleCancel = () => {
  emit('cancel')
}

const handleConfirm = () => {
  if (addType.value === 'form') {
    emit('confirm', 'form', formData.value)
  } else {
    emit('confirm', 'code', codeData.value)
  }
}

const handleUpdateAddType = (type: AddType) => {
  emit('update:addType', type)
}
</script>

<template>
  <div class="mcp-add-form">
    <div class="mcp-add-form__content">
      <!-- 添加插件方式-->
      <div class="mcp-add-form__add-type">
        <span class="mcp-add-form__add-type-label">添加方式</span>
        <tiny-radio-group
          v-model="addType"
          type="button"
          :options="addTypeOptions"
          @update:model-value="handleUpdateAddType"
        />
      </div>

      <div v-if="addType === 'form'">
        <FormEditor v-model:form-data="formData" />
      </div>

      <div v-if="addType === 'code'">
        <CodeEditor v-model:code-data="codeData" />
      </div>
    </div>

    <div class="mcp-add-form__footer">
      <div class="button cancel" @click="handleCancel">
        <span>取消</span>
      </div>
      <div class="button confirm" @click="handleConfirm">
        <span>确定</span>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.tr-mcp-add-form-vars() {
  @prefix: tr-mcp-add-form;

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

.tr-mcp-add-form-vars();
</style>

<style lang="less" scoped>
// 第二层：组件映射层 (Component Mapping Layer)
.mcp-add-form {
  /* 内容区域变量 */
  --content-padding: var(--tr-mcp-add-form-content-padding);

  /* 添加类型区域变量 */
  --add-type-gap: var(--tr-mcp-add-form-add-type-gap);
  --add-type-margin: var(--tr-mcp-add-form-add-type-margin);
  --add-type-label-font-size: var(--tr-mcp-add-form-add-type-label-font-size);
  --add-type-label-font-weight: var(--tr-mcp-add-form-add-type-label-font-weight);
  --add-type-label-line-height: var(--tr-mcp-add-form-add-type-label-line-height);
  --add-type-label-color: var(--tr-mcp-add-form-add-type-label-color);

  /* 底部区域变量 */
  --footer-padding: var(--tr-mcp-add-form-footer-padding);
  --footer-gap: var(--tr-mcp-add-form-footer-gap);

  /* 按钮变量 */
  --button-border-radius: var(--tr-mcp-add-form-button-border-radius);
  --button-padding: var(--tr-mcp-add-form-button-padding);
  --button-font-size: var(--tr-mcp-add-form-button-font-size);
  --button-height: var(--tr-mcp-add-form-button-height);
  --button-line-height: var(--tr-mcp-add-form-button-line-height);
  --button-min-width: var(--tr-mcp-add-form-button-min-width);
  --button-transition: var(--tr-mcp-add-form-button-transition);

  /* 取消按钮变量 */
  --cancel-bg-color: var(--tr-mcp-add-form-cancel-bg-color);
  --cancel-border-color: var(--tr-mcp-add-form-cancel-border-color);
  --cancel-text-color: var(--tr-mcp-add-form-cancel-text-color);
  --cancel-hover-border-color: var(--tr-mcp-add-form-cancel-hover-border-color);

  /* 确认按钮变量 */
  --confirm-bg-color: var(--tr-mcp-add-form-confirm-bg-color);
  --confirm-border-color: var(--tr-mcp-add-form-confirm-border-color);
  --confirm-text-color: var(--tr-mcp-add-form-confirm-text-color);
  --confirm-hover-bg-color: var(--tr-mcp-add-form-confirm-hover-bg-color);
  --confirm-hover-border-color: var(--tr-mcp-add-form-confirm-hover-border-color);
}

.mcp-add-form {
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
  .mcp-add-form {
    &__add-type {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--tr-mcp-add-form-add-type-gap-mobile);
    }

    &__content {
      padding: var(--tr-mcp-add-form-content-padding-mobile);
    }

    &__footer {
      padding: var(--tr-mcp-add-form-footer-padding-mobile);
      justify-content: space-between;
      gap: var(--tr-mcp-add-form-footer-gap-mobile);
    }

    &__footer > .button {
      flex: 1;
      height: 40px;
    }
  }
}
</style>
