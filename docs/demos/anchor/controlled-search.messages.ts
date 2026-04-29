type AnchorDemoMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export const controlledSearchMessages = [
  {
    id: 'u-discovery',
    role: 'user',
    content: '映射关系应该怎么设计？',
  },
  {
    id: 'assistant-u-discovery',
    role: 'assistant',
    content:
      '可以把每一轮用户提问视为一个稳定锚点：目录数据直接来源于用户消息本身，BubbleList 负责渲染完整上下文，Anchor 只消费"用户问题摘要 + 对应 DOM 锚点"。这样目录、滚动定位和阅读上下文会天然保持一致。',
  },
  {
    id: 'u-feedback',
    role: 'user',
    content: '点击目录之后，我不想只是滚过去而已；最好让对应的用户气泡轻微闪一下。',
  },
  {
    id: 'assistant-u-feedback',
    role: 'assistant',
    content:
      '这非常适合 jump feedback。只要目录项和真实用户气泡之间的定位链路稳定，点击目录之后就可以直接给对应气泡加一层轻反馈，让用户明确知道当前跳到的是哪一轮对话。',
  },
  {
    id: 'u-tooltip',
    role: 'user',
    content: '这里我还想顺便验证超长目录文案被截断之后，tooltip 能不能完整展示。',
  },
  {
    id: 'assistant-u-tooltip',
    role: 'assistant',
    content:
      '长文案很适合在目录里做省略，在 tooltip 中保留完整语义。这样导航本身依然紧凑，但用户在需要时又能获取完整问题描述。',
  },
  {
    id: 'u-search',
    role: 'user',
    content: '示例里再带一个 controlled search，会不会更贴近真实使用场景？',
  },
  {
    id: 'assistant-u-search',
    role: 'assistant',
    content:
      '会更贴近。目录的 label 可以保持问题摘要，searchText 再把用户提问和助手回复都拼接进去，这样既保留了目录语义，也提高了搜索召回率。',
  },
] satisfies AnchorDemoMessage[]
