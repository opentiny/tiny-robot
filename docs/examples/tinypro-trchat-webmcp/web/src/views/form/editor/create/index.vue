<script lang="ts" setup>
import type { CollaborationDocument, RichTextDocument } from '@/mock/editor'
import TinyEditor from '@opentiny/fluent-editor'
import { Modal, Dropdown as TinyDropdown, Input as TinyInput } from '@opentiny/vue'
import { iconAdd, iconChevronLeft, iconDel, iconEdit, iconEllipsis, iconError, iconFullscreenRight, iconGroup, IconLoadingShadow, iconMinscreenRight, iconSuccess, iconUser } from '@opentiny/vue-icon'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import {
  createCollaborationDocument,
  createEditorDocument,
  deleteCollaborationDocument,
  deleteEditorDocument,
  getCollaborationDocuments,
  getEditorDocuments,
  updateCollaborationDocument,
  updateEditorDocument,
} from '@/api/editor'
import { useUserStore } from '@/store'
import { getToken } from '@/utils/auth'
import { clearCollabRoomData, waitCollabRoomDataSettled } from '../util'
import '@opentiny/fluent-editor/style.css'

const IconAdd = iconAdd()
const IconChevronLeft = iconChevronLeft()
const IconDel = iconDel()
const IconUser = iconUser()
const IconEllipsis = iconEllipsis()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 协同编辑 WebSocket 服务地址（y-websocket），配置步骤：
// 1. 默认（未配置 VITE_COLLAB_WEBSOCKET_URL）：回退到 Yjs 公共演示服务 wss://demos.yjs.dev/ws，
//    仅供功能体验与测试——文档内容会同步到第三方服务器，且房间名可预测，存在内容泄露风险，切勿用于真实文档；
// 2. 自建服务（推荐）：将 VITE_COLLAB_WEBSOCKET_URL 指向自部署的 y-websocket 服务地址，
//    开发环境写入 template/tinyvue/.env.development（或 .env），生产构建经 CI 环境变量或 .env.production 注入，
//    配置后优先使用自建服务，不再连接公共演示服务
const PUBLIC_DEMO_WEBSOCKET_URL = 'wss://demos.yjs.dev/ws'
const customCollabWebsocketUrl = import.meta.env.VITE_COLLAB_WEBSOCKET_URL
// 用户未配置自建服务时，当前实际使用的是公共演示服务（状态栏据此追加提示）
const isPublicDemoServer = !customCollabWebsocketUrl
if (isPublicDemoServer) {
  console.warn('[tiny-pro] 协同编辑当前使用 Yjs 公共演示服务，仅供测试；请配置 VITE_COLLAB_WEBSOCKET_URL 为自部署服务后再用于真实文档。')
}
const collabWebsocketUrl = customCollabWebsocketUrl || PUBLIC_DEMO_WEBSOCKET_URL

const editorRef = ref<HTMLElement>()
const title = ref('')
const isFullscreen = ref(false)

let _editor: TinyEditor | null = null

// 协同编辑实例，销毁编辑器时必须一并清理，否则重复初始化会叠加连接与工具栏
let collabBinding: { destroy: () => void } | null = null
let collabProvider: { destroy: () => void, off?: (event: string, handler: (event: { status: string }) => void) => void } | null = null
let collabPersistence: { destroy: () => void } | null = null
let collabDoc: { destroy: () => void } | null = null
// y-indexeddb 构造函数缓存：协同初始化后用于房间重绑，避免重复动态导入
let IndexeddbPersistenceClass: any = null
let collabAwareness: { off: (event: string, handler: () => void) => void } | null = null
let collabAwarenessHandler: (() => void) | null = null
let collabHeartbeatTimer: ReturnType<typeof setInterval> | null = null
// 当前房间的协作用户（awareness 实时同步）
const collabUsers = ref<{ name: string, color?: string }[]>([])
// 本机在协同房间中的用户身份，保存文档时写入成员列表
const currentCollabUser = ref<{ name: string, color?: string } | null>(null)
// 最多直接展示 3 个用户，其余收进 ellipsis 下拉
const MAX_VISIBLE_COLLAB_USERS = 3
const visibleUsers = computed(() => collabUsers.value.slice(0, MAX_VISIBLE_COLLAB_USERS))
const moreUsers = computed(() =>
  collabUsers.value.slice(MAX_VISIBLE_COLLAB_USERS).map(user => ({ label: user.name, icon: iconUser() })),
)
// 协同同步状态：connecting 连接中 / syncing 正在同步中 / connected 同步成功 / disconnected 同步失败
const collabSyncStatus = ref<'connecting' | 'syncing' | 'connected' | 'disconnected'>('connecting')
let collabStatusHandler: ((event: { status: string }) => void) | null = null
// 首次与远端完成内容同步后才允许显示“同步成功”，避免仅连接成功就误报
let hasSyncedRemote = false
// 离线兜底标记：provider 断连且本地缓存读取完成后，房间无内容则用 mock 内容初始化
let providerOffline = false
let persistenceSynced = false

