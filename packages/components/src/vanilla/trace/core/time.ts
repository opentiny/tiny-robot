import type { TrajectoryAxisOptions, TrajectoryItem, TrajectoryLabelStyle, TrajectoryTime } from '../types'

export const DEFAULT_LABEL_STYLES: Record<string, TrajectoryLabelStyle> = {
  info: { text: 'info', color: '#bfdbfe', textColor: '#2563eb' },
  success: { text: 'success', color: '#bbf7d0', textColor: '#16a34a' },
  warning: { text: 'warning', color: '#fef3c7', textColor: '#a16207' },
  error: { text: 'error', color: '#fecaca', textColor: '#dc2626' },
  analysis: {
    text: 'analysis',
    color: 'linear-gradient(90deg, #ddd6fe 0%, #fbcfe8 100%)',
    textColor: 'linear-gradient(90deg, #7c3aed 0%, #db2777 100%)',
  },
}

export interface NormalizedTrajectoryItem {
  readonly item: TrajectoryItem
  readonly start: number
  readonly end: number
  readonly duration: number
  readonly visible: boolean
  readonly lane: number
  readonly left: number
  readonly width: number
  readonly label: string
  readonly message: string
  readonly color: string
  readonly textColor: string
}

export interface TrajectoryTimeModel {
  readonly start: number
  readonly end: number
  readonly total: number
  readonly laneCount: number
  readonly items: readonly NormalizedTrajectoryItem[]
}

export function toTimestamp(value: TrajectoryTime, fieldName: string): number {
  const timestamp = value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(value)
  if (!Number.isFinite(timestamp)) throw new Error(`Invalid trajectory ${fieldName}`)
  return timestamp
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value)
  try {
    const serialized = JSON.stringify(value)
    return serialized === undefined ? String(value) : serialized
  } catch {
    return String(value)
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

interface LaneState {
  readonly end: number
  readonly lane: number
  readonly zeroDuration: boolean
}

function compareLaneState(left: LaneState, right: LaneState): number {
  if (left.end !== right.end) return left.end - right.end
  if (left.zeroDuration !== right.zeroDuration) return left.zeroDuration ? 1 : -1
  return left.lane - right.lane
}

function pushLaneState(heap: LaneState[], state: LaneState): void {
  heap.push(state)
  let index = heap.length - 1
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2)
    if (compareLaneState(heap[parent], heap[index]) <= 0) break
    ;[heap[parent], heap[index]] = [heap[index], heap[parent]]
    index = parent
  }
}

function popLaneState(heap: LaneState[]): LaneState | undefined {
  if (!heap.length) return undefined
  const first = heap[0]
  const last = heap.pop()!
  if (heap.length) {
    heap[0] = last
    let index = 0
    while (true) {
      const left = index * 2 + 1
      const right = left + 1
      let smallest = index
      if (left < heap.length && compareLaneState(heap[left], heap[smallest]) < 0) smallest = left
      if (right < heap.length && compareLaneState(heap[right], heap[smallest]) < 0) smallest = right
      if (smallest === index) break
      ;[heap[index], heap[smallest]] = [heap[smallest], heap[index]]
      index = smallest
    }
  }
  return first
}

function resolveLabelStyle(
  item: TrajectoryItem,
  labels: Readonly<Record<string, TrajectoryLabelStyle>>,
): { label: string; color: string; textColor: string } {
  const style = labels[item.type] ?? DEFAULT_LABEL_STYLES[item.type] ?? { color: '#64748b' }
  const label = item.label !== undefined ? displayValue(item.label) : (style.text ?? item.type)
  return {
    label,
    color: item.color ?? style.color,
    textColor: item.textColor ?? style.textColor ?? '#ffffff',
  }
}

