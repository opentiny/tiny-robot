<template>
  <Welcome title="盘古助手2" description="您好，我是盘古助手，您专属的华为云专家" :icon="icon"></Welcome>
</template>

<script setup lang="tsx">
import { Welcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
</script>