const IconSync = computed(() => {
  if (collabSyncStatus.value === 'connected') {
    return iconSuccess()
  }
  if (collabSyncStatus.value === 'disconnected') {
    return iconError()
  }
  return IconLoadingShadow()
})
const syncStatusText = computed(() => {
  const demoNote = '（公共演示服务，仅供测试使用。若用于生产环境，请自行配置部署的服务地址）'
  if (collabSyncStatus.value === 'connected') {
    return `同步成功${demoNote}`
  }
  if (collabSyncStatus.value === 'disconnected') {
    return `同步失败${demoNote}`
  }
  if (collabSyncStatus.value === 'syncing') {
    return `正在同步中${demoNote}`
  }
  return '同步中…'
})
// 初始化代次：协同编辑器异步初始化，完成前若用户已切换文档，丢弃过期结果
let editorEpoch = 0
// 新建协同文档的临时房间号，首次自动保存拿到正式 id 前保持不变，避免中途换房间丢失内容
let collabRoomSeed = ''
// 当前用户是否真实编辑过内容（mock 内容回填不算），只有编辑过才写入文档成员
let hasUserContentEdit = false
// 自上次成功保存以来是否有未落盘的编辑，用于返回前判断是否需要未保存提示
let hasUnsavedEdits = false
// mock 内容回填标记，回填产生的 text-change 不算用户编辑
let isSeedingContent = false

// 无 id 参数时为新建文档模式，有 id 时为编辑已有文档模式；两种模式均为富文本可编辑状态
const isCreateMode = computed(() => route.query.id === undefined)

// 从多人协同列表进入时（from=collaboration）展示协同文档，否则展示开始创作文档
const isCollaborationMode = computed(() => route.query.from === 'collaboration')
// 左侧文档目录：由 mock 接口（src/api/editor.ts）加载，模式切换时重新请求对应列表
const documents = ref<(RichTextDocument | CollaborationDocument)[]>([])
let loadedListMode: 'documents' | 'collaboration' | null = null

async function ensureDocuments() {
  const mode = isCollaborationMode.value ? 'collaboration' : 'documents'
  if (loadedListMode === mode) {
    return
  }
  try {
    documents.value = mode === 'collaboration' ? await getCollaborationDocuments() : await getEditorDocuments()
    loadedListMode = mode
  }
  catch {
    // 加载失败不缓存结果，下次切换/重试可重新请求
    documents.value = []
    loadedListMode = null
    console.warn(`请补充后端接口`)
  }
}
// 新建模式下首次自动保存创建的文档 id（刻意不改 URL，避免 fullPath 变化导致整页重挂载）
const pendingDocId = ref<number | null>(null)
const activeDocument = computed(() => {
  const id = route.query.id !== undefined ? Number(route.query.id) : pendingDocId.value
  return documents.value.find(doc => doc.id === id)
})

// 已加载到编辑器的文档 id，初始为 null，避免新建模式（无 id）下被误判为“已加载”而跳过初始化
let loadedDocId: number | null = null

