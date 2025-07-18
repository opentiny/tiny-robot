<script setup lang="tsx">
import { IconClose } from '@opentiny/tiny-robot-svgs'
import { onClickOutside, useElementSize, useMediaQuery, useScroll, watchThrottled } from '@vueuse/core'
import { computed, CSSProperties, reactive, ref, watch } from 'vue'
import TrBasePopper from '../base-popper'
import FlowLayoutButtons from '../flow-layout-buttons'
import IconButton from '../icon-button'
import { createTeleport, useTeleportTarget } from '../shared/composables'
import Backdrop from './components/Backdrop.vue'
import Header from './components/Header.vue'
import Loading from './components/Loading.vue'
import NoData from './components/NoData.vue'
import Tooltip from './components/Tooltip.vue'
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
  topOffset: 8,
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

const basePopperRef = ref<InstanceType<typeof TrBasePopper> | null>(null)
const triggerRef = computed(() => basePopperRef.value?.triggerRef)
const popoverRef = computed(() => basePopperRef.value?.popperRef)

const isMobile = useMediaQuery('(max-width: 767px)')

const listRef = ref<HTMLElement | null>(null)
const isScrolling = ref(false)
// useScroll 设置 throttle 参数在 shadow dom 中会报错，所以使用 watchThrottled 代替
const { isScrolling: listScrolling } = useScroll(listRef)
watchThrottled(
  listScrolling,
  (value) => {
    isScrolling.value = value
  },
  { throttle: 100, leading: true, trailing: true },
)

const listItemsRef = ref<(HTMLElement | null)[]>([])
const firstItemRef = computed(() => listItemsRef.value.at(0))

const setItemRef = (el: HTMLElement | null, index: number) => {
  listItemsRef.value[index] = el
}

const isOverflowList = ref<boolean[]>([])

const updateOverflowStates = () => {
  isOverflowList.value = listItemsRef.value.map((el) => {
    if (!el) return false
    return el.scrollWidth > el.clientWidth
  })
}

const tooltipRef = ref<InstanceType<typeof Tooltip> | null>(null)
const tooltipTriggerRef = ref<HTMLElement | null>(null)
const tooltipShow = ref(false)
const tooltipContent = ref('')

const { width: firstItemWidth } = useElementSize(firstItemRef)

watch(firstItemWidth, () => {
  updateOverflowStates()
})

const popoverStyles = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      left: 0,
      right: 0,
      bottom: 0,
      top: 'unset',
      minWidth: '100dvw',
    }
  }

  return {}
})

const teleportTarget = useTeleportTarget(triggerRef)

const teleportProps = reactive({ to: props.appendTo || teleportTarget.value })
createTeleport(teleportProps, () => <Backdrop show={show.value && isMobile.value} />)

const emitClickTriggerEvents = () => {
  if (props.trigger === 'click') {
    if (show.value) {
      emit('open')
    } else {
      emit('close')
    }
  }
}

onClickOutside(
  popoverRef,
  (ev) => {
    emit('click-outside', ev as MouseEvent)
    show.value = false
    emitClickTriggerEvents()
  },
  { ignore: [triggerRef] },
)

const handleToggleShow = () => {
  show.value = !show.value
  emitClickTriggerEvents()
}

const handleClose = () => {
  show.value = false
  emit('close')
}

const handleItemClick = (item: SuggestionItem) => {
  emit('item-click', item)
  show.value = false
  emitClickTriggerEvents()
}

const handleGroupClick = (id: string) => {
  const group = props.data.find((item) => (item as SuggestionGroup).group === id) as SuggestionGroup | undefined
  if (group) {
    emit('group-click', group)
  }
}

const handleItemMouseenter = (item: SuggestionItem, index: number) => {
  tooltipTriggerRef.value = listItemsRef.value[index]
  tooltipShow.value = true
  tooltipContent.value = item.text
}

const handleItemMouseleave = (event: MouseEvent) => {
  if ((tooltipRef.value?.$el as HTMLElement).contains(event.relatedTarget as Node)) {
    return
  }

  tooltipShow.value = false
}
</script>

