<script setup lang="ts">
import { IconSparkles, IconClose } from '@opentiny/tiny-robot-svgs'
import { onClickOutside, useElementBounding } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'
import FlowLayout from '../flow-layout'
import {
  QuestionGroup,
  QuestionItem,
  QuestionPopoverEmits,
  QuestionPopoverProps,
  QuestionPopoverSlots,
} from './index.type'
import IconButton from '../icon-button'
import { toCssUnit } from '../shared/utils'

const props = withDefaults(defineProps<QuestionPopoverProps>(), {
  title: '热门问题',
  popperWidth: 540,
  listHeight: 280,
  topOffset: 0,
  closeOnClickOutside: true,
})

const show = defineModel<QuestionPopoverProps['show']>('show')

defineSlots<QuestionPopoverSlots>()

const emit = defineEmits<QuestionPopoverEmits>()

const selectedGroup = defineModel<string | symbol>('selectedGroup')

const isGrouped = computed(() => {
  return typeof (props.data[0] as QuestionGroup).group === 'string'
})

if (!selectedGroup.value && isGrouped.value && props.data.length) {
  selectedGroup.value = (props.data as QuestionGroup[])[0].group
}

const dataItems = computed(() => {
  if (!isGrouped.value) {
    return props.data as QuestionItem[]
  }

  return (props.data as QuestionGroup[]).find((group) => group.group === selectedGroup.value)?.items || []
})

const flowLayoutGroups = computed(() => {
  if (!isGrouped.value) {
    return []
  }

  return (props.data as QuestionGroup[]).map((group) => ({
    ...group,
    id: group.group,
  }))
})

const popoverTriggerRef = useTemplateRef('popper-trigger')
const popperRef = useTemplateRef('popper')

const { x, y, update } = useElementBounding(popoverTriggerRef)

if (props.closeOnClickOutside) {
  onClickOutside(popperRef, (ev) => {
    ev.stopPropagation()
    show.value = false
  })
}

const handleToggleShow = () => {
  show.value = !show.value
  if (show.value) {
    update()
  }
}

const handleClose = () => {
  show.value = false
}

const handleItemClick = (item: QuestionItem) => {
  emit('item-click', item)
  handleClose()
}
</script>

<template>
  <div class="tr-question-popover__wrapper" ref="popper-trigger" @click="handleToggleShow">
    <slot />

    <Teleport v-if="show" to="body">
      <div class="tr-question-popover" ref="popper">
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
          <FlowLayout
            class="tr-question__group"
            v-if="flowLayoutGroups.length > 0"
            :items="flowLayoutGroups"
            v-model:selected="selectedGroup"
            :lines-limit="2"
          ></FlowLayout>
          <ul class="tr-question__list">
            <li
              class="tr-question__list-item"
              v-for="(item, index) in dataItems"
              :key="item.id"
              @click="handleItemClick(item)"
            >
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
  left: v-bind('toCssUnit(x)');
  top: calc(v-bind('toCssUnit(y)') + v-bind('toCssUnit(props.topOffset)') - 8px);
  z-index: 30;
  width: v-bind('toCssUnit(props.popperWidth)');
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
    .tr-question__group {
      margin-top: 16px;
    }

    .tr-question__list {
      list-style: none;
      // 负数 margin + 正数补偿 padding 解决 box-shadow 被裁剪的问题
      margin: 0 -16px 0 -16px;
      padding: 16px 16px 0 16px;
      height: v-bind('toCssUnit(props.listHeight)');
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
