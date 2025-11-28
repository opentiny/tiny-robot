<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import Avatar from '../Avatar.vue'

const splitPolymorphic = ref(false)
</script>

<template>
  <section>
    <p><strong>多模态消息</strong></p>

    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
      <div>
        <label>
          <input type="checkbox" v-model="splitPolymorphic" />
          Split Polymorphic
        </label>
      </div>
    </div>

    <Bubble
      :content="[
        {
          type: 'image_url',
          image_url: 'https://placedog.net/400/369?id=238',
        },
        { type: 'text', text: '这是什么品种' },
      ]"
      :avatar="Avatar"
      :split-polymorphic="splitPolymorphic"
    />
  </section>
</template>
