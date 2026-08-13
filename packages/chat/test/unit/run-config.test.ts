import { describe, expect, it } from 'vitest'
import { shallowRef } from 'vue'
import {
  areEnabledMcpToolsReady,
  cloneRunConfig,
  readRunConfigFromMessage,
  resolveComposerRunConfig,
} from '../../src/runtime/runConfig'
import { CHAT_REASONING_EFFORTS } from '../../src/types/runtime'

function createComposer() {
  const features = shallowRef({ thinking: true, search: false })
  const servers = shallowRef([
    { id: 'server-a', name: 'Server A', installed: true, enabled: true, loading: false },
    { id: 'server-b', name: 'Server B', installed: false, enabled: true },
  ])
  const tools = shallowRef({ 'server-a': [{ id: 'tool-a', name: 'Tool A', enabled: true }] })

  return {
    composer: {
      model: {
        options: shallowRef([{ id: 'model-a', label: 'Model A' }]),
        selectedId: shallowRef<string | null>('model-a'),
        features,
        reasoning: shallowRef({ enabled: true, effort: 'high' as const }),
        select: () => {},
        setFeature: () => {},
      },
      mcp: {
        servers,
        tools,
        addServer: () => {},
        removeServer: () => {},
        setServerEnabled: () => {},
        setToolEnabled: () => {},
      },
    },
    features,
    servers,
    tools,
  }
}

describe('runConfig', () => {
  it('derives reasoning efforts from the shared constant', () => {
    expect(CHAT_REASONING_EFFORTS).toEqual(['low', 'medium', 'high', 'max'])
  })
  it('resolves model, reasoning and enabled MCP state', () => {
    const fixture = createComposer()
    const config = resolveComposerRunConfig(fixture.composer)

    expect(config).toEqual({
      modelId: 'model-a',
      features: { thinking: true, search: false },
      reasoning: { enabled: true, effort: 'high' },
      mcp: { serverIds: ['server-a'], toolIds: { 'server-a': ['tool-a'] } },
    })
  })

  it('clones config state and isolates later changes', () => {
    const fixture = createComposer()
    const config = resolveComposerRunConfig(fixture.composer)
    fixture.features.value.thinking = false
    fixture.servers.value[0].enabled = false

    expect(config?.features?.thinking).toBe(true)
    expect(config?.mcp?.serverIds).toEqual(['server-a'])
  })

  it('deep clones an existing config', () => {
    const source = {
      modelId: 'model-a',
      features: { thinking: true },
      reasoning: { enabled: true, effort: 'high' as const },
      mcp: { serverIds: ['server-a'], toolIds: { 'server-a': ['tool-a'] } },
    }
    const cloned = cloneRunConfig(source)
    source.features.thinking = false
    source.mcp?.serverIds.push('server-b')
    source.mcp?.toolIds['server-a'].push('tool-b')

    expect(cloned).toEqual({
      modelId: 'model-a',
      features: { thinking: true },
      reasoning: { enabled: true, effort: 'high' },
      mcp: { serverIds: ['server-a'], toolIds: { 'server-a': ['tool-a'] } },
    })
  })

  it('does not produce MCP config before enabled server tools are ready', () => {
    const fixture = createComposer()
    fixture.servers.value[0].loading = true
    expect(areEnabledMcpToolsReady(fixture.composer.mcp)).toBe(false)
    expect(resolveComposerRunConfig(fixture.composer)?.mcp).toBeUndefined()
  })

  it('accepts valid message metadata and returns an independent copy', () => {
    const message = {
      metadata: {
        run_config_metadata: {
          modelId: 'model-a',
          features: { thinking: true },
          reasoning: { enabled: true, effort: 'high' },
          mcp: { serverIds: ['server-a'], toolIds: { 'server-a': ['tool-a'] } },
        },
      },
    }
    const config = readRunConfigFromMessage(message)
    message.metadata.run_config_metadata.features.thinking = false

    expect(config?.features?.thinking).toBe(true)
  })

  it.each([
    { modelId: 1 },
    { features: { thinking: 'yes' } },
    { reasoning: { enabled: 'yes' } },
    { mcp: { serverIds: ['server-a', 'server-a'], toolIds: { 'server-a': [] } } },
    { mcp: { serverIds: ['server-a'], toolIds: { 'server-a': [''] } } },
    { mcp: { serverIds: ['server-a'], toolIds: {} } },
  ])('rejects invalid metadata %#', (metadata) => {
    expect(readRunConfigFromMessage({ metadata: { run_config_metadata: metadata } })).toBeUndefined()
  })
})
