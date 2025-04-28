<script setup lang="ts">
import { IconArrowUp } from '@opentiny/tiny-robot-svgs'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    sources: { label: string; link: string }[]
    linesLimit?: number
  }>(),
  {
    linesLimit: Number.MAX_SAFE_INTEGER,
  },
)

const showAll = ref(false)
const pillRefs = ref<(HTMLElement | null)[]>([])
const morePillIndex = ref<number | null>(null)

const updateMoreIndex = () => {
  nextTick(() => {
    const tops = pillRefs.value.map((el) => el?.offsetTop || 0)
    const uniqueTops = Array.from(new Set(tops))

    if (uniqueTops.length > props.linesLimit) {
      // 超过 linesLimit 行，找到第 linesLimit 行最后一个的index
      const lastLineTop = uniqueTops[props.linesLimit - 1]
      const lastIndex = tops.lastIndexOf(lastLineTop)
      morePillIndex.value = lastIndex
    } else {
      morePillIndex.value = null
    }
  })
}

const leftPillCount = computed(() => {
  return props.sources.length - (morePillIndex.value || 0)
})

onMounted(updateMoreIndex)

watch(() => props.sources, updateMoreIndex)

const setPillRef = (el: HTMLElement | null, idx: number) => {
  if (el) {
    pillRefs.value[idx] = el
  }
}
</script>

<template>
  <div class="tr-feedback__source-list">
    <template v-for="(source, index) in props.sources" :key="index">
      <a
        v-if="!morePillIndex || showAll || index < morePillIndex"
        class="pill"
        :href="source.link"
        target="_blank"
        :ref="(el) => setPillRef(el as HTMLElement, index)"
      >
        {{ source.label }}
      </a>
      <span v-if="morePillIndex && !showAll && index === morePillIndex" class="pill" @click="showAll = true">
        {{ leftPillCount }}+
      </span>
    </template>
    <span v-if="showAll" class="pill collapse-pill" @click="showAll = false">
      <IconArrowUp />
    </span>
  </div>
</template>

<style lang="less" scoped>
.tr-feedback__source-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .pill {
    padding: 4px 12px;
    font-size: 12px;
    line-height: 20px;
    border-radius: 999px;
    border: none;
    background-color: rgba(20, 118, 255, 0.06);
    color: rgb(20, 118, 255);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }

    &.collapse {
      font-size: 16px;
    }
  }

  .collapse-pill {
    padding: 0;
    font-size: 16px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba(20, 118, 255, 0.12);
    }
  }
}
</style>
