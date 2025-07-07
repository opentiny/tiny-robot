<script setup lang="ts">
import { IconArrowUp, IconSuccessFill } from '@opentiny/tiny-robot-svgs'
import { ref } from 'vue'

export interface ChainItem {
  title: string
  content: string
}

const props = withDefaults(
  defineProps<{
    items: ChainItem[]
    html?: boolean
    contentClass?: string
    contentRenderer?: (content: string) => string
  }>(),
  {
    html: true,
  },
)

const collapsedMap = ref<Record<number, boolean>>({})

const toggleCollapse = (index: number) => {
  collapsedMap.value[index] = !collapsedMap.value[index]
}

const getContent = (content: string) => {
  if (props.contentRenderer) {
    return props.contentRenderer(content)
  }
  return content
}
</script>

<template>
  <div class="tr-chain-list">
    <div class="tr-chain-item" v-for="(item, index) in props.items" :key="index">
      <div class="tr-chain-item__header">
        <div class="tr-chain-item__icon"><IconSuccessFill /></div>
        <div class="tr-chain-item__title">{{ item.title }}</div>
        <IconArrowUp
          class="expand-icon"
          :class="{ 'rotate-180': collapsedMap[index] }"
          @click="toggleCollapse(index)"
        />
      </div>
      <div class="tr-chain-item__body" v-show="!collapsedMap[index]">
        <div class="tr-chain-item__chain-line-wrapper">
          <div class="tr-chain-item__chain-line"></div>
        </div>
        <div v-if="!props.html" class="tr-chain-item__content" :class="props.contentClass">
          {{ getContent(item.content) }}
        </div>
        <div v-else class="tr-chain-item__content" :class="props.contentClass" v-html="getContent(item.content)"></div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-chain-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tr-chain-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tr-chain-item__header {
  display: flex;
  align-items: center;
  gap: 8px;

  .tr-chain-item__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 12px;
    color: #dbdbdb;
  }

  .tr-chain-item__title {
    font-size: 14px;
    line-height: 24px;
    color: #191919;
    font-weight: 600;
  }

  .expand-icon {
    cursor: pointer;
    font-size: 14px;
    color: #191919;

    &.rotate-180 {
      transform: rotate(180deg);
    }
  }
}

.tr-chain-item__body {
  flex: 1;
  display: flex;
  gap: 8px;

  .tr-chain-item__chain-line-wrapper {
    flex-shrink: 0;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%);
  }

  .tr-chain-item__chain-line {
    width: 2px;
    height: 100%;
    background-color: transparent;
    border-left: 2px dotted #dbdbdb;
  }

  .tr-chain-item__content {
    flex: 1;
    font-size: 14px;
    line-height: 22px;
    color: #595959;
  }
}
</style>
