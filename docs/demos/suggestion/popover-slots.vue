<template>
  <SuggestionPopover :data="data" @item-click="(item) => console.log(item)" v-model:show="show" trigger="manual">
    <template #trigger>
      <button @click="show = !show">点击弹出SuggestionPopover</button>
    </template>
    <template #header v-if="customHeader">
      <h3 style="font-size: 20px; font-weight: 500">我是自定义头部</h3>
    </template>
    <template #body v-if="customBody">
      <ul>
        <li v-for="item in data" :key="item.id">
          <span style="font-size: 14px">{{ item.text }}</span>
        </li>
      </ul>
    </template>
  </SuggestionPopover>
  <hr />
  <div>
    <div>
      <label>自定义头部</label>
      <tiny-switch v-model="customHeader" />
    </div>
    <div>
      <label>自定义内容</label>
      <tiny-switch v-model="customBody" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'

const show = ref(false)

const customHeader = ref(true)
const customBody = ref(true)

const data = [
  { id: 'b1', text: '什么是弹性云服务器?' },
  { id: 'b2', text: '如何登录到Windows云服务器?' },
  { id: 'b3', text: '弹性公网IP为什么ping不通?' },
  { id: 'b4', text: '云服务器安全组如何配置云服务器安全组如何配置云服务器安全组如何配置?' },
  { id: 'b5', text: '如何查看云服务器密码如何查看云服务器密码如何查看云服务器密码如何查看云服务器密码?' },
  { id: 'b6', text: '什么是弹性云服务器什么是弹性云服务器什么是弹性云服务器什么是弹性云服务器什么是弹性云服务器?' },
  {
    id: 'b7',
    text: '如何登录到Windows云服务器如何登录到Windows云服务器如何登录到Windows云服务器如何登录到Windows云服务器?',
  },
  { id: 'b8', text: '弹性公网IP为什么ping不通?' },
  { id: 'b9', text: '云服务器安全组如何配置?' },
  { id: 'b0', text: '如何查看云服务器密码?' },
]
</script>
