<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const showPrefixSlot = ref(true)
const showSuffixSlot = ref(true)
const showContentFooterSlot = ref(true)
const showAfterSlot = ref(true)

const content = 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。'
</script>

<template>
  <section>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
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

    <Bubble :content="content" :avatar="aiAvatar">
      <template #prefix v-if="showPrefixSlot">
        <div style="background-color: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px">Prefix</div>
      </template>
      <template #suffix v-if="showSuffixSlot">
        <div style="background-color: #f3e5f5; color: #7b1fa2; padding: 4px 8px; border-radius: 4px">Suffix</div>
      </template>
      <template #content-footer v-if="showContentFooterSlot">
        <div style="background-color: #e8f5e9; color: #388e3c; padding: 4px 8px; border-radius: 4px">
          Content Footer
        </div>
      </template>
      <template #after v-if="showAfterSlot">
        <div style="background-color: #fff3e0; color: #f57c00; padding: 4px 8px; border-radius: 4px">After</div>
      </template>
    </Bubble>
  </section>
</template>
