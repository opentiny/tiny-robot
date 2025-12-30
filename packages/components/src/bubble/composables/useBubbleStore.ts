import { inject, provide, reactive } from 'vue'
import { BUBBLE_STORE_KEY } from '../constants'

/**
 * Setup bubble store
 * Call this function in BubbleList or Bubble component to provide a global store
 * If a store already exists, it will return the existing store without creating a new one
 *
 * @param initialData - Initial data for the store (only used if store doesn't exist)
 * @returns The reactive store object
 */
export function setupBubbleStore<T extends Record<string, unknown>>(initialData?: T): T {
  // Check if store already exists
  const existingStore = inject(BUBBLE_STORE_KEY, undefined)
  if (existingStore) {
    return existingStore as T
  }

  // Create new store and provide it
  const store = reactive<T>(initialData || ({} as T))
  provide(BUBBLE_STORE_KEY, store)
  return store as T
}

/**
 * Use bubble store
 * Call this function in child components to access the global store
 *
 * @returns The reactive store object, or undefined if not provided
 */
export function useBubbleStore<T extends Record<string, unknown> = Record<string, unknown>>(): T {
  return inject(BUBBLE_STORE_KEY, {}) as T
}
