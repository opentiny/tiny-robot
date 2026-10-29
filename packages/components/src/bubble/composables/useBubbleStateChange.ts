import { useBubbleEventFn } from './useBubbleEvent'

export function useBubbleStateChangeFn() {
  const handleBubbleEvent = useBubbleEventFn()

  return (key: string, value: unknown) => {
    handleBubbleEvent({
      name: 'state:update',
      payload: { key, value },
    })
  }
}
