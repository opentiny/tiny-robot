<template>
  <tr-welcome title="盘古助手" description="您好，我是盘古助手，您专属的华为云专家" :icon="icon">
    <template #footer>
      <div class="welcome-footer">
        <span>根据相关法律法规要求，您需要先<a>登录</a>，若没有帐号，您可前往<a>注册</a></span>
      </div>
    </template>
  </tr-welcome>
</template>

<script setup lang="tsx">
import { TrWelcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
</script>

<style lang="less" scoped>
.welcome-footer {
  margin-top: 12px;
  color: rgb(128, 128, 128);
  font-size: 12px;
  line-height: 20px;
}
</style>
