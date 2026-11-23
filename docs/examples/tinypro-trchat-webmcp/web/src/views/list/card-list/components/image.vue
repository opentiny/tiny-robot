<script lang="ts" setup>
import { computed } from 'vue'

const { src = 'card-list-application-default.png' } = defineProps<{ src?: string }>()

const url = computed(
  () => new URL(`../../../../assets/images/${src}`, import.meta.url).href,
)
</script>

<template>
  <img :src="url" class="img" alt="">
</template>

<style scoped lang="less">
.img {
  width: 32px;
  height: 32px;
}
</style>
