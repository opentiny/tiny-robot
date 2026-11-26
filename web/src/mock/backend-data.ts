import localeTable from '../locales.json'

export interface MenuNode {
  children: MenuNode[]
  component: string
  customIcon: string
  id: number
  label: string
  locale: string
  menuType: string
  order: number
  parentId: number | null
  url: string
}

const permissions = [
  { id: 1, name: '*', desc: '全部权限' },
  { id: 2, name: 'user::query', desc: '查询用户' },
  { id: 3, name: 'permission::get', desc: '查询权限' },
  { id: 4, name: 'role::query', desc: '查询角色' },
  { id: 5, name: 'menu::query', desc: '查询菜单' },
  { id: 6, name: 'i18n::query', desc: '查询国际化词条' },
]

let nextMenuId = 1

function menu(
  label: string,
  url: string,
  component: string,
  locale: string,
  children: MenuNode[] = [],
  customIcon = '',
): MenuNode {
  const id = nextMenuId++
  children.forEach((child) => {
    child.parentId = id
  })
  return {
    id,
    label,
    url,
    component,
    customIcon,
    menuType: 'normal',
    parentId: null,
    order: id,
    locale,
    children,
  }
}

const menuTree = [
  menu('Board', 'board', 'board/index', 'menu.board', [
    menu('Home', 'home', 'board/home/index', 'menu.home'),
    menu('Work', 'work', 'board/work/index', 'menu.work'),
  ], 'IconApplication'),
  menu('List', 'list', 'list/index', 'menu.list', [
    menu('Table', 'table', 'list/search-table/index', 'menu.list.searchTable'),
    menu('Card', 'card', 'list/card-list/index', 'menu.list.cardList'),
    menu('AdvancedList', 'advanced-list', 'list/advanced-list/index', 'menu.list.advancedList'),
  ], 'IconFiles'),
  menu('Form', 'form', 'form/index', 'menu.form', [
    menu('Base', 'base', 'form/base/index', 'menu.form.base'),
    menu('Step', 'step', 'form/step/index', 'menu.form.step'),
    menu('Editor', 'editor', 'form/editor/index', 'menu.form.editor'),
  ], 'IconSetting'),
  menu('Profile', 'profile', 'profile/index', 'menu.profile', [
    menu('Detail', 'detail', 'profile/detail/index', 'menu.profile.detail'),
  ], 'IconFiletext'),
  menu('Result', 'result', 'result/index', 'menu.result', [
    menu('Success', 'success', 'result/success/index', 'menu.result.success'),
    menu('Error', 'error', 'result/error/index', 'menu.result.error'),
  ], 'IconSuccessful'),
  menu('Exception', 'exception', 'exception/index', 'menu.exception', [
    menu('403', '403', 'exception/403/index', 'menu.exception.403'),
    menu('404', '404', 'exception/404/index', 'menu.exception.404'),
    menu('500', '500', 'exception/500/index', 'menu.exception.500'),
  ], 'IconCueL'),
  menu('User', 'user', 'user/index', 'menu.user', [
    menu('Info', 'info', 'user/info/index', 'menu.user.info'),
  ], 'IconUser'),
  menu('SystemManager', '', 'menu/index', 'menu.systemManager', [
    menu('AllMenu', 'menu/allMenu', 'menu/info/index', 'menu.menu.info'),
    menu('AllPermission', 'permission/allPermission', 'permission/info/index', 'menu.permission.info'),
    menu('AllRole', 'role/allRole', 'role/info/index', 'menu.role.info'),
    menu('AllInfo', 'userManager/allInfo', 'userManager/info/index', 'menu.userManager.info'),
    menu('Local', 'locale', 'locale/index', 'menu.i18n'),
  ], 'IconTotal'),
]

export function createBackendState() {
  const role = {
    id: 1,
    name: 'admin',
    permission: structuredClone(permissions),
    menus: structuredClone(menuTree),
  }
  const user = {
    id: '1',
    name: 'admin',
    email: 'admin@no-reply.com',
    department: 'Tiny-Vue-Pro',
    employeeType: 'social recruitment',
    probationStart: '2021-04-19',
    probationEnd: '2021-10-15',
    probationDuration: '180',
    protocolStart: '2021-04-19',
    protocolEnd: '2024-04-19',
    address: 'xian',
    status: 'normal',
    role: [role],
  }
  const localeRecords = Object.entries(localeTable).flatMap(
    ([language, messages]: [string, any]) => Object.entries(messages).map(
      ([key, content], index) => ({
        id: language === 'enUS' ? index + 1 : index + 10001,
        key,
        content,
        lang: language === 'enUS'
          ? { id: 1, name: 'enUS' }
          : { id: 2, name: 'zhCN' },
      }),
    ),
  )

  return {
    credentials: new Map([[
      'admin@no-reply.com',
      '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    ]]),
    languages: [{ id: 1, name: 'enUS' }, { id: 2, name: 'zhCN' }],
    localeTable: structuredClone(localeTable),
    localeRecords,
    menuTree: structuredClone(menuTree),
    permissions: structuredClone(permissions),
    roles: [role],
    refreshTokens: new Map<string, string>(),
    tokens: new Map<string, string>(),
    users: [user],
  }
}

export type BackendState = ReturnType<typeof createBackendState>