const TOOLBAR_OPTIONS = [
  ['undo', 'redo'],
  [{ header: [1, 2, 3, 4, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['blockquote', 'code-block', 'link'],
  [{ size: ['small', false, 'large', 'huge'] }],
  ['clean'],
]

function destroyEditor() {
  editorEpoch += 1
  if (collabHeartbeatTimer) {
    clearInterval(collabHeartbeatTimer)
    collabHeartbeatTimer = null
  }
  if (collabAwareness && collabAwarenessHandler) {
    collabAwareness.off('change', collabAwarenessHandler)
  }
  collabAwareness = null
  collabAwarenessHandler = null
  collabUsers.value = []
  currentCollabUser.value = null
  if (collabProvider?.off && collabStatusHandler) {
    collabProvider.off('status', collabStatusHandler)
  }
  collabStatusHandler = null
  collabSyncStatus.value = 'connecting'
  hasSyncedRemote = false
  providerOffline = false
  persistenceSynced = false
  collabBinding?.destroy()
  collabBinding = null
  collabProvider?.destroy()
  collabProvider = null
  collabPersistence?.destroy()
  collabPersistence = null
  collabDoc?.destroy()
  collabDoc = null
  const container = editorRef.value
  if (container) {
    // 销毁时需一并移除，否则重复初始化会叠加工具栏
    container.parentElement?.querySelectorAll(':scope > .ql-toolbar').forEach(el => el.remove())
    container.innerHTML = ''
    container.classList.remove('ql-container', 'ql-snow', 'ql-blank', 'ql-disabled')
  }
  _editor = null
}

// 协同展示名：优先用户档案 name。mock 模式（含 mock 后端与 VITE_MOCK_LOGIN_ENABLED 纯前端登录）
// 签发的 token 内嵌登录邮箱（mock-access-token:{email} / mock-local-access-token:{email}），
// 当档案姓名未随登录账号区分（仍是默认 admin 且与登录邮箱不符）时，兜底用登录邮箱标识协作者
function currentLoginName(): string {
  const token = getToken() ?? ''
  const tokenEmail = token.startsWith('mock-') ? token.slice(token.indexOf(':') + 1) : ''
  const name = userStore.name?.trim()
  if (name && (name !== 'admin' || !tokenEmail || tokenEmail === userStore.email)) {
    return name
  }
  return tokenEmail || name || `user${Math.random().toString(36).slice(2, 8)}`
}

// 每个协同文档一个房间，已有文档按 id 区分，新建文档用临时种子房间
function currentCollabRoom(): string {
  const id = route.query.id !== undefined ? Number(route.query.id) : pendingDocId.value
  if (id != null && Number.isInteger(id)) {
    return `tiny-pro-collab-${id}`
  }
  if (!collabRoomSeed) {
    collabRoomSeed = `tiny-pro-collab-new-${Math.random().toString(36).slice(2, 10)}`
  }
  return collabRoomSeed
}

// 新建协同文档首次保存后，把当前会话的 provider 与本地缓存重绑到正式房间，
// 保证后续从列表按 id 打开该文档的用户与当前会话处在同一房间
function rebindCollabRoom(id: number) {
  if (!collabDoc || !IndexeddbPersistenceClass) {
    return
  }
  const room = `tiny-pro-collab-${id}`
  if (collabProvider) {
    const provider = collabProvider as any
    provider.disconnect()
    provider.roomname = room
    provider.bcChannel = `${provider.serverUrl}/${room}`
    provider.connect()
  }
  collabPersistence?.destroy()
  collabPersistence = new IndexeddbPersistenceClass(room, collabDoc)
}

function attachAutoSave(editor: TinyEditor) {
  editor.on('text-change', (_delta, _oldContents, source) => {
    if (source === 'user') {
      scheduleAutoSave()
    }
  })
}

function initEditor(content = '') {
  destroyEditor()
  hasUserContentEdit = false
  hasUnsavedEdits = false
  if (isCollaborationMode.value) {
    // 多人协同：实时协同编辑器，内容通过 yjs 在协作者间同步
    const epoch = editorEpoch
    initCollabEditor(content).catch(() => {
      // 动态导入或初始化失败：仅当用户仍在当前文档时标记断连，避免影响已切换的新会话
      if (epoch === editorEpoch) {
        collabSyncStatus.value = 'disconnected'
      }
    })
    return
  }
  _editor = new TinyEditor(editorRef.value, {
    theme: 'snow',
    modules: {
      toolbar: TOOLBAR_OPTIONS,
    },
  })
  attachAutoSave(_editor)
  if (content) {
    _editor.clipboard.dangerouslyPasteHTML(content)
  }
}

async function initCollabEditor(content: string) {
  const epoch = editorEpoch
  const [
    { default: QuillCursors },
    Y,
    { QuillBinding },
    { WebsocketProvider },
    { IndexeddbPersistence },
    { Awareness },
  ] = await Promise.all([
    import('quill-cursors'),
    import('yjs'),
    import('y-quill'),
    import('y-websocket'),
    import('y-indexeddb'),
    import('y-protocols/awareness'),
  ])
  // 初始化期间用户已切换文档或离开页面，丢弃本次结果
  if (epoch !== editorEpoch || !editorRef.value) {
    return
  }
  IndexeddbPersistenceClass = IndexeddbPersistence
  TinyEditor.register('modules/cursors', QuillCursors, true)
  const room = currentCollabRoom()
  const ydoc = new Y.Doc()
  // collabWebsocketUrl 始终有值（未配置时回退公共演示服务），直接建立网络连接
  const provider = collabWebsocketUrl ? new WebsocketProvider(collabWebsocketUrl, room, ydoc) : null
  const persistence = new IndexeddbPersistence(room, ydoc)
  collabDoc = ydoc
  collabProvider = provider
  collabPersistence = persistence
  if (provider) {
    collabSyncStatus.value = 'connecting'
  }
  else {
    providerOffline = true
    collabSyncStatus.value = 'disconnected'
  }
  // 无网络连接时使用本地 awareness，保证光标组件与本地用户状态可用
  const awareness = provider ? provider.awareness : new Awareness(ydoc)
  const ytext = ydoc.getText('quill')
  _editor = new TinyEditor(editorRef.value, {
    theme: 'snow',
    modules: {
      toolbar: TOOLBAR_OPTIONS,
      cursors: true,
    },
  })
  attachAutoSave(_editor)
  // 本地编辑时进入“正在同步中”，停止输入一小段时间后视为同步完成回到“同步成功”
  // isSeedingContent 用于区分 mock 内容回填与真实编辑，回填不计入用户编辑
  _editor.on('text-change', (_delta, _oldContents, source) => {
    if (source !== 'user') {
      return
    }
    if (!isSeedingContent) {
      hasUserContentEdit = true
    }
    if (collabSyncStatus.value === 'connected') {
      collabSyncStatus.value = 'syncing'
    }
    if (collabSyncStatus.value === 'syncing') {
      if (syncBackTimer) {
        clearTimeout(syncBackTimer)
      }
      syncBackTimer = setTimeout(() => {
        syncBackTimer = null
        if (collabSyncStatus.value === 'syncing' && hasSyncedRemote) {
          collabSyncStatus.value = 'connected'
        }
      }, 800)
    }
  })
  collabBinding = new QuillBinding(ytext, _editor, awareness)
  // 远端编辑到达时同步文档内容与“最后更新时间”，避免列表时间比内容新；本地编辑由自动保存负责更新（transaction.origin 为 binding）
  ytext.observe((_event: unknown, transaction: { origin: unknown }) => {
    if (transaction.origin === collabBinding) {
      return
    }
    const docId = route.query.id !== undefined ? Number(route.query.id) : pendingDocId.value
    if (!_editor || docId == null || !Number.isInteger(docId)) {
      return
    }
    const patch = {
      time: new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-'),
      content: _editor.getSemanticHTML(),
    }
    // 本地列表立即反映远端内容，服务端记录异步落盘
    const localDoc = documents.value.find(doc => doc.id === docId)
    if (localDoc) {
      Object.assign(localDoc, patch)
    }
    void updateCollaborationDocument(docId, patch)
  })
  // 协同身份使用当前登录用户的账号名，未取到时退化为随机名
  const localUser = {
    name: currentLoginName(),
  }
  currentCollabUser.value = localUser
  awareness.setLocalStateField('user', localUser)
  awareness.setLocalStateField('ts', Date.now())
  // 心跳：定期刷新时间戳，协作者据此判断彼此是否在线（直接关浏览器时服务端可能检测不到断连）
  if (provider) {
    collabHeartbeatTimer = setInterval(() => {
      provider.awareness.setLocalStateField('ts', Date.now())
    }, 5000)
  }
  // 同步当前房间的协作用户列表（awareness 变化时实时更新）
  const updateCollabUsers = () => {
    const users: { name: string, color?: string }[] = []
    const now = Date.now()
    for (const state of awareness.getStates().values()) {
      const s = state as { user?: { name: string, color?: string }, ts?: number }
      // 超过 15 秒未刷新心跳视为已退出，直接从列表移除
      if (!s.user || (s.ts !== undefined && now - s.ts > 15000)) {
        continue
      }
      users.push({ name: s.user.name, color: s.user.color })
    }
    collabUsers.value = users
  }
  collabAwareness = awareness
  collabAwarenessHandler = updateCollabUsers
  awareness.on('change', updateCollabUsers)
  updateCollabUsers()
  // 房间为空（无协作者、本地也无缓存）时，用 mock 内容作为初始文档。
  const maybeSeed = () => {
    if (epoch !== editorEpoch) {
      return
    }
    if (ytext.length === 0 && content) {
      isSeedingContent = true
      _editor?.clipboard.dangerouslyPasteHTML(content)
      isSeedingContent = false
    }
  }
  // 在线：等 provider 完成远端同步后再回填，避免与远端内容重复
  provider?.on('sync', (isSynced: boolean) => {
    if (isSynced) {
      hasSyncedRemote = true
      providerOffline = false
      maybeSeed()
      if (collabSyncStatus.value === 'connecting' || collabSyncStatus.value === 'syncing') {
        collabSyncStatus.value = 'connected'
      }
    }
  })
  // 离线：websocket 不会触发 sync，本地缓存读取完成且确认断连后，房间无内容则用 mock 内容兜底
  persistence.on('synced', () => {
    persistenceSynced = true
    if (providerOffline) {
      maybeSeed()
    }
  })
  const onStatus = (event: { status: string }) => {
    if (event.status === 'connected') {
      // 连接成功但尚未与远端完成内容同步时，保持“同步中”而不是“同步成功”
      collabSyncStatus.value = hasSyncedRemote ? 'connected' : 'connecting'
    }
    else {
      providerOffline = true
      // 断连后重置远端同步标记，重连完成新的 sync 前保持“同步中”，避免误报“同步成功”
      hasSyncedRemote = false
      collabSyncStatus.value = 'disconnected'
      // 离线时本地缓存已读完且房间无内容，则用 mock 内容兜底（maybeSeed 内有 epoch 与空内容守卫）
      if (persistenceSynced) {
        maybeSeed()
      }
    }
  }
  provider?.on('status', onStatus)
  collabStatusHandler = onStatus
  if (route.query.id === undefined) {
    _editor.focus()
  }
}

async function syncForm() {
  await ensureDocuments()
  // 等待接口期间用户可能已离开页面，编辑器容器已卸载
  if (!editorRef.value) {
    return
  }
  const id = route.query.id === undefined ? undefined : Number(route.query.id)
  if (id !== undefined && !documents.value.some(doc => doc.id === id)) {
    // 文档不存在（已删除或非法链接）：提示并返回列表，不为未知 id 打开协同房间
    Modal.message({ message: '文档不存在或已被删除', status: 'warning' })
    router.replace({ name: 'Editor', query: isCollaborationMode.value ? { view: 'collaboration' } : {} })
    return
  }
  if (id === loadedDocId) {
    return
  }
  loadedDocId = id
  pendingDocId.value = null
  title.value = activeDocument.value?.name ?? ''
  initEditor(activeDocument.value?.content ?? '')
  if (id === undefined) {
    _editor?.focus()
  }
}

onMounted(() => {
  syncForm()
  window.addEventListener('keydown', handleKeydown)
})

watch(() => route.query.id, syncForm, { flush: 'post' })

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  if (syncBackTimer) {
    clearTimeout(syncBackTimer)
  }
  destroyEditor()
})

function goBack() {
  const hasContent = !!(_editor?.getText().trim())
  // 有未保存的编辑但缺少标题时自动保存不会生效，返回会丢失这些编辑，先提示用户
  if (hasContent && !title.value.trim() && hasUnsavedEdits) {
    Modal.confirm({
      title: '提示',
      message: '文档尚未保存：已填写内容但缺少标题，返回后内容将丢失。确定要返回吗？',
    }).then((res: string) => {
      if (res === 'confirm') {
        pushBack()
      }
    })
    return
  }
  // 有标题时先把未触发的自动保存落盘，再返回
  if (title.value.trim()) {
    void doSave().finally(() => pushBack())
    return
  }
  pushBack()
}

function pushBack() {
  // 从多人协同进入的返回多人协同列表，否则返回开始创作列表
  router.push({
    name: 'Editor',
    query: isCollaborationMode.value ? { view: 'collaboration' } : {},
  })
}

function handleSelectDoc(id: number) {
  router.replace({
    name: 'EditorCreate',
    query: isCollaborationMode.value ? { id, from: 'collaboration' } : { id },
  })
}

const createMenuOptions = reactive({
  options: [
    { label: '创建文档', type: 'create', icon: iconEdit() },
    { label: '多人协同', type: 'collaboration', icon: iconGroup() },
  ],
  textField: 'label',
  // 弹层挂载到 body，样式需配合下方全局 style 块
  popperClass: 'editor-create-dropdown-menu',
})

function handleCreateMenuClick({ itemData }: any) {
  // 已处于新建模式时 query 不变不会触发 watch，这里强制重置编辑器
  loadedDocId = null
  collabRoomSeed = ''
  router.replace({
    name: 'EditorCreate',
    query: itemData?.type === 'collaboration' ? { from: 'collaboration' } : {},
  }).then(() => syncForm())
}

// 自动保存：标题或正文变化后延迟保存，无需手动点击保存按钮
let saveTimer: ReturnType<typeof setTimeout> | null = null
let syncBackTimer: ReturnType<typeof setTimeout> | null = null

function scheduleAutoSave() {
  hasUnsavedEdits = true
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveTimer = setTimeout(() => {
    saveTimer = null
    void doSave()
  }, 800)
}

// 离开当前文档前立即落盘未保存的编辑：守卫执行时 route.query.id 仍指向原文档，
// 否则编辑器被替换/卸载时会清掉定时器，最近 800ms 内的编辑会丢失
function flushPendingSave() {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
    void doSave()
  }
}

