<script setup lang="ts">
import { computed, ref } from 'vue'
import Layout from '../../../components/src/layout'
import type { LayoutFloatingState, LayoutMode, LayoutProps } from '../../../components/src/layout/index.type'
import ModelSelector from '../../../components/src/model-selector'
import type { ModelSelectorOption, ModelSelectorProps } from '../../../components/src/model-selector/index.type'

const props = withDefaults(
  defineProps<{ mode?: LayoutMode; appendTo?: ModelSelectorProps['appendTo']; nested?: boolean }>(),
  {
    mode: 'floating',
  },
)

const mode = ref(props.mode)
const modelValue = ref<string | null>('gpt-4o')
const models: ModelSelectorOption[] = [
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4.1', label: 'GPT-4.1' },
]
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
  <div id="model-selector-custom-target" />
  <Layout v-bind="layoutProps">
    <template #main>
      <Layout v-if="props.nested" mode="normal">
        <template #main>
          <ModelSelector
            v-model="modelValue"
            data-testid="model-selector"
            :models="models"
            :append-to="props.appendTo"
          />
        </template>
      </Layout>
      <ModelSelector
        v-else
        v-model="modelValue"
        data-testid="model-selector"
        :models="models"
        :append-to="props.appendTo"
      />
    </template>
  </Layout>
  <output data-testid="model-value">{{ modelValue }}</output>
</template>
