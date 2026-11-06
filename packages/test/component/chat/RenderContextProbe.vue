<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'
import { useMessageContent, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { useChatRenderContext } from '../../../chat/src/composables/useChatRenderContext'

const props = defineProps<BubbleContentRendererProps>()
const context = useChatRenderContext(props)!
const { contentText } = useMessageContent(props)
const extraHeight = ref(0)
const animatedExpanded = ref(false)
const height = computed(() =>
  props.message.role === 'assistant' ? `${Math.max(200, contentText.value.length) + extraHeight.value}px` : undefined,
)
const instance = getCurrentInstance()!.uid

function resize(height: number) {
  context.pauseAutoScroll()
  extraHeight.value = height
}

function toggleAnimated() {
  context.pauseAutoScroll()
  animatedExpanded.value = !animatedExpanded.value
}
</script>

<template>
  <div
    class="context-probe"
    :data-key="context.messageKey.value"
    :data-thread="context.conversationId.value"
    :data-index="context.contentIndex.value"
    :data-state="context.streamState.value"
    :data-root="context.scrollRoot.value?.classList.contains('chat-main-scroll-host')"
    :data-instance="instance"
    :data-extra-height="extraHeight"
    :style="{ minHeight: height }"
  >
    {{ contentText }}
    <template v-if="props.message.role === 'assistant'">
      <div data-testid="inner-scroll" tabindex="0" style="height: 40px; overflow-y: auto">
        <div style="height: 200px" />
      </div>
      <button data-testid="expand" @click="resize(1200)">Expand</button>
      <button data-testid="expand-short" @click="resize(20)">Expand short</button>
      <button data-testid="collapse" @click="resize(0)">Collapse</button>
      <button data-testid="animated-toggle" @click="toggleAnimated">Toggle animated content</button>
      <Transition name="probe-expand">
        <div v-if="animatedExpanded" data-testid="animated-content" class="probe-expanded-content" />
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.probe-expanded-content {
  height: 1400px;
}

.probe-expand-enter-active,
.probe-expand-leave-active {
  overflow: hidden;
  transition: height 0.4s linear;
}

.probe-expand-enter-from,
.probe-expand-leave-to {
  height: 0;
}
</style>
