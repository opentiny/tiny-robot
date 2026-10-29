<script setup lang="ts">
import { computed, markRaw, ref } from 'vue'
import { IconEditPen } from '@opentiny/tiny-robot-svgs'
import type {
  ExtensionCardGridActionEvent,
  ExtensionCardGridItem,
  ExtensionCardGridNameClickEvent,
} from '../../../components/src/extension-manager/index.type'
import ExtensionCardGrid from '../../../components/src/extension-manager/components/ExtensionCardGrid.vue'

const editIcon = markRaw(IconEditPen)

const items: ExtensionCardGridItem[] = [
  {
    id: 'alpha',
    name: 'Alpha extension',
    description: 'Alpha description',
    icon: 'https://example.com/alpha-icon.png',
    actions: [
      {
        id: 'toggle-alpha',
        type: 'switch',
        label: 'Enable Alpha',
        checked: true,
        icon: IconEditPen,
        hidden: false,
        disabled: false,
        danger: false,
      },
      {
        id: 'install-alpha',
        type: 'button',
        label: 'Install Alpha',
        icon: IconEditPen,
        hidden: false,
        disabled: false,
        danger: false,
      },
      {
        id: 'inspect-alpha',
        type: 'custom',
        label: 'Inspect Alpha',
        icon: IconEditPen,
        hidden: false,
        disabled: false,
        danger: false,
        data: { origin: 'grid-fixture', nested: { enabled: true } },
      },
    ],
    primaryActionsLimit: 3,
    progress: 75,
    nameClickable: true,
    overflowMenuLabel: 'Alpha actions',
    overflowMenuPlacement: 'top-end',
  },
  {
    id: 'beta',
    name: 'Beta extension',
    description: 'Beta description',
    nameClickable: false,
  },
]

const columnItems: ExtensionCardGridItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: `column-${index}`,
  name: `Column ${index}`,
}))

const emptyItems: ExtensionCardGridItem[] = []
const fallbackItems: ExtensionCardGridItem[] = [
  {
    id: 'fallback',
    name: 'Fallback extension',
    actions: [
      { id: 'fallback-primary', type: 'button', label: 'Fallback primary' },
      { id: 'fallback-overflow', type: 'button', label: 'Fallback overflow', icon: editIcon },
    ],
  },
  {
    id: 'override',
    name: 'Override extension',
    primaryActionsLimit: 2,
    actions: [
      { id: 'override-primary-1', type: 'button', label: 'Override primary 1' },
      { id: 'override-primary-2', type: 'button', label: 'Override primary 2' },
    ],
  },
  {
    id: 'zero',
    name: 'Zero extension',
    primaryActionsLimit: 0,
    actions: [{ id: 'zero-overflow', type: 'button', label: 'Zero overflow' }],
  },
]
const nameClickableItems: ExtensionCardGridItem[] = [
  { id: 'fallback-name', name: 'Fallback name' },
  { id: 'disabled-name', name: 'Disabled name', nameClickable: false },
]
const implicitNameClickableItems: ExtensionCardGridItem[] = [{ id: 'implicit-name', name: 'Implicit name' }]
const menuFallbackItems: ExtensionCardGridItem[] = [
  {
    id: 'menu-fallback',
    name: 'Menu fallback extension',
    actions: [{ id: 'fallback-menu-action', type: 'button', label: 'Fallback menu action', icon: editIcon }],
  },
  {
    id: 'menu-override',
    name: 'Menu override extension',
    overflowMenuLabel: 'Item actions',
    overflowMenuPlacement: 'bottom-end',
    overflowMenuShowIcons: false,
    actions: [{ id: 'override-menu-action', type: 'button', label: 'Override menu action', icon: editIcon }],
  },
]
const actionEvents = ref<ExtensionCardGridActionEvent[]>([])
const lastNameClick = ref<ExtensionCardGridNameClickEvent>()

const actionSummary = computed(() =>
  actionEvents.value
    .map(({ itemId, action }) => `${itemId}:${action.id}:${action.type}:${action.checked ?? ''}`)
    .join('|'),
)

const serializeItem = (item: ExtensionCardGridItem) =>
  JSON.stringify(item, (key, value) => {
    if (key === 'icon' && value && typeof value !== 'string') return '[component]'
    return value
  })

const handleAction = (event: ExtensionCardGridActionEvent) => {
  actionEvents.value.push(event)
}

const handleNameClick = (event: ExtensionCardGridNameClickEvent) => {
  lastNameClick.value = event
}
</script>

<template>
  <div style="margin-top: 200px">
    <ExtensionCardGrid data-testid="fallback-grid" :items="fallbackItems" :primary-actions-limit="1" />
  </div>
  <ExtensionCardGrid data-testid="default-grid" :items="items" @action="handleAction" @name-click="handleNameClick" />

  <ExtensionCardGrid data-testid="slot-grid" :items="items">
    <template #item="{ item, index }">
      <article :data-testid="`slot-item-${item.id}`">
        <output :data-testid="`slot-item-${item.id}-value`">{{ serializeItem(item) }}</output>
        <output :data-testid="`slot-item-${item.id}-index`">{{ index }}</output>
      </article>
    </template>
  </ExtensionCardGrid>

  <ExtensionCardGrid data-testid="default-empty-grid" :items="emptyItems" />
  <ExtensionCardGrid data-testid="text-empty-grid" :items="emptyItems" empty-text="Nothing to show" />
  <ExtensionCardGrid data-testid="slot-empty-grid" :items="emptyItems" empty-text="Fallback empty text">
    <template #empty>
      <span data-testid="custom-empty">Custom empty slot</span>
    </template>
  </ExtensionCardGrid>

  <ExtensionCardGrid data-testid="name-clickable-fallback-grid" :items="nameClickableItems" :name-clickable="true" />
  <ExtensionCardGrid data-testid="implicit-name-clickable-grid" :items="implicitNameClickableItems" />
  <div style="position: fixed; top: 200px; left: 0; width: 100%">
    <ExtensionCardGrid
      data-testid="menu-fallback-grid"
      :items="menuFallbackItems"
      :primary-actions-limit="0"
      overflow-menu-label="Grid actions"
      overflow-menu-placement="top-end"
      :overflow-menu-show-icons="true"
    />
  </div>

  <div data-testid="default-min-width-container" style="width: 820px">
    <ExtensionCardGrid data-testid="default-min-width-grid" :items="columnItems" />
  </div>

  <div data-testid="narrow-min-width-container" style="width: 640px">
    <ExtensionCardGrid data-testid="narrow-min-width-grid" :items="columnItems" />
  </div>

  <div data-testid="custom-min-width-container" style="width: 820px">
    <ExtensionCardGrid
      data-testid="custom-min-width-grid"
      :items="columnItems"
      style="--tr-extension-card-grid-card-min-width: 260px"
    />
  </div>

  <output data-testid="action-events">{{ actionSummary }}</output>
  <output data-testid="name-click-item-id">{{ lastNameClick?.itemId }}</output>
</template>
