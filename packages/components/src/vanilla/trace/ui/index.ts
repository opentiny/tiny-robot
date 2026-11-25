import type { NormalizedTrajectoryItem, TrajectoryTimeModel } from '../core/time'
import type { TrajectoryDurationFormat, TrajectoryMessages, TrajectorySelectSource } from '../types'
import { bindVanillaTheme } from '../../theme/service'

export interface TrajectoryRenderModel {
  readonly time: TrajectoryTimeModel
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
  segment.style.top = `${item.lane * 22}px`
  segment.style.left = `${item.left * 100}%`
  segment.style.height = '18px'
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
  const laneCount = Math.max(1, model.time.laneCount)
  track.style.height = `${laneCount * 18 + Math.max(0, laneCount - 1) * 4}px`
  for (const item of model.time.items) {
    if (item.visible) track.append(renderSegment(document, item, item.item.id === model.selectedId))
  }
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

  row.append(label, message)
  if (model.durationFormat !== 'none') {
    const duration = createElement(document, 'span', 'tr-trajectory__duration')
    setText(duration, model.formatDuration(item.duration, item.item))
    row.append(duration)
  }
  return row
}

function renderList(document: Document, model: TrajectoryRenderModel): HTMLElement {
  const list = createElement(document, 'div', 'tr-trajectory__list')
  list.classList.toggle('is-no-duration', model.durationFormat === 'none')
  for (const item of model.time.items) list.append(renderItem(document, item, model))
  return list
}

function getFocusedTarget(document: Document, host: HTMLElement): { id: string; source: string } | undefined {
  const active = document.activeElement
  if (!active || active.nodeType !== 1 || !host.contains(active)) return undefined
  const element = active as HTMLElement
  const id = element.dataset.trTrajectoryId
  const source = element.dataset.trTrajectorySource
  return id && source ? { id, source } : undefined
}

function restoreFocus(host: HTMLElement, target: { id: string; source: string } | undefined): void {
  if (!target) return
  const element = Array.from(host.querySelectorAll<HTMLElement>('[data-tr-trajectory-id]')).find(
    (candidate) =>
      candidate.dataset.trTrajectoryId === target.id && candidate.dataset.trTrajectorySource === target.source,
  )
  element?.focus()
}

export function createTrajectoryUI(options: {
  document: Document
  onSelect: (id: string, source: TrajectorySelectSource) => void
}): TrajectoryUI {
  const host = createElement(options.document, 'div', 'tr-trajectory')
  host.dataset.trTrajectory = ''
  let releaseTheme: (() => void) | undefined
  releaseTheme = bindVanillaTheme(host, options.document)
  let destroyed = false

  const handleClick = (event: MouseEvent): void => {
    if (destroyed) return
    const targetNode = event.target
    if (!targetNode) return
    const targetElement = targetNode as Element
    if (targetElement.nodeType !== 1) return
    const target = targetElement.closest<HTMLElement>('[data-tr-trajectory-id]')
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
      const focusedTarget = getFocusedTarget(options.document, host)
      if (!model.time.items.length) {
        const empty = createElement(options.document, 'div', 'tr-trajectory__empty')
        setText(empty, model.messages.empty)
        host.replaceChildren(empty)
        return
      }
      host.replaceChildren(renderTimeline(options.document, model), renderList(options.document, model))
      restoreFocus(host, focusedTarget)
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
      releaseTheme?.()
      releaseTheme = undefined
      host.remove()
    },
  }

  return controller
}
