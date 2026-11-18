<script setup lang="ts">
import { ref } from 'vue'
import Sender from '../../../../components/src/sender/index.vue'
import type { AutoSize, InputMode } from '../../../../components/src/sender/index.type'

interface Props {
  mode?: InputMode
  autoSize?: AutoSize
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'single',
  width: '180px',
})

const value = ref('')
const mode = ref<InputMode>(props.mode)
const size = ref<'normal' | 'small'>('normal')
</script>

<template>
  <main>
    <button data-testid="toggle-mode" type="button" @click="mode = mode === 'single' ? 'multiple' : 'single'">
      toggle mode
    </button>
    <button data-testid="toggle-size" type="button" @click="size = size === 'normal' ? 'small' : 'normal'">
      toggle size
    </button>
    <button data-testid="clear-value" type="button" @click="value = ''">clear</button>
    <output data-testid="mode-output">{{ mode }}</output>
    <div :style="{ width: props.width }">
      <Sender data-testid="sender-root" v-model="value" :mode="mode" :size="size" :auto-size="props.autoSize" />
    </div>
  </main>
</template>
