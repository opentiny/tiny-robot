import { DEFAULT_LABEL_STYLES, formatClockDuration, formatDurationValue, normalizeTrajectory } from './time'
import { createTrajectoryUI, type TrajectoryRenderModel, type TrajectoryUI } from '../ui'
import type {
  TrajectoryEvent,
  TrajectoryInstance,
  TrajectoryItem,
  TrajectoryMessages,
  TrajectoryOptions,
  TrajectorySelectSource,
  TrajectoryUpdateOptions,
} from '../types'

const DEFAULT_MESSAGES: TrajectoryMessages = {
  empty: '暂无轨迹',
}

function asError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

function emitSafely(callback: TrajectoryOptions['onEvent'], event: TrajectoryEvent): void {
  try {
    callback?.(event)
  } catch {
    // Consumer telemetry must not break rendering or cleanup.
  }
}

function validateOptions(input: TrajectoryOptions): void {
  if (!input || typeof input !== 'object') throw new Error('Trajectory options must be an object')
  if (!isHTMLElement(input.container)) {
    throw new Error('Trajectory requires an HTMLElement container')
  }
  if (!Array.isArray(input.items)) throw new Error('Trajectory items must be an array')
  if (input.durationFormat !== undefined && !['compact', 'clock', 'none'].includes(input.durationFormat)) {
    throw new Error('Trajectory durationFormat must be compact, clock, or none')
  }
  if (input.formatDuration !== undefined && typeof input.formatDuration !== 'function') {
    throw new Error('Trajectory formatDuration must be a function')
  }
  if (input.onEvent !== undefined && typeof input.onEvent !== 'function') {
    throw new Error('Trajectory onEvent must be a function')
  }
}

export function isHTMLElement(value: unknown): value is HTMLElement {
  if (!value || typeof value !== 'object') return false
  const element = value as HTMLElement
  if (element.nodeType !== 1) return false
  const view = element.ownerDocument?.defaultView
  return view?.HTMLElement
    ? element instanceof view.HTMLElement
    : element.namespaceURI === 'http://www.w3.org/1999/xhtml'
}

export function validateTraceOptions(input: TrajectoryOptions): void {
  validateOptions(input)
}

function hasItem(items: readonly TrajectoryItem[], id: string | null): boolean {
  return id !== null && items.some((item) => item.id === id)
}

function createModel(
  items: readonly TrajectoryItem[],
  options: TrajectoryOptions,
  selectedId: string | null,
): TrajectoryRenderModel {
  const labels = { ...DEFAULT_LABEL_STYLES, ...(options.labels ?? {}) }
  const time = normalizeTrajectory(items, options.axis, labels)
  return {
    time,
    selectedId,
    durationFormat: options.durationFormat ?? 'compact',
    messages: { ...DEFAULT_MESSAGES, ...(options.messages ?? {}) },
    formatDuration:
      options.formatDuration ??
      (options.durationFormat === 'clock'
        ? (duration) => formatClockDuration(duration)
        : (duration) => formatDurationValue(duration)),
  }
}

export function createTrace(input: TrajectoryOptions): TrajectoryInstance {
  validateTraceOptions(input)
  const document = input.container.ownerDocument
  let items: readonly TrajectoryItem[] = [...input.items]
  let options: TrajectoryOptions = { ...input, items }
  let selectedId = hasItem(items, input.selectedId ?? null) ? (input.selectedId ?? null) : null
  let destroyed = false

  const emit = (event: TrajectoryEvent): void => emitSafely(options.onEvent, event)

  const renderState = (
    nextItems: readonly TrajectoryItem[],
    nextOptions: TrajectoryOptions,
    nextSelectedId: string | null,
  ): void => {
    if (destroyed) return
    const model = createModel(nextItems, nextOptions, nextSelectedId)
    ui.render(model)
  }

  const render = (): void => renderState(items, options, selectedId)

  const select = (id: string | null, source: TrajectorySelectSource): boolean => {
    if (destroyed) return false
    if (id !== null && !hasItem(items, id)) return false
    if (selectedId === id) return false
    try {
      renderState(items, options, id)
    } catch (error) {
      const normalizedError = asError(error)
      ui.renderError(normalizedError)
      emit({ type: 'error', error: normalizedError })
      return false
    }
    selectedId = id
    emit({
      type: 'select',
      itemId: selectedId,
      source,
      item: selectedId === null ? undefined : items.find((item) => item.id === selectedId),
    })
    return true
  }

  const handleUISelect = (id: string, source: TrajectorySelectSource): void => {
    const previous = selectedId
    const changed = select(id, source)
    if (!changed && previous === id) {
      const item = items.find((candidate) => candidate.id === id)
      emit({ type: 'select', itemId: id, source, item })
    }
  }

  const ui: TrajectoryUI = createTrajectoryUI({ document, onSelect: handleUISelect })
  input.container.append(ui.host)

  try {
    render()
  } catch (error) {
    ui.destroy()
    throw error
  }

  const instance: TrajectoryInstance = {
    setItems(nextItems): void {
      if (destroyed) return
      if (!Array.isArray(nextItems)) {
        const error = new Error('Trajectory items must be an array')
        ui.renderError(error)
        emit({ type: 'error', error })
        return
      }
      try {
        const candidateItems = [...nextItems]
        const candidateSelectedId = hasItem(candidateItems, selectedId) ? selectedId : null
        renderState(candidateItems, options, candidateSelectedId)
        items = candidateItems
        options = { ...options, items: candidateItems }
        selectedId = candidateSelectedId
        emit({ type: 'update' })
      } catch (error) {
        const normalizedError = asError(error)
        ui.renderError(normalizedError)
        emit({ type: 'error', error: normalizedError })
      }
    },

    select(id): void {
      select(id, 'api')
    },

    clearSelection(): void {
      select(null, 'api')
    },

    getSelectedId(): string | null {
      return selectedId
    },

    updateOptions(partial: TrajectoryUpdateOptions): void {
      if (destroyed) return
      if (!partial || typeof partial !== 'object' || Array.isArray(partial)) {
        const error = new Error('Trajectory update options must be an object')
        ui.renderError(error)
        emit({ type: 'error', error })
        return
      }
      const hasOwn = (key: keyof TrajectoryUpdateOptions): boolean => Object.prototype.hasOwnProperty.call(partial, key)
      const nextOptions: TrajectoryOptions = {
        ...options,
        ...partial,
        container: options.container,
        items,
        labels: hasOwn('labels') ? partial.labels : options.labels,
        axis: hasOwn('axis') ? partial.axis : options.axis,
        messages: hasOwn('messages') ? partial.messages : options.messages,
      }
      const requestedSelectedId = partial.selectedId === undefined ? selectedId : partial.selectedId
      const nextSelectedId =
        requestedSelectedId !== null && !hasItem(items, requestedSelectedId) ? selectedId : requestedSelectedId
      const resolvedOptions: TrajectoryOptions = { ...nextOptions, selectedId: nextSelectedId }
      try {
        validateOptions(resolvedOptions)
        renderState(items, resolvedOptions, nextSelectedId ?? null)
        options = resolvedOptions
        selectedId = nextSelectedId ?? null
        emit({ type: 'update' })
      } catch (error) {
        const normalizedError = asError(error)
        ui.renderError(normalizedError)
        emit({ type: 'error', error: normalizedError })
      }
    },

    destroy(): void {
      if (destroyed) return
      destroyed = true
      ui.destroy()
    },
  }

  return instance
}

export const createTrajectory = createTrace
