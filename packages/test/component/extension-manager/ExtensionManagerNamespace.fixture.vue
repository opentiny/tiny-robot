<script setup lang="ts">
import type { App, Component } from 'vue'
import ExtensionManager from '../../../components/src/extension-manager'
import type { ExtensionManagerTab } from '../../../components/src/extension-manager/index.type'

const Manager = ExtensionManager
const Card = ExtensionManager.Card
const CardGrid = ExtensionManager.CardGrid
const managerTabs: ExtensionManagerTab[] = [{ id: 'library', label: 'Library', items: [] }]

const installInto = (component: Component & { install: (app: App) => void }) => {
  const registrations = new Map<string, Component>()
  const app = {
    component(name: string, registeredComponent: Component) {
      registrations.set(name, registeredComponent)
      return this
    },
  } as unknown as App

  component.install(app)
  return registrations
}

const managerRegistrations = installInto(Manager)
const cardRegistrations = installInto(Card)
const cardGridRegistrations = installInto(CardGrid)
</script>

<template>
  <div data-testid="manager-surface">
    <Manager :tabs="managerTabs" />
  </div>
  <output data-testid="manager-name">{{ Manager.name }}</output>
  <output data-testid="card-name">{{ Card.name }}</output>
  <output data-testid="card-grid-name">{{ CardGrid.name }}</output>
  <output data-testid="manager-registration">
    {{
      managerRegistrations.size === 3 &&
      managerRegistrations.get('TrExtensionManager') === Manager &&
      managerRegistrations.get('TrExtensionCard') === Card &&
      managerRegistrations.get('TrExtensionCardGrid') === CardGrid
    }}
  </output>
  <output data-testid="card-registration">
    {{ cardRegistrations.size === 1 && cardRegistrations.get('TrExtensionCard') === Card }}
  </output>
  <output data-testid="card-grid-registration">
    {{ cardGridRegistrations.size === 1 && cardGridRegistrations.get('TrExtensionCardGrid') === CardGrid }}
  </output>
</template>
