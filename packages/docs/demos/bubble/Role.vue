<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <bubble-item role="user" content="简单介绍TinyVue" :role-config="userRoleConfig"></bubble-item
    ><bubble-item
      role="ai"
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    ></bubble-item>
    <hr style="width: 100%" />
    <div style="display: flex; flex-direction: column; gap: 16px">
      <div>
        <label style="font-size: 12px; margin-right: 8px">自定义头像</label>
        <tiny-switch mini @change="toggleUserAvatar"></tiny-switch>
      </div>
      <tiny-radio-group v-model="userRoleConfig.align">
        <tiny-radio label="left">左对齐</tiny-radio>
        <tiny-radio label="right">右对齐</tiny-radio>
      </tiny-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleRoleConfig } from '@opentiny/tiny-robot'
import { h, reactive } from 'vue'

// 角色配置
const userRoleConfig = reactive<BubbleRoleConfig>({
  align: 'right',
  avatar: undefined,
})

const toggleUserAvatar = (value: boolean) => {
  userRoleConfig.avatar = value ? h('div', { style: 'font-size: 24px' }, '👤') : undefined
}
</script>
