<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import Avatar from '../Avatar.vue'

const loading = ref(true)
</script>

<template>
  <section>
    <p><strong>加载中消息</strong></p>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
      <div>
        <label> <input type="checkbox" v-model="loading" /> Loading</label>
      </div>
    </div>

    <Bubble :content="'Hello, world! This is a sample message.'" :loading="loading" :avatar="Avatar" />
  </section>
</template>