onBeforeRouteUpdate(flushPendingSave)
// 返回列表等离开本路由的场景会卸载组件，onBeforeRouteUpdate 不会触发，同样需要落盘
onBeforeRouteLeave(flushPendingSave)

watch(title, (value) => {
  // 文档加载时回填的标题不触发自动保存：协同模式下正文尚未同步完成，此时保存会把空内容写进文档；标题与文档名一致说明是回填或未改动，也无需保存
  if (value === activeDocument.value?.name) {
    return
  }
  scheduleAutoSave()
})

async function doSave(): Promise<boolean> {
  const name = title.value.trim()
  if (!name) {
    return false
  }
  const content = _editor?.getSemanticHTML() ?? editorRef.value?.innerHTML ?? ''
  // 协同模式保存时把当前用户并入文档成员（仅当真实编辑过内容），列表“成员”列可见
  const mergeMembers = (members: string[]) => {
    const userName = currentCollabUser.value?.name
    if (!userName || !hasUserContentEdit) {
      return members
    }
    // 新建文档时的「我」占位替换为真实协同用户名
    return [...new Set([...members.filter(member => member !== '我'), userName])]
  }
  const id = route.query.id !== undefined ? Number(route.query.id) : pendingDocId.value
  if (id == null) {
    // 新建模式首次保存：只写入数据，不改 URL，防止布局重挂载页面；id 由服务端生成后回填
    let doc: RichTextDocument | CollaborationDocument | null
    if (isCollaborationMode.value) {
      doc = await createCollaborationDocument({ name, content, members: mergeMembers(['我']) })
      if (!doc) {
        return false
      }
      // 首次保存拿到正式 id 后重绑到正式房间，后续协同编辑对列表用户可见
      rebindCollabRoom(doc.id)
    }
    else {
      doc = await createEditorDocument({ name, content, department: '未分类' })
      if (!doc) {
        return false
      }
    }
    documents.value.unshift(doc)
    pendingDocId.value = doc.id
    loadedDocId = doc.id
    hasUnsavedEdits = false
    return true
  }
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-')
  const localDoc = documents.value.find(item => item.id === id)
  // 本地列表与服务端记录同步更新：列表立即反映最新标题 / 时间，服务端由接口落盘
  if (isCollaborationMode.value) {
    const patch = {
      name,
      content,
      time: now,
      members: mergeMembers(localDoc && 'members' in localDoc ? localDoc.members : []),
    }
    const updated = await updateCollaborationDocument(id, patch)
    if (!updated) {
      return false
    }
    if (localDoc) {
      Object.assign(localDoc, patch)
    }
    hasUnsavedEdits = false
  }
  else {
    const patch = { name, content, time: now }
    const updated = await updateEditorDocument(id, patch)
    if (!updated) {
      // 文档可能已被删除（如 id 不存在），保存失败时不再向上报成功
      return false
    }
    if (localDoc) {
      Object.assign(localDoc, patch)
    }
    hasUnsavedEdits = false
  }
  return true
}

