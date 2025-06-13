<script setup lang="ts">
import { IconReasoning, IconArrowDown, IconArrowUp } from '@opentiny/tiny-robot-svgs'
import { computed, ref } from 'vue'

const props = defineProps<{
  content?: string
  completed?: boolean
}>()

const collapsed = ref(false)

const label = computed(() => {
  return props.completed ? '推理搜索已完成' : '正在推理搜索...'
})
</script>

<template>
  <div class="tr-bubble__reasoning">
    <div class="tr-bubble__reasoning-toggle" @click="collapsed = !collapsed">
      <div class="tr-bubble__reasoning-toggle-label-wrapper">
        <IconReasoning v-if="!props.completed" />
        <span>{{ label }}</span>
      </div>
      <IconArrowDown v-if="collapsed" />
      <IconArrowUp v-else />
    </div>
    <span v-show="!collapsed" class="tr-bubble__reasoning-content">{{ content }}</span>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble__reasoning {
  font-size: 16px;
  line-height: 26px;
  margin-bottom: 16px;

  .tr-bubble__reasoning-toggle {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: -8px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .tr-bubble__reasoning-toggle-label-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16px;
      color: rgb(25, 25, 25);

      svg {
        flex-shrink: 0;
        font-size: 24px;
      }
    }
  }

  .tr-bubble__reasoning-content {
    color: rgb(89, 89, 89);
    border-left: 2px solid rgb(219, 219, 219);
    padding-left: 16px;
    margin-top: 16px;
    white-space: pre-line;
    display: inline-block;
  }
}
</style>
