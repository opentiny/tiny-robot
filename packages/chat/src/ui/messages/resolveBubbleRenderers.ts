import {
  BubbleRenderers,
  type BubbleBoxRendererMatch,
  type BubbleContentRendererMatch,
  type BubbleMessage,
} from '@opentiny/tiny-robot'
import type { Component } from 'vue'
import type { ChatBubbleBoxRendererMatch, ChatBubbleContentRendererMatch, ChatBubbleRenderers } from '../../types'
import ChatBubbleBoxRenderer from './ChatBubbleBoxRenderer.vue'
import ChatBubbleContentRenderer from './ChatBubbleContentRenderer.vue'

const contentRenderers = {
  text: BubbleRenderers.Text,
  markdown: BubbleRenderers.Markdown,
  image: BubbleRenderers.Image,
  loading: BubbleRenderers.Loading,
  reasoning: BubbleRenderers.Reasoning,
  tools: BubbleRenderers.Tools,
  'tool-role': BubbleRenderers.ToolRole,
} satisfies Record<string, Component>

const boxRenderers = {
  box: BubbleRenderers.Box,
} satisfies Record<string, Component>

function reportOnce(onError: (error: unknown) => void) {
  let reported = false
  return (error: unknown) => {
    if (reported) return
    reported = true
    onError(error)
  }
}

function normalizeContentMatch(
  match: ChatBubbleContentRendererMatch,
  onError: (error: unknown) => void,
): BubbleContentRendererMatch | undefined {
  const report = reportOnce(onError)
  const find: BubbleContentRendererMatch['find'] = (message, content, contentIndex) => {
    try {
      return match.find(message, content, contentIndex)
    } catch (error) {
      report(error)
      return false
    }
  }

  if (typeof match.renderer === 'string') {
    const renderer = contentRenderers[match.renderer as keyof typeof contentRenderers]
    if (!renderer) {
      report(new Error(`Unknown built-in Bubble content renderer: ${match.renderer}`))
      return undefined
    }
    return { ...match, find, renderer }
  }

  return {
    find,
    renderer: ChatBubbleContentRenderer,
    priority: match.priority,
    attributes: {
      ...match.attributes,
      domRenderer: match.renderer,
      onRendererError: onError,
    },
  }
}

function normalizeBoxMatch(
  match: ChatBubbleBoxRendererMatch,
  onError: (error: unknown) => void,
): BubbleBoxRendererMatch | undefined {
  const report = reportOnce(onError)
  let matchedContext: Parameters<BubbleBoxRendererMatch['find']>[3] | undefined
  const find: BubbleBoxRendererMatch['find'] = (messages, content, contentIndex, context) => {
    try {
      const matched = match.find(messages, content, contentIndex, context)
      if (matched) matchedContext = context
      return matched
    } catch (error) {
      report(error)
      return false
    }
  }

  if (typeof match.renderer === 'string') {
    const renderer = boxRenderers[match.renderer as keyof typeof boxRenderers]
    if (!renderer) {
      report(new Error(`Unknown built-in Bubble box renderer: ${match.renderer}`))
      return undefined
    }
    return { ...match, find, renderer, attributes: match.attributes as BubbleBoxRendererMatch['attributes'] }
  }

  const resolveUserAttributes = (
    messages: BubbleMessage[],
    content: Parameters<BubbleBoxRendererMatch['find']>[1],
    contentIndex: number | undefined,
  ) => (typeof match.attributes === 'function' ? match.attributes(messages, content, contentIndex) : match.attributes)

  return {
    find,
    renderer: ChatBubbleBoxRenderer,
    priority: match.priority,
    attributes: (messages, content, contentIndex) => ({
      ...resolveUserAttributes(messages, content, contentIndex),
      messages,
      content,
      contentIndex,
      boxContext: matchedContext ?? {
        contentRenderMode: typeof contentIndex === 'number' ? 'split' : 'single',
        resolvedMessageContent: messages.length === 1 ? messages[0]?.content : undefined,
      },
      domRenderer: match.renderer,
      onRendererError: onError,
    }),
  }
}

export function resolveBubbleRendererMatches(
  renderers: Readonly<ChatBubbleRenderers> | undefined,
  onError: (error: unknown) => void,
): {
  contentRendererMatches: BubbleContentRendererMatch[]
  boxRendererMatches: BubbleBoxRendererMatch[]
} {
  return {
    contentRendererMatches: (renderers?.contentRendererMatches ?? [])
      .map((match) => normalizeContentMatch(match, onError))
      .filter((match): match is BubbleContentRendererMatch => Boolean(match)),
    boxRendererMatches: (renderers?.boxRendererMatches ?? [])
      .map((match) => normalizeBoxMatch(match, onError))
      .filter((match): match is BubbleBoxRendererMatch => Boolean(match)),
  }
}