function resetPage() {
  loadedDocId = null
  collabRoomSeed = ''
  router.replace({
    name: 'EditorCreate',
    query: isCollaborationMode.value ? { from: 'collaboration' } : {},
  }).then(() => syncForm())
}

function handleDelete() {
  const pendingId = pendingDocId.value
  if (isCreateMode.value && pendingId == null) {
    Modal.confirm({
      title: '提示',
      message: '当前文档尚未保存，确定清空并新建文档吗？',
    }).then((res: string) => {
      if (res === 'confirm') {
        resetPage()
      }
    })
    return
  }
  Modal.confirm({
    title: '删除确认',
    message: `确定要删除文档「${title.value || '未命名文档'}」吗？删除后不可恢复。`,
  }).then(async (res: string) => {
    if (res !== 'confirm') {
      return
    }
    const id = isCreateMode.value ? pendingId! : Number(route.query.id)
    if (isCollaborationMode.value) {
      // 未落盘的自动保存先触发并清掉定时器，避免删除后残留的 saveTimer 以“新建”名义把已删内容写回来
      flushPendingSave()
      // 当前打开的协同房间还持有 IndexedDB 连接，先销毁编辑器释放连接，避免数据清理被阻塞
      destroyEditor()
      // 先清理本地 IndexedDB 房间数据再删服务端记录，避免同 id 重建文档时复活旧内容；
      // 首次清理可能被其他连接阻塞超时，等 pending 删除落定后重试
      let removed = await removeCollabDocument(id)
      if (!removed) {
        await waitCollabRoomDataSettled(`tiny-pro-collab-${id}`)
        removed = await removeCollabDocument(id)
      }
      if (!removed) {
        // 仍有其他页面持有该房间连接导致清理无法完成：恢复编辑器并重建房间连接（优先使用房间实时内容，快照仅在房间为空时兜底），避免页面空白不可用
        initEditor(activeDocument.value?.content ?? '')
        Modal.message({ message: '删除失败：本地协同数据清理未完成，请重试', status: 'error' })
        return
      }
    }
    else {
      const removed = await deleteEditorDocument(id)
      if (!removed) {
        Modal.message({ message: '删除失败：文档不存在或已被删除', status: 'error' })
        return
      }
    }
    documents.value = documents.value.filter(doc => doc.id !== id)
    Modal.message({ message: '删除成功', status: 'success' })
    resetPage()
  })
}

