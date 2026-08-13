import type {
  ChatComposerRuntime,
  ChatMcpRunConfig,
  ChatMcpRuntime,
  ChatMessageItem,
  ChatRunConfig,
  ChatRunConfigReasoning,
} from '../types'
import { CHAT_REASONING_EFFORTS } from '../types/runtime'

export const CHAT_RUN_CONFIG_METADATA_KEY = 'run_config_metadata'
export const CHAT_RUN_CONFIG_CONTEXT_KEY = 'run_config_context'

export function cloneRunConfig(runConfig?: ChatRunConfig): ChatRunConfig | undefined {
  if (!runConfig) {
    return undefined
  }

  return {
    ...runConfig,
    features: runConfig.features ? { ...runConfig.features } : undefined,
    reasoning: runConfig.reasoning ? { ...runConfig.reasoning } : undefined,
    mcp: runConfig.mcp
      ? {
          serverIds: [...runConfig.mcp.serverIds],
          toolIds: Object.fromEntries(
            Object.entries(runConfig.mcp.toolIds).map(([serverId, toolIds]) => [serverId, [...toolIds]]),
          ),
        }
      : undefined,
  }
}

function getEnabledMcpServers(mcp?: ChatMcpRuntime) {
  return mcp?.servers.value.filter((server) => server.installed && server.enabled) ?? []
}

export function areEnabledMcpToolsReady(mcp?: ChatMcpRuntime) {
  if (!mcp) {
    return true
  }

  return getEnabledMcpServers(mcp).every(
    (server) => !server.loading && Object.prototype.hasOwnProperty.call(mcp.tools.value, server.id),
  )
}

function resolveMcpRunConfig(mcp?: ChatMcpRuntime): ChatMcpRunConfig | undefined {
  if (mcp === undefined) {
    return undefined
  }
  const servers = getEnabledMcpServers(mcp)

  if (servers.length === 0 || !areEnabledMcpToolsReady(mcp)) {
    return undefined
  }

  return {
    serverIds: servers.map((server) => server.id),
    toolIds: Object.fromEntries(
      servers.map((server) => [
        server.id,
        (mcp.tools.value[server.id] ?? []).filter((tool) => tool.enabled).map((tool) => tool.id),
      ]),
    ),
  }
}

export function resolveComposerRunConfig(composer: ChatComposerRuntime): ChatRunConfig | undefined {
  const model = composer.model
  const reasoning = composer.model?.reasoning?.value
  const mcp = resolveMcpRunConfig(composer.mcp)

  if (!model && !reasoning && !mcp) {
    return undefined
  }

  return cloneRunConfig({
    modelId: model?.selectedId.value ?? undefined,
    features: model ? { ...model.features.value } : undefined,
    reasoning,
    mcp,
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function readMcpRunConfig(value: unknown): ChatMcpRunConfig | undefined {
  if (!isRecord(value) || !Array.isArray(value.serverIds) || !isRecord(value.toolIds)) {
    return undefined
  }

  if (!value.serverIds.every((serverId) => typeof serverId === 'string' && serverId.length > 0)) {
    return undefined
  }

  const serverIds = value.serverIds as string[]
  const serverIdSet = new Set(serverIds)

  if (serverIdSet.size !== serverIds.length) {
    return undefined
  }

  const toolIds = Object.entries(value.toolIds)

  if (
    toolIds.length !== serverIds.length ||
    !toolIds.every(
      ([serverId, ids]) =>
        serverIdSet.has(serverId) &&
        Array.isArray(ids) &&
        ids.every((id) => typeof id === 'string' && id.length > 0) &&
        new Set(ids).size === ids.length,
    )
  ) {
    return undefined
  }

  if (serverIds.some((serverId) => !Object.prototype.hasOwnProperty.call(value.toolIds, serverId))) {
    return undefined
  }

  return {
    serverIds: [...serverIds],
    toolIds: Object.fromEntries(toolIds.map(([serverId, ids]) => [serverId, [...(ids as string[])]])),
  }
}

export function readRunConfigFromMessage(message?: ChatMessageItem): ChatRunConfig | undefined {
  const raw = message?.metadata?.[CHAT_RUN_CONFIG_METADATA_KEY]

  if (!isRecord(raw)) {
    return undefined
  }

  if (raw.modelId !== undefined && typeof raw.modelId !== 'string') {
    return undefined
  }

  if (
    raw.features !== undefined &&
    (!isRecord(raw.features) || Object.values(raw.features).some((enabled) => typeof enabled !== 'boolean'))
  ) {
    return undefined
  }

  let reasoning: ChatRunConfig['reasoning']

  if (raw.reasoning !== undefined) {
    if (
      !isRecord(raw.reasoning) ||
      typeof raw.reasoning.enabled !== 'boolean' ||
      (raw.reasoning.effort !== undefined &&
        (typeof raw.reasoning.effort !== 'string' || !CHAT_REASONING_EFFORTS.includes(raw.reasoning.effort as never)))
    ) {
      return undefined
    }

    reasoning = {
      enabled: raw.reasoning.enabled,
      effort: raw.reasoning.effort as ChatRunConfigReasoning['effort'],
    }
  }

  const mcp = raw.mcp === undefined ? undefined : readMcpRunConfig(raw.mcp)

  if (raw.mcp !== undefined && !mcp) {
    return undefined
  }

  return cloneRunConfig({
    modelId: raw.modelId as string | undefined,
    features: raw.features as Readonly<Record<string, boolean>> | undefined,
    reasoning,
    mcp,
  })
}
