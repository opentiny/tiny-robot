import type { BackendState } from './backend-data'
import type { MockMethod } from './dispatch'
import { createBackendState } from './backend-data'

export const MOCK_BACKEND_STORAGE_KEY = 'tiny-pro-mock-backend-state'
const MOCK_BACKEND_STATE_VERSION = 2

export interface BackendStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function createMemoryStorage(): BackendStorage {
  const data = new Map<string, string>()
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
}

export function createDefaultBackendStorage(): BackendStorage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  }
  catch {
    // Accessing localStorage can throw in some private browsing modes.
  }
  return createMemoryStorage()
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isIdRecord(value: unknown): value is { id: number } {
  return isObject(value) && typeof value.id === 'number'
}

function isMenuNode(value: unknown): boolean {
  return isObject(value)
    && typeof value.id === 'number'
    && Array.isArray(value.children)
    && value.children.every(isMenuNode)
}

function isRole(value: unknown): boolean {
  return isObject(value)
    && typeof value.id === 'number'
    && Array.isArray(value.permission)
    && value.permission.every(isIdRecord)
    && Array.isArray(value.menus)
    && value.menus.every(isMenuNode)
}

function isUser(value: unknown): boolean {
  return isObject(value)
    && typeof value.email === 'string'
    && Array.isArray(value.role)
    && value.role.every(isIdRecord)
}

function isLanguage(value: unknown): boolean {
  return isObject(value) && typeof value.id === 'number' && typeof value.name === 'string'
}

function isLocaleRecord(value: unknown): boolean {
  return isObject(value)
    && typeof value.id === 'number'
    && isObject(value.lang)
    && typeof value.lang.name === 'string'
}

function everyItem<T>(value: unknown, check: (item: T) => boolean): value is T[] {
  return Array.isArray(value) && value.every(check)
}

function isStringPairList(value: unknown): value is [string, string][] {
  return Array.isArray(value) && value.every(
    item => Array.isArray(item)
      && item.length === 2
      && typeof item[0] === 'string'
      && typeof item[1] === 'string',
  )
}

function serializeBackendState(state: BackendState) {
  return {
    version: MOCK_BACKEND_STATE_VERSION,
    credentials: [...state.credentials.entries()],
    languages: state.languages,
    localeTable: state.localeTable,
    localeRecords: state.localeRecords,
    menuTree: state.menuTree,
    permissions: state.permissions,
    roles: state.roles,
    refreshTokens: [...state.refreshTokens.entries()],
    tokens: [...state.tokens.entries()],
    users: state.users,
  }
}

function rebindRoles(state: {
  permissions: BackendState['permissions']
  roles: BackendState['roles']
}): BackendState['roles'] {
  return state.roles.map(role => ({
    ...role,
    permission: (role.permission ?? [])
      .map(item => state.permissions.find(permission => permission.id === item.id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
  }))
}

function rebindUsers(
  users: BackendState['users'],
  roles: BackendState['roles'],
): BackendState['users'] {
  return users.map(user => ({
    ...user,
    role: (user.role ?? [])
      .map(item => roles.find(role => role.id === item.id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
  }))
}

function deserializeBackendState(raw: unknown): BackendState | null {
  if (!isObject(raw) || raw.version !== MOCK_BACKEND_STATE_VERSION) {
    return null
  }
  if (
    !isStringPairList(raw.credentials)
    || !isStringPairList(raw.tokens)
    || !isStringPairList(raw.refreshTokens)
    || !everyItem(raw.users, isUser)
    || !everyItem(raw.languages, isLanguage)
    || !everyItem(raw.localeRecords, isLocaleRecord)
    || !everyItem(raw.menuTree, isMenuNode)
    || !everyItem(raw.permissions, isIdRecord)
    || !everyItem(raw.roles, isRole)
    || !isObject(raw.localeTable)
  ) {
    return null
  }

  const permissions = raw.permissions as BackendState['permissions']
  const roles = rebindRoles({
    permissions,
    roles: raw.roles as BackendState['roles'],
  })

  return {
    credentials: new Map(raw.credentials),
    languages: raw.languages as BackendState['languages'],
    localeTable: raw.localeTable as BackendState['localeTable'],
    localeRecords: raw.localeRecords as BackendState['localeRecords'],
    menuTree: raw.menuTree as BackendState['menuTree'],
    permissions,
    roles,
    refreshTokens: new Map(raw.refreshTokens),
    tokens: new Map(raw.tokens),
    users: rebindUsers(raw.users as BackendState['users'], roles),
  }
}

export function loadBackendState(storage: BackendStorage): BackendState {
  try {
    const raw = storage.getItem(MOCK_BACKEND_STORAGE_KEY)
    if (!raw) {
      return createBackendState()
    }
    return deserializeBackendState(JSON.parse(raw)) ?? createBackendState()
  }
  catch {
    return createBackendState()
  }
}

function saveBackendState(storage: BackendStorage, state: BackendState) {
  try {
    storage.setItem(
      MOCK_BACKEND_STORAGE_KEY,
      JSON.stringify(serializeBackendState(state)),
    )
  }
  catch {
    // Ignore quota and private-mode write failures.
  }
}

export function withBackendPersist(
  mocks: MockMethod[],
  storage: BackendStorage,
  state: BackendState,
): MockMethod[] {
  const persist = () => saveBackendState(storage, state)
  return mocks.map(mock => ({
    ...mock,
    response: async (context) => {
      const result = await mock.response(context)
      persist()
      return result
    },
  }))
}
