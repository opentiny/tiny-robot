import { defineComponent, h, ref } from 'vue'

export const CONTRACT_EVENTS = ['empty', 'text', 'object', 'array', 'multiple', 'update:sampleValue'] as const

export default defineComponent({
  emits: [...CONTRACT_EVENTS],
  setup(_, { emit }) {
    const cancelled = ref(false)
    return () =>
      h('div', [
        h('button', { onClick: () => emit('empty') }, 'No arguments'),
        h('button', { onClick: () => emit('text', 'message') }, 'String argument'),
        h(
          'button',
          {
            onClick: () =>
              emit('object', {
                text: 'message',
                preventDefault: () => {
                  cancelled.value = true
                },
              }),
          },
          'Object argument',
        ),
        h('output', { 'data-testid': 'business-cancelled' }, cancelled.value ? '已取消' : '待处理'),
        h('button', { onClick: () => emit('array', ['A', 'B']) }, 'Array argument'),
        h('button', { onClick: () => emit('multiple', 'message', 42, { source: 'test' }) }, 'Multiple arguments'),
        h('button', { onClick: () => emit('update:sampleValue', 'next') }, 'Update argument'),
      ])
  },
})
