<script setup lang="ts">
const codeData = defineModel<string>('codeData', { required: true })
</script>

<template>
  <div class="code-editor__container">
    <div class="code-editor__section">
      <div class="code-editor__area">
        <textarea v-model="codeData" class="code-editor__textarea" placeholder="请输入 JSON 配置..."></textarea>
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
    color: #191919;
    background-color: #f5f5f5;
    box-sizing: border-box;

    &::placeholder {
      color: #999999;
    }

    &:focus {
      box-shadow: none;
    }
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
