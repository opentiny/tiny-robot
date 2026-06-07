<template>
  <tr-bubble-provider :content-renderer-matches="contentRendererMatches">
    <div class="state-change-demo">
      <tr-bubble
        :content="messageContent"
        :avatar="aiAvatar"
        :state="messageState"
        @bubble-event="handleBubbleEvent"
        @state-change="handleStateChange"
      ></tr-bubble>

      <div class="event-log">
        <div class="event-log__header">
          <span>外部收到的事件：</span>
          <button class="event-log__reset" type="button" @click="resetEventLogs">重置日志</button>
        </div>
        <pre class="event-log__content">{{ bubbleEventLog }}</pre>
        <pre class="event-log__content">{{ stateChangeLog }}</pre>
      </div>
    </div>
  </tr-bubble-provider>
</template>

<script setup lang="ts">
import {
  BubbleRendererMatchPriority,
  type BubbleEvent,
  type BubbleContentRendererMatch,
  type BubbleContentRendererProps,
  TrBubble,
  TrBubbleProvider,
  useBubbleEventFn,
  useBubbleStateChangeFn,
  useMessageContent,
} from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { computed, defineComponent, h, markRaw, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const messageContent = [{ type: 'state-demo', text: '这条消息的状态由自定义 renderer 修改。' }]
const messageState = ref<Record<string, unknown>>({
  expanded: false,
  liked: false,
})
const bubbleEventLog = ref('bubble-event 尚未触发')
const stateChangeLog = ref('state-change 尚未触发')

const StateDemoRenderer = defineComponent({
  props: {
    message: {
      type: Object,
      required: true,
    },
    contentIndex: Number,
  },
  setup(props: BubbleContentRendererProps) {
    const { content } = useMessageContent(props)
    const emitBubbleEvent = useBubbleEventFn()
    const handleStateChange = useBubbleStateChangeFn()

    const expanded = computed(() => Boolean(props.message.state?.expanded))
    const liked = computed(() => Boolean(props.message.state?.liked))

    const toggleExpanded = () => {
      handleStateChange('expanded', !expanded.value)
    }

    const toggleLiked = () => {
      handleStateChange('liked', !liked.value)
    }

    const sendCustomEvent = () => {
      emitBubbleEvent({
        name: 'demo:apply-to-input',
        payload: {
          text: content.value?.text || '',
        },
      })
    }

    const button = (text: string, onClick: () => void) => h('button', { type: 'button', onClick }, text)

    return () => {
      const detailText = liked.value ? '详情已展开，当前已点赞。' : '详情已展开，当前未点赞。'

      return h('div', { style: 'display: flex; flex-direction: column; gap: 8px' }, [
        h('div', content.value?.text || ''),
        h('div', { style: 'display: flex; gap: 8px' }, [
          button(expanded.value ? '收起详情' : '展开详情', toggleExpanded),
          button(liked.value ? '取消点赞' : '点赞', toggleLiked),
          button('发送事件', sendCustomEvent),
        ]),
        expanded.value
          ? h(
              'div',
              {
                style:
                  'padding: 8px; background: var(--vp-c-bg-soft); border-radius: 6px; color: var(--vp-c-text-2); font-size: 12px',
              },
              detailText,
            )
          : null,
      ])
    }
  },
})

const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (_message, content) => content.type === 'state-demo',
    renderer: markRaw(StateDemoRenderer),
    priority: BubbleRendererMatchPriority.CONTENT,
  },
]

const handleStateChange = (payload: { key: string; value: unknown; contentIndex: number }) => {
  messageState.value[payload.key] = payload.value
  stateChangeLog.value = `state-change\n${JSON.stringify(payload, null, 2)}`
}

const handleBubbleEvent = (payload: BubbleEvent & { messageIndex: number; contentIndex: number }) => {
  bubbleEventLog.value = `bubble-event\n${JSON.stringify(payload, null, 2)}`
}

const resetEventLogs = () => {
  bubbleEventLog.value = 'bubble-event 尚未触发'
  stateChangeLog.value = 'state-change 尚未触发'
}
</script>

<style scoped>
.state-change-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-log {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.event-log__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-log__reset {
  padding: 2px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
  cursor: pointer;
}

.event-log__content {
  padding: 8px;
  margin: 8px 0 0;
  overflow: auto;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  white-space: pre;
}
</style>
