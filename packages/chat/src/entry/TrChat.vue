<script setup lang="ts">
import { useSlots, type Slot } from 'vue'
import { toolPlugin } from '@opentiny/tiny-robot-kit'
import { TrChatRoot, TrChatPage } from '@/entry'
import { useTrChatConfigRuntimeResolution } from '@/runtime/config/useTrChatConfigRuntimeResolution'
import { createRuntimeFromConfig } from '@/runtime/config/createRuntimeFromConfig'
import type { TrChatProps } from '@/types'

defineOptions({ name: 'TrChat', inheritAttrs: false })

const props = defineProps<TrChatProps>()
const slots = useSlots() as Record<string, Slot | undefined>
const runtimeResolution = useTrChatConfigRuntimeResolution(() => props.config, {
  createRuntime: (config) =>
    createRuntimeFromConfig(config, {
      plugins: props.mcpManager
        ? [
            toolPlugin({
              getTools: () => props.mcpManager!.getTools(),
              callTool: (toolCall) => props.mcpManager!.callTool(toolCall),
            }),
          ]
        : [],
    }),
})
</script>

<template>
  <TrChatRoot :runtime="runtimeResolution.runtime" :ui="runtimeResolution.ui" :mcp-manager="props.mcpManager">
    <TrChatPage>
      <template v-for="(_, name) in slots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </TrChatPage>
  </TrChatRoot>
</template>
