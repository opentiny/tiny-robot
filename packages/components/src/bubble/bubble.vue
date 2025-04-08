<script setup lang="ts">
import markdownit from 'markdown-it'
import Typed, { TypedOptions } from 'typed.js'
import { computed, onMounted, ref, watchEffect } from 'vue'
import AIAvatar from '../../images/ai-avatar.svg?raw'
import Copy from '../../images/copy.svg?raw'
import Refresh from '../../images/refresh.svg?raw'
import { Bubble } from './index.type'

const props = withDefaults(defineProps<Bubble>(), {
  type: 'text',
})

const textRef = ref<HTMLSpanElement>()
const isLoading = ref(false)

const bubbleContent = computed(() => {
  if (props.type === 'markdown') {
    return markdownit().render(props.content)
  }
  return props.content
})

const isUserRole = computed(() => props.role === 'user')

watchEffect(() => {
  isLoading.value = props.loading
})

onMounted(() => {
  const { enable, ...rest } = props.typedConfig || {}

  const options: TypedOptions = {
    strings: [bubbleContent.value],
    contentType: props.type === 'markdown' ? 'html' : 'null',
    showCursor: false,
  }

  if (enable) {
    const otherOptions: TypedOptions = {
      typeSpeed: 50,
      showCursor: true,
      onBegin: () => {
        isLoading.value = true
      },
      onComplete: () => {
        isLoading.value = false
      },
      ...rest,
    }

    Object.assign(options, otherOptions)
  }

  new Typed(textRef.value, options)
})
</script>

<template>
  <div :class="['tr-bubble', { 'tr-bubble__role-user': isUserRole }]">
    <slot name="avatar">
      <div class="tr-bubble__avatar" v-html="AIAvatar"></div>
    </slot>
    <div :class="['tr-bubble__content', { 'tr-bubble__content-role-user': isUserRole }]">
      <div class="tr-bubbule__text-wrap">
        <span ref="textRef" class="tr-bubble__text"></span>
      </div>
      <slot name="footer">
        <!-- TODO 这里的默认插槽是否需要？ -->
        <div v-if="!isUserRole && !isLoading" class="tr-bubble__footer">
          <div style="flex: 1"></div>
          <div class="buttons">
            <button class="action" v-html="Refresh"></button>
            <button class="action" v-html="Copy"></button>
          </div>
        </div>
      </slot>
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

.tr-bubble__avatar {
  width: 32px;
  height: 32px;
}

.tr-bubble__content {
  background-color: white;
  padding: 16px 24px;
  border-top-left-radius: 0;
  border-top-right-radius: 24px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.02);

  &.tr-bubble__content-role-user {
    border-top-left-radius: 24px;
    border-top-right-radius: 0;
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
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

  .buttons {
    display: flex;
    gap: 4px;

    .action {
      width: 24px;
      height: 24px;
      padding: 4px;
      box-sizing: border-box;
    }
  }
}
</style>
