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
    if (!item.id) throw new Error('Trajectory item id must not be empty')
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
  const start = axisStart ?? (parsed.length ? itemStart : (axisEnd ?? 0))
  const end = axisEnd ?? (parsed.length ? itemEnd : (axisStart ?? 0))
  if (end < start) throw new Error('Trajectory axis endTime must be >= startTime')

  const total = end - start
  const scale = total > 0 ? total : 1
  const normalized = parsed.map(({ item, start: itemStartTime, end: itemEndTime }) => {
    const visible = itemEndTime >= start && itemStartTime <= end
    const left = clamp((itemStartTime - start) / scale, 0, 1)
    const right = clamp((itemEndTime - start) / scale, 0, 1)
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

  const laneEnds: Array<{ end: number; zeroDuration: boolean }> = []
  const laneById = new Map<string, number>()
  const layoutOrder = normalized
    .filter((item) => item.visible)
    .slice()
    .sort((left, right) => left.start - right.start || left.end - right.end)

  for (const item of layoutOrder) {
    const visibleStart = Math.max(item.start, start)
    const visibleEnd = Math.min(item.end, end)
    const zeroDuration = item.start === item.end
    let lane = laneEnds.findIndex(
      (laneState) =>
        laneState.end <= visibleStart && !(laneState.zeroDuration && zeroDuration && laneState.end === visibleStart),
    )
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = { end: visibleEnd, zeroDuration }
    laneById.set(item.item.id, lane)
  }

  const laidOut = normalized.map((item) => (item.visible ? { ...item, lane: laneById.get(item.item.id) ?? 0 } : item))

  return { start, end, total, laneCount: laneEnds.length, items: laidOut }
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
