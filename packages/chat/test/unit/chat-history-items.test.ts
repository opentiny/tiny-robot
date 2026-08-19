import { nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useChatHistoryItems } from '../../src/composables/useChatHistoryItems'

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
})
