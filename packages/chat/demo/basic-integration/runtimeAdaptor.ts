import { computed, reactive, ref } from 'vue'
import type { ChatModelOption, ChatModelRuntime, ChatRunConfig, ChatRuntime } from '../../src/types'
import { useMcp } from './useMcp'

type FeatureId = 'thinking' | 'search'

type ModelDefinition = Omit<ChatModelOption, 'capabilities'> & {
  capabilities: Partial<Record<FeatureId, true>>
  requestModel: string
  provider: string
}

const modelDefinitions: readonly ModelDefinition[] = [
  {
    id: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    requestModel: 'deepseek-v4-flash',
    provider: 'deepseek',
    capabilities: {},
  },
  {
    id: 'deepseek-v4-pro',
    label: 'DeepSeek V4 Pro',
    requestModel: 'deepseek-v4-pro',
    provider: 'deepseek',
    capabilities: {
      thinking: true,
    },
  },
]

export function useRuntimeAdaptor() {
  const mcpBridge = useMcp()
  const selectedModelId = ref<string | null>(modelDefinitions[0]?.id ?? null)
  const featureState = reactive<Record<FeatureId, boolean>>({
    thinking: false,
    search: false,
  })

  const selectedModel = computed(() => modelDefinitions.find((item) => item.id === selectedModelId.value))
  const reasoning = computed(() => ({
    enabled: Boolean(selectedModel.value?.capabilities.thinking && featureState.thinking),
    effort: selectedModel.value?.capabilities.thinking && featureState.thinking ? ('high' as const) : undefined,
  }))

  const model: ChatModelRuntime = {
    options: computed<readonly ChatModelOption[]>(() =>
      modelDefinitions.map(({ id, label, capabilities }) => ({
        id,
        label,
        capabilities,
      })),
    ),

    selectedId: computed(() => selectedModelId.value),

    select(id) {
      if (id !== null && !modelDefinitions.some((item) => item.id === id)) {
        throw new Error(`Unknown model: ${id}`)
      }

      selectedModelId.value = id
    },

    features: computed(() => ({
      thinking: Boolean(selectedModel.value?.capabilities.thinking && featureState.thinking),
      search: Boolean(selectedModel.value?.capabilities.search && featureState.search),
    })),

    setFeature(id, enabled) {
      if (id !== 'thinking' && id !== 'search') {
        throw new Error(`Unknown model feature: ${id}`)
      }

      if (enabled && !selectedModel.value?.capabilities[id]) {
        throw new Error(`Current model does not support ${id}`)
      }

      featureState[id] = enabled
    },
  }

  const enabledMcpServers = computed(() =>
    mcpBridge.mcp.servers.value.filter((server) => server.installed && server.enabled),
  )
  const mcpToolsReady = computed(() =>
    enabledMcpServers.value.every(
      (server) => !server.loading && Object.prototype.hasOwnProperty.call(mcpBridge.mcp.tools.value, server.id),
    ),
  )

  const runConfig = computed<Readonly<ChatRunConfig>>(() => {
    const serverIds = enabledMcpServers.value.map((server) => server.id)

    return {
      modelId: model.selectedId.value ?? undefined,
      mcp:
        serverIds.length > 0 && mcpToolsReady.value
          ? {
              serverIds,
              toolIds: Object.fromEntries(
                serverIds.map((serverId) => [
                  serverId,
                  (mcpBridge.mcp.tools.value[serverId] ?? []).filter((tool) => tool.enabled).map((tool) => tool.id),
                ]),
              ),
            }
          : undefined,
      features: { ...model.features.value },
      reasoning: reasoning.value,
    }
  })

  const composer: ChatRuntime['composer'] = {
    disabled: computed(() => enabledMcpServers.value.length > 0 && !mcpToolsReady.value),
    model,
    mcp: mcpBridge.mcp,
    runConfig,
  }

  return {
    composer,
    model,
    mcp: mcpBridge.mcp,
    resolveModel(modelId: string) {
      return modelDefinitions.find((item) => item.id === modelId)
    },
    listTools: mcpBridge.listTools,
    callTool: mcpBridge.callTool,
  }
}
