<script setup lang="ts">
import { IconHotQuestion } from '@opentiny/tiny-robot-svgs'
import { useElementBounding } from '@vueuse/core'
import { Component, useTemplateRef, VNode } from 'vue'
import FlowLayout from '../flow-layout'

interface Category {
  id: string
  label: string
  icon?: VNode | Component
  questions: Question[]
}

interface Question {
  id: string
  text: string
  keywords?: string[]
}

const props = defineProps<{
  categories: Category[]
  loading?: boolean
}>()

defineSlots<{
  default: () => unknown
  header: () => unknown
}>()

const popoverTriggerRef = useTemplateRef('popover-trigger')
const { x, y } = useElementBounding(popoverTriggerRef)
</script>

<template>
  <div class="tr-question-popover__wrapper" ref="popover-trigger">
    <slot />

    <Teleport to="body">
      <div class="tr-question-popover">
        <div class="tr-question__header">
          <slot name="header">
            <IconHotQuestion style="font-size: 36px" />
            <h3 class="tr-question_header-title">热门问题</h3>
          </slot>
        </div>
        <div class="tr-question__body">
          <FlowLayout :items="props.categories" :lines-limit="2"></FlowLayout>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="less" scoped>
.tr-question-popover__wrapper {
  display: inline-block;
}

.tr-question-popover {
  position: fixed;
  left: v-bind("x + 'px'");
  top: v-bind("y + 'px'");
  z-index: 30;
  max-width: 600px;
  transform: translateY(-100%);
  padding: 24px;
  border-radius: 24px;
  background-color: #ffffff;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);

  .tr-question__header {
    display: flex;
    align-items: center;
    gap: 12px;

    .tr-question_header-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1d2129;
    }
  }

  .tr-question__body {
    margin-top: 16px;
  }
}
</style>
