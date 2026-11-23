import type { MockMethod } from './dispatch'
import { mockHttpResponse } from './dispatch'

// 响应为裸业务数据；未找到文档返回 404，由 api 层（src/api/editor.ts）归一为 false / null。
// 浏览器内 mock（axios adapter 模式）下数据写入 localStorage 持久化，刷新不丢；
export interface RichTextDocument {
  id: number
  name: string
  department: string
  time: string
  content: string
}

export interface CollaborationDocument {
  id: number
  name: string
  members: string[]
  time: string
  content: string
}

interface EditorMockState {
  documents: RichTextDocument[]
  collaborationDocuments: CollaborationDocument[]
  // 协同文档 id 单调下限：id 分配自持久化计数器，删除文档（包括最大 id）或重启服务后都不会复用旧 id，
  // 避免新文档与远端仍存活的同名协同房间（tiny-pro-collab-${id}）串内容
  collaborationDocIdFloor: number
}

function createSeedState(): EditorMockState {
  return {
    documents: [
      {
        id: 1,
        name: 'TinyPro 项目周报',
        department: '前端开发部',
        time: '2026-10-20 10:30:00',
        content: `
      <h2><strong>TinyPro 项目周报</strong></h2>
      <p>本周主要完成了 <strong>TinyPro</strong> 中后台模板的基础功能开发，整体进度符合预期。</p>
      <h3>一、本周完成</h3>
      <ul>
        <li>完成表单页基础表单、分步表单的开发与联调</li>
        <li>接入 FluentEditor 富文本编辑器，支持表格、表情等扩展能力</li>
        <li>修复登录页在移动端下的样式适配问题</li>
      </ul>
      <h3>二、下周计划</h3>
      <ol>
        <li>推进富文本栏目（开始创作 / 多人协同）页面开发</li>
        <li>完成列表页卡片模式的联调与验收</li>
      </ol>
      <blockquote>风险：多人协同编辑依赖后端 WebSocket 服务，需要提前申请测试环境。</blockquote>
    `,
      },
      {
        id: 2,
        name: '版本发布说明 V2.3.0',
        department: '产品研发部',
        time: '2026-10-18 16:45:00',
        content: `
      <h2><strong>V2.3.0 发布说明</strong></h2>
      <p>本次版本聚焦于<strong>编辑器能力</strong>与<strong>性能优化</strong>，建议全量升级。</p>
      <h3>新增特性</h3>
      <ul>
        <li>富文本编辑器支持<u>多人实时协同编辑</u></li>
        <li>新增文档列表视图，支持按部门、时间筛选</li>
      </ul>
      <h3>问题修复</h3>
      <ul>
        <li>修复表格在暗色主题下边框颜色异常的问题</li>
        <li>修复部分场景下工具栏图标不显示的缺陷</li>
      </ul>
      <p><em>升级方式：执行 <code>pnpm update</code> 并重新构建即可。</em></p>
    `,
      },
      {
        id: 3,
        name: '需求评审纪要',
        department: '产品部',
        time: '2026-10-15 09:20:00',
        content: `
      <h2><strong>需求评审纪要</strong></h2>
      <p>参会人：产品、设计、前端、后端、测试（全员到齐）。</p>
      <h3>评审结论</h3>
      <ol>
        <li>表单页新增<strong>富文本栏目</strong>，与基础表单、分步表单同级</li>
        <li>富文本栏目包含内容创作、多人协同两个子功能</li>
        <li>文档列表默认隐藏表头，展示文档标题与编辑、删除操作</li>
      </ol>
      <h3>待确认事项</h3>
      <ul>
        <li>协同编辑后端服务的部署方案（Docker / 本地部署）</li>
      </ul>
      <blockquote>下次评审时间：下周一 10:00。</blockquote>
    `,
      },
    ],
    collaborationDocuments: [
      {
        id: 101,
        name: 'TinyPro 迭代计划协同文档',
        members: ['张伟', '李娜'],
        time: '2026-10-21 10:00:00',
        content: `
      <h2><strong>TinyPro 迭代计划</strong></h2>
      <p>本迭代聚焦富文本栏目与列表页联调，各模块负责人请每日更新进展。</p>
      <ul>
        <li>表单页：基础表单、分步表单已完成</li>
        <li>富文本：开始创作、多人协同编辑开发中</li>
        <li>列表页：卡片模式待验收</li>
      </ul>
    `,
      },
      {
        id: 102,
        name: '富文本编辑器需求协同文档',
        members: ['刘洋', '赵敏'],
        time: '2026-10-20 15:30:00',
        content: `
      <h2><strong>富文本编辑器需求</strong></h2>
      <ol>
        <li>支持表格、表情、代码块等扩展能力</li>
        <li>支持多人实时协同编辑与光标显示</li>
        <li>支持文档列表管理与历史版本回溯</li>
      </ol>
    `,
      },
      {
        id: 103,
        name: '团队周会纪要协同文档',
        members: ['褚峰', '卫东'],
        time: '2026-10-16 10:00:00',
        content: `
      <h2><strong>团队周会纪要</strong></h2>
      <ul>
        <li>上周完成：登录 mock 联调、构建流水线修复</li>
        <li>本周计划：富文本栏目收尾、E2E 用例补充</li>
      </ul>
    `,
      },
    ],
    collaborationDocIdFloor: 103,
  }
}

