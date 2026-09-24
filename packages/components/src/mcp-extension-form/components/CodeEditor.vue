<script setup lang="ts">
import { ref } from 'vue'
import { useStableId } from '../../shared/composables'

const codeData = defineModel<string>('codeData', { required: true })
const props = defineProps<{ error?: string }>()
const textarea = ref<HTMLTextAreaElement>()
const errorId = `mcp-extension-code-error-${useStableId()}`
const codePlaceholder = `{
  "mcpServers": {
    "mcp-server": {
      "type": "sse",
      "url": ""
    }
  }
}`

defineExpose({
  focus() {
    textarea.value?.focus()
  },
})

const handleInput = (event: Event) => {
  codeData.value = (event.target as HTMLTextAreaElement).value
}
</script>

<template>
  <div class="code-editor__container">
    <div class="code-editor__section">
      <div class="code-editor__area">
        <textarea
          ref="textarea"
          :value="codeData"
          class="code-editor__textarea"
          aria-label="MCP JSON 配置"
          :aria-invalid="Boolean(props.error)"
          :aria-describedby="props.error ? errorId : undefined"
          :placeholder="codePlaceholder"
          @input="handleInput"
        ></textarea>
        <p v-if="props.error" :id="errorId" class="code-editor__error">{{ props.error }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.code-editor {
  &__container {
    display: flex;
    gap: 32px;
    width: 100%;
    border-radius: 8px;
    box-sizing: border-box;
  }

  &__section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__header {
    padding-bottom: 8px;
    line-height: 22px;
  }

  &__area {
    flex: 1;
    border-radius: 12px;
    overflow: hidden;
  }

  &__textarea {
    width: 100%;
    height: 360px;
    border: none;
    outline: none;
    resize: none;
    padding: 12px;
    font-size: 13px;
    line-height: 1.4;
    color: var(--tr-text-primary);
    background-color: var(--tr-page-bg-default);
    box-sizing: border-box;

    &::placeholder {
      color: var(--tr-text-tertiary);
    }

    &:focus {
      box-shadow: none;
    }
  }

  &__error {
    margin: 6px 0 0;
    color: var(--tr-color-error, #f23030);
    font-size: 12px;
    line-height: 18px;
  }
}

@media (max-width: 768px) {
  .code-editor__area {
    margin-bottom: 58px;
  }

  .code-editor__textarea {
    height: 470px;
  }
}
</style>
