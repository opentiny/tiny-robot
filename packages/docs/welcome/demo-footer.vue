<template>
  <Welcome title="盘古助手" description="您好，我是盘古助手，您专属的华为云专家" :icon="icon">
    <template #footer>
      <span>根据相关法律法规要求，您需要先<a>登录</a>，若没有帐号，您可前往<a>注册</a></span>
    </template>
  </Welcome>
</template>

<script setup lang="tsx">
import { Welcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
</script>
