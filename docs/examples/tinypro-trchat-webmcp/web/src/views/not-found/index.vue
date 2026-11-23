<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function back() {
  // warning： Go to the node that has the permission
  // router.push({ name: 'Home' })
}

onMounted(() => {
  setTimeout(() => {
    back()
  }, 1000)
})
</script>

<template>
  <div class="h-screen w-full flex flex-col items-center justify-center">
    <h1>404</h1>
    <div>{{ $t('exception.result.404.description') }}</div>
  </div>
</template>

<style scoped lang="less">
</style>
