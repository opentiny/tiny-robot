<script setup lang="ts">
import markdownit from 'markdown-it'
import Typed, { TypedOptions } from 'typed.js'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AIAvatar from '../../images/ai-avatar.svg?raw'
import { Bubble } from './index.type'

const props = withDefaults(defineProps<Bubble>(), {
  content: '',
  type: 'text',
  loading: false,
})

const contentRef = ref<HTMLElement>()
const typedInstance = ref<Typed>()

const bubbleContent = computed(() => {
  if (props.type === 'markdown') {
    return markdownit(props.mdConfig || {}).render(props.content)
  }
  return props.content
})

const isUserRole = computed(() => props.role === 'user')

// 流式文本队列
const streamQueue: string[] = []

const streamAppendText = (text: string) => {
  if (!typedInstance.value) {
    return
  }

  streamQueue.push(text)
}

const playNextChunk = (self: Typed) => {
  if (!typedInstance.value || streamQueue.length === 0) {
    self.cursor.remove()
    return
  }

  const nextChunk = streamQueue.shift()!
  const currentStrings = (typedInstance.value as unknown as { strings: string[] }).strings[0]

  // 更新Typed实例的字符串
  ;(typedInstance.value as unknown as { strings: string[] }).strings = [currentStrings + nextChunk]
  // TODO typed目前不支持流式输出 https://github.com/mattboldt/typed.js/issues/595
  typedInstance.value.reset()
}

onMounted(() => {
  const { enable, onComplete, ...rest } = props.typedConfig || {}

  if (enable) {
    const options: TypedOptions = {
      strings: [''], // 初始为空字符串
      contentType: props.type === 'markdown' ? 'html' : 'null',
      typeSpeed: 50,
      showCursor: true,
      onComplete: (self) => {
        // 一段内容播放完成后检查队列
        playNextChunk(self)
        onComplete?.(self)
      },
      ...rest,
    }

    typedInstance.value = new Typed(contentRef.value, options)

    // 初始化第一段内容
    if (bubbleContent.value) {
      streamAppendText(bubbleContent.value)
    }
  }
})

onBeforeUnmount(() => {
  typedInstance.value?.destroy()
})

defineExpose({ typedInstance, streamAppendText })
</script>

<template>
  <div :class="['tr-bubble', { 'tr-bubble__role-user': isUserRole }]">
    <slot name="avatar">
      <!-- TODO 修改默认头像 -->
      <div class="tr-bubble__default-avatar" v-html="AIAvatar"></div>
    </slot>
    <div
      :class="[
        'tr-bubble__content',
        { 'tr-bubble__content-role-ai': !isUserRole },
        { 'tr-bubble__content-role-user': isUserRole },
      ]"
    >
      <div class="tr-bubbule__text-wrap">
        <span v-if="props.typedConfig?.enable" ref="contentRef" class="tr-bubble__text"></span>
        <span v-else-if="props.type === 'markdown'" v-html="bubbleContent" class="tr-bubble__text"></span>
        <span v-else class="tr-bubble__text">{{ bubbleContent }}</span>
      </div>
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble {
  display: flex;
  gap: 16px;

  &.tr-bubble__role-user {
    flex-direction: row-reverse;
  }
}

.tr-bubble__default-avatar {
  width: 32px;
  height: 32px;
}

.tr-bubble__content {
  background-color: white;
  padding: 16px 24px;
  border-radius: 24px;

  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.02);

  &.tr-bubble__content-role-ai {
    border-top-left-radius: 0;
  }

  &.tr-bubble__content-role-user {
    border-top-right-radius: 0;
  }

  .tr-bubble__text {
    color: rgb(25, 25, 25);
    font-size: 16px;
    line-height: 26px;
    margin: 0;
  }
}

.tr-bubble__footer {
  margin-top: 16px;
  display: flex;
  gap: 24px;

  .tr-bubble__footer-left {
    flex: 1;
  }

  .tr-bubble__footer-right {
    display: flex;
    gap: 4px;
  }
}
</style>