// 删除协同文档：先清本地 IndexedDB 房间数据（失败则不动服务端记录），再调接口删除
async function removeCollabDocument(id: number): Promise<boolean> {
  if (!await clearCollabRoomData(id)) {
    return false
  }
  return deleteCollaborationDocument(id)
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

async function handleKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    if (!title.value.trim()) {
      Modal.message({ message: '请输入文档标题', status: 'warning' })
      return
    }
    const saved = await doSave()
    Modal.message({
      message: saved ? '文档已自动保存，无需手动保存' : '保存失败，文档不存在或已被删除',
      status: saved ? 'success' : 'error',
    })
    return
  }
  if (event.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}
</script>

<template>
  <div class="editor-create-page">
    <Breadcrumb :items="isCollaborationMode ? ['menu.form', 'menu.form.editor', 'menu.form.editor.collaboration'] : ['menu.form', 'menu.form.editor', 'menu.form.editor.create']" />
    <div class="editor-create" :class="{ 'editor-create--fullscreen': isFullscreen }">
      <div class="editor-create-list">
        <div class="editor-create-back" @click="goBack">
          <span class="editor-create-back-icon"><IconChevronLeft /></span>
          <span class="editor-create-back-text">返回</span>
        </div>
        <div class="editor-create-new">
          <TinyDropdown
            class="editor-create-new-dropdown"
            inherit-width border
            :menu-options="createMenuOptions"
            @item-click="handleCreateMenuClick"
          >
            <span class="editor-create-trigger-label">
              <span class="editor-create-trigger-icon"><IconAdd /></span>
              新建文档
            </span>
          </TinyDropdown>
        </div>
        <div class="editor-create-list-body">
          <div class="editor-create-list-title">
            文档列表
          </div>
          <div
            v-for="doc in documents"
            :key="doc.id"
            class="editor-create-item"
            :class="{ 'editor-create-item--active': doc.id === activeDocument?.id }"
            @click="handleSelectDoc(doc.id)"
          >
            <div class="editor-create-item-name">
              {{ doc.name }}
            </div>
            <div class="editor-create-item-time">
              {{ doc.time }}
            </div>
          </div>
        </div>
      </div>
      <div class="editor-create-content">
        <div class="editor-create-content-header">
          <div class="editor-create-content-fields">
            <div v-if="isFullscreen" class="editor-create-fullback" @click="goBack">
              <span class="editor-create-back-icon"><IconChevronLeft /></span>
              <span class="editor-create-fullback-text">返回</span>
              <span class="editor-create-fullback-divider">|</span>
            </div>
            <div class="editor-create-content-field">
              <TinyInput v-model="title" placeholder="请输入文档标题" class="editor-create-content-input" />
            </div>
          </div>
          <div class="editor-create-actions">
            <span class="editor-create-action editor-create-action--danger" title="删除" @click="handleDelete">
              <IconDel />
            </span>
            <span class="editor-create-action" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
              <component :is="isFullscreen ? iconMinscreenRight() : iconFullscreenRight()" />
            </span>
          </div>
        </div>
        <div class="editor-create-editor-scroll">
          <div v-if="isCollaborationMode" class="editor-create-statusbar">
            <span class="editor-create-sync">
              <component :is="IconSync" />
              <span class="editor-create-sync-text">{{ syncStatusText }}</span>
            </span>
            <span class="editor-create-collabusers">
              <span
                v-for="user in visibleUsers"
                :key="user.name"
                class="editor-create-collabuser"
                :style="{ color: user.color }"
              >
                <IconUser />
                <span class="editor-create-collabuser-name">{{ user.name }}</span>
              </span>
              <TinyDropdown
                v-if="moreUsers.length"
                class="editor-create-more"
                :suffix-icon="IconEllipsis"
                trigger="hover"
                :menu-options="{ options: moreUsers, textField: 'label', popperClass: 'editor-create-dropdown-menu' }"
              >
                <span class="editor-create-more-trigger" /></TinyDropdown>
              <span v-if="!collabUsers.length" class="editor-create-collabusers-empty">连接中…</span>
            </span>
          </div>
          <div ref="editorRef" class="editor-create-content-editor" />
        </div>
        <div class="editor-desc">
          <a href="https://docs.opentiny.design/tiny-editor/guide/quick-start.html" target="_blank" rel="noopener noreferrer">
            点击查看 → TinyEditor 官方文档
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.editor-create-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

