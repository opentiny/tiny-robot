import { shallowRef } from 'vue'
import { createSharedComposable, useTimeoutFn } from '@vueuse/core'
import type { ChatMessageItem } from '../../types'

export const useChatTimestampDate = createSharedComposable(() => {
  const today = shallowRef(new Date())
  const { start } = useTimeoutFn(
    () => {
      today.value = new Date()
      start()
    },
    () => new Date(today.value.getFullYear(), today.value.getMonth(), today.value.getDate() + 1).getTime() - Date.now(),
  )
  return today
})

export function formatChatMessageTimestamp(timestamp: number, now = new Date()): string | undefined {
  if (!Number.isFinite(timestamp)) return
  const date = new Date(timestamp * 1000)
  if (!Number.isFinite(date.getTime())) return

  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return time
  }

  const dateLabel =
    date.getFullYear() === now.getFullYear()
      ? `${date.getMonth() + 1}月${date.getDate()}日`
      : `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  return `${dateLabel} ${time}`
}

export function resolveChatMessageTimestamp(
  message: ChatMessageItem,
  format?: (timestamp: number, context: { message: ChatMessageItem }) => string | undefined,
  now = new Date(),
) {
  if (!message) return
  if (message.role !== 'assistant' || message.streamState !== 'finished') return
  const timestamp = message.metadata?.completedAt
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return
  const date = new Date(timestamp * 1000)
  if (!Number.isFinite(date.getTime())) return
  try {
    const label = format ? format(timestamp, { message }) : formatChatMessageTimestamp(timestamp, now)
    if (typeof label !== 'string' || !label.trim()) return
    return { timestamp: date.toISOString(), label }
  } catch {
    return
  }
}
