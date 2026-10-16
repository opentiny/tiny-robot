<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrSender as Sender } from '@opentiny/tiny-robot'

const props = defineProps<{ activeSuggestionKeys?: string[] }>()
const content = shallowRef('')
const selectionCount = shallowRef(0)
const extensions = [
  Sender.suggestion([{ content: 'ECS' }], {
    activeSuggestionKeys: props.activeSuggestionKeys,
    onSelect: () => {
      selectionCount.value += 1
    },
  }),
]
</script>

<template>
  <div>
    <Sender v-model="content" :extensions="extensions">
      <template #actions-inline>
        <button data-testid="next-focus" type="button">Next</button>
      </template>
    </Sender>
    <output data-testid="content">{{ content }}</output>
    <output data-testid="selection-count">{{ selectionCount }}</output>
  </div>
</template>
