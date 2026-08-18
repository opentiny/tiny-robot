<script setup lang="ts">
import type { App, Component } from 'vue'
import ExtensionManager from '../../../components/src/extension-manager'
import type { ExtensionManagerTab } from '../../../components/src/extension-manager/index.type'

const Manager = ExtensionManager
const Card = ExtensionManager.Card
const CardGrid = ExtensionManager.CardGrid
const managerTabs: ExtensionManagerTab[] = [{ id: 'library', label: 'Library', items: [] }]

const registrations = new Map<string, Component>()
const app = {
  component(name: string, component: Component) {
    registrations.set(name, component)
    return this
  },
} as unknown as App

ExtensionManager.install(app)
</script>

<template>
  <div data-testid="manager-surface">
    <Manager :tabs="managerTabs" />
  </div>
  <output data-testid="manager-name">{{ Manager.name }}</output>
  <output data-testid="card-name">{{ Card.name }}</output>
  <output data-testid="card-grid-name">{{ CardGrid.name }}</output>
  <output data-testid="manager-registration">{{ registrations.get('ExtensionManager') === Manager }}</output>
  <output data-testid="card-registration">{{ registrations.get('ExtensionCard') === Card }}</output>
  <output data-testid="card-grid-registration">{{ registrations.get('ExtensionCardGrid') === CardGrid }}</output>
</template>
