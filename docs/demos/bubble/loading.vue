<template>
  <p>单个气泡加载中</p>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    :avatar="aiAvatar"
    :loading="loading"
    :style="{ marginTop: '16px' }"
  ></tr-bubble>
  <hr />
  <p>单个气泡加载中，使用 slots 自定义 loading 内容</p>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    :avatar="aiAvatar"
    :loading="loading"
    :style="{ marginTop: '16px' }"
  >
    <template #loading>
      <img style="height: 40px; margin-left: -25px" :src="loadingImgUrl" />
    </template>
  </tr-bubble>
  <hr />
  <p>列表加载中</p>
  <tr-bubble-list :items="items" :roles="roles" :loading="loading" loading-role="ai"></tr-bubble-list>
  <hr />
  <div>
    <label style="margin-right: 8px">加载中</label>
    <tiny-switch v-model="loading"></tiny-switch>
  </div>
</template>

<script setup lang="ts">
import { BubbleListProps, TrBubble, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })
const loading = ref(true)

const loadingImgUrl = import.meta.env.BASE_URL + '/wave.webp'

const items = ref<BubbleListProps['items']>([
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
])

const roles = ref<BubbleListProps['roles']>({
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
  ai: {
    placement: 'start',
    avatar: aiAvatar,
    slots: {
      loading: () => h('img', { style: { height: '40px', marginLeft: '-25px' }, src: loadingImgUrl }),
    },
  },
})
</script>
