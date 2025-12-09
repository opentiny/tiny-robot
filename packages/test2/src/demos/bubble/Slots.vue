<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import Avatar from '../Avatar.vue'

const placement = ref<'start' | 'end'>('start')
const showPrefixSlot = ref(false)
const showSuffixSlot = ref(false)
const showContentFooterSlot = ref(false)
const showAfterSlot = ref(false)

const content = 'Hello, world! This is a sample message with slots demonstration.'
</script>

<template>
  <section>
    <p><strong>插槽</strong></p>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
      <div>
        <label>Placement:</label>
        <label><input type="radio" v-model="placement" value="start" /> start</label>
        <label><input type="radio" v-model="placement" value="end" /> end</label>
      </div>

      <div>
        <label> <input type="checkbox" v-model="showPrefixSlot" /> Prefix Slot</label>
      </div>
      <div>
        <label> <input type="checkbox" v-model="showSuffixSlot" /> Suffix Slot</label>
      </div>
      <div>
        <label> <input type="checkbox" v-model="showContentFooterSlot" /> Content Footer Slot</label>
      </div>
      <div>
        <label> <input type="checkbox" v-model="showAfterSlot" /> After Slot</label>
      </div>
    </div>

    <Bubble :content="content" :placement="placement" :avatar="Avatar">
      <template #prefix v-if="showPrefixSlot">
        <div class="prefix">Prefix</div>
      </template>
      <template #suffix v-if="showSuffixSlot">
        <div class="suffix">Suffix</div>
      </template>
      <template #content-footer v-if="showContentFooterSlot">
        <div class="content-footer">Content Footer</div>
      </template>
      <template #after v-if="showAfterSlot">
        <div class="after">After</div>
      </template>
    </Bubble>
  </section>
</template>
