<template>
  <Prompt label="引导问题类别" description="常规问题举例常规问题举例" :icon="icon" badge="NEW"></Prompt>
</template>

<script setup lang="ts">
import { Prompt } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '18px' } as CSSProperties }, '💡')
</script>
