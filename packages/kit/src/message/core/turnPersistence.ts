import type { RequestProcessingState } from '../types'

export const TURN_STATE_STORAGE_KEY = '__tiny-robot-turn'
const TURN_STATE_VERSION = 1

export interface PersistedTurnSnapshot {
  /**
   * Runtime metadata only. Conversation messages stay in the conversation storage
   * and are supplied again as initialMessages when the engine is recreated.
   */
  version: typeof TURN_STATE_VERSION
  turnId: string
  requestState: 'paused'
  processingState?: RequestProcessingState
  toolCallIds: string[]
  customContext: Record<string, unknown>
  pausedAt: number
}

interface PersistedTurnStorage {
  version: typeof TURN_STATE_VERSION
  turns: PersistedTurnSnapshot[]
}

const getLocalStorage = (): Storage | undefined => {
  try {
    if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
      return undefined
    }

    return globalThis.localStorage
  } catch {
    return undefined
  }
}

const toSerializable = (value: unknown, ancestors: WeakSet<object> = new WeakSet()): unknown => {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'function' || typeof value === 'symbol') {
    return undefined
  }

  if (typeof value !== 'object') {
    return value
  }

  if (ancestors.has(value)) {
    return undefined
  }

  ancestors.add(value)

  let result: unknown
  if (Array.isArray(value)) {
    result = value.map((item) => toSerializable(item, ancestors))
  } else {
    const objectResult: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      const serializableItem = toSerializable(item, ancestors)
      if (serializableItem !== undefined) {
        objectResult[key] = serializableItem
      }
    }
    result = objectResult
  }

  ancestors.delete(value)
  return result
}

const serialize = <T>(value: T): T | undefined => {
  try {
    const serializableValue = toSerializable(value)
    return serializableValue === undefined ? undefined : (JSON.parse(JSON.stringify(serializableValue)) as T)
  } catch {
    return undefined
  }
}

const parsePersistedTurnStorage = (value: string | null): PersistedTurnStorage => {
  if (!value) {
    return { version: TURN_STATE_VERSION, turns: [] }
  }

  try {
    const parsed = JSON.parse(value) as Partial<PersistedTurnStorage>
    if (parsed.version !== TURN_STATE_VERSION || !Array.isArray(parsed.turns)) {
      return { version: TURN_STATE_VERSION, turns: [] }
    }

    const turns = parsed.turns.filter((turn): turn is PersistedTurnSnapshot => {
      return Boolean(
        turn &&
        turn.version === TURN_STATE_VERSION &&
        typeof turn.turnId === 'string' &&
        turn.requestState === 'paused' &&
        Array.isArray(turn.toolCallIds) &&
        turn.customContext &&
        typeof turn.customContext === 'object' &&
        typeof turn.pausedAt === 'number',
      )
    })

    return { version: TURN_STATE_VERSION, turns }
  } catch {
    return { version: TURN_STATE_VERSION, turns: [] }
  }
}

const writePersistedTurnStorage = (turnStorage: PersistedTurnStorage) => {
  const storage = getLocalStorage()
  if (!storage) {
    return
  }

  try {
    storage.setItem(TURN_STATE_STORAGE_KEY, JSON.stringify(turnStorage))
  } catch {
    // Persistence is best effort. A full or unavailable localStorage must not break messaging.
  }
}

export const loadTurnSnapshots = (): PersistedTurnSnapshot[] => {
  const storage = getLocalStorage()
  if (!storage) {
    return []
  }

  try {
    return parsePersistedTurnStorage(storage.getItem(TURN_STATE_STORAGE_KEY)).turns
  } catch {
    return []
  }
}

export const saveTurnSnapshot = (snapshot: PersistedTurnSnapshot): void => {
  const serializedSnapshot = serialize(snapshot)
  if (!serializedSnapshot) {
    return
  }

  const storage = getLocalStorage()
  if (!storage) {
    return
  }

  let storedValue: string | null = null
  try {
    storedValue = storage.getItem(TURN_STATE_STORAGE_KEY)
  } catch {
    return
  }

  const turnStorage = parsePersistedTurnStorage(storedValue)
  const existingIndex = turnStorage.turns.findIndex((turn) => turn.turnId === snapshot.turnId)

  if (existingIndex === -1) {
    turnStorage.turns.push(serializedSnapshot)
  } else {
    turnStorage.turns[existingIndex] = serializedSnapshot
  }

  writePersistedTurnStorage(turnStorage)
}

export const clearTurnSnapshot = (turnId: string): void => {
  const storage = getLocalStorage()
  if (!storage) {
    return
  }

  let storedValue: string | null = null
  try {
    storedValue = storage.getItem(TURN_STATE_STORAGE_KEY)
  } catch {
    return
  }

  const turnStorage = parsePersistedTurnStorage(storedValue)
  const turns = turnStorage.turns.filter((turn) => turn.turnId !== turnId)

  if (turns.length === turnStorage.turns.length) {
    return
  }

  if (turns.length === 0) {
    try {
      storage.removeItem(TURN_STATE_STORAGE_KEY)
    } catch {
      // Persistence is best effort.
    }
    return
  }

  writePersistedTurnStorage({ ...turnStorage, turns })
}

export const serializeTurnData = <T>(value: T): T => {
  return serialize(value) ?? ({} as T)
}
