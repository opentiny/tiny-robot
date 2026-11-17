import { defineComponent, h, nextTick, shallowRef, watch, type PropType } from 'vue'
import { useSenderContext } from '@opentiny/tiny-robot'
import { nodesFor } from './ElementRenderer'
import { useElementRendererInput, useElementRendererOwner } from './elementRendererHost'
import type {
  ChatRenderer,
  ChatRendererError,
  ChatSenderContentRendererContext,
  ChatSenderContentRendererState,
} from './elementRenderers'

export default defineComponent({
  props: { renderer: { type: Function as PropType<ChatRenderer<ChatSenderContentRendererContext>>, required: true } },
  emits: ['error'],
  setup(props, { emit }) {
    const sender = useSenderContext()
    const owner = useElementRendererOwner()
    const focusOverride = useElementRendererInput()
    const outlet = shallowRef<HTMLElement>()
    const listeners = new Set<(state: ChatSenderContentRendererState) => void>()
    let fail: ((error: unknown) => void) | undefined
    const state = (): ChatSenderContentRendererState => ({
      value: sender.editor.value?.getText() ?? '',
      disabled: sender.disabled.value,
      loading: sender.loading.value,
    })
    watch(
      () => [outlet.value, props.renderer, owner(), sender.editor.value] as const,
      ([root, renderer, runtime, editor], _, onCleanup) => {
        if (!root || !editor) return
        const controller = new AbortController()
        const active = () =>
          !controller.signal.aborted && owner() === runtime && sender.editor.value === editor && !editor.isDestroyed
        const focus = async () => {
          if (!active() || sender.disabled.value) return false
          await nextTick()
          if (!active()) return false
          const input = root.querySelector<HTMLElement>(
            'input:not(:disabled),textarea:not(:disabled),[contenteditable=true],[tabindex]:not([tabindex="-1"])',
          )
          input?.focus()
          return active() && Boolean(input && root.ownerDocument.activeElement === input)
        }
        const control = {
          focus,
          blur() {
            const focused = root.ownerDocument.activeElement
            if (active() && focused instanceof HTMLElement && root.contains(focused)) focused.blur()
          },
        }
        if (focusOverride) focusOverride.value = control
        const dispose = () => {
          controller.abort()
          listeners.clear()
          root.replaceChildren()
          if (focusOverride?.value === control) focusOverride.value = undefined
        }
        fail = (error) => {
          dispose()
          emit('error', { name: 'sender-content', error } satisfies ChatRendererError)
        }
        onCleanup(() => {
          dispose()
          fail = undefined
        })
        try {
          const context: ChatSenderContentRendererContext = {
            get value() {
              return state().value
            },
            get disabled() {
              return sender.disabled.value
            },
            get loading() {
              return sender.loading.value
            },
            setInputValue(text) {
              if (!active() || sender.disabled.value) return
              editor.commands.setContent({
                type: 'doc',
                content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }],
              })
            },
            subscribe(listener) {
              if (!active()) return () => undefined
              listeners.add(listener)
              listener(state())
              return () => {
                listeners.delete(listener)
              }
            },
          }
          root.replaceChildren(...nodesFor(renderer(context, { signal: controller.signal })))
        } catch (error) {
          fail(error)
        }
      },
      { immediate: true, flush: 'post' },
    )
    watch(
      () => [sender.editor.value?.getText(), sender.disabled.value, sender.loading.value],
      () => {
        for (const listener of Array.from(listeners)) {
          try {
            listener(state())
          } catch (error) {
            fail?.(error)
            break
          }
        }
      },
      { flush: 'post' },
    )
    return () => h('div', { ref: outlet, style: 'display: contents' })
  },
})
