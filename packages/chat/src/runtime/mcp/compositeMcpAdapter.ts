/** @deprecated Import MCP adapter composition from `@opentiny/tiny-robot`. */
export { createCompositeMcpAdapter } from '@opentiny/tiny-robot'
export type {
  CreateCompositeMcpAdapterOptions,
  CompositeMcpAdapter as PublicCompositeMcpAdapter,
  McpAdapter,
} from '@opentiny/tiny-robot'

import type { CompositeMcpAdapter as PublicCompositeMcpAdapter, McpAdapter } from '@opentiny/tiny-robot'

export type ChatMcpAdapter = McpAdapter
export type CompositeMcpAdapter = PublicCompositeMcpAdapter
