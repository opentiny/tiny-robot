<script setup lang="ts">
import { IconSparkles, IconClose } from '@opentiny/tiny-robot-svgs'
import { useElementBounding } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'
import FlowLayout from '../flow-layout'
import { QuestionPopoverProps, QuestionPopoverSlots } from './index.type'
import IconButton from '../icon-button'

const props = withDefaults(defineProps<QuestionPopoverProps>(), {
  title: '热门问题',
  popperWidth: '540px',
  listHeight: '280px',
})

const show = defineModel<QuestionPopoverProps['show']>('show')

defineSlots<QuestionPopoverSlots>()

const selectedGroup = defineModel<string | symbol>('selectedGroup')

if (!selectedGroup.value && props.groups.length) {
  selectedGroup.value = props.groups[0].id
}

const groupItems = computed(() => {
  if (!selectedGroup.value) {
    return []
  }

  return props.groups.find((group) => group.id === selectedGroup.value)?.items || []
})

const popoverTriggerRef = useTemplateRef('popover-trigger')
const { x, y, update } = useElementBounding(popoverTriggerRef)

const handleToggleShow = () => {
  show.value = !show.value
  if (show.value) {
    update()
  }
}

const handleClose = () => {
  show.value = false
}
</script>

<template>
  <div class="tr-question-popover__wrapper" ref="popover-trigger" @click="handleToggleShow">
    <slot />

    <Teleport v-if="show" to="body">
      <div class="tr-question-popover">
        <div class="tr-question__header">
          <component v-if="props.icon" :is="icon" />
          <IconSparkles v-else style="font-size: 36px; color: #1476ff" />
          <h3 class="tr-question_header-title">{{ props.title }}</h3>
          <IconButton
            class="tr-question-popover__close"
            :icon="IconClose"
            size="24"
            svg-size="20"
            @click="handleClose"
          />
        </div>
        <div class="tr-question__body">
          <FlowLayout :items="props.groups" v-model:selected="selectedGroup" :lines-limit="2"></FlowLayout>
          <ul class="tr-question__list">
            <li class="tr-question__list-item" v-for="(item, index) in groupItems" :key="item.id">
              <span class="tr-question__list-item-text">
                <span>{{ index + 1 }}. </span>{{ item.text }}
              </span>
            </li>
          </ul>
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
  max-width: v-bind('props.popperWidth');
  transform: translateY(-100%);
  padding: 20px;
  padding-bottom: 16px;
  border-radius: 24px;
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);

  .tr-question__header {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;

    .tr-question_header-title {
      margin: 0;
      font-size: 20px;
      line-height: 30px;
      font-weight: 600;
      color: #1d2129;
    }

    .tr-question-popover__close {
      // TODO icon 待整改
      // color: #595959;
      right: 0;
      position: absolute;
    }
  }

  .tr-question__body {
    margin-top: 16px;

    .tr-question__list {
      list-style: none;
      // 负数 margin + 正数补偿 padding 解决 box-shadow 被裁剪的问题
      margin: 16px -16px 0 -16px;
      padding: 0 16px;
      height: v-bind('props.listHeight');
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #dbdbdb transparent;

      .tr-question__list-item {
        font-size: 14px;
        line-height: 24px;
        padding: 0 12px;
        cursor: pointer;
        border-radius: 12px;
        transition: box-shadow 0.3s ease;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

          .tr-question__list-item-text {
            border-color: transparent;
          }
        }

        .tr-question__list-item-text {
          display: inline-block;
          width: 100%;
          padding: 16px 4px 15px 4px;
          border-bottom: 1px solid rgb(240, 240, 240);
          transition: border-color 0.3s ease;
        }
      }
    }
  }
}
</style>
