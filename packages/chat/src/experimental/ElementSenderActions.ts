import { computed, defineComponent, h, nextTick, type PropType } from 'vue'
import { useSenderContext } from '@opentiny/tiny-robot'
import ElementRenderer from './ElementRenderer'
import { useElementRendererInput, useElementRendererOwner } from './elementRendererHost'
import type { ChatRenderer, ChatSenderRendererContext } from './elementRenderers'

export default defineComponent({
  props: {
    name: {
      type: String as PropType<'sender-actions-inline' | 'sender-footer' | 'sender-footer-right'>,
      required: true,
    },
    renderer: { type: Function as PropType<ChatRenderer<ChatSenderRendererContext>>, required: true },
  },
  emits: ['error'],
  setup(props, { emit }) {
    const sender = useSenderContext()
    const owner = useElementRendererOwner()
    const focusOverride = useElementRendererInput()
    const focusEditor = () => {
      if (focusOverride?.value) void focusOverride.value.focus()
      else sender.focus()
    }
    const available = () => Boolean(sender.editor.value && !sender.editor.value.isDestroyed)
    const editable = () => available() && !sender.disabled.value
    const focus = async () => {
      const editor = sender.editor.value
      const runtime = owner()
      if (!editable()) return false
      if (focusOverride?.value) {
        const focused = await focusOverride.value.focus()
        return editable() && owner() === runtime && focused
      }
      sender.focus()
      await nextTick()
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      return editable() && owner() === runtime && sender.editor.value === editor && Boolean(editor?.isFocused)
    }
    const context = computed<ChatSenderRendererContext>(() => ({
      disabled: sender.disabled.value,
      loading: sender.loading.value,
      hasContent: sender.hasContent.value,
      focus,
      blur: () => {
        if (!available()) return
        if (focusOverride?.value) focusOverride.value.blur()
        else sender.blur()
      },
      insert: (text) => {
        if (editable() && text) {
          sender.editor.value!.commands.insertContent({ type: 'text', text })
          focusEditor()
        }
      },
      append: (text) => {
        const editor = sender.editor.value
        if (editable() && text && editor) {
          editor.commands.insertContentAt(Math.max(1, editor.state.doc.content.size - 1), { type: 'text', text })
          focusEditor()
        }
      },
      replace: (text) => {
        if (!editable()) return
        sender.editor.value!.commands.setContent({
          type: 'doc',
          content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }],
        })
        focusEditor()
      },
    }))
    return () =>
      h(ElementRenderer, {
        name: props.name,
        context: context.value,
        renderer: props.renderer,
        onError: (error) => emit('error', error),
      })
  },
})
