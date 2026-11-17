<script setup lang="ts">
import { defineCustomElement, onBeforeUnmount, onMounted, ref } from 'vue'
import Contract from './ElementEventContract.ce.vue'
const lastEvent = ref('')
let element: HTMLElement | undefined
onMounted(() => {
  if (!customElements.get('test-event-contract')) {
    customElements.define('test-event-contract', defineCustomElement(Contract, { shadowRoot: false }))
  }
  element = document.createElement('test-event-contract')
  for (const name of ['ready', 'empty', 'text', 'object', 'array', 'multiple', 'sample-value-update']) {
    element.addEventListener(name, (event) => {
      const detail = (event as CustomEvent).detail
      if (name === 'object') detail[0].preventDefault()
      lastEvent.value = JSON.stringify({ name, detail })
    })
  }
  document.querySelector('[data-testid="event-contract-mount"]')!.append(element)
})
onBeforeUnmount(() => element?.remove())
</script>
<template>
  <div data-testid="event-contract-mount" />
  <output data-testid="last-element-event">{{ lastEvent }}</output>
</template>
