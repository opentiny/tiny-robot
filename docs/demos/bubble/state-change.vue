<template>
  <tr-bubble-provider :content-renderer-matches="contentRendererMatches">
    <div style="display: flex; flex-direction: column; gap: 16px">
      <tr-bubble
        :content="messageContent"
        :avatar="aiAvatar"
        :state="messageState"
        @bubble-event="handleBubbleEvent"
        @state-change="handleStateChange"
      ></tr-bubble>

      <div style="font-size: 12px; color: #666">
        <div style="display: flex; align-items: center; gap: 8px">
          <span>外部收到的事件：</span>
          <button type="button" style="padding: 2px 8px; font-size: 12px" @click="resetEventLogs">重置日志</button>
        </div>
        <pre style="margin: 8px 0 0; padding: 8px; background: #f5f5f5; border-radius: 6px">{{ bubbleEventLog }}</pre>
        <pre style="margin: 8px 0 0; padding: 8px; background: #f5f5f5; border-radius: 6px">{{ stateChangeLog }}</pre>
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
          button('发送普通事件', sendCustomEvent),
        ]),
        expanded.value
          ? h(
              'div',
              { style: 'padding: 8px; background: #f5f5f5; border-radius: 6px; color: #666; font-size: 12px' },
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
