import type { MenuNode } from './backend-data'
import type { BackendStorage } from './backend-persist'
import type { MockHeaders, MockMethod } from './dispatch'
import {
  createDefaultBackendStorage,
  loadBackendState,
  withBackendPersist,
} from './backend-persist'
import { mockHttpResponse } from './dispatch'

function nextId(items: { id: number }[]) {
  return Math.max(0, ...items.map(item => item.id)) + 1
}

function paginate<T>(items: T[], query: URLSearchParams) {
  const page = Math.max(1, Number(query.get('page') ?? 1))
  const limit = Math.max(1, Number(query.get('limit') ?? 10))
  const start = (page - 1) * limit
  return {
    items: items.slice(start, start + limit),
    meta: {
      currentPage: page,
      itemCount: Math.min(limit, Math.max(0, items.length - start)),
      itemsPerPage: limit,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  }
}

function includesFilter(value: string, filter: string | null) {
  return !filter || value.toLowerCase().includes(filter.replaceAll('%', '').toLowerCase())
}

function flattenMenus(nodes: MenuNode[]): MenuNode[] {
  return nodes.flatMap(node => [node, ...flattenMenus(node.children)])
}

function selectMenus(nodes: MenuNode[], ids: Set<number>): MenuNode[] {
  return nodes.flatMap((node) => {
    const children = selectMenus(node.children, ids)
    if (!ids.has(node.id) && !children.length) {
      return []
    }
    return [{ ...node, children }]
  })
}

function findMenuLocation(nodes: MenuNode[], id: number): {
  node: MenuNode
  siblings: MenuNode[]
} | null {
  for (const node of nodes) {
    if (node.id === id) {
      return { node, siblings: nodes }
    }
    const child = findMenuLocation(node.children, id)
    if (child) {
      return child
    }
  }
  return null
}

function bearerToken(headers: MockHeaders) {
  const value = headers.authorization
  return Array.isArray(value) ? value[0]?.replace(/^Bearer\s+/i, '') : value?.replace(/^Bearer\s+/i, '')
}

async function digestPassword(password: string) {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(password),
  )
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

export function createBackendMocks(storage: BackendStorage = createDefaultBackendStorage()): MockMethod[] {
  const state = loadBackendState(storage)

  const syncRoleMenus = (roleMenuIds: Map<number, Set<number>>) => {
    state.roles.forEach((role) => {
      role.menus = selectMenus(state.menuTree, roleMenuIds.get(role.id) ?? new Set())
    })
  }

  const snapshotRoleMenuIds = () => new Map(
    state.roles.map(role => [role.id, new Set(flattenMenus(role.menus).map(item => item.id))]),
  )

  const removeFormattedLocale = (record: any) => {
    delete state.localeTable[record.lang.name]?.[record.key]
  }

  const writeFormattedLocale = (record: any) => {
    state.localeTable[record.lang.name] ??= {}
    state.localeTable[record.lang.name][record.key] = record.content
  }

  const authenticatedEmail = (
    headers: MockHeaders,
  ) => {
    const token = bearerToken(headers)
    if (!token) {
      return undefined
    }
    const email = state.tokens.get(token)
    if (email) {
      return email
    }
    // 兼容仅前端项目的模拟登录（VITE_MOCK_LOGIN_ENABLED）：前端本地签发
    // mock-local-access-token:<email>（刻意与服务端 mock-access-token 区分，
    // 避免登出后仅靠前缀又被认证），按 token 中的邮箱直接认证
    if (token.startsWith('mock-local-access-token:')) {
      return token.slice('mock-local-access-token:'.length)
    }
    return undefined
  }

  return withBackendPersist([
    {
      url: '/api/auth/login',
      method: 'post',
      response: async ({ body }) => {
        const passwordHash = await digestPassword(body?.password ?? '')
        const email = body?.email
        if (!email || !state.users.some(item => item.email === email) || state.credentials.get(email) !== passwordHash) {
          return mockHttpResponse(401, { message: '邮箱或密码错误' })
        }
        const accessToken = `mock-access-token:${email}`
        const refreshToken = `mock-refresh-token:${email}`
        state.tokens.set(accessToken, email)
        state.refreshTokens.set(refreshToken, email)
        return {
          accessToken,
          accessTokenTTL: 3600,
          refreshToken,
          refreshTokenTTL: 86400,
        }
      },
    },
    {
      url: '/api/auth/token/refresh',
      method: 'post',
      response: ({ body }) => {
        const email = state.refreshTokens.get(body?.token)
        if (!email) {
          return mockHttpResponse(401, { message: '刷新令牌无效' })
        }
        state.refreshTokens.set(body.token, email)
        const accessToken = `mock-access-token:${email}`
        const refreshToken = `mock-refresh-token:${email}`
        state.tokens.set(accessToken, email)
        return {
          accessToken,
          accessTokenTTL: 3600,
          refreshToken,
          refreshTokenTTL: 86400,
        }
      },
    },
    {
      url: '/api/auth/logout',
      method: 'post',
      response: ({ headers }) => {
        const token = bearerToken(headers)
        if (token) {
          state.tokens.delete(token)
        }
        return true
      },
    },
    {
      url: '/api/user/info/:email?',
      response: ({ headers, params }) => {
        const authenticatedUser = authenticatedEmail(headers)
        if (!authenticatedUser) {
          return mockHttpResponse(401, { message: '请先登录' })
        }
        const email = params.email || authenticatedUser
        const user = state.users.find(item => item.email === email)
        return user ?? mockHttpResponse(404, { message: '用户不存在' })
      },
    },
    {
      url: '/api/role/info/:id',
      response: ({ params }) => {
        const role = state.roles.find(item => item.id === Number(params.id))
        return role ?? mockHttpResponse(404, { message: '角色不存在' })
      },
    },
    {
      url: '/api/menu/role/:email',
      response: ({ params }) => {
        const user = state.users.find(item => item.email === params.email)
        if (!user) {
          return mockHttpResponse(404, { message: '用户不存在' })
        }
        const ids = new Set(
          user.role.flatMap(role => flattenMenus(role.menus).map(item => item.id)),
        )
        return selectMenus(state.menuTree, ids)
      },
    },
    {
      url: '/api/lang',
      response: () => state.languages,
    },
    {
      url: '/api/lang',
      method: 'post',
      response: ({ body }) => {
        const language = { id: nextId(state.languages), name: body.name }
        state.languages.push(language)
        state.localeTable[language.name] = {}
        return language
      },
    },
    {
      url: '/api/lang/:id',
      method: 'patch',
      response: ({ body, params }) => {
        const language = state.languages.find(item => item.id === Number(params.id))
        if (!language) {
          return mockHttpResponse(404, { message: '语言不存在' })
        }
        const oldName = language.name
        Object.assign(language, body)
        if (oldName !== language.name) {
          state.localeTable[language.name] = state.localeTable[oldName] ?? {}
          delete state.localeTable[oldName]
          state.localeRecords
            .filter(item => item.lang.id === language.id)
            .forEach((item) => {
              item.lang.name = language.name
            })
        }
        return language
      },
    },
    {
      url: '/api/lang/:id',
      method: 'delete',
      response: ({ params }) => {
        const index = state.languages.findIndex(item => item.id === Number(params.id))
        if (index < 0) {
          return mockHttpResponse(404, { message: '语言不存在' })
        }
        if (state.localeRecords.some(item => item.lang.id === Number(params.id))) {
          return mockHttpResponse(409, { message: '语言仍被国际化词条引用' })
        }
        const language = state.languages.splice(index, 1)[0]
        delete state.localeTable[language.name]
        state.localeRecords = state.localeRecords.filter(item => item.lang.id !== language.id)
        return language
      },
    },
    {
      url: '/api/i18/format',
      response: ({ query }) => {
        const language = query.get('lang')
        if (!language) {
          return state.localeTable
        }
        return { [language]: state.localeTable[language] ?? {} }
      },
    },
    {
      url: '/api/permission',
      response: ({ query }) => {
        const filtered = state.permissions.filter(item => includesFilter(item.name, query.get('name')))
        return query.has('page') || query.has('limit') ? paginate(filtered, query) : filtered
      },
    },
    {
      url: '/api/permission',
      method: 'post',
      response: ({ body }) => {
        const permission = { id: nextId(state.permissions), name: body.name, desc: body.desc ?? '' }
        state.permissions.push(permission)
        return permission
      },
    },
    {
      url: '/api/permission',
      method: 'patch',
      response: ({ body }) => {
        const permission = state.permissions.find(item => item.id === Number(body.id))
        if (!permission) {
          return mockHttpResponse(404, { message: '权限不存在' })
        }
        Object.assign(permission, body)
        return permission
      },
    },
    {
      url: '/api/permission/:id',
      method: 'delete',
      response: ({ params }) => {
        const index = state.permissions.findIndex(item => item.id === Number(params.id))
        if (index < 0) {
          return mockHttpResponse(404, { message: '权限不存在' })
        }
        if (state.roles.some(role => role.permission.some(item => item.id === Number(params.id)))) {
          return mockHttpResponse(409, { message: '权限仍被角色引用' })
        }
        return state.permissions.splice(index, 1)[0]
      },
    },
    {
      url: '/api/user',
      response: ({ query }) => {
        const roleIds = new Set(
          (query.get('role') ?? '').split(',').filter(Boolean).map(Number),
        )
        const filtered = state.users.filter(item => (
          includesFilter(item.name, query.get('name'))
          && includesFilter(item.email, query.get('email'))
          && (!roleIds.size || item.role.some(role => roleIds.has(role.id)))
        ))
        return paginate(filtered, query)
      },
    },
    {
      url: '/api/user/reg',
      method: 'post',
      response: async ({ body }) => {
        const email = body.email ?? body.username
        const passwordHash = await digestPassword(body.password ?? '')
        if (!email || state.users.some(item => item.email === email)) {
          return mockHttpResponse(409, { message: '用户已存在或邮箱为空' })
        }
        const { password: _password, username: _username, ...userData } = body
        const roleIds = body.roleIds ?? (state.roles[0] ? [state.roles[0].id] : [])
        const user = {
          ...state.users[0],
          ...userData,
          email,
          name: body.name ?? email,
          id: String(nextId(state.users.map(item => ({ id: Number(item.id) })))),
          role: state.roles.filter(role => roleIds.includes(role.id)),
        }
        state.users.push(user)
        state.credentials.set(email, passwordHash)
        return user
      },
    },
    {
      url: '/api/user/update',
      method: 'patch',
      response: ({ body }) => {
        const user = state.users.find(item => item.email === body.email)
        if (!user) {
          return mockHttpResponse(404, { message: '用户不存在' })
        }
        const { roleIds, ...userInfo } = body
        Object.assign(user, userInfo)
        if (roleIds) {
          user.role = state.roles.filter(role => roleIds.includes(role.id))
        }
        return user
      },
    },
    {
      url: '/api/user/:email',
      method: 'delete',
      response: ({ params }) => {
        const index = state.users.findIndex(item => item.email === params.email)
        if (index < 0) {
          return mockHttpResponse(404, { message: '用户不存在' })
        }
        const user = state.users.splice(index, 1)[0]
        state.credentials.delete(user.email)
        return user
      },
    },
    {
      url: '/api/user/batch',
      method: 'post',
      response: ({ body }) => {
        const emails = Array.isArray(body) ? body : []
        const removed = state.users.filter(item => emails.includes(item.email))
        state.users = state.users.filter(item => !emails.includes(item.email))
        removed.forEach(user => state.credentials.delete(user.email))
        return removed
      },
    },
    {
      url: '/api/user/admin/updatePwd',
      method: 'patch',
      response: async ({ body }) => {
        const passwordHash = await digestPassword(body.newPassword ?? '')
        if (!body.email || !state.users.some(item => item.email === body.email) || !state.credentials.has(body.email)) {
          return mockHttpResponse(404, { message: '用户不存在' })
        }
        state.credentials.set(body.email, passwordHash)
        return true
      },
    },
    {
      url: '/api/user/updatePwd',
      method: 'patch',
      response: async ({ body }) => {
        const [oldHash, newHash] = await Promise.all([
          digestPassword(body.oldPassword ?? ''),
          digestPassword(body.newPassword ?? ''),
        ])
        if (
          !body.email
          || !state.users.some(item => item.email === body.email)
          || state.credentials.get(body.email) !== oldHash
        ) {
          return mockHttpResponse(401, { message: '旧密码错误' })
        }
        state.credentials.set(body.email, newHash)
        return true
      },
    },
    {
      url: '/api/role',
      response: () => state.roles,
    },
    {
      url: '/api/role/detail',
      response: ({ query }) => {
        const filtered = state.roles.filter(item => includesFilter(item.name, query.get('name')))
        return {
          roleInfo: paginate(filtered, query),
          menuTree: filtered.map(role => role.menus),
        }
      },
    },
    {
      url: '/api/role',
      method: 'post',
      response: ({ body }) => {
        const role = {
          id: nextId(state.roles),
          name: body.name,
          permission: state.permissions.filter(item => (body.permissionIds ?? []).includes(item.id)),
          menus: selectMenus(state.menuTree, new Set(body.menuIds ?? [])),
        }
        state.roles.push(role)
        return role
      },
    },
    {
      url: '/api/role',
      method: 'patch',
      response: ({ body }) => {
        const role = state.roles.find(item => item.id === Number(body.id))
        if (!role) {
          return mockHttpResponse(404, { message: '角色不存在' })
        }
        if (body.name) {
          role.name = body.name
        }
        if (body.permissionIds) {
          role.permission = state.permissions.filter(item => body.permissionIds.includes(item.id))
        }
        if (body.menuIds) {
          role.menus = selectMenus(state.menuTree, new Set(body.menuIds))
        }
        return role
      },
    },
    {
      url: '/api/role/:id',
      method: 'delete',
      response: ({ params }) => {
        const index = state.roles.findIndex(item => item.id === Number(params.id))
        if (index < 0) {
          return mockHttpResponse(404, { message: '角色不存在' })
        }
        if (state.users.some(user => user.role.some(role => role.id === Number(params.id)))) {
          return mockHttpResponse(409, { message: '角色仍被用户引用' })
        }
        return state.roles.splice(index, 1)[0]
      },
    },
    {
      url: '/api/menu',
      response: () => state.menuTree,
    },
    {
      url: '/api/menu',
      method: 'post',
      response: ({ body }) => {
        const roleMenuIds = snapshotRoleMenuIds()
        const item = {
          id: nextId(flattenMenus(state.menuTree)),
          label: body.name,
          url: body.path,
          component: body.component,
          customIcon: body.icon ?? '',
          menuType: body.menuType ?? 'normal',
          parentId: body.parentId ?? null,
          order: body.order ?? 0,
          locale: body.locale,
          children: [],
        }
        if (item.parentId === null) {
          state.menuTree.push(item)
        }
        else {
          const parent = findMenuLocation(state.menuTree, Number(item.parentId))
          if (!parent) {
            return mockHttpResponse(404, { message: '父菜单不存在' })
          }
          parent.node.children.push(item)
        }
        syncRoleMenus(roleMenuIds)
        return item
      },
    },
    {
      url: '/api/menu',
      method: 'patch',
      response: ({ body }) => {
        const roleMenuIds = snapshotRoleMenuIds()
        const location = findMenuLocation(state.menuTree, Number(body.id))
        if (!location) {
          return mockHttpResponse(404, { message: '菜单不存在' })
        }
        const index = location.siblings.indexOf(location.node)
        location.siblings.splice(index, 1)
        Object.assign(location.node, {
          label: body.name ?? location.node.label,
          url: body.path ?? location.node.url,
          component: body.component ?? location.node.component,
          customIcon: body.icon ?? location.node.customIcon,
          menuType: body.menuType ?? location.node.menuType,
          parentId: body.parentId ?? null,
          order: body.order ?? location.node.order,
          locale: body.locale ?? location.node.locale,
        })
        if (location.node.parentId === null) {
          state.menuTree.push(location.node)
        }
        else {
          const parent = findMenuLocation(state.menuTree, Number(location.node.parentId))
          if (!parent) {
            location.siblings.splice(index, 0, location.node)
            return mockHttpResponse(404, { message: '父菜单不存在' })
          }
          parent.node.children.push(location.node)
        }
        syncRoleMenus(roleMenuIds)
        return location.node
      },
    },
    {
      url: '/api/menu',
      method: 'delete',
      response: ({ query }) => {
        const roleMenuIds = snapshotRoleMenuIds()
        const location = findMenuLocation(state.menuTree, Number(query.get('id')))
        if (!location) {
          return mockHttpResponse(404, { message: '菜单不存在' })
        }
        const index = location.siblings.indexOf(location.node)
        const removed = location.siblings.splice(index, 1)[0]
        const parentId = Number(query.get('parentId'))
        const target = parentId === -1
          ? state.menuTree
          : findMenuLocation(state.menuTree, parentId)?.node.children
        if (target) {
          removed.children.forEach((child) => {
            child.parentId = parentId === -1 ? null : parentId
            target.push(child)
          })
        }
        roleMenuIds.forEach(ids => ids.delete(removed.id))
        syncRoleMenus(roleMenuIds)
        return removed
      },
    },
    {
      url: '/api/i18',
      response: ({ query }) => {
        const languageIds = new Set(
          (query.get('lang') ?? '').split(',').filter(Boolean).map(Number),
        )
        const records = state.localeRecords.filter(item => (
          includesFilter(item.key, query.get('key'))
          && includesFilter(String(item.content), query.get('content'))
          && (!languageIds.size || languageIds.has(item.lang.id))
        ))
        if (query.get('all') && query.get('all') !== '0') {
          const allQuery = new URLSearchParams({
            page: '1',
            limit: String(Math.max(1, records.length)),
          })
          return paginate(records, allQuery)
        }
        return paginate(records, query)
      },
    },
    {
      url: '/api/i18',
      method: 'post',
      response: ({ body }) => {
        const language = state.languages.find(item => item.id === Number(body.lang))
        if (!language) {
          return mockHttpResponse(404, { message: '语言不存在' })
        }
        const record = {
          id: nextId(state.localeRecords),
          key: body.key,
          content: body.content,
          lang: language,
        }
        state.localeRecords.push(record)
        writeFormattedLocale(record)
        return record
      },
    },
    {
      url: '/api/i18/batch',
      method: 'post',
      response: ({ body }) => {
        const ids = Array.isArray(body) ? body : body.ids ?? []
        const removed = state.localeRecords.filter(item => ids.includes(item.id) || ids.includes(String(item.id)))
        removed.forEach(removeFormattedLocale)
        state.localeRecords = state.localeRecords.filter(item => !removed.includes(item))
        return removed
      },
    },
    {
      url: '/api/i18/:id',
      method: 'patch',
      response: ({ body, params }) => {
        const record = state.localeRecords.find(item => item.id === Number(params.id))
        if (!record) {
          return mockHttpResponse(404, { message: '词条不存在' })
        }
        const language = body.lang === undefined
          ? record.lang
          : state.languages.find(item => item.id === Number(body.lang))
        if (!language) {
          return mockHttpResponse(404, { message: '语言不存在' })
        }
        removeFormattedLocale(record)
        Object.assign(record, {
          content: body.content ?? record.content,
          key: body.key ?? record.key,
          lang: language,
        })
        writeFormattedLocale(record)
        return record
      },
    },
    {
      url: '/api/i18/:id',
      method: 'delete',
      response: ({ params }) => {
        const index = state.localeRecords.findIndex(item => item.id === Number(params.id))
        if (index < 0) {
          return mockHttpResponse(404, { message: '词条不存在' })
        }
        const record = state.localeRecords.splice(index, 1)[0]
        removeFormattedLocale(record)
        return record
      },
    },
  ], storage, state)
}
