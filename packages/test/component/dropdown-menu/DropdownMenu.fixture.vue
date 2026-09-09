<script setup lang="ts">
import { ref } from 'vue'
import DropdownMenu from '../../../components/src/dropdown-menu/index.vue'
import type { DropdownMenuItem } from '../../../components/src/dropdown-menu/index.type'

const items: DropdownMenuItem[] = [
  { id: 'reasoning', text: 'Reasoning model' },
  { id: 'fast', text: 'Fast model' },
]

const clickShow = ref(false)
const manualShow = ref(false)
const selectedItem = ref('')
const outsideEvent = ref('')

const recordItem = (item: DropdownMenuItem) => {
  selectedItem.value = JSON.stringify(item)
}

const recordOutside = (event: MouseEvent) => {
  outsideEvent.value = event.type
}
</script>

<template>
  <main>
    <section data-testid="click-menu">
      <DropdownMenu v-model:show="clickShow" :items="items" @item-click="recordItem" @click-outside="recordOutside">
        <template #trigger>
          <button type="button">Choose model</button>
        </template>
      </DropdownMenu>
      <output data-testid="click-show">{{ clickShow }}</output>
      <output data-testid="selected-item">{{ selectedItem }}</output>
      <output data-testid="outside-event">{{ outsideEvent }}</output>
    </section>

    <section data-testid="manual-menu">
      <button type="button" @click="manualShow = !manualShow">Toggle manual menu</button>
      <DropdownMenu :show="manualShow" trigger="manual" :items="items">
        <template #trigger>
          <button type="button">Manual trigger</button>
        </template>
      </DropdownMenu>
      <output data-testid="manual-show">{{ manualShow }}</output>
    </section>

    <section data-testid="hover-menu">
      <DropdownMenu trigger="hover" :items="items">
        <template #trigger>
          <button type="button">Hover trigger</button>
        </template>
      </DropdownMenu>
    </section>

    <div id="dropdown-append-target" data-testid="append-target"></div>
    <section data-testid="appended-menu">
      <DropdownMenu :items="items" append-to="#dropdown-append-target">
        <template #trigger>
          <button type="button">Appended trigger</button>
        </template>
      </DropdownMenu>
    </section>

    <button type="button">Outside control</button>
  </main>
</template>
