<script setup lang="ts">
import { computed, inject } from 'vue'
import { rendererRuntimeOwner } from './rendererRuntimeOwner'
import type { SenderSlotScope } from '@opentiny/tiny-robot'
import type { ChatRenderer, ChatSenderRendererContext } from '../../types'
import { ChatRendererOutlet } from './ChatRendererOutlet'

const props = defineProps<{
  renderer: ChatRenderer<ChatSenderRendererContext>
  scope: SenderSlotScope
  disabled: boolean
  focusInput: () => Promise<boolean>
  onError: (error: unknown) => void
}>()

const runtimeOwner = inject(rendererRuntimeOwner, undefined)
const render = computed<ChatRenderer<SenderSlotScope>>(() => {
  const renderer = props.renderer
  const runtime = runtimeOwner?.runtime.value
  return (scope, lifecycle) => {
    const available = () =>
      !lifecycle.signal.aborted &&
      runtimeOwner?.runtime.value === runtime &&
      Boolean(props.scope.editor && !props.scope.editor.isDestroyed)
    const editable = () => available() && !props.disabled && !props.scope.disabled
    return renderer(
      {
        disabled: props.disabled || scope.disabled,
        loading: scope.loading,
        hasContent: scope.hasContent,
        focus: async () => editable() && (await props.focusInput()) && available(),
        blur: () => {
          if (available()) props.scope.blur()
        },
        insert: (content) => {
          if (editable()) props.scope.insert(content)
        },
        append: (content) => {
          if (editable()) props.scope.append(content)
        },
        replace: (content) => {
          if (editable()) props.scope.replace(content)
        },
      },
      lifecycle,
    )
  }
})
</script>

<template>
  <ChatRendererOutlet :renderer="render" :context="props.scope" :on-error="props.onError" />
</template>
