import type { MessageEnginePlugin, MessageRequestBody } from '../types'

// Internal hook for deterministic projection of stored messages without enabling plugin work.
export const projectRequestWhenDisabled = Symbol.for('tiny-robot.projectRequestWhenDisabled')

export type RequestProjectionPlugin = MessageEnginePlugin & {
  [projectRequestWhenDisabled]?: (requestBody: MessageRequestBody) => void
}
