<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import Avatar from '../Avatar.vue'

const hidden = ref(false)
</script>

<template>
  <section>
    <p><strong>隐藏气泡</strong></p>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
      <div>
        <label> <input type="checkbox" v-model="hidden" /> Hidden</label>
      </div>
    </div>

    <Bubble :content="'Hello, world! This is a sample message.'" :hidden="hidden" :avatar="Avatar" />
  </section>
</template>
