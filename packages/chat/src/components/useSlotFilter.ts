import { computed } from 'vue'
import type { ComputedRef, Slot } from 'vue'

export function useSlotFilter(
  slots: Record<string, Slot | undefined>,
  allowedNames: readonly string[],
): ComputedRef<Partial<Record<string, Slot>>> {
  return computed(() =>
    Object.fromEntries(
      Object.entries(slots)
        .filter(([name, slot]) => allowedNames.includes(name) && slot !== undefined)
        .map(([name, slot]) => [name, slot as Slot]),
    ),
  )
}
