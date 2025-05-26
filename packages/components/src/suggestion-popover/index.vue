<script setup lang="ts">
import { IconClose, IconSparkles } from '@opentiny/tiny-robot-svgs'
import { onClickOutside, useElementBounding } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'
import FlowLayout from '../flow-layout'
import IconButton from '../icon-button'
import { toCssUnit } from '../shared/utils'
import {
  SuggestionGroup,
  SuggestionItem,
  SuggestionPopoverEmits,
  SuggestionPopoverProps,
  SuggestionPopoverSlots,
} from './index.type'

const props = withDefaults(defineProps<SuggestionPopoverProps>(), {
  title: '热门问题',
  popoverWidth: 540,
  popoverHeight: 464,
  topOffset: 0,
  closeOnClickOutside: true,
})

const show = defineModel<SuggestionPopoverProps['show']>('show')

defineSlots<SuggestionPopoverSlots>()

const emit = defineEmits<SuggestionPopoverEmits>()

const selectedGroup = defineModel<string | symbol>('selectedGroup')

const isGrouped = computed(() => {
  return typeof (props.data.at(0) as SuggestionGroup | undefined)?.group === 'string'
})

if (!selectedGroup.value && isGrouped.value && props.data.length) {
  selectedGroup.value = (props.data as SuggestionGroup[])[0].group
}

const dataItems = computed(() => {
  if (!isGrouped.value) {
    return props.data as SuggestionItem[]
  }

  return (props.data as SuggestionGroup[]).find((group) => group.group === selectedGroup.value)?.items || []
})

const flowLayoutGroups = computed(() => {
  if (!isGrouped.value) {
    return []
  }

  return (props.data as SuggestionGroup[]).map((group) => ({
    ...group,
    id: group.group,
  }))
})

const popoverTriggerRef = useTemplateRef('popover-trigger')
const popoerRef = useTemplateRef('popover')

const { x, y, update } = useElementBounding(popoverTriggerRef)

if (props.closeOnClickOutside) {
  onClickOutside(popoerRef, (ev) => {
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

const handleItemClick = (item: SuggestionItem) => {
  emit('item-click', item)
  handleClose()
}
</script>

<template>
  <div class="tr-question-popover__wrapper" ref="popover-trigger" @click="handleToggleShow">
    <slot />

    <Transition name="tr-question-popover">
      <Teleport v-if="show" to="body">
        <div class="tr-question-popover" ref="popover">
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
          <div v-if="props.loading" class="tr-question__loading-wrapper">
            <slot name="loading">
              <img class="tr-question__loading" src="../assets/loading.webp" />
              <span class="tr-question__loading-text">正在加载</span>
            </slot>
          </div>
          <div v-else-if="props.data.length === 0" class="tr-question__no-data-wrapper">
            <slot name="empty">
              <img class="tr-question__no-data" src="../assets/svgs/no-data.svg" />
              <span class="tr-question__no-data-text">暂时没有内容</span>
            </slot>
          </div>
          <template v-else>
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
          </template>
        </div>
      </Teleport>
    </Transition>
  </div>
</template>

<style lang="less" scoped>
.tr-question-popover__wrapper {
  display: inline-block;
}

.tr-question-popover {
  position: fixed;
  left: v-bind('toCssUnit(x)');
  top: max(
    calc(v-bind('toCssUnit(y)') + v-bind('toCssUnit(props.topOffset)') - 8px),
    v-bind('toCssUnit(props.popoverHeight)')
  );
  z-index: 30;
  width: v-bind('toCssUnit(props.popoverWidth)');
  height: v-bind('toCssUnit(props.popoverHeight)');
  transform: translateY(-100%);
  padding: 20px;
  padding-bottom: 16px;
  border-radius: 24px;
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;

  &-enter-active,
  &-leave-active {
    transition: opacity 0.3s ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-to,
  &-leave-from {
    opacity: 1;
  }

  .tr-question__header {
    flex-shrink: 0;
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

  .tr-question__group {
    flex-shrink: 0;
    margin-top: 16px;
  }

  .tr-question__list {
    flex: 1;
    list-style: none;
    // 负数 margin + 正数补偿 padding 解决 box-shadow 被裁剪的问题
    margin: 0 -16px 0 -16px;
    padding: 16px 16px 0 16px;
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

  .tr-question__loading-wrapper,
  .tr-question__no-data-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .tr-question__loading-wrapper {
    .tr-question__loading {
      width: 36px;
      height: 36px;
    }

    .tr-question__loading-text {
      margin-top: 12px;
      font-size: 12px;
      line-height: 24px;
      color: #808080;
    }
  }

  .tr-question__no-data-wrapper {
    .tr-question__no-data {
      width: 120px;
      height: 120px;
    }

    .tr-question__no-data-text {
      margin-top: 14px;
      font-size: 12px;
      line-height: 24px;
      color: #191919;
    }
  }
}
</style>
