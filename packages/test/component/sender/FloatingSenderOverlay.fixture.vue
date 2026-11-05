<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import type { LayoutFloatingState, LayoutProps, LayoutMode } from '../../../components/src/layout/index.type'
import Layout from '../../../components/src/layout'
import Sender from '../../../components/src/sender'

const props = withDefaults(defineProps<{ type: 'mention' | 'suggestion'; mode?: LayoutMode }>(), {
  mode: 'floating',
})

const mode = ref(props.mode)
const content = shallowRef('')
const extensions =
  props.type === 'mention'
    ? [Sender.mention([{ id: 'alice', label: 'Alice', value: 'alice' }])]
    : [Sender.suggestion([{ content: 'ECS' }])]
const floatingState: LayoutFloatingState = {
  placement: 'center',
  offsetX: 0,
  offsetY: 0,
  width: 520,
  height: 560,
}
const layoutProps = computed<LayoutProps>(() =>
  mode.value === 'floating' ? { mode: 'floating', defaultFloatingState: floatingState } : { mode: 'normal' },
)

function toggleMode() {
  mode.value = mode.value === 'floating' ? 'normal' : 'floating'
}
</script>

<template>
  <button data-testid="toggle-mode" type="button" @click="toggleMode">Toggle mode</button>
  <Layout v-bind="layoutProps">
    <template #main>
      <Sender v-model="content" :extensions="extensions" />
    </template>
  </Layout>
  <output data-testid="content">{{ content }}</output>
</template>
