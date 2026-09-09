<script setup lang="ts">
import { h } from 'vue'
import Welcome from '../../../components/src/welcome/index.vue'

const icon = h('span', { 'data-testid': 'welcome-icon', 'aria-hidden': 'true' }, 'AI')
</script>

<template>
  <div>
    <Welcome data-testid="default-welcome" title="Start here" description="Ask anything" />

    <Welcome data-testid="aligned-welcome" title="Aligned" description="Right aligned" align="right" />

    <Welcome data-testid="slotted-welcome" title="With icon" description="Choose a prompt" :icon="icon">
      <template #footer>
        <button type="button">Try prompt</button>
      </template>
    </Welcome>
  </div>
</template>
