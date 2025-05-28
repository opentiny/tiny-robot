<script setup lang="ts">
import { IconClose, IconSparkles } from '@opentiny/tiny-robot-svgs'
import { onClickOutside, useElementBounding, useMediaQuery } from '@vueuse/core'
import { computed, CSSProperties, ref, watch } from 'vue'
import FlowLayoutButtons from '../flow-layout-buttons'
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
  trigger: 'click',
  popoverWidth: 540,
  popoverHeight: 464,
  topOffset: 0,
  groupShowMoreTrigger: 'hover',
})

const showRef = ref(false)

// 如果 trigger 是 manual，则 show 由外部控制，此时组件内部无法修改 show 的值
const show = computed({
  get: () => {
    if (props.trigger === 'manual') {
      return props.show
    }
    return showRef.value
  },
  set: (newValue) => {
    if (props.trigger === 'manual') {
      return
    }
    showRef.value = newValue
  },
})

defineSlots<SuggestionPopoverSlots>()

const emit = defineEmits<SuggestionPopoverEmits>()

const selectedGroup = defineModel<string>('selectedGroup')

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

const popoverTriggerRef = ref<HTMLDivElement | null>(null)
const popoverRef = ref<HTMLDivElement | null>(null)

const { x, y, update } = useElementBounding(popoverTriggerRef)

const isMobile = useMediaQuery('(max-width: 767px)')

const popoverStyles = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      left: 0,
      right: 0,
      bottom: 0,
    }
  }

  return {
    left: `min(${toCssUnit(x.value)}, 100% - ${toCssUnit(props.popoverWidth)})`,
    top: `max(${toCssUnit(y.value)} - ${toCssUnit(props.popoverHeight)} + ${toCssUnit(props.topOffset)} - 8px, 0px)`,
    width: toCssUnit(props.popoverWidth),
  }
})

if (props.trigger === 'click') {
  onClickOutside(popoverRef, (ev) => {
    ev.stopPropagation()
    show.value = false
  })
}

watch(show, (value) => {
  if (value) {
    update()
  }
})

const handleToggleShow = () => {
  show.value = !show.value
  if (show.value) {
    emit('open')
  }
}

const handleClose = () => {
  show.value = false
  emit('close')
}

const handleItemClick = (item: SuggestionItem) => {
  show.value = false
  emit('item-click', item)
}

const handleGroupClick = (id: string) => {
  const group = props.data.find((item) => (item as SuggestionGroup).group === id) as SuggestionGroup | undefined
  if (group) {
    emit('group-click', group)
  }
}
</script>

<template>
  <div class="tr-question-popover__wrapper" ref="popoverTriggerRef" @click="handleToggleShow">
    <slot />

    <Teleport v-if="show && isMobile" to="body">
      <div class="tr-question-popover__backdrop"></div>
    </Teleport>
    <Transition name="tr-question-popover">
      <Teleport v-if="show" to="body">
        <div class="tr-question-popover" :style="popoverStyles" ref="popoverRef">
          <div class="tr-question__header">
            <component v-if="props.icon" :is="props.icon" />
            <span v-else class="tr-question__header-icon">
              <IconSparkles style="color: #1476ff" />
            </span>
            <h3 class="tr-question__header-title">{{ props.title }}</h3>
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
            <FlowLayoutButtons
              class="tr-question__group"
              v-if="flowLayoutGroups.length > 0"
              :items="flowLayoutGroups"
              v-model:selected="selectedGroup"
              :lines-limit="2"
              :show-more-trigger="props.groupShowMoreTrigger"
              @item-click="handleGroupClick"
            ></FlowLayoutButtons>
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

.tr-question-popover__backdrop {
  position: fixed;
  z-index: 40;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.15);
}

.tr-question-popover {
  position: fixed;
  z-index: 50;
  height: v-bind('toCssUnit(props.popoverHeight)');
  padding: 20px;
  padding-bottom: 16px;
  border-radius: 24px;
  border-bottom-left-radius: v-bind("isMobile ? '0': '24px'");
  border-bottom-right-radius: v-bind("isMobile ? '0': '24px'");
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
  color: rgb(25, 25, 25);
  display: flex;
  flex-direction: column;

  &-enter-active,
  &-leave-active {
    transition-property: opacity, transform;
    transition-duration: 0.3s;
    transition-timing-function: ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: v-bind("isMobile ? 'unset': '0'");
    transform: v-bind("isMobile ? 'translateY(100%)': 'unset'");
  }

  &-enter-to,
  &-leave-from {
    opacity: v-bind("isMobile ? 'unset': '1'");
    transform: v-bind("isMobile ? 'translateY(0)': 'unset'");
  }

  .tr-question__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;

    .tr-question__header-icon {
      font-size: 24px;
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .tr-question__header-title {
      margin: 0;
      font-size: 20px;
      line-height: 30px;
      font-weight: 600;
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
