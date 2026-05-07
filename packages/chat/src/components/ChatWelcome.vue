<script setup lang="ts">
import { computed } from 'vue'
import { TrWelcome, TrPrompts } from '@opentiny/tiny-robot'
import type { VNode } from 'vue'
import { useChatPageInputs } from '@/shared/context'
import type { TrChatWelcomeEmits, TrChatWelcomeProps } from '@/types'

defineOptions({ name: 'TrChatWelcome' })

const props = defineProps<TrChatWelcomeProps>()
const emit = defineEmits<TrChatWelcomeEmits>()
const pageInputs = useChatPageInputs()
const welcomeInput = computed(() => pageInputs?.value.welcome)

const resolvedTitle = computed(() => props.title ?? welcomeInput.value?.title ?? '')
const resolvedDescription = computed(() => props.description ?? welcomeInput.value?.description ?? '')
const resolvedPrompts = computed(() => props.prompts ?? welcomeInput.value?.prompts)
const iconVNode = computed(() => (props.icon ?? welcomeInput.value?.icon) as VNode | undefined)

const welcomeStyle = computed(() => ({
  '--title-color': 'var(--chat-text-primary)',
  '--description-color': 'var(--chat-text-secondary)',
}))
</script>

<template>
  <div class="tr-chat__welcome">
    <TrWelcome :title="resolvedTitle" :description="resolvedDescription" :icon="iconVNode" :style="welcomeStyle" />
    <TrPrompts
      v-if="resolvedPrompts?.length"
      :items="resolvedPrompts"
      :wrap="true"
      class="tr-chat__welcome-prompts"
      @item-click="(_ev, item) => emit('prompt-click', item.description ?? item.label)"
    />
  </div>
</template>

<style scoped>
:deep(.tr-welcome__icon) {
  font-size: 32px;
}
</style>
