<script lang="ts" setup>
</script>

<template>
  <div class="flex flex-wrap gap-6">
    <div
      v-for="i in 6"
      :key="i"
      class="col min-h-[48px] flex flex-[0_0_calc(33.333%-16px)] items-center rounded-md bg-[#f5f5f5] px-6 max-md:flex-[0_0_100%]"
    >
      <span class="line-clamp-2 max-w-full text-[14px] text-[#191919]">{{ $t(`work.index.questions${i}`) }}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.col {
  &:hover {
    background: #fff;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
  }
}
</style>
