import type {
  CreateWebMcpToolSourceOptions,
  WebMcpContext,
  WebMcpToolDescriptor,
  WebMcpToolSource,
} from './webmcpTypes'

function readDefaultContext(): WebMcpContext | undefined {
  if (typeof document === 'undefined') return undefined
  return (document as Document & { modelContext?: WebMcpContext }).modelContext
}

function isWebMcpInputParseError(error: unknown) {
  const name = error instanceof Error ? error.name : (error as { name?: unknown } | null)?.name
  const message = error instanceof Error ? error.message : String(error)
  return name === 'TypeError' && /failed to parse input arguments/i.test(message)
}

export function normalizeWebMcpInputSchema(raw: unknown): Record<string, unknown> {
  let schema: Record<string, unknown> = {}

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    schema = { ...(raw as Record<string, unknown>) }
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        schema = parsed as Record<string, unknown>
      }
    } catch {
      schema = {}
    }
  }

  return {
    ...schema,
    type: typeof schema.type === 'string' ? schema.type : 'object',
    properties: schema.properties && typeof schema.properties === 'object' ? schema.properties : {},
  }
}

export function readWebMcpToolText(result: unknown): string {
  if (typeof result === 'string') return result

  const content = (result as { content?: unknown } | null)?.content
  if (Array.isArray(content)) {
    const text = content
      .map((part) => (typeof part === 'string' ? part : String((part as { text?: unknown })?.text ?? '')))
      .filter(Boolean)
      .join('\n')
    if (text.trim()) return text
  }

  try {
    return JSON.stringify(result)
  } catch {
    return String(result)
  }
}

export function createWebMcpToolSource(options: CreateWebMcpToolSourceOptions = {}): WebMcpToolSource {
  const getContext = options.getContext ?? readDefaultContext
  const descriptors = new Map<string, WebMcpToolDescriptor>()
  const listeners = new Set<() => void>()
  let boundContext: WebMcpContext | undefined
  let refreshQueue: Promise<void> = Promise.resolve()

  function bind() {
    const context = getContext()
    if (!context || context === boundContext) return
    boundContext?.removeEventListener?.('toolchange', handleToolChange)
    context.addEventListener?.('toolchange', handleToolChange)
    boundContext = context
  }

  function unbind() {
    boundContext?.removeEventListener?.('toolchange', handleToolChange)
    boundContext = undefined
  }

  async function refresh() {
    bind()
    const task = refreshQueue.then(async () => {
      const context = getContext()
      const list = context?.listTools ?? context?.getTools
      const raw = list ? await list.call(context) : []
      const next = new Map<string, WebMcpToolDescriptor>()

      for (const tool of Array.isArray(raw) ? raw : []) {
        if (tool?.name && !next.has(tool.name)) next.set(tool.name, tool)
      }

      descriptors.clear()
      for (const [name, tool] of next) descriptors.set(name, tool)
    })

    refreshQueue = task.then(
      () => undefined,
      () => undefined,
    )
    await task
  }

  function handleToolChange() {
    void refresh().then(
      () => listeners.forEach((listener) => listener()),
      () => undefined,
    )
  }

  return {
    async listTools() {
      await refresh()
      return [...descriptors.values()]
    },
    async callTool(name, args) {
      bind()
      if (!descriptors.has(name)) await refresh()

      const context = getContext()
      const tool = descriptors.get(name)
      if (!context?.executeTool || !tool) throw new Error(`WebMCP 工具不可用：${name}`)

      const input = args ?? {}
      try {
        return readWebMcpToolText(await context.executeTool(tool, input))
      } catch (error) {
        if (!isWebMcpInputParseError(error)) throw error
        return readWebMcpToolText(await context.executeTool(tool, JSON.stringify(input)))
      }
    },
    subscribe(listener) {
      listeners.add(listener)
      bind()

      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) unbind()
      }
    },
  }
}
