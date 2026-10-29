import type { Component } from 'vue'
import type {
  ExtensionCardGridActionEvent,
  ExtensionCardGridEmits,
  ExtensionCardGridItem,
  ExtensionCardGridNameClickEvent,
  ExtensionCardGridProps,
  ExtensionCardGridSlots,
  ExtensionCardAction,
  ExtensionCardActionEvent,
  ExtensionCardProps,
  ExtensionManagerActionEvent,
  ExtensionManagerEmits,
  ExtensionManagerItem,
  ExtensionManagerNameClickEvent,
  ExtensionManagerProps,
  ExtensionManagerSectionKey,
  ExtensionManagerSectionToggleEvent,
  ExtensionManagerSlots,
  ExtensionManagerTab,
  ExtensionManagerTabChangeEvent,
} from './index.type'

const icon = {} as Component

const cardProps: ExtensionCardProps = {
  name: 'Standalone card',
  description: 'Card description',
  icon,
  actions: [
    { id: 'enabled', type: 'switch', label: '启用扩展', checked: true },
    { id: 'install', type: 'button', label: '安装' },
    { id: 'inspect', type: 'custom', label: '检查', data: { origin: 'type-test' } },
  ],
  primaryActionsLimit: 1,
  progress: 'indeterminate',
  nameClickable: false,
  overflowMenuLabel: '扩展操作',
  overflowMenuPlacement: 'top-end',
}

const switchAction: ExtensionCardAction = {
  id: 'enabled',
  type: 'switch',
  label: '启用扩展',
  checked: false,
}
const buttonAction: ExtensionCardAction = {
  id: 'install',
  type: 'button',
  label: '安装',
}
const customAction: ExtensionCardAction = {
  id: 'inspect',
  type: 'custom',
  label: '检查',
}
const event: ExtensionCardActionEvent = {
  id: 'enabled',
  type: 'switch',
  checked: true,
}

const cardGridItem: ExtensionCardGridItem = {
  ...cardProps,
  id: 'grid-item',
}

const cardGridProps: ExtensionCardGridProps = {
  items: [cardGridItem],
  emptyText: 'No cards',
  primaryActionsLimit: 1,
  nameClickable: true,
  overflowMenuLabel: 'Grid actions',
  overflowMenuPlacement: 'top-end',
  overflowMenuShowIcons: false,
}
const cardGridDefaultProps: ExtensionCardGridProps = {
  items: [cardGridItem],
}

const cardGridSlots: ExtensionCardGridSlots = {
  item: ({ item, index }) => {
    const itemId: string = item.id
    const itemName: string = item.name
    const itemIndex: number = index

    void itemId
    void itemName
    void itemIndex
    return []
  },
  empty: () => [],
}

const cardGridActionEvent: ExtensionCardGridActionEvent = {
  itemId: cardGridItem.id,
  action: event,
}
const cardGridNameClickEvent: ExtensionCardGridNameClickEvent = {
  itemId: cardGridItem.id,
  event: {} as MouseEvent,
}

declare const cardGridEmit: ExtensionCardGridEmits
cardGridEmit('action', cardGridActionEvent)
cardGridEmit('name-click', cardGridNameClickEvent)

const managerItem: ExtensionManagerItem = {
  ...cardProps,
  id: 'manager-item',
  installed: true,
}

const managerTab: ExtensionManagerTab = {
  id: 'catalog',
  label: 'Catalog',
  items: [managerItem],
}
const secondManagerTab: ExtensionManagerTab = {
  id: 'updates',
  label: 'Updates',
  items: [],
}

const managerProps: ExtensionManagerProps = {
  tabs: [managerTab, secondManagerTab],
  activeTab: 'catalog',
  defaultActiveTab: 'updates',
  title: 'Extensions',
  emptyText: 'No enabled tabs',
}

const managerTabChangeEvent: ExtensionManagerTabChangeEvent = {
  tabId: managerTab.id,
}
const managerSectionKey: ExtensionManagerSectionKey = 'installed'
const managerSectionToggleEvent: ExtensionManagerSectionToggleEvent = {
  tabId: managerTab.id,
  sectionKey: managerSectionKey,
  expanded: true,
}
const managerActionEvent: ExtensionManagerActionEvent = {
  tabId: managerTab.id,
  sectionKey: managerSectionKey,
  itemId: managerItem.id,
  action: event,
}
const managerNameClickEvent: ExtensionManagerNameClickEvent = {
  tabId: managerTab.id,
  sectionKey: managerSectionKey,
  itemId: managerItem.id,
  event: {} as MouseEvent,
}

const managerSlots: ExtensionManagerSlots = {
  'header-actions': () => [],
  tab: ({ tab, active, select }) => {
    const tabId: string = tab.id
    const isActive: boolean = active
    select()

    void tabId
    void isActive
    return []
  },
  item: ({ tab, sectionKey, item, index }) => {
    const tabId: string = tab.id
    const itemId: string = item.id
    const itemIndex: number = index

    void tabId
    void sectionKey
    void itemId
    void itemIndex
    return []
  },
  empty: ({ tab, sectionKey, title }) => {
    const tabId: string = tab.id
    const sectionTitle: string = title

    void tabId
    void sectionKey
    void sectionTitle
    return []
  },
}

declare const managerEmit: ExtensionManagerEmits
managerEmit('update:active-tab', managerTab.id)
managerEmit('update:active-tab', undefined)
managerEmit('tab-change', managerTabChangeEvent)
managerEmit('section-toggle', managerSectionToggleEvent)
managerEmit('action', managerActionEvent)
managerEmit('name-click', managerNameClickEvent)

// @ts-expect-error Manager items retain Grid-owned identity.
const managerItemWithoutId: ExtensionManagerItem = { name: 'Missing Manager identity' }
// @ts-expect-error ExtensionCardGridItem requires the Grid-owned id.
const cardGridItemWithoutId: ExtensionCardGridItem = { name: 'Missing Grid identity' }
// @ts-expect-error Every action requires a label.
const unlabeledAction: ExtensionCardAction = { id: 'install', type: 'button' }
// @ts-expect-error Domain-specific install action is not a Card action type.
const installAction: ExtensionCardAction = { id: 'install', type: 'install', label: '安装' }

void cardProps
void switchAction
void buttonAction
void customAction
void event
void cardGridItem
void cardGridProps
void cardGridDefaultProps
void cardGridSlots
void cardGridActionEvent
void cardGridNameClickEvent
void managerItem
void managerTab
void secondManagerTab
void managerProps
void managerTabChangeEvent
void managerSectionToggleEvent
void managerActionEvent
void managerNameClickEvent
void managerSectionKey
void managerSlots
void managerItemWithoutId
void cardGridItemWithoutId
void unlabeledAction
void installAction