function formatTime(date = new Date()): string {
  return date.toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-')
}

function isRecordWithId(value: unknown): value is { id: number } {
  return !!value && typeof value === 'object' && !Array.isArray(value) && typeof (value as { id?: unknown }).id === 'number'
}

export const MOCK_EDITOR_STORAGE_KEY = 'tiny-pro-mock-editor-state'
const MOCK_EDITOR_STATE_VERSION = 1

export interface EditorStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function createMemoryEditorStorage(): EditorStorage {
  const data = new Map<string, string>()
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
}

export function createDefaultEditorStorage(): EditorStorage {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage
    }
  }
  catch {
    // 部分隐私模式下访问 localStorage 会抛错，退化为内存存储
  }
  return createMemoryEditorStorage()
}

function deserializeEditorState(raw: unknown): EditorMockState | null {
  if (!raw || typeof raw !== 'object' || (raw as { version?: unknown }).version !== MOCK_EDITOR_STATE_VERSION) {
    return null
  }
  const state = raw as { documents?: unknown, collaborationDocuments?: unknown, collaborationDocIdFloor?: unknown }
  if (
    !Array.isArray(state.documents)
    || !state.documents.every(isRecordWithId)
    || !Array.isArray(state.collaborationDocuments)
    || !state.collaborationDocuments.every(isRecordWithId)
    || typeof state.collaborationDocIdFloor !== 'number'
  ) {
    return null
  }
  return state as unknown as EditorMockState
}

export function loadEditorState(storage: EditorStorage): EditorMockState {
  try {
    const raw = storage.getItem(MOCK_EDITOR_STORAGE_KEY)
    if (raw) {
      return deserializeEditorState(JSON.parse(raw)) ?? createSeedState()
    }
  }
  catch {
    // 存储内容损坏时回到种子数据
  }
  return createSeedState()
}

function saveEditorState(storage: EditorStorage, state: EditorMockState) {
  try {
    storage.setItem(MOCK_EDITOR_STORAGE_KEY, JSON.stringify({ version: MOCK_EDITOR_STATE_VERSION, ...state }))
  }
  catch {
    // 忽略配额不足 / 隐私模式写入失败
  }
}

// 9 位随机量：id 计数器读-改写无法跨标签页 / 跨进程串行化，并发新建可能读到同一计数，
// 在单调下限之上叠加随机量把碰撞概率降到可忽略（非安全场景，crypto 不可用时退化 Math.random）
function randomIdSuffix(): number {
  if (globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000_000
  }
  return Math.floor(Math.random() * 1_000_000_000)
}

function nextCollaborationDocumentId(state: EditorMockState): number {
  const maxId = Math.max(100, ...state.collaborationDocuments.map(doc => doc.id))
  // 下限取持久化计数器与当前最大 id 的较大者，再加随机量；随后抬高计数器供下次分配
  const floor = Math.max(state.collaborationDocIdFloor, maxId) + 1
  const next = Math.max(floor, 1_000_000_000) + randomIdSuffix()
  state.collaborationDocIdFloor = next
  return next
}

