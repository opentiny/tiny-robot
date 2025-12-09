<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { computed, ref } from 'vue'
import Avatar from '../Avatar.vue'

const placement = ref<'start' | 'end'>('start')
const shape = ref<'rounded' | 'corner' | 'none'>('corner')
const showAvatar = ref(true)
const showLongContent = ref(false)
const shortContent = 'Hello, world! This is a sample message.'

const content = computed(() => {
  return showLongContent.value ? shortContent.repeat(10) : shortContent
})
</script>

<template>
  <section>
    <p><strong>普通文本消息</strong></p>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
      <div>
        <label>Placement:</label>
        <label><input type="radio" v-model="placement" value="start" /> start</label>
        <label><input type="radio" v-model="placement" value="end" /> end</label>
      </div>

      <div>
        <label>Shape: </label>
        <label><input type="radio" v-model="shape" value="corner" /> corner</label>
        <label><input type="radio" v-model="shape" value="rounded" /> rounded</label>
        <label><input type="radio" v-model="shape" value="none" /> none</label>
      </div>

      <div>
        <label> <input type="checkbox" v-model="showAvatar" /> Avatar</label>
      </div>
      <div>
        <label> <input type="checkbox" v-model="showLongContent" /> Long Content</label>
      </div>
    </div>

    <Bubble :content="content" :placement="placement" :shape="shape" :avatar="showAvatar ? Avatar : undefined">
    </Bubble>
  </section>
</template>
