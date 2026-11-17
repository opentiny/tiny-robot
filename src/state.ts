import { shallowRef, type ShallowRef } from "vue";

/** Vue-native immutable store. Shallow state preserves Blob/AbortController/IDB values. */
export function create<T>(initialize: () => T) {
  const state = shallowRef(initialize()) as ShallowRef<T>;
  const listeners = new Set<(state: T, previous: T) => void>();
  function select<R>(selector: (state: T) => R): R {
    return selector(state.value);
  }
  select.state = state;
  select.getState = () => state.value;
  select.setState = (update: Partial<T> | ((state: T) => Partial<T>)) => {
    const previous = state.value;
    const patch = typeof update === "function" ? update(previous) : update;
    if (patch === previous) return;
    state.value = Object.assign({}, previous, patch);
    for (const listener of listeners) listener(state.value, previous);
  };
  select.subscribe = (listener: (state: T, previous: T) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  return select;
}
