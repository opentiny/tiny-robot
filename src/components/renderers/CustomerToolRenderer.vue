<script setup lang="ts">
import { computed } from 'vue'
import type { BubbleContentRendererProps } from '@opentiny/tiny-robot'

type ToolCallState = {
  status?: 'running' | 'success' | 'failed' | 'cancelled'
}

const props = defineProps<
  BubbleContentRendererProps<
    string,
    {
      toolCall?: Record<string, ToolCallState>
    }
  >
>()

const toolNameMap: Record<string, string> = {
  query_order_status: '查询订单状态',
  query_refund_status: '查询退款进度',
  query_logistics: '查询物流信息',
}

const statusTextMap: Record<string, string> = {
  running: '正在查询',
  success: '查询完成',
  failed: '查询失败',
  cancelled: '查询已取消',
}

const getToolTitle = (name: string) => toolNameMap[name] ?? name

const getToolStatus = (id: string) => {
  return props.message.state?.toolCall?.[id]?.status ?? 'running'
}

const tools = computed(() => {
  return (props.message.tool_calls ?? []).map((toolCall) => {
    const status = getToolStatus(toolCall.id)

    return {
      id: toolCall.id,
      name: toolCall.function.name,
      title: getToolTitle(toolCall.function.name),
      status,
      statusText: statusTextMap[status] ?? '准备查询',
    }
  })
})
</script>

<template>
  <div class="customer-tools">
    <div v-for="tool in tools" :key="tool.id" class="customer-tool" :data-status="tool.status">
      <div class="tool-line">
        <span class="tool-status" :class="{ 'loading-text': tool.status === 'running' }">{{ tool.statusText }}</span>
        <span class="tool-name">{{ tool.title }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customer-tools {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.customer-tool {
  border-radius: var(--tr-radius-md);
  padding: 10px 12px;
  background: var(--tr-container-bg-default-2);
  color: var(--tr-text-secondary);
  font-size: var(--tr-font-size-sm);
  line-height: 1.6;
}

.tool-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tool-status {
  color: var(--tr-color-primary);
  font-weight: var(--tr-font-weight-medium);
}

.customer-tool[data-status='failed'] .tool-status,
.customer-tool[data-status='cancelled'] .tool-status {
  color: var(--tr-color-error);
}

.tool-name {
  color: var(--tr-text-primary);
}

.loading-text {
  background: linear-gradient(
    90deg,
    var(--tr-color-primary) 0%,
    var(--tr-color-primary) 40%,
    #ffffff 50%,
    var(--tr-color-primary) 60%,
    var(--tr-color-primary) 100%
  );

  background-size: 200% 100%;

  -webkit-background-clip: text;
  background-clip: text;

  animation: shine 2s linear infinite;
}

@keyframes shine {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}
</style>
