<template>
  <div class="chat-demo">
    <!-- 在 BubbleList 上配置其他渲染器，需要使用 BubbleProvider 包裹 -->
    <tr-bubble-provider :fallback-content-renderer="BubbleRenderers.Markdown">
      <tr-bubble-list class="chat-list" :messages="messages" :role-configs="roles" auto-scroll />
    </tr-bubble-provider>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '正在思考中...' : '请输入问题'"
      :loading="isProcessing"
      :clearable="true"
      @submit="handleSubmit"
      @cancel="abortRequest"
    />
  </div>
</template>

<script setup lang="ts">
import { BubbleRenderers, TrBubbleList, TrBubbleProvider, TrSender, type BubbleRoleConfig } from "@opentiny/tiny-robot";
import { IconAi, IconUser } from "@opentiny/tiny-robot-svgs";
import { h, ref } from "vue";
import { useChat } from "./useChat";

const { messages, isProcessing, sendMessage, abortRequest } = useChat();
const inputMessage = ref("");

function handleSubmit(content: string) {
  if (!content || isProcessing.value) return;
  sendMessage(content);
  inputMessage.value = "";
}

// 简洁角色配置：左右排列 + 头像
const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: "start", avatar: h(IconAi, { style: { fontSize: "32px" } }) },
  user: { placement: "end", avatar: h(IconUser, { style: { fontSize: "32px" } }) },
};
</script>

<style scoped>
.chat-demo {
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chat-list {
  height: 400px;
}

/* 使用 data-type 选择器可以匹配不同类型的渲染器 */
:deep([data-type="markdown"]) p {
  margin: 0;
}
</style>
