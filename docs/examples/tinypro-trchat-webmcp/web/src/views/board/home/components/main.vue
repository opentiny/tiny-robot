<script lang="ts" setup>
import { Progress as TinyProgress, Tag as TinyTag } from '@opentiny/vue'
import { iconArrowDown, iconArrowUp } from '@opentiny/vue-icon'
import { computed, ref } from 'vue'

const props = defineProps<{ cards?: Record<RangeKey, CardData[]> }>()
const TrendUpIcon = iconArrowUp()
const TrendDownIcon = iconArrowDown()

const ranges = [
  { key: 'week', labelKey: 'home.main.rangeWeek' },
  { key: 'day', labelKey: 'home.main.rangeDay' },
  { key: 'hour', labelKey: 'home.main.rangeHour' },
] as const

type RangeKey = (typeof ranges)[number]['key']

interface CardData {
  value: string
  trend: 'up' | 'down'
  change: string
  type: 'success' | 'danger'
  percent: number
}

const emptyCards: Record<RangeKey, CardData[]> = { week: [], day: [], hour: [] }

const rangeData = computed(() => props.cards ?? emptyCards)

const cardLabels = [
  { labelKey: 'home.main.one' },
  { label: 'DOM Ready' },
  { labelKey: 'home.main.up' },
  { labelKey: 'home.main.down' },
]

const currentRange = ref<RangeKey>('week')
const currentData = computed(() => rangeData.value[currentRange.value])

const trendIcons = {
  up: TrendUpIcon,
  down: TrendDownIcon,
}
</script>

<template>
  <div class="main">
    <div class="header">
      <h3 class="title">
        {{ $t('home.main.title') }}
      </h3>
      <div class="range-switch">
        <div
          v-for="item in ranges"
          :key="item.key"
          class="range-item"
          role="button"
          tabindex="0"
          :class="{ active: currentRange === item.key }"
          @click="currentRange = item.key"
          @keydown.enter.prevent="currentRange = item.key"
          @keydown.space.prevent="currentRange = item.key"
        >
          {{ $t(item.labelKey) }}
        </div>
      </div>
    </div>
    <div v-if="currentData.length" class="cards">
      <div v-for="(card, index) in cardLabels" :key="card.label || card.labelKey" class="card">
        <div class="info">
          <div class="value">
            {{ currentData[index].value }}<span class="unit">/s</span>
          </div>
          <div class="label">
            {{ card.label || $t(card.labelKey) }}
          </div>
        </div>
        <div class="trend">
          <div class="trend-compare">
            <span class="compare">{{ $t('home.main.day') }}</span>
            <TinyTag :type="currentData[index].type">
              <span class="tag-content">
                <component :is="trendIcons[currentData[index].trend]" class="trend-icon" />
                {{ currentData[index].change }}
              </span>
            </TinyTag>
          </div>
        </div>
        <div class="progress">
          <TinyProgress
            type="circle"
            :percentage="currentData[index].percent"
            color="#4e85f4"
            :width="56"
            :stroke-width="5"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.main {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 10px 0 rgb(64 98 225 / 20%);

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .title {
    color: #191919;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
  }

  .range-switch {
    display: flex;
  }

  .range-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    height: 24px;
    padding: 3px 16px;
    margin-left: -1px;
    color: #595959;
    font-size: 12px;
    line-height: 24px;
    text-align: center;
    background: #f5f5f5;
    border: 1px solid #f5f5f5;
    cursor: pointer;
    user-select: none;
  }

  .range-item:first-child {
    margin-left: 0;
    border-radius: 4px 0 0 4px;
  }

  .range-item:last-child {
    border-radius: 0 4px 4px 0;
  }

  .range-item.active {
    z-index: 1;
    border-radius: 4px;
    color: #191919;
    background: #fff;
    border-color: #191919;
    font-weight: 600;
  }

  // 中间分割线，上下垂直居中
  .range-item:not(:last-child)::after {
    position: absolute;
    top: 50%;
    right: -1px;
    z-index: 2;
    width: 1px;
    height: 12px;
    background: #dbdbdb;
    transform: translateY(-50%);
    content: '';
  }

  // 选中项两侧的分割线隐藏，避免与选中边框重叠
  .range-item.active::after,
  .range-item:has(+ .range-item.active)::after {
    display: none;
  }

  .cards {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
  }

  .card {
    display: flex;
    flex: 1;
    justify-content: space-between;
    gap: 8px;
    min-width: 280px;
    height: 110px;
    padding: 24px 16px;
    background: #f5f5f5;
    border-radius: 8px;
  }

  .info {
    flex-shrink: 0;
  }

  .value {
    color: #191919;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    white-space: nowrap;

    .unit {
      color: #808080;
      font-weight: 400;
      margin-left: 6px;
      font-size: 14px;
    }
  }

  .label {
    margin-top: 4px;
    color: #808080;
    font-size: 14px;
    line-height: 22px;
    white-space: nowrap;
  }

  .trend {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex-shrink: 0;
  }

  .trend-compare {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  .compare {
    color: #808080;
    font-size: 14px;
    line-height: 22px;
    white-space: nowrap;
  }

  .progress {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .tag-content {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .trend-icon {
    font-size: 12px;
  }
}

@media (max-width: @screen-sm) {
  .main {
    .cards {
      flex-wrap: wrap;
    }

    .card {
      flex: 1 1 40%;
    }
  }
}
</style>
