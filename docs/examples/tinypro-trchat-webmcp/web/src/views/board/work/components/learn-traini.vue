<script lang="ts" setup>
import {
  Loading,
  Col as TinyCol,
  Layout as TinyLayout,
} from '@opentiny/vue'
import { onMounted, reactive } from 'vue'
import { getUserTrain } from '@/api/board'

// 切换数据
const state = reactive<{
  loading: any
  options: any
  project: string
  span: number
}>({
  loading: null,
  options: [] as any,
  project: '',
  span: 3,
})

async function fetchData() {
  state.loading = Loading.service({
    text: 'loading...',
    target: document.getElementById('container'),
  })
  try {
    const result = await getUserTrain()
    const body = result?.data ?? result
    state.options = body?.options ?? body?.data?.options ?? []
  }
  finally {
    state.loading.close()
  }
}

// 初始化请求数据
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <TinyLayout>
      <div class="grid grid-cols-4 gap-4 max-md:grid-cols-2">
        <TinyCol
          v-for="item in state.options"
          :key="item.value"
          class="col flex flex-col items-start justify-start rounded bg-white p-6"
        >
          <img src="@/assets/images/collectImage1.png" class="h-10 w-10">
          <div
            class="favorite-title mt-3 text-[14px] font-bold leading-[22px] max-md:text-[12px] max-md:leading-[18px]"
          >
            {{ $t(item.value) }}
          </div>
          <div class="mt-2 text-left text-[12px] text-gray-500 max-md:text-[10px] max-md:leading-[16px]">
            {{ $t(item.description) }}
          </div>
          <div class="space-x-1 mt-2 text-left">
            <span
              class="inline-block h-[18px] rounded px-1 text-xs leading-[18px]"
              :class="item?.isNews ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
            >
              {{ $t(item.label1) }}
            </span>
            <span class="inline-block h-[18px] rounded bg-gray-100 px-1 text-xs text-black leading-[18px]">
              {{ $t(item.label2) }}
            </span>
          </div>
        </TinyCol>
      </div>
    </TinyLayout>
  </div>
</template>

<style scoped lang="less">
.favorite-title {
  &:hover {
    text-decoration: underline;
  }
}
</style>
