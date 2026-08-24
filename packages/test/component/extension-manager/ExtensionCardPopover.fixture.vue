<script setup lang="ts">
import { defineComponent, h } from 'vue'
import ExtensionCardPopover from '../../../components/src/extension-manager/components/ExtensionCardPopover.vue'

const CustomTrigger = defineComponent({
  name: 'CustomTrigger',
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => h('button', { ...attrs, 'data-testid': 'component-trigger', type: 'button' }, '组件触发器')
  },
})
</script>

<template>
  <div>
    <button type="button" data-testid="outside-target">外部区域</button>

    <section data-testid="native-trigger-section">
      <ExtensionCardPopover as-child>
        <template #trigger="{ open }">
          <button type="button" data-testid="native-trigger" :aria-expanded="open">原生触发器</button>
        </template>
        <template #content>
          <span>原生触发器内容</span>
        </template>
      </ExtensionCardPopover>
    </section>

    <section data-testid="component-trigger-section">
      <ExtensionCardPopover as-child>
        <template #trigger="{ open }">
          <CustomTrigger :aria-expanded="open" />
        </template>
        <template #content>
          <span>组件触发器内容</span>
        </template>
      </ExtensionCardPopover>
    </section>
  </div>
</template>
