/** A timestamp accepted by the framework-free trace component. Numbers are milliseconds. */
export type TrajectoryTime = number | Date | string

/** One row in the single-axis trajectory. */
export interface TrajectoryItem {
  readonly id: string
  /** Semantic type used to resolve a default label style, for example `info` or `success`. */
  readonly type: string
  /** Display value for the left label. Objects and other values are stringified safely. */
  readonly label?: unknown
  /** Display value for the message column. Objects and other values are stringified safely. */
  readonly message: unknown
  readonly startTime: TrajectoryTime
  readonly endTime: TrajectoryTime
  /** CSS background value. Both colors and gradients are supported. */
  readonly color?: string
  readonly textColor?: string
  readonly meta?: Record<string, unknown>
}

export interface TrajectoryLabelStyle {
  readonly text?: string
  readonly color: string
  readonly textColor?: string
}

export interface TrajectoryAxisOptions {
  readonly startTime?: TrajectoryTime
  readonly endTime?: TrajectoryTime
}

export type TrajectoryFormatDuration = (durationMs: number, item: TrajectoryItem) => string

/** Built-in duration display styles. `none` removes the duration column. */
export type TrajectoryDurationFormat = 'compact' | 'clock' | 'none'

export interface TrajectoryMessages {
  readonly empty: string
}

export interface TrajectoryOptions {
  readonly container: HTMLElement
  readonly items: readonly TrajectoryItem[]
  readonly labels?: Readonly<Record<string, TrajectoryLabelStyle>>
  readonly axis?: TrajectoryAxisOptions
  /** Defaults to `compact`; `clock` displays HH:MM:SS; `none` hides the duration column. */
  readonly durationFormat?: TrajectoryDurationFormat
  readonly formatDuration?: TrajectoryFormatDuration
  readonly messages?: Partial<TrajectoryMessages>
  readonly selectedId?: string | null
  readonly onEvent?: (event: TrajectoryEvent) => void
}

export type TrajectoryUpdateOptions = Partial<Omit<TrajectoryOptions, 'container' | 'items'>>

export type TrajectorySelectSource = 'timeline' | 'message' | 'api'

export type TrajectoryEvent =
  | {
      readonly type: 'select'
      readonly itemId: string | null
      readonly source: TrajectorySelectSource
      readonly item?: TrajectoryItem
    }
  | { readonly type: 'update' }
  | { readonly type: 'error'; readonly error: Error }

export interface TrajectoryInstance {
  setItems: (items: readonly TrajectoryItem[]) => void
  select: (id: string | null) => void
  clearSelection: () => void
  getSelectedId: () => string | null
  updateOptions: (options: TrajectoryUpdateOptions) => void
  destroy: () => void
}
