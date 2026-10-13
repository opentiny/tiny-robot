export interface ExperimentalErrorDetail {
  readonly source: 'renderer' | 'element'
  readonly error: unknown
}

export type ExperimentalEventInit<TDetail> = Omit<CustomEventInit<TDetail>, 'detail'>

export function toExperimentalEventName(name: string): string {
  const updatePrefix = 'update:'
  const normalized = name.startsWith(updatePrefix) ? name.slice(updatePrefix.length) : name
  const kebabName = normalized
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_:\s]+/g, '-')
    .toLowerCase()

  return name.startsWith(updatePrefix) ? `${kebabName}-update` : kebabName
}

export function dispatchExperimentalEvent<TDetail>(
  target: EventTarget,
  name: string,
  detail: TDetail,
  init: ExperimentalEventInit<TDetail> = {},
): boolean {
  return target.dispatchEvent(
    new CustomEvent(toExperimentalEventName(name), {
      bubbles: true,
      composed: true,
      ...init,
      detail,
    }),
  )
}
