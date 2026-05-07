<script setup lang="ts">
import { BubbleProvider } from '@opentiny/tiny-robot'
import type { BubbleListProps } from '@opentiny/tiny-robot'
import { computed, inject, type PropType, provide } from 'vue'
import { useDefaultBubbleConfig } from './useDefaultBubbleConfig'
import { BUBBLE_CONFIG_KEY, CHAT_RUNTIME_KEY, useChatPageInputs } from '@/shared/context'
import type { ChatAppearanceConfig, ChatBubbleRenderers, ChatContentLayout, ChatRuntime } from '@/types'
import { triStateBooleanProp } from '@/shared/utils'
import ConditionalThemeProvider from '@/components/shared/ConditionalThemeProvider.vue'

defineOptions({ name: 'TrChatLayout' })

const props = defineProps({
  show: triStateBooleanProp,
  roleConfigs: Object as PropType<BubbleListProps['roleConfigs']>,
  appearance: Object as PropType<ChatAppearanceConfig>,
  contentLayout: String as PropType<ChatContentLayout>,
  bubbleRenderers: Object as PropType<ChatBubbleRenderers>,
})
const chatRuntime = inject<ChatRuntime | null>(CHAT_RUNTIME_KEY, null)
const pageInputs = useChatPageInputs()
const layoutInput = computed(() => pageInputs?.value.layout)
const appearanceInput = computed(() => pageInputs?.value.appearance)
const resolvedBubbleRenderers = computed<ChatBubbleRenderers | undefined>(
  () => props.bubbleRenderers ?? chatRuntime?.message.config?.renderers ?? layoutInput.value?.bubbleRenderers,
)

const {
  contentMatches: defaultContentMatches,
  boxMatches: defaultBoxMatches,
  roles: defaultRoles,
} = useDefaultBubbleConfig()
const contentMatches = computed(() => [
  ...(resolvedBubbleRenderers.value?.contentMatches ?? []),
  ...defaultContentMatches,
])
const boxMatches = computed(() => [...(resolvedBubbleRenderers.value?.boxMatches ?? []), ...defaultBoxMatches])
const resolvedShow = computed(() => props.show ?? layoutInput.value?.show ?? true)
const resolvedAppearance = computed(() => props.appearance ?? appearanceInput.value)
const resolvedContentLayout = computed<ChatContentLayout>(
  () => props.contentLayout ?? layoutInput.value?.contentLayout ?? 'centered',
)
const resolvedRoleConfigs = computed(() => props.roleConfigs ?? layoutInput.value?.roleConfigs)

const mergedRoleConfigs = computed(() => ({
  ...defaultRoles,
  ...resolvedRoleConfigs.value,
}))

provide(BUBBLE_CONFIG_KEY, {
  roleConfigs: mergedRoleConfigs,
})
</script>

<template>
  <BubbleProvider :box-renderer-matches="boxMatches" :content-renderer-matches="contentMatches">
    <ConditionalThemeProvider :appearance="resolvedAppearance" scope-id-prefix="tr-chat-theme-scope">
      <template #default="{ themeScopeId }">
        <div
          :id="themeScopeId"
          v-show="resolvedShow"
          class="tr-chat"
          :data-tr-appearance-mode="resolvedAppearance?.mode"
          :data-chat-content-layout="resolvedContentLayout"
        >
          <slot />
        </div>
      </template>
    </ConditionalThemeProvider>
  </BubbleProvider>
</template>
