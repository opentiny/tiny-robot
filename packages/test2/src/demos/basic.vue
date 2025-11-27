<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
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
  </div>

  <Divider />

  <p><strong>普通文本消息</strong></p>

  <Bubble
    :content="'Hello, world! This is a sample message.\n你好，世界！这是一个示例消息。'"
    :placement="placement"
    :shape="shape"
    :avatar="showAvatar ? Avatar : undefined"
  />

  <Divider />

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
    :placement="placement"
    :shape="shape"
    :avatar="showAvatar ? Avatar : undefined"
    :split-polymorphic="splitPolymorphic"
  />

  <Divider />

  <p><strong>推理消息</strong></p>

  <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
    <div>
      <label>
        <input type="checkbox" v-model="extras.thinking" />
        Thinking
      </label>
    </div>
  </div>

  <Bubble
    content="这是一只小狗"
    reasoning_content="这是一只小狗，它的品种是柯基。这是一只小狗，它的品种是柯基。这是一只小狗，它的品种是柯基。这是一只小狗，它的品种是柯基。这是一只小狗，它的品种是柯基。这是一只小狗，它的品种是柯基。"
    :extras="extras"
    :placement="placement"
    :shape="shape"
    :avatar="showAvatar ? Avatar : undefined"
    :split-polymorphic="splitPolymorphic"
  />
</template>

<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { h, ref } from 'vue'
import Avatar from './Avatar.vue'

const placement = ref<'start' | 'end'>('start')
const shape = ref<'rounded' | 'corner' | 'none'>('corner')
const showAvatar = ref(true)
const splitPolymorphic = ref(false)
const Divider = h('hr', { style: { border: 'none', borderTop: '1px solid #ddd', marginBlock: '16px' } })

const extras = ref({
  thinking: false,
  open: true,
})
</script>

<style>
:root {
  --tr-bubble-box-bg: #f0f0f0;
}
</style>