<template>
  <TrBasePopper
    :show="show"
    :class="['tr-question-popover', { mobile: isMobile }]"
    :style="popoverStyles"
    ref="basePopperRef"
    placement="top-left"
    :append-to="props.appendTo"
    :offset="props.topOffset"
    :transition-props="{ name: isMobile ? 'tr-question-popover-mobile' : 'tr-question-popover' }"
    :prevent-overflow="true"
    :trigger-events="{ onClick: handleToggleShow }"
  >
    <template #trigger>
      <slot name="trigger" />
    </template>
    <template #content>
      <slot name="header">
        <Header :icon="props.icon" :title="props.title" />
      </slot>
      <Loading v-if="props.loading">
        <slot name="loading" />
      </Loading>
      <NoData v-else-if="props.data.length === 0">
        <slot name="empty" />
      </NoData>
      <template v-else>
        <slot name="body">
          <FlowLayoutButtons
            class="tr-question__group"
            v-if="flowLayoutGroups.length > 0"
            :items="flowLayoutGroups"
            v-model:selected="selectedGroup"
            :lines-limit="2"
            :show-more-trigger="props.groupShowMoreTrigger"
            @item-click="handleGroupClick"
          ></FlowLayoutButtons>
          <ul class="tr-question__list" :class="{ scrolling: isScrolling }" ref="listRef">
            <li
              class="tr-question__list-item"
              v-for="(item, index) in dataItems"
              :key="item.id"
              :ref="(el) => setItemRef(el as HTMLElement, index)"
              @click="handleItemClick(item)"
              @mouseenter="isOverflowList[index] && handleItemMouseenter(item, index)"
              @mouseleave="isOverflowList[index] && handleItemMouseleave($event)"
            >
              <slot name="item" :item="item">
                <span>{{ index + 1 }}. </span>{{ item.text }}
              </slot>
            </li>
          </ul>
        </slot>
      </template>
      <Tooltip
        ref="tooltipRef"
        v-model:show="tooltipShow"
        :content="tooltipContent"
        :trigger="tooltipTriggerRef"
        :disabled="isScrolling"
        placement="top"
        :delay-open="300"
        :delay-close="300"
      ></Tooltip>
      <IconButton class="tr-question-popover__close" :icon="IconClose" size="32" svg-size="20" @click="handleClose" />
    </template>
  </TrBasePopper>
</template>

<style lang="less">
:root {
  --tr-suggestion-popover-bg-color: #ffffff;
  --tr-suggestion-popover-box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
  --tr-suggestion-popover-color: rgb(25, 25, 25);
  --tr-suggestion-popover-width: 540px;
  --tr-suggestion-popover-height: 464px;
  --tr-suggestion-popover-backdrop-color: rgba(0, 0, 0, 0.15);
  --tr-suggestion-popover-scrollbar-color: #dbdbdb;

  // 列表项
  --tr-suggestion-popover-item-font-size: 14px;
  --tr-suggestion-popover-item-line-height: 24px;
  --tr-suggestion-popover-item-hover-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  --tr-suggestion-popover-item-border-color: rgb(240, 240, 240);

  // 关闭按钮
  --tr-suggestion-popover-close-bg-color: var(--tr-icon-button-bg);
  --tr-suggestion-popover-close-hover-bg-color: var(--tr-icon-button-hover-bg);
  --tr-suggestion-popover-close-color: #595959;
}

.tr-question-popover {
  z-index: var(--tr-z-index-popover);
  width: var(--tr-suggestion-popover-width);
  height: var(--tr-suggestion-popover-height);
  max-width: 100dvw;
  max-height: 100dvh;
  padding: 20px;
  padding-bottom: 16px;
  border-radius: 24px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  background-color: var(--tr-suggestion-popover-bg-color);
  box-shadow: var(--tr-suggestion-popover-box-shadow);
  color: var(--tr-suggestion-popover-color);
  display: flex;
  flex-direction: column;

  &.mobile {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

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
}

.tr-question-popover-mobile {
  &-enter-active,
  &-leave-active {
    transition: transform 0.3s ease;
  }

  &-enter-from,
  &-leave-to {
    transform: translateY(100%);
  }

  &-enter-to,
  &-leave-from {
    transform: translateY(0);
  }
}
</style>

<style lang="less" scoped>
.tr-question-popover__wrapper {
  display: inline-block;
}

.tr-question__group {
  flex-shrink: 0;
  margin-top: 16px;
}

.tr-question__list {
  flex: 1;
  list-style: none;
  // 负数 margin + 正数补偿 padding 解决 box-shadow 被裁剪的问题
  margin: 0 -12px;
  margin-top: 16px;
  padding: 0 12px;
  overflow-y: auto;
  --scrollbar-color: transparent;

  &.scrolling {
    --scrollbar-color: var(--tr-suggestion-popover-scrollbar-color);
  }

  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-color);
    border-radius: 2px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  // 兼容性不支持 ::-webkit-scrollbar 的浏览器
  @supports not selector(::-webkit-scrollbar) {
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-color) transparent;
  }

  .tr-question__list-item {
    font-size: var(--tr-suggestion-popover-item-font-size);
    line-height: var(--tr-suggestion-popover-item-line-height);
    padding: 16px;
    cursor: pointer;
    border-radius: 12px;
    transition: box-shadow 0.3s ease;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
    position: relative;

    &:hover {
      box-shadow: var(--tr-suggestion-popover-item-hover-box-shadow);

      &::after {
        background-color: transparent;
      }
    }

    &::after {
      content: '';
      display: block;
      position: absolute;
      bottom: 0;
      left: 12px;
      right: 12px;
      height: 1px;
      background-color: var(--tr-suggestion-popover-item-border-color);
      transition: background-color 0.3s ease;
    }

    // 如果当前项的下一个项被 hover，则当前项的after边框不显示
    &:has(+ .tr-question__list-item:hover) {
      &::after {
        background-color: transparent;
      }
    }
  }
}

.tr-question-popover__close {
  background-color: var(--tr-suggestion-popover-close-bg-color);
  color: var(--tr-suggestion-popover-close-color);
  top: 22px;
  right: 10px;
  position: absolute;
}
</style>
