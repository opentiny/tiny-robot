export interface ChatRendererLifecycle {
  readonly signal: AbortSignal
}

export type ChatRendererResult = Node | readonly Node[] | string | null

export type ChatRenderer<TContext> = (context: TContext, lifecycle: ChatRendererLifecycle) => ChatRendererResult

export interface ChatRendererHostOptions {
  onError?: (error: unknown) => void
}

export interface ChatRendererHost {
  render<TContext>(renderer: ChatRenderer<TContext>, context: TContext): void
  clear(): void
  dispose(): void
}

function toNodes(result: ChatRendererResult): Node[] {
  if (result === null) return []
  if (typeof result === 'string') return [document.createTextNode(result)]
  if (result instanceof Node) return [result]
  return [...result]
}

export function createChatRendererHost(host: HTMLElement, options: ChatRendererHostOptions = {}): ChatRendererHost {
  let activeController: AbortController | undefined

  function clear() {
    activeController?.abort()
    activeController = undefined
    host.replaceChildren()
  }

  return {
    render(renderer, context) {
      clear()
      const nextController = new AbortController()

      try {
        const nodes = toNodes(renderer(context, { signal: nextController.signal }))
        activeController = nextController
        host.replaceChildren(...nodes)
      } catch (error) {
        nextController.abort()
        options.onError?.(error)
      }
    },
    clear,
    dispose: clear,
  }
}