// 全屏：不遮挡左侧主菜单与面包屑，仅隐藏文档目录列表，编辑器占用其空间
.editor-create--fullscreen {
  .editor-create-list {
    display: none;
  }
}

.editor-create {
  display: flex;
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 10px;
}

.editor-create-list {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 300px;
  padding: 32px;
  border-right: 1px solid #e8e8e8;
}

.editor-create-list-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-top: 1px solid #f0f0f0;
}

.editor-create-list-title {
  font-size: 16px;
  font-weight: 600;
  color: #191919;
  line-height: 24px;
  margin: 20px 0;
}

.editor-create-back {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 8px;
  margin-bottom: 20px;
  cursor: pointer;
  color: #1476ff;

  &:hover {
    color: #0b5ed7;
  }
}

.editor-create-back-icon {
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
  font-size: 16px;
}

.editor-create-back-text {
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
}

.editor-create-new {
  margin-bottom: 20px;
}

.editor-create-new-dropdown {
  width: 100%;

  :deep(.tiny-dropdown__border) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 40px;
    padding: 12px 20px;
    font-weight: 700;
    color: #fff;
    background: #1476ff;
    border-color: #1476ff;

    &:hover,
    &:focus {
      color: #fff;
      background: #0e63d8;
      border-color: #0e63d8;

      svg {
        fill: #fff;
      }
    }

    // 覆盖主题 hover 下图标变色规则
    &:hover.tiny-button.tiny-button--default:not(.is-disabled) .tiny-svg {
      fill: #fff;
    }

    svg {
      fill: #fff;
    }
  }
}

