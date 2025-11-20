<script setup lang="ts">
import { useChatInputContext } from '../../context'
import WordCounter from '../word-counter/index.vue'
import ClearButton from '../clear-button/index.vue'
import SubmitButton from '../submit-button/index.vue'

const { clearable, hasContent, loading } = useChatInputContext()
</script>

<template>
  <div class="tr-chat-input-default-right">
    <WordCounter />
    <div v-if="hasContent || loading" class="tr-chat-input-action-buttons">
      <div v-if="clearable && hasContent && !loading" class="tr-chat-input-utility-buttons">
        <ClearButton />
      </div>
      <div class="tr-chat-input-submit-wrapper">
        <SubmitButton />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-input-default-right {
  display: flex;
  align-items: center;
  gap: 12px;

  .tr-chat-input-action-buttons {
    display: flex;
    align-items: center;
    gap: 12px; // 普通按钮组和发送按钮之间的间距
  }

  .tr-chat-input-utility-buttons {
    display: flex;
    align-items: center;
    gap: 4px; // 普通按钮之间的间距
  }

  .tr-chat-input-submit-wrapper {
    display: flex;
    align-items: center;
  }
}
</style>
