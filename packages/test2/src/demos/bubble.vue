<template>
  <div class="basic-demos">
    <Text />
    <Divider />
    <Loading />
    <Divider />
    <Hidden />
    <Divider />
    <Slots />
    <Divider />
    <Polymorphic />
    <Divider />
    <Reasoning />
    <Divider />
    <ToolCall />
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import Hidden from './bubble/Hidden.vue'
import Loading from './bubble/Loading.vue'
import Polymorphic from './bubble/Polymorphic.vue'
import Reasoning from './bubble/Reasoning.vue'
import Slots from './bubble/Slots.vue'
import Text from './bubble/Text.vue'
import ToolCall from './bubble/ToolCall.vue'

const Divider = h('hr', { style: { width: '100%', border: 'none', borderTop: '1px solid #ddd', marginBlock: '16px' } })
</script>

<style scoped>
.basic-demos {
  --tr-bubble-box-bg: #f0f0f0;

  display: flex;
  flex-direction: column;
}
</style>
