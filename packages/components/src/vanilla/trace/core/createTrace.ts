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
  if (!input.container || input.container.nodeType !== 1) {
    throw new Error('Trajectory requires an HTMLElement container')
  }
  if (!Array.isArray(input.items)) throw new Error('Trajectory items must be an array')
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
  validateOptions(input)
  const document = input.container.ownerDocument
  let options: TrajectoryOptions = { ...input, items: [...input.items] }
  let items: readonly TrajectoryItem[] = [...input.items]
  let selectedId = hasItem(items, input.selectedId ?? null) ? (input.selectedId ?? null) : null
  let destroyed = false

  const emit = (event: TrajectoryEvent): void => emitSafely(options.onEvent, event)

  const render = (): void => {
    if (destroyed) return
    const model = createModel(items, options, selectedId)
    ui.render(model)
  }

  const select = (id: string | null, source: TrajectorySelectSource): void => {
    if (destroyed) return
    if (id !== null && !hasItem(items, id)) return
    if (selectedId === id) return
    selectedId = id
    render()
    emit({
      type: 'select',
      itemId: selectedId,
      source,
      item: selectedId === null ? undefined : items.find((item) => item.id === selectedId),
    })
  }

  const handleUISelect = (id: string, source: TrajectorySelectSource): void => {
    const previous = selectedId
    select(id, source)
    if (previous === id) {
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
        createModel(nextItems, options, selectedId)
        items = [...nextItems]
        if (!hasItem(items, selectedId)) selectedId = null
        render()
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
      const nextOptions: TrajectoryOptions = {
        ...options,
        ...partial,
        labels: partial.labels ? { ...(options.labels ?? {}), ...partial.labels } : options.labels,
        axis: partial.axis ? { ...(options.axis ?? {}), ...partial.axis } : options.axis,
        messages: partial.messages ? { ...(options.messages ?? {}), ...partial.messages } : options.messages,
      }
      const requestedSelectedId = partial.selectedId === undefined ? selectedId : partial.selectedId
      const nextSelectedId =
        requestedSelectedId !== null && !hasItem(items, requestedSelectedId) ? selectedId : requestedSelectedId
      const resolvedOptions: TrajectoryOptions = { ...nextOptions, selectedId: nextSelectedId }
      try {
        createModel(items, resolvedOptions, nextSelectedId ?? null)
        options = resolvedOptions
        selectedId = nextSelectedId ?? null
        render()
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
