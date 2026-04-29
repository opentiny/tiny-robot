type AnchorDemoMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export const basicSourceMessages = [
  {
    id: 'overview',
    role: 'user',
    content: 'Overview',
  },
  {
    id: 'assistant-overview',
    role: 'assistant',
    content: '这一节介绍目录导航的基础用法，以及在长内容场景中的整体效果。',
  },
  {
    id: 'structure',
    role: 'user',
    content: 'Structure',
  },
  {
    id: 'assistant-structure',
    role: 'assistant',
    content: '目录项可以直接对应到页面章节，结构清晰时，跳转和回看都会更快。',
  },
  {
    id: 'interaction',
    role: 'user',
    content: 'Interaction',
  },
  {
    id: 'assistant-interaction',
    role: 'assistant',
    content: '点击目录项后会滚动到对应章节，同时保留当前章节的可见反馈。',
  },
  {
    id: 'tips',
    role: 'user',
    content: 'Tips',
  },
  {
    id: 'assistant-tips',
    role: 'assistant',
    content: '需要搜索时可以补充搜索文案，需要点击反馈时可以为目标章节添加额外样式。',
  },
] satisfies AnchorDemoMessage[]
