import { computed, defineComponent, h, markRaw, shallowRef, watch, type Component, type PropType } from 'vue'
import { useBubbleEventFn, useMessageContent, type BubbleMessage } from '@opentiny/tiny-robot'
import type { ChatUIOptions } from '../types'
import ElementRenderer from './ElementRenderer'
import type { ChatRenderer, ChatRendererError } from './elementRenderers'
import type { ChatBubbleContentRendererContext, ChatBubbleRenderers } from './elementBubbleRenderers'

/** Convert only host content callbacks; keep Bubble's matching, attributes, grouping and events. */
export function useElementBubbleContent(
  source: () => Readonly<ChatBubbleRenderers> | undefined,
  reportError: (error: ChatRendererError) => void,
) {
  const contentComponents = new WeakMap<ChatRenderer<ChatBubbleContentRendererContext>, Component>()
  const fallbackComponents = new WeakMap<ChatRenderer<ChatBubbleContentRendererContext>, Component>()
  function componentFor(renderer: ChatRenderer<ChatBubbleContentRendererContext>, fallback = false): Component {
    const cache = fallback ? fallbackComponents : contentComponents
    const cached = cache.get(renderer)
    if (cached) return cached
    const component = markRaw(
      defineComponent({
        inheritAttrs: false,
        props: {
          message: { type: Object as PropType<BubbleMessage>, required: true },
          contentIndex: { type: Number, required: true },
        },
        setup(props, { attrs }) {
          const { content } = useMessageContent(props)
          const emit = useBubbleEventFn()
          const revision = shallowRef(0)
          // Runtime streams may update fields within the current content item in place.
          watch(
            () => [props.message, content.value],
            () => revision.value++,
            { deep: true },
          )
          const context = computed<ChatBubbleContentRendererContext>(() => {
            void revision.value
            return {
              message: props.message,
              content: content.value,
              contentIndex: props.contentIndex,
              emit,
              setState: (key, value) => emit({ name: 'state:update', payload: { key, value } }),
            }
          })
          return () =>
            h(ElementRenderer, {
              ...attrs,
              name: fallback ? 'bubble-fallback-content' : 'bubble-content',
              context: context.value,
              sameContext: () => false,
              renderer: renderer as ChatRenderer<never>,
              onError: reportError,
            })
        },
      }),
    )
    cache.set(renderer, component)
    return component
  }
  return (ui: Readonly<ChatUIOptions>): Readonly<ChatUIOptions> => {
    const options = source()
    if (!options) return ui
    const provider = ui.bubble?.bubbleProvider
    return {
      ...ui,
      bubble: {
        ...ui.bubble,
        bubbleProvider: {
          ...provider,
          contentRendererMatches: [
            ...(options.contentRendererMatches ?? []).map((match) => ({
              ...match,
              renderer: componentFor(match.renderer),
            })),
            ...(provider?.contentRendererMatches ?? []),
          ],
          ...(options.fallbackContentRenderer
            ? { fallbackContentRenderer: componentFor(options.fallbackContentRenderer, true) }
            : {}),
        },
      },
    }
  }
}
