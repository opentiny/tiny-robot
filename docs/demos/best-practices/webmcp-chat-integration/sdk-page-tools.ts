import { initializeBuiltinWebMCP } from '@opentiny/next-sdk'
import { ref, type Ref } from 'vue'
import type { WebMcpContext, WebMcpToolDescriptor } from '@opentiny/tiny-robot'

type SdkToolContext = WebMcpContext & {
  registerTool: (
    definition: {
      name: string
      description?: string
      inputSchema?: unknown
      execute: (args: Record<string, unknown>) => Promise<unknown>
    },
    options?: { signal?: AbortSignal },
  ) => unknown
}

interface SharedRegistration {
  controller: AbortController
  refs: number
  listeners: Set<(cause: unknown) => void>
}

interface ContextRegistry {
  section: Ref<string>
  registrations: Map<string, SharedRegistration>
}

const GLOBAL_STATE_KEY = '__opentinyTinyRobotWebMcpSdkDemoState__'
const globalState = (() => {
  const target = globalThis as typeof globalThis & { [key: string]: unknown }
  const existing = target[GLOBAL_STATE_KEY] as { contexts: WeakMap<object, ContextRegistry> } | undefined
  if (existing) return existing

  const created = { contexts: new WeakMap<object, ContextRegistry>() }
  target[GLOBAL_STATE_KEY] = created
  return created
})()

function getContextRegistry(context: SdkToolContext) {
  const existing = globalState.contexts.get(context)
  if (existing) return existing

  const registry: ContextRegistry = {
    section: ref('overview'),
    registrations: new Map(),
  }
  globalState.contexts.set(context, registry)
  return registry
}

function readContext() {
  return (document as Document & { modelContext?: SdkToolContext }).modelContext
}

function acquireRegistration(
  context: SdkToolContext,
  descriptor: WebMcpToolDescriptor,
  execute: (args: Record<string, unknown>) => Promise<unknown>,
  onError: (cause: unknown) => void,
) {
  const registry = getContextRegistry(context)
  const existing = registry.registrations.get(descriptor.name)
  if (existing) {
    existing.refs += 1
    existing.listeners.add(onError)
    return () => releaseRegistration(registry, descriptor.name, existing, onError)
  }

  const entry: SharedRegistration = {
    controller: new AbortController(),
    refs: 1,
    listeners: new Set([onError]),
  }
  registry.registrations.set(descriptor.name, entry)

  const handleError = (cause: unknown) => {
    if (entry.controller.signal.aborted) return
    if (registry.registrations.get(descriptor.name) === entry) registry.registrations.delete(descriptor.name)
    entry.listeners.forEach((listener) => listener(cause))
  }

  try {
    const registration = context.registerTool(
      {
        name: descriptor.name,
        description: descriptor.description,
        inputSchema: descriptor.inputSchema,
        execute,
      },
      { signal: entry.controller.signal },
    )
    void Promise.resolve(registration).catch(handleError)
  } catch (cause) {
    handleError(cause)
    throw cause
  }

  return () => releaseRegistration(registry, descriptor.name, entry, onError)
}

function releaseRegistration(
  registry: ContextRegistry,
  name: string,
  entry: SharedRegistration,
  onError: (cause: unknown) => void,
) {
  if (registry.registrations.get(name) !== entry) return
  entry.listeners.delete(onError)
  entry.refs -= 1
  if (entry.refs > 0) return
  registry.registrations.delete(name)
  entry.controller.abort()
}

export function createSdkPageTools() {
  initializeBuiltinWebMCP()

  const context = readContext()
  if (!context) throw new Error('WebMCP modelContext is unavailable')
  const registry = getContextRegistry(context)
  const section = registry.section
  const statusToolAdded = ref(false)
  const registrationError = ref<string | undefined>()
  const releases = new Map<string, () => void>()
  const tools = new Map<string, WebMcpToolDescriptor>()

  function getErrorMessage(cause: unknown) {
    return cause instanceof Error ? cause.message : String(cause)
  }

  function removeRegistration(name: string) {
    releases.get(name)?.()
    releases.delete(name)
    tools.delete(name)
    if (name === 'get-demo-status') statusToolAdded.value = false
  }

  function register(descriptor: WebMcpToolDescriptor, execute: (args: Record<string, unknown>) => Promise<unknown>) {
    registrationError.value = undefined
    const release = acquireRegistration(context, descriptor, execute, (cause) => {
      removeRegistration(descriptor.name)
      registrationError.value = getErrorMessage(cause)
    })
    releases.set(descriptor.name, release)
    tools.set(descriptor.name, descriptor)
  }

  register(
    {
      name: 'get-page-info',
      description: '读取当前页面标题和页面区域。',
      inputSchema: { type: 'object', properties: {} },
    },
    async () => ({
      content: [{ type: 'text', text: JSON.stringify({ title: 'WebMCP SDK Demo', section: section.value }) }],
    }),
  )

  register(
    {
      name: 'set-page-section',
      description: '切换当前页面展示区域。',
      inputSchema: {
        type: 'object',
        properties: { section: { type: 'string' } },
        required: ['section'],
      },
    },
    async (args) => {
      if (typeof args.section !== 'string' || !args.section.trim()) {
        throw new Error('section is required')
      }
      section.value = args.section
      return {
        content: [{ type: 'text', text: `页面区域已切换为：${section.value}` }],
      }
    },
  )

  return {
    context: () => context,
    section,
    statusToolAdded,
    registrationError,
    tools,
    registerStatusTool() {
      if (releases.has('get-demo-status')) return
      register(
        {
          name: 'get-demo-status',
          description: '读取当前 WebMCP SDK Demo 状态。',
          inputSchema: { type: 'object', properties: {} },
        },
        async () => ({
          content: [{ type: 'text', text: `当前页面区域：${section.value}` }],
        }),
      )
      statusToolAdded.value = true
    },
    unregisterStatusTool() {
      removeRegistration('get-demo-status')
      statusToolAdded.value = false
    },
    dispose() {
      for (const name of [...releases.keys()]) removeRegistration(name)
      statusToolAdded.value = false
    },
  }
}
