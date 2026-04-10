import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useTargetRegistry, type TargetBinder } from '../../shared/composables'
import type { ContentNavItem, ContentNavSource } from '../../shared/content-nav.type'
import { createContentResolver } from './useContentResolver'
import type { BubbleListContentNavOptions, BubbleMessage, BubbleMessageGroup, BubbleProps } from '../index.type'

type BubbleContentNavEntry = {
  id: string
  item: ContentNavItem
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function extractResolvedContentText(message: BubbleMessage, resolveContent: ReturnType<typeof createContentResolver>) {
  const parts: string[] = []
  const content = resolveContent(message)

  if (typeof content === 'string') {
    parts.push(content)
  } else if (Array.isArray(content)) {
    content.forEach((item) => {
      if (typeof item?.text === 'string') {
        parts.push(item.text)
      } else if (typeof item?.title === 'string') {
        parts.push(item.title)
      } else if (typeof item?.alt === 'string') {
        parts.push(item.alt)
      }
    })
  }

  return normalizeText(parts.join(' '))
}

function extractMessageText(message: BubbleMessage, resolveContent: ReturnType<typeof createContentResolver>) {
  const parts: string[] = []
  const resolvedContentText = extractResolvedContentText(message, resolveContent)

  if (resolvedContentText) {
    parts.push(resolvedContentText)
  }

  if (typeof message.reasoning_content === 'string') {
    parts.push(message.reasoning_content)
  }

  if (Array.isArray(message.tool_calls)) {
    message.tool_calls.forEach((toolCall) => {
      if (toolCall.function?.name) {
        parts.push(toolCall.function.name)
      }
    })
  }

  return normalizeText(parts.join(' '))
}

function resolveGroupTexts(group: BubbleMessageGroup, resolveContent: ReturnType<typeof createContentResolver>) {
  const messageTexts: string[] = []
  let firstMessageText = ''

  group.messages.forEach((message) => {
    const text = extractMessageText(message, resolveContent)
    if (!text) {
      return
    }

    if (!firstMessageText) {
      firstMessageText = text
    }

    messageTexts.push(text)
  })

  return {
    firstMessageText,
    groupMessagesText: normalizeText(messageTexts.join(' ')),
  }
}

function resolveDefaultContentNavItem(
  group: BubbleMessageGroup,
  groupIndex: number,
  fallbackRole: string,
  resolveContent: ReturnType<typeof createContentResolver>,
): ContentNavItem {
  const groupRole = group.role || fallbackRole
  const { firstMessageText, groupMessagesText } = resolveGroupTexts(group, resolveContent)
  const label = firstMessageText || groupMessagesText || `${groupRole} ${groupIndex + 1}`
  const id = group.messages.find((message) => message.id)?.id || `bubble-group-${group.startIndex}`

  return {
    id,
    label,
    searchText: groupMessagesText || label,
    tooltipText: label,
    meta: {
      role: groupRole,
      groupIndex,
      startIndex: group.startIndex,
      messageIndexes: [...group.messageIndexes],
    },
  }
}

export function useBubbleContentNav(options: {
  contentNav: MaybeRefOrGetter<boolean | BubbleListContentNavOptions | undefined>
  messageGroups: MaybeRefOrGetter<BubbleMessageGroup[]>
  dividerRole: MaybeRefOrGetter<string>
  fallbackRole: MaybeRefOrGetter<string>
  contentResolver?: MaybeRefOrGetter<BubbleProps['contentResolver'] | undefined>
}) {
  const resolvedContentNavOptions = computed<BubbleListContentNavOptions | undefined>(() => {
    const contentNav = toValue(options.contentNav)
    if (!contentNav) {
      return undefined
    }

    return contentNav === true ? {} : contentNav
  })

  const isContentNavEnabled = computed(() => Boolean(resolvedContentNavOptions.value))
  const resolveContent = createContentResolver(options.contentResolver)
  const registry = useTargetRegistry()
  const noopGroupTargetBinder: TargetBinder = () => {}

  const contentNavEntries = computed<Array<BubbleContentNavEntry | undefined>>(() => {
    const groups = toValue(options.messageGroups)
    if (!isContentNavEnabled.value) {
      return groups.map(() => undefined)
    }

    const dividerRole = toValue(options.dividerRole)
    const fallbackRole = toValue(options.fallbackRole)
    const contentNavOptions = resolvedContentNavOptions.value

    return groups.map((group, groupIndex) => {
      const resolvedItem =
        contentNavOptions?.itemResolver?.({
          group,
          groupIndex,
          dividerRole,
        }) ?? resolveDefaultContentNavItem(group, groupIndex, fallbackRole, resolveContent)

      if (!resolvedItem || !resolvedItem.id) {
        return undefined
      }

      return {
        id: resolvedItem.id,
        item: resolvedItem,
      }
    })
  })

  const contentNavItems = computed(() =>
    contentNavEntries.value.flatMap((entry) => {
      return entry ? [entry.item] : []
    }),
  )

  const internalContentNavSource: ContentNavSource = {
    items: contentNavItems,
    resolveTarget: registry.get,
    revision: registry.version,
  }

  watch(
    () => contentNavItems.value.map((item) => item.id),
    (activeIds) => {
      registry.prune(activeIds)
    },
    { immediate: true },
  )

  const contentNavSource = computed(() => (isContentNavEnabled.value ? internalContentNavSource : undefined))

  function bindGroupTarget(id: string | undefined) {
    if (!isContentNavEnabled.value || !id) {
      return noopGroupTargetBinder
    }

    return registry.bindTarget(id)
  }

  return {
    contentNavEntries,
    contentNavSource,
    bindGroupTarget,
  }
}
