import { defineComponent, h, type PropType } from 'vue'
import type { ChatEmptyStateSlotProps } from '../types'
import ElementRenderer from './ElementRenderer'
import ElementSenderActions from './ElementSenderActions'
import ElementSenderContent from './ElementSenderContent'
import ElementEmptyStateRenderer from './ElementEmptyStateRenderer'
import type {
  ChatRenderer,
  ChatRenderers,
  ChatEmptyStateRendererContext,
  ChatSenderContentRendererContext,
  ChatSenderRendererContext,
} from './elementRenderers'

export default defineComponent({
  props: {
    name: { type: String as PropType<keyof ChatRenderers>, required: true },
    context: { type: Object as PropType<object>, required: true },
    renderer: { type: Function as PropType<ChatRenderer<never>>, required: true },
  },
  emits: ['error'],
  setup(props, { emit }) {
    const onError = (error: unknown) => emit('error', error)
    return () => {
      if (props.name === 'sender-content')
        return h(ElementSenderContent, {
          renderer: props.renderer as ChatRenderer<ChatSenderContentRendererContext>,
          onError,
        })
      if (props.name === 'layout-empty-state')
        return h(ElementEmptyStateRenderer, {
          context: props.context as ChatEmptyStateSlotProps,
          renderer: props.renderer as ChatRenderer<ChatEmptyStateRendererContext>,
          onError,
        })
      if (
        props.name === 'sender-actions-inline' ||
        props.name === 'sender-footer' ||
        props.name === 'sender-footer-right'
      )
        return h(ElementSenderActions, {
          name: props.name,
          renderer: props.renderer as ChatRenderer<ChatSenderRendererContext>,
          onError,
        })
      return h(ElementRenderer, { ...props, onError })
    }
  },
})
