import type { NormalizedTrajectoryItem, TrajectoryTimeModel } from '../core/time'
import type {
  TrajectoryAxisOptions,
  TrajectoryDurationFormat,
  TrajectoryMessages,
  TrajectorySelectSource,
} from '../types'

export interface TrajectoryRenderModel {
  readonly time: TrajectoryTimeModel
  readonly axis: TrajectoryAxisOptions | undefined
  readonly selectedId: string | null
  readonly durationFormat: TrajectoryDurationFormat
  readonly messages: TrajectoryMessages
  readonly formatDuration: (durationMs: number, item: NormalizedTrajectoryItem['item']) => string
}

export interface TrajectoryUI {
  readonly host: HTMLElement
  render: (model: TrajectoryRenderModel) => void
  renderError: (error: Error) => void
  destroy: () => void
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  document: Document,
  tagName: K,
  className: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName)
  element.className = className
  return element
}

function setText(element: HTMLElement, value: string): void {
  element.textContent = value
  element.title = value
}

function isGradient(value: string): boolean {
  return /gradient\(/iu.test(value)
}

function renderSegment(document: Document, item: NormalizedTrajectoryItem, selected: boolean): HTMLButtonElement {
  const segment = createElement(document, 'button', 'tr-trajectory__segment')
  segment.type = 'button'
  segment.dataset.trTrajectoryId = item.item.id
  segment.dataset.trTrajectorySource = 'timeline'
  segment.style.left = `${item.left * 100}%`
  segment.style.width = item.width > 0 ? `${item.width * 100}%` : '4px'
  segment.style.background = item.color
  segment.title = `${item.label} · ${item.message}`
  segment.setAttribute('aria-label', `${item.label}: ${item.message}`)
  segment.setAttribute('aria-pressed', String(selected))
  segment.classList.toggle('is-selected', selected)
  return segment
}

function renderTimeline(document: Document, model: TrajectoryRenderModel): HTMLElement {
  const section = createElement(document, 'section', 'tr-trajectory__axis')
  section.setAttribute('aria-label', 'Trajectory timeline')

  const track = createElement(document, 'div', 'tr-trajectory__track')
  for (const item of model.time.items) track.append(renderSegment(document, item, item.item.id === model.selectedId))
  section.append(track)
  return section
}

function renderItem(
  document: Document,
  item: NormalizedTrajectoryItem,
  model: TrajectoryRenderModel,
): HTMLButtonElement {
  const selected = item.item.id === model.selectedId
  const row = createElement(document, 'button', 'tr-trajectory__item')
  row.type = 'button'
  row.dataset.trTrajectoryId = item.item.id
  row.dataset.trTrajectorySource = 'message'
  row.setAttribute('aria-pressed', String(selected))
  row.classList.toggle('is-selected', selected)

  const label = createElement(document, 'span', 'tr-trajectory__label')
  label.title = item.label
  label.style.background = item.color

  const labelText = createElement(document, 'span', 'tr-trajectory__label-text')
  setText(labelText, item.label)
  if (isGradient(item.textColor)) {
    labelText.style.backgroundImage = item.textColor
    labelText.style.backgroundClip = 'text'
    labelText.style.webkitBackgroundClip = 'text'
    labelText.style.color = 'transparent'
    labelText.style.webkitTextFillColor = 'transparent'
  } else {
    labelText.style.color = item.textColor
  }
  label.append(labelText)

  const message = createElement(document, 'span', 'tr-trajectory__message')
  setText(message, item.message)

  const duration = createElement(document, 'span', 'tr-trajectory__duration')
  setText(duration, model.formatDuration(item.duration, item.item))

  row.append(label, message)
  if (model.durationFormat !== 'none') row.append(duration)
  return row
}

function renderList(document: Document, model: TrajectoryRenderModel): HTMLElement {
  const list = createElement(document, 'div', 'tr-trajectory__list')
  list.classList.toggle('is-no-duration', model.durationFormat === 'none')
  for (const item of model.time.items) list.append(renderItem(document, item, model))
  return list
}

export function createTrajectoryUI(options: {
  document: Document
  onSelect: (id: string, source: TrajectorySelectSource) => void
}): TrajectoryUI {
  const host = createElement(options.document, 'div', 'tr-trajectory')
  host.dataset.trTrajectory = ''
  let destroyed = false

  const handleClick = (event: MouseEvent): void => {
    if (destroyed) return
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-tr-trajectory-id]') : null
    if (!target || !host.contains(target)) return
    const id = target.dataset.trTrajectoryId
    const source = target.dataset.trTrajectorySource
    if (!id || (source !== 'timeline' && source !== 'message')) return
    options.onSelect(id, source)
  }

  host.addEventListener('click', handleClick)

  const controller: TrajectoryUI = {
    host,

    render(model): void {
      if (destroyed) return
      if (!model.time.items.length) {
        const empty = createElement(options.document, 'div', 'tr-trajectory__empty')
        setText(empty, model.messages.empty)
        host.replaceChildren(empty)
        return
      }
      host.replaceChildren(renderTimeline(options.document, model), renderList(options.document, model))
    },

    renderError(error): void {
      if (destroyed) return
      const message = createElement(options.document, 'div', 'tr-trajectory__error')
      setText(message, error.message)
      host.replaceChildren(message)
    },

    destroy(): void {
      if (destroyed) return
      destroyed = true
      host.removeEventListener('click', handleClick)
      host.remove()
    },
  }

  return controller
}
