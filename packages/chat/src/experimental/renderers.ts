import { dispatchExperimentalEvent, type ExperimentalErrorDetail } from './events'

export interface ExperimentalRendererLifecycle {
  readonly signal: AbortSignal
}

export type ExperimentalRendererResult = Node | readonly Node[] | string | null

export type ExperimentalRenderer<TContext> = (
  context: TContext,
  lifecycle: ExperimentalRendererLifecycle,
) => ExperimentalRendererResult

export interface ExperimentalRendererHost {
  render<TContext>(renderer: ExperimentalRenderer<TContext>, context: TContext): void
  clear(): void
  dispose(): void
}

function toNodes(result: ExperimentalRendererResult): Node[] {
  if (result === null) return []
  if (typeof result === 'string') return [document.createTextNode(result)]
  if (result instanceof Node) return [result]
  return [...result]
}

export function createRendererHost(host: HTMLElement): ExperimentalRendererHost {
  let activeController: AbortController | undefined

  function clear() {
    activeController?.abort()
    activeController = undefined
    host.replaceChildren()
  }

  return {
    render(renderer, context) {
      const nextController = new AbortController()
      let nodes: Node[]

      try {
        nodes = toNodes(renderer(context, { signal: nextController.signal }))
      } catch (error) {
        nextController.abort()
        dispatchExperimentalEvent<ExperimentalErrorDetail>(host, 'experimental-error', {
          source: 'renderer',
          error,
        })
        return
      }

      activeController?.abort()
      activeController = nextController
      host.replaceChildren(...nodes)
    },
    clear,
    dispose: clear,
  }
}
