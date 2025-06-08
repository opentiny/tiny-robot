<script setup lang="ts">
import { onClickOutside, useElementBounding, useElementSize, useMediaQuery } from '@vueuse/core'
import { computed, CSSProperties, ref, StyleValue, useAttrs, watch } from 'vue'
import FlowLayoutButtons from '../flow-layout-buttons'
import { toCssUnit } from '../shared/utils'
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
  popoverWidth: 540,
  popoverHeight: 464,
  topOffset: 0,
  groupShowMoreTrigger: 'hover',
})

const attrs = useAttrs()
const attrsStyle = computed(() => attrs.style as StyleValue)

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
    // 如果在外部点到了 trigger，则停止冒泡，防止 triger 被点击然后触发菜单再次开启
    if (popoverTriggerRef.value?.contains(ev.target as Node)) {
      ev.stopPropagation()
    }
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
  <div
    class="tr-question-popover__wrapper"
    :class="attrs.class"
    :style="attrsStyle"
    ref="popoverTriggerRef"
    @click="handleToggleShow"
  >
    <slot />
  </div>
  <div v-if="show && isMobile" class="tr-question-popover__backdrop"></div>
  <Transition name="tr-question-popover">
    <div v-if="show" class="tr-question-popover" :style="popoverStyles" ref="popoverRef">
      <Header :icon="props.icon" :title="props.title" @close="handleClose" />
      <Loading v-if="props.loading">
        <slot name="loading" />
      </Loading>
      <NoData v-else-if="props.data.length === 0">
        <slot name="empty" />
      </NoData>
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
            :ref="(el) => setItemRef(el as HTMLElement, index)"
            @click="handleItemClick(item)"
            @mouseenter="isOverflowList[index] && handleItemMouseenter(item, index)"
            @mouseleave="isOverflowList[index] && handleItemMouseleave($event)"
          >
            <span>{{ index + 1 }}. </span>{{ item.text }}
          </li>
        </ul>
      </template>
      <Tooltip
        ref="tooltipRef"
        v-model:show="tooltipShow"
        :content="tooltipContent"
        :trigger="tooltipTriggerRef"
        placement="top"
        :delay-open="300"
        :delay-close="300"
      ></Tooltip>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
.tr-question-popover__wrapper {
  display: inline-block;
}

.tr-question-popover__backdrop {
  position: fixed;
  z-index: var(--tr-z-index-popover-backdrop);
  inset: 0;
  background-color: rgba(0, 0, 0, 0.15);
}

.tr-question-popover {
  position: fixed;
  z-index: var(--tr-z-index-popover);
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
      padding: 16px;
      cursor: pointer;
      border-radius: 12px;
      transition: box-shadow 0.3s ease;
      white-space: nowrap;
      overflow-x: hidden;
      text-overflow: ellipsis;
      position: relative;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

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
        background-color: rgb(240, 240, 240);
        transition: background-color 0.3s ease;
      }
    }
  }
}
</style>
