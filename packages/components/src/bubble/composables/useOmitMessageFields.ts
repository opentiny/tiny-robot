import { computed, ComputedRef } from 'vue'
import { BubbleContentRendererProps, BubbleMessage } from '../index.type'

/**
 * Omit specified fields from message and return computed props
 * @param props - The original props containing the message
 * @param fields - Array of field names to omit from the message
 * @returns An object containing restMessage and restProps computed refs
 */
export function useOmitMessageFields<P extends BubbleContentRendererProps, K extends keyof BubbleMessage>(
  props: P,
  fields: K[],
): {
  restMessage: ComputedRef<Omit<BubbleMessage, K>>
  restProps: ComputedRef<P>
} {
  const restMessage = computed(() => {
    const filteredEntries = Object.entries(props.message).filter(([key]) => !fields.includes(key as K))
    return Object.fromEntries(filteredEntries) as Omit<BubbleMessage, K>
  })

  const restProps = computed(() => {
    return {
      ...props,
      message: restMessage.value,
    } as P
  })

  return {
    restMessage,
    restProps,
  }
}
