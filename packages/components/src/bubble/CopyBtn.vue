<script setup lang="ts">
import { IconCopy } from '@opentiny/tiny-robot-svgs'
import { useClipboard } from '@vueuse/core'
import IconButton from '../icon-button'

const props = withDefaults(defineProps<{ content: string }>(), {
  content: '',
})

const { copy, isSupported } = useClipboard()

const handleCopy = () => {
  if (isSupported && props.content) {
    copy(props.content)
  }
}
</script>

<template>
  <IconButton :icon="IconCopy" @click.stop="handleCopy"></IconButton>
</template>
