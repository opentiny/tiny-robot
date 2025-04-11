<script setup lang="ts">
import { iconCopy, iconRefresh } from '@opentiny/vue-icon'
import markdownit from 'markdown-it'
import Typed, { TypedOptions } from 'typed.js'
import { computed, onBeforeUnmount, onMounted, ref, toRaw } from 'vue'
import { BubbleItemProps } from '../bubble-list/index.type'
import AISvg from './components/ai-svg.vue'
import UserSvg from './components/user-svg.vue'

const props = withDefaults(defineProps<BubbleItemProps>(), {
  content: '',
  type: 'text',
  loading: false,
  maxWidth: '80%',
})

const contentRef = ref<HTMLElement>()
/**
 * @deprecated
 */
const typedInstance = ref<Typed>()

const bubbleContent = computed(() => {
  if (props.type === 'markdown') {
    return markdownit(props.mdConfig || {}).render(props.content)
  }
  return props.content
})

const isUserRole = computed(() => props.role === 'user')

const isAlignRight = computed(() => {
  if (props.roleConfig?.align) {
    return props.roleConfig.align === 'right'
  }

  return isUserRole.value
})

const avatarVNode = computed(() => {
  const avatar = props.roleConfig?.avatar
  if (avatar) {
    return () => avatar
  }

  return isUserRole.value ? UserSvg : AISvg
})

const TinyIconCopy = iconCopy()
const TinyIconRefresh = iconRefresh()

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

const emit = defineEmits(['copy', 'regenerate'])

// TODO
const handleCopy = () => {
  emit('copy', 'copy', toRaw(props))
}

const handleRegenerate = () => {
  emit('regenerate', 'regenerate', toRaw(props))
}
</script>

<template>
  <div
    :class="[
      'tr-bubble',
      {
        'align-left': !isAlignRight,
        'align-right': isAlignRight,
      },
    ]"
  >
    <div class="tr-bubble__avatar">
      <component :is="avatarVNode"></component>
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
        <span v-if="props.typedConfig?.enable" ref="contentRef"></span>
        <span v-else-if="props.type === 'markdown'" v-html="bubbleContent"></span>
        <span v-else>{{ bubbleContent }}</span>
        <span v-if="props.aborted" class="tr-bubbule__content-aborted">（用户停止）</span>
      </div>
      <slot name="footer"></slot>
      <div v-if="props.showActions" class="actions">
        <span>
          <tiny-icon-refresh @click="handleRegenerate"></tiny-icon-refresh>
        </span>
        <span>
          <tiny-icon-copy @click="handleCopy"></tiny-icon-copy>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble {
  display: flex;
  gap: 16px;
  max-width: v-bind('props.maxWidth');

  &.align-left {
    flex-direction: row;

    .tr-bubble__content {
      border-top-left-radius: 0;
    }
  }

  &.align-right {
    flex-direction: row-reverse;
    margin-left: auto;

    .tr-bubble__content {
      border-top-right-radius: 0;
    }
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
  padding: 16px 24px;
  border-radius: 24px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.02);

  &.tr-bubble__content-role-ai {
    background-color: white;
  }

  &.tr-bubble__content-role-user {
    background-color: rgb(222, 236, 255);
  }

  .tr-bubbule__text-wrap {
    color: rgb(25, 25, 25);
    font-size: 16px;
    line-height: 26px;
  }

  .tr-bubbule__content-aborted {
    color: rgb(128, 128, 128);
    font-size: 14px;
  }

  .actions {
    display: flex;
    justify-self: end;
    gap: 4px;
    margin-top: 16px;

    & > * {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