export function normalizeTrajectory(
  items: readonly TrajectoryItem[],
  axis: TrajectoryAxisOptions | undefined,
  labels: Readonly<Record<string, TrajectoryLabelStyle>>,
): TrajectoryTimeModel {
  const seenIds = new Set<string>()
  const parsed = items.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('Trajectory items must be objects')
    if (typeof item.id !== 'string' || !item.id) {
      throw new Error('Trajectory item id must be a non-empty string')
    }
    if (typeof item.type !== 'string') throw new Error(`Trajectory item type must be a string: ${item.id}`)
    if (seenIds.has(item.id)) throw new Error(`Duplicate trajectory item id: ${item.id}`)
    seenIds.add(item.id)
    const start = toTimestamp(item.startTime, `startTime for ${item.id}`)
    const end = toTimestamp(item.endTime, `endTime for ${item.id}`)
    if (end < start) throw new Error(`Trajectory item endTime must be >= startTime: ${item.id}`)
    return { item, start, end }
  })

  let itemStart = parsed.length ? Infinity : 0
  let itemEnd = parsed.length ? -Infinity : 0
  for (const entry of parsed) {
    if (entry.start < itemStart) itemStart = entry.start
    if (entry.end > itemEnd) itemEnd = entry.end
  }
  const axisStart = axis?.startTime === undefined ? undefined : toTimestamp(axis.startTime, 'axis startTime')
  const axisEnd = axis?.endTime === undefined ? undefined : toTimestamp(axis.endTime, 'axis endTime')
  const defaultStart = parsed.length ? itemStart : (axisEnd ?? 0)
  const defaultEnd = parsed.length ? itemEnd : (axisStart ?? 0)
  const start = axisStart ?? (axisEnd === undefined ? defaultStart : Math.min(defaultStart, axisEnd))
  const end = axisEnd ?? (axisStart === undefined ? defaultEnd : Math.max(defaultEnd, axisStart))
  if (end < start) throw new Error('Trajectory axis endTime must be >= startTime')

  const total = end - start
  const scale = total > 0 ? total : 1
  const normalized = parsed.map(({ item, start: itemStartTime, end: itemEndTime }) => {
    const visible = itemEndTime >= start && itemStartTime <= end
    const left = total > 0 ? clamp((itemStartTime - start) / scale, 0, 1) : visible ? 0.5 : 0
    const right = total > 0 ? clamp((itemEndTime - start) / scale, 0, 1) : left
    const style = resolveLabelStyle(item, labels)
    return {
      item,
      start: itemStartTime,
      end: itemEndTime,
      duration: itemEndTime - itemStartTime,
      visible,
      lane: 0,
      left,
      width: Math.max(0, right - left),
      message: displayValue(item.message),
      ...style,
    }
  })

  const availableLanes: LaneState[] = []
  const laneById = new Map<string, number>()
  let laneCount = 0
  const layoutOrder = normalized
    .filter((item) => item.visible)
    .slice()
    .sort((left, right) => left.start - right.start || left.end - right.end)

  for (const item of layoutOrder) {
    const visibleStart = Math.max(item.start, start)
    const visibleEnd = Math.min(item.end, end)
    const zeroDuration = visibleStart === visibleEnd
    const firstAvailable = availableLanes[0]
    const canReuse =
      firstAvailable &&
      (firstAvailable.end < visibleStart ||
        (firstAvailable.end === visibleStart && !firstAvailable.zeroDuration && !zeroDuration))
    const lane = canReuse ? popLaneState(availableLanes)!.lane : laneCount++
    pushLaneState(availableLanes, { end: visibleEnd, lane, zeroDuration })
    laneById.set(item.item.id, lane)
  }

  const laidOut = normalized.map((item) => (item.visible ? { ...item, lane: laneById.get(item.item.id) ?? 0 } : item))

  return { start, end, total, laneCount, items: laidOut }
}

function compactNumber(value: number): string {
  return value.toFixed(value >= 10 ? 0 : 1).replace(/\.0$/u, '')
}

export function formatDurationValue(durationMs: number): string {
  if (durationMs < 1000) return `${Math.round(durationMs)}ms`
  if (durationMs < 60_000) return `${compactNumber(durationMs / 1000)}s`
  const seconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

export function formatClockDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function formatRelativeTime(timestamp: number, startTime: number): string {
  return formatDurationValue(Math.max(0, timestamp - startTime))
}
