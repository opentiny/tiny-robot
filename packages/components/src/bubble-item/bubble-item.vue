<script setup lang="ts">
import markdownit from 'markdown-it'
import Typed, { TypedOptions } from 'typed.js'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { BubbleItem } from '../bubble-list/index.type'
import AISvg from './components/ai-svg.vue'
import UserSvg from './components/user-svg.vue'

const props = withDefaults(defineProps<BubbleItem>(), {
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

onMounted(() => {
  const { enable, ...rest } = props.typedConfig || {}

  if (enable) {
    const options: TypedOptions = {
      strings: [bubbleContent.value], // 初始为空字符串
      contentType: props.type === 'markdown' ? 'html' : 'null',
      typeSpeed: 50,
      showCursor: true,
      ...rest,
    }

    typedInstance.value = new Typed(contentRef.value, options)
  }
})

onBeforeUnmount(() => {
  typedInstance.value?.destroy()
})

defineExpose({ typedInstance })
</script>

<template>
  <div :class="['tr-bubble', { 'tr-bubble__right': isUserRole }]">
    <div class="tr-bubble__avatar">
      <slot name="avatar">
        <AISvg v-if="!isUserRole" />
        <UserSvg v-if="isUserRole" />
      </slot>
    </div>
    <div v-if="loading" class="tr-bubble__load-wrap">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div
      v-if="!loading"
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

  &.tr-bubble__right {
    flex-direction: row-reverse;
  }
}

.tr-bubble__avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tr-bubble__load-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;

  span {
    height: 8px;
    width: 8px;
    margin: 0 2px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  @keyframes typing {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
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
    background-color: rgb(222, 236, 255);
  }

  .tr-bubble__text {
    color: rgb(25, 25, 25);
    font-size: 16px;
    line-height: 26px;
    margin: 0;
  }
}
</style>
