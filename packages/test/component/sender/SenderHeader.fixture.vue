<script setup lang="ts">
import { Comment, Fragment, Text, defineComponent, h, shallowRef } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const props = defineProps<{ mode: 'single' | 'multiple' }>()
const variant = shallowRef('comment')
const EmptyComponent = defineComponent(() => () => null)
const SenderCase = defineComponent(
  () => () =>
    h(
      TrSender,
      { mode: props.mode },
      {
        header: () => {
          switch (variant.value) {
            case 'comment':
              return [h(Comment)]
            case 'fragment':
              return [h(Fragment, [h(Comment), h(Fragment, [])])]
            case 'whitespace':
              return [h(Text, ' \n ')]
            case 'zero':
              return [h(Text, '0')]
            case 'element':
              return [h('span', 'Tag')]
            case 'component':
              return [h(EmptyComponent)]
            default:
              return []
          }
        },
      },
    ),
)
</script>

<template>
  <div>
    <button
      v-for="name in ['comment', 'fragment', 'whitespace', 'zero', 'element', 'component', 'empty']"
      :key="name"
      @click="variant = name"
    >
      {{ name }}
    </button>
    <SenderCase />
  </div>
</template>
