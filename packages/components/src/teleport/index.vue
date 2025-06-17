<script setup lang="ts">
import { computed, TeleportProps } from 'vue'

const props = defineProps<
  Omit<TeleportProps, 'to'> & {
    to?: TeleportProps['to']
    anchor?: Node | null
  }
>()

const teleportNode = computed(() => {
  if (props.anchor) {
    const rootNode = props.anchor.getRootNode()

    return rootNode instanceof ShadowRoot ? rootNode : document.body
  }

  return document.body
})
</script>

<template>
  <Teleport v-bind="props" :to="props.to || teleportNode">
    <slot />
  </Teleport>
</template>
