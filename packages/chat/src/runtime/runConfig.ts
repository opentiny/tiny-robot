import type {
  ChatComposerRuntime,
  ChatMcpRunConfig,
  ChatMcpRuntime,
  ChatMessageItem,
  ChatRunConfig,
  ChatModelOption,
} from '../types'
import { getChatModelFeatureValues } from '../modelFeatures'
import { resolveModelFeatureValues } from '@opentiny/tiny-robot'

export const CHAT_RUN_CONFIG_METADATA_KEY = 'run_config_metadata'
export const CHAT_RUN_CONFIG_CONTEXT_KEY = 'run_config_context'

export function cloneRunConfig(runConfig?: ChatRunConfig): ChatRunConfig | undefined {
  if (!runConfig) {
    return undefined
  }

  return {
    ...runConfig,
    featureValues: runConfig.featureValues ? { ...runConfig.featureValues } : undefined,
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
  const mcp = resolveMcpRunConfig(composer.mcp)

  if (!model && !mcp) {
    return undefined
  }

  return cloneRunConfig({
    modelId: model?.selectedId.value ?? undefined,
    featureValues: model ? getChatModelFeatureValues(model) : undefined,
    mcp,
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isValidFieldValue(
  field: NonNullable<ChatModelOption['fields']>[number],
  value: unknown,
): value is boolean | string {
  return field.type === 'switch'
    ? typeof value === 'boolean'
    : typeof value === 'string' && field.options.some((option) => option.value === value && !option.disabled)
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

export function readRunConfigFromMessage(
  message?: ChatMessageItem,
  resolveModel?: (modelId: string) => ChatModelOption | undefined,
): ChatRunConfig | undefined {
  const raw = message?.metadata?.[CHAT_RUN_CONFIG_METADATA_KEY]

  if (!isRecord(raw)) {
    return undefined
  }

  if (raw.modelId !== undefined && typeof raw.modelId !== 'string') {
    return undefined
  }

  if (
    raw.featureValues !== undefined &&
    (!isRecord(raw.featureValues) ||
      Object.values(raw.featureValues).some((value) => typeof value !== 'boolean' && typeof value !== 'string'))
  ) {
    return undefined
  }

  const mcp = raw.mcp === undefined ? undefined : readMcpRunConfig(raw.mcp)

  if (raw.mcp !== undefined && !mcp) {
    return undefined
  }

  let featureValues = raw.featureValues as ChatRunConfig['featureValues']
  if (featureValues === undefined && (raw.features !== undefined || raw.reasoning !== undefined)) {
    if (
      !isRecord(raw.features ?? {}) ||
      Object.values(raw.features ?? {}).some((value) => typeof value !== 'boolean') ||
      (raw.reasoning !== undefined &&
        (!isRecord(raw.reasoning) ||
          typeof raw.reasoning.enabled !== 'boolean' ||
          (raw.reasoning.effort !== undefined && (typeof raw.reasoning.effort !== 'string' || !raw.reasoning.effort))))
    ) {
      throw new Error('Invalid legacy model feature snapshot')
    }
    const model = typeof raw.modelId === 'string' ? resolveModel?.(raw.modelId) : undefined
    if (!model) throw new Error(`Cannot resolve legacy model feature snapshot: ${String(raw.modelId)}`)
    const fields = model.fields ?? []
    const features = raw.features as Record<string, boolean> | undefined
    const reasoning = raw.reasoning as { enabled: boolean; effort?: string } | undefined
    const values: Record<string, boolean | string> = {}
    if (reasoning || features?.thinking !== undefined) {
      const field = fields.find((item) => item.key === 'reasoning')
      const enabled = reasoning?.enabled ?? features?.thinking
      if (field?.type !== 'select') {
        if (enabled) throw new Error(`Cannot convert legacy thinking for model: ${model.id}`)
      } else {
        const value = enabled
          ? (reasoning?.effort ??
            (resolveModelFeatureValues([field]).reasoning !== 'off'
              ? (resolveModelFeatureValues([field]).reasoning as string)
              : field.options.find((option) => !option.disabled && option.value !== 'off')?.value))
          : 'off'
        if (value === undefined || !isValidFieldValue(field, value)) {
          throw new Error(`Cannot convert legacy thinking for model: ${model.id}`)
        }
        values.reasoning = value
      }
    }
    if (features?.search !== undefined) {
      const field = fields.find((item) => item.key === 'search')
      if (field?.type !== 'switch') {
        if (features.search) throw new Error(`Cannot convert legacy search for model: ${model.id}`)
      } else {
        values.search = features.search
      }
    }
    featureValues = values
  }

  return cloneRunConfig({
    modelId: raw.modelId as string | undefined,
    featureValues,
    mcp,
  })
}