export function createEditorMocks(storage = createDefaultEditorStorage()): MockMethod[] {
  const state = loadEditorState(storage)

  const documentNotFound = () => mockHttpResponse(404, { message: '文档不存在或已被删除' })

  const mocks: MockMethod[] = [
    // 开始创作文档列表
    {
      url: '/api/editor/documents',
      method: 'get',
      response: () => {
        // 返回副本，防止调用方改动/插入影响 mock 存储的数组
        return [...state.documents]
      },
    },
    // 新建文档：id 由 mock 服务端生成
    {
      url: '/api/editor/document',
      method: 'post',
      response: ({ body }: { body?: Pick<RichTextDocument, 'name' | 'department' | 'content'> }) => {
        if (!body?.name) {
          return mockHttpResponse(400, { message: '文档标题不能为空' })
        }
        const doc: RichTextDocument = {
          id: Math.max(0, ...state.documents.map(item => item.id)) + 1,
          department: '未分类',
          ...body,
          time: formatTime(),
        }
        state.documents.unshift(doc)
        return doc
      },
    },
    // 更新文档（自动保存）
    {
      url: '/api/editor/document/update',
      method: 'post',
      response: ({ body }: { body?: { id?: number, patch?: Partial<Omit<RichTextDocument, 'id'>> } }) => {
        const doc = state.documents.find(item => item.id === body?.id)
        if (!doc) {
          return documentNotFound()
        }
        Object.assign(doc, body?.patch ?? {})
        return true
      },
    },
    // 删除文档
    {
      url: '/api/editor/document',
      method: 'delete',
      response: ({ query }: { query: URLSearchParams }) => {
        const id = Number(query.get('id'))
        const index = state.documents.findIndex(item => item.id === id)
        if (index === -1) {
          return documentNotFound()
        }
        state.documents.splice(index, 1)
        return true
      },
    },

    // 多人协同文档列表
    {
      url: '/api/editor/collaboration-documents',
      method: 'get',
      response: () => {
        // 返回副本，防止调用方改动/插入影响 mock 存储的数组
        return [...state.collaborationDocuments]
      },
    },
    // 新建协同文档：id 由 mock 服务端按持久化计数器分配，避免复用旧 id 串了远端协同房间
    {
      url: '/api/editor/collaboration-document',
      method: 'post',
      response: ({ body }: { body?: Pick<CollaborationDocument, 'name' | 'content'> & { members?: string[] } }) => {
        if (!body?.name) {
          return mockHttpResponse(400, { message: '文档标题不能为空' })
        }
        const doc: CollaborationDocument = {
          id: nextCollaborationDocumentId(state),
          members: ['我'],
          ...body,
          time: formatTime(),
        }
        state.collaborationDocuments.unshift(doc)
        return doc
      },
    },
    // 更新协同文档（自动保存 / 远端协同内容回流）
    {
      url: '/api/editor/collaboration-document/update',
      method: 'post',
      response: ({ body }: { body?: { id?: number, patch?: Partial<Omit<CollaborationDocument, 'id'>> } }) => {
        const doc = state.collaborationDocuments.find(item => item.id === body?.id)
        if (!doc) {
          return documentNotFound()
        }
        Object.assign(doc, body?.patch ?? {})
        return true
      },
    },
    // 删除协同文档（前端需先清理本地 IndexedDB 房间数据再调用）
    {
      url: '/api/editor/collaboration-document',
      method: 'delete',
      response: ({ query }: { query: URLSearchParams }) => {
        const id = Number(query.get('id'))
        const index = state.collaborationDocuments.findIndex(item => item.id === id)
        if (index === -1) {
          return documentNotFound()
        }
        state.collaborationDocuments.splice(index, 1)
        return true
      },
    },
  ]

  // 每个写请求响应后持久化一次状态；浏览器 adapter 模式存 localStorage，独立服务进程则为内存存储
  return mocks.map(mock => ({
    ...mock,
    response: async (context: unknown) => {
      const result = await (mock.response as (ctx: unknown) => unknown)(context)
      saveEditorState(storage, state)
      return result
    },
  }))
}
