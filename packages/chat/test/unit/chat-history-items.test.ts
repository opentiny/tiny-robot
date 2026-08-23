import { nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useChatHistoryData, useChatHistoryItems } from '../../src/composables/useChatHistoryItems'

describe('useChatHistoryItems', () => {
  it('keeps the same item reference while syncing updated fields', async () => {
    const source = ref([{ id: 'conversation-a', title: '初始标题' }])
    const historyItems = useChatHistoryItems({ conversations: source, defaultTitle: '新对话' })
    const item = historyItems.value[0]

    source.value[0].title = '更新标题'
    await nextTick()

    expect(historyItems.value[0]).toBe(item)
    expect(historyItems.value[0]?.title).toBe('更新标题')
  })

  it('removes items whose source conversations were deleted', async () => {
    const source = ref([
      { id: 'conversation-a', title: '会话 A' },
      { id: 'conversation-b', title: '会话 B' },
    ])
    const historyItems = useChatHistoryItems({ conversations: source, defaultTitle: '新对话' })

    source.value = [source.value[1]]
    await nextTick()

    expect(historyItems.value.map((item) => item.id)).toEqual(['conversation-b'])
  })

  it('uses defaultTitle for empty conversation titles', () => {
    const source = ref([{ id: 'conversation-a', title: '' }])
    const historyItems = useChatHistoryItems({ conversations: source, defaultTitle: '新对话' })

    expect(historyItems.value[0]?.title).toBe('新对话')
  })

  it('updates empty titles when defaultTitle changes', async () => {
    const source = ref([{ id: 'conversation-a', title: '' }])
    const defaultTitle = ref('新对话')
    const historyItems = useChatHistoryItems({ conversations: source, defaultTitle })
    const item = historyItems.value[0]

    defaultTitle.value = '未命名会话'
    await nextTick()

    expect(historyItems.value[0]).toBe(item)
    expect(historyItems.value[0]?.title).toBe('未命名会话')
  })

  it('creates a new item for a new conversation id', async () => {
    const source = ref([{ id: 'conversation-a', title: '会话 A' }])
    const historyItems = useChatHistoryItems({ conversations: source, defaultTitle: '新对话' })
    const firstItem = historyItems.value[0]

    source.value = [...source.value, { id: 'conversation-b', title: '会话 B' }]
    await nextTick()

    expect(historyItems.value[0]).toBe(firstItem)
    expect(historyItems.value[1]).not.toBe(firstItem)
  })

  it('preserves business-provided history groups while normalizing items', () => {
    const source = [
      { id: 'conversation-a', title: '置顶会话', metadata: { group: '置顶' } },
      { id: 'conversation-b', title: '昨天会话', metadata: { group: '昨天' } },
    ]
    const history = [
      { group: '置顶', items: [source[0]] },
      { group: '昨天', items: [source[1]] },
    ] as const
    const historyData = useChatHistoryData({
      conversations: source,
      history,
      defaultTitle: '新对话',
    })

    expect(historyData.value.map((group) => 'group' in group && group.group)).toEqual(['置顶', '昨天'])
    expect(historyData.value[0]).toMatchObject({ items: [{ raw: source[0] }] })
  })

  it('falls back to a flat history when no projection is provided', () => {
    const source = [{ id: 'conversation-a', title: '会话 A' }]
    const historyData = useChatHistoryData({ conversations: source, defaultTitle: '新对话' })

    expect(historyData.value).toHaveLength(1)
    expect(historyData.value[0]).toMatchObject({ raw: source[0] })
  })
})