.editor-create-trigger-label {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
}

.editor-create-trigger-icon {
  display: inline-flex;
  font-size: 16px;
  margin-right: 16px;
}

.editor-create-fullback {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
  margin-right: 8px;
  cursor: pointer;
  color: #1476ff;

  &:hover {
    color: #0b5ed7;
  }
}

.editor-create-fullback-text {
  font-size: 14px;
  line-height: 22px;
}

.editor-create-fullback-divider {
  margin-left: 12px;
  font-size: 14px;
  font-weight: 400;
  color: #d9d9d9;
}

.editor-create-item {
  height: 76px;
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  background: #ffffff;
  border-radius: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #f5f5f5;
  }
}

.editor-create-item--active {
  background: #f5f5f5;
}

.editor-create-item-name {
  font-size: 14px;
  font-weight: 550;
  line-height: 20px;
  color: #595959;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.editor-create-item-time {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  color: #808080;
}

.editor-create-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.editor-create-content-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 32px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.editor-create-content-fields {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.editor-create-content-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-create-content-input {
  width: 360px;
  min-width: 0;
  flex-shrink: 1;

  // 无边框输入框，聚焦时显示
  :deep(.tiny-input__inner) {
    font-size: 18px;

    &,
    &:hover {
      border-color: transparent;
    }

    &::placeholder {
      font-size: 18px;
    }

    &:focus {
      border-color: #191919;
    }
  }
}

// 编辑器内顶部状态栏：位于工具栏下方，宽度随编辑器，左侧同步状态，右侧协同用户
// ::before 在状态栏行补画编辑框左右边框，保证工具栏-状态栏-编辑区的外框连续
.editor-create-statusbar {
  position: relative;
  order: 2;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  margin: 24px 16px 0px;
  padding: 0 12px;
  font-size: 12px;
  border-radius: 8px;
  color: #595959;
  background: #f5f5f5;

  &::before {
    position: absolute;
    top: -24px;
    bottom: 0;
    left: -16px;
    right: -16px;
    pointer-events: none;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    content: '';
  }
}

.editor-create-sync {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
  white-space: nowrap;

  .editor-create-sync-text {
    color: #595959;
    font-size: 14px;
  }

  .tiny-svg {
    fill: currentcolor;
    font-size: 14px;
  }
}

.editor-create-collabusers {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.editor-create-collabuser {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .tiny-svg {
    fill: currentcolor;
    font-size: 14px;
  }
}

.editor-create-collabuser-name {
  font-weight: 500;
  font-size: 14px;
  color: #595959;
}

.editor-create-collabusers-empty {
  color: #999;
}

// 超过 3 个用户时的 ellipsis 更多入口
.editor-create-more {
  display: inline-flex;

  :deep(.tiny-dropdown__suffix-inner) {
    .tiny-svg {
      fill: #595959;
    }
  }

  .editor-create-more-trigger {
    display: inline-flex;
    align-items: center;
    color: #595959;
    cursor: pointer;

    .tiny-svg {
      fill: currentcolor;
    }
  }
}

.editor-create-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.editor-create-action {
  display: inline-flex;
  font-size: 18px;
  color: #666;
  cursor: pointer;

  .tiny-svg {
    fill: #191919;
  }
}

.editor-create-editor-scroll {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 16px 32px;

  :deep(.ql-toolbar) {
    order: 1;
    flex-shrink: 0;
  }
}

// 编辑器撑满剩余空间，滚动只发生在 .ql-editor 内部
.editor-create-content-editor {
  order: 3;
  flex: 1;
  min-height: 0;
  height: auto;

  :deep(.ql-editor) {
    color: #000;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p,
    li,
    blockquote {
      color: #000;
    }
  }
}

.editor-desc {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  font-size: 14px;
  color: #999;
  padding-bottom: 16px;

  a {
    color: #1890ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

// 下拉弹层挂载到 body，需用非 scoped 样式
<style lang="less">
// 下拉菜单
.editor-create-dropdown-menu.tiny-dropdown-menu {
  padding: 8px;

  .tiny-dropdown-item {
    height: 40px;
    margin-bottom: 4px;
    padding: 0 12px;
    line-height: 40px;
    border-radius: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background: #f5f5f5;
      border-radius: 16px;
    }

    .tiny-dropdown-item__wrap .tiny-dropdown-item__content .tiny-dropdown-item__label {
      margin-left: 2px;
    }
  }
}
</style>
