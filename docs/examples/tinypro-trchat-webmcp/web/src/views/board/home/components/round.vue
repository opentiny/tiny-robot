<script lang="ts" setup>
import { Progress as TinyProgress } from '@opentiny/vue'
import { TinyHuichartsRing as TinyChartRing } from '@opentiny/vue-huicharts'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import useLocale from '@/hooks/locale'
import { debounce } from '@/hooks/responsive'

const props = defineProps<{
  round?: {
    ring: { value: number, name: string }[]
    stations: { key: string, percentage: number, color: string }[]
  }
}>()
const { t } = useI18n()
const { currentLocale } = useLocale()
const ringRef = ref()
const legendLeft = ref('60%')

const resolvedData = computed(() =>
  (props.round?.ring ?? []).map(item => ({
    ...item,
    // name 为 home.* 时按国际化 key 处理（如 home.round.unknow）
    name: item.name.startsWith('home.') ? t(item.name) : item.name,
  })),
)

const totalValue = computed(() =>
  resolvedData.value.reduce((sum, item) => sum + item.value, 0),
)

const options = computed(() => ({
  data: resolvedData.value.map(item => ({ value: item.value, name: item.name })),
}))

const stations = computed(() => props.round?.stations ?? [])

const chartExtend = computed(() => {
  const total = totalValue.value

  return {
    color: ['#bf0a1c', '#f23030', '#ffb700', '#ff8800'],
    title: {
      text: `${total.toLocaleString(currentLocale.value === 'zhCN' ? 'zh-CN' : 'en-US')} GB`,
      subtext: t('home.round.total'),
      left: '36%',
      top: '50%',
      textAlign: 'center',
      textVerticalAlign: 'middle',
      itemGap: 6,
      textStyle: {
        fontSize: 24,
        fontWeight: 500,
        color: '#191919',
      },
      subtextStyle: {
        fontSize: 12,
        color: '#808080',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter(p: any) {
        return `${p.name}: ${p.value} (${p.percent.toFixed(1)}%)`
      },
    },
    legend: {
      orient: 'vertical',
      left: legendLeft.value,
      top: 'middle',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      textStyle: {
        fontSize: 14,
        color: '#808080',
      },
      formatter(name: string) {
        const item = resolvedData.value.find(d => d.name === name)
        const percent = item ? ((item.value / total) * 100).toFixed(1) : '0'
        return `${name}  ${percent}%`
      },
    },
    series: [
      {
        type: 'pie',
        selectedMode: 'single',
        radius: ['60%', '66%'],
        center: ['36%', '50%'],
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
        avoidLabelOverlap: true,
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            formatter(p: any) {
              return `${p.percent.toFixed(1)}%`
            },
            fontSize: 22,
            fontWeight: 600,
            color: '#191919',
            offset: [0, -48],
          },
        },
        labelLine: {
          show: false,
        },
      },
    ],
  }
})

onMounted(() => {
  const resizeHandler = debounce(() => {
    ringRef.value?.resize()
    updateLegendPosition()
  }, 200)

  window.addEventListener('resize', resizeHandler)

  const el = ringRef.value?.$el || ringRef.value
  let observer: ResizeObserver | null = null
  if (el) {
    observer = new ResizeObserver(() => {
      ringRef.value?.resize()
      updateLegendPosition()
    })
    observer.observe(el)
  }

  resizeHandler()

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
    observer?.disconnect()
  })
})

function getLegendLeft() {
  const el = ringRef.value?.$el || ringRef.value
  if (!el?.clientWidth)
    return '60%'
  const w = el.clientWidth
  const h = el.clientHeight || 320
  const ringRightEdge = 0.36 * w + 0.66 * (Math.min(w, h) / 2)
  const preferred = Math.round(ringRightEdge + 160)
  return Math.max(0, Math.min(preferred, w - measureLegendWidth()))
}

function measureLegendWidth() {
  const total = totalValue.value
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx)
    return 0
  ctx.font = '14px sans-serif'
  const maxTextWidth = Math.max(
    ...resolvedData.value.map(item =>
      ctx.measureText(`${item.name}  ${((item.value / total) * 100).toFixed(1)}%`).width,
    ),
  )
  return maxTextWidth + 20
}

function updateLegendPosition() {
  legendLeft.value = getLegendLeft()
}

watch(currentLocale, () => {
  ringRef.value?.resize()
  updateLegendPosition()
})
</script>

<template>
  <div class="round-box">
    <div class="round-body">
      <div class="chart-panel">
        <h3 class="title">
          {{ $t('home.round.title') }}
        </h3>
        <TinyChartRing
          ref="ringRef"
          width="100%"
          height="320px"
          :options="options"
          :extend="chartExtend"
        />
      </div>

      <div class="resource">
        <h4 class="resource-title">
          {{ $t('home.round.resource') }}
        </h4>

        <div class="io-row">
          <div class="io-item">
            <div class="io-value">
              21.2GB
            </div>
            <div class="io-label">
              {{ $t('home.round.readIO') }}
            </div>
          </div>
          <div class="io-item">
            <div class="io-value">
              41.5GB
            </div>
            <div class="io-label">
              {{ $t('home.round.writeIO') }}
            </div>
          </div>
        </div>

        <div class="stations">
          <div v-for="station in stations" :key="station.key" class="station-item">
            <span class="station-name">{{ $t(station.key) }}</span>
            <TinyProgress
              class="station-progress"
              :percentage="station.percentage"
              :color="station.color"
              :stroke-width="6"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.round-box {
  margin-top: 20px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 10px #4062e133;
}

.round-body {
  display: flex;
  align-items: flex-start;
  gap: 64px;
  margin-bottom: 22px;
}

.chart-panel {
  flex: 1;
  min-width: 0;
}

.title {
  margin-bottom: 16px;
  color: #191919;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
}

.resource {
  flex: 1;
  min-width: 260px;
}

.resource-title {
  margin-bottom: 24px;
  color: #191919;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
}

.io-row {
  display: flex;
  gap: 30px;
  margin-bottom: 32px;
}

.io-value {
  color: #191919;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
}

.io-label {
  margin-top: 4px;
  color: #808080;
  font-size: 14px;
  line-height: 22px;
}

.stations {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.station-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.station-name {
  color: #595959;
  font-size: 14px;
  line-height: 22px;
}

.station-progress {
  width: 100%;
}

@media (max-width: 768px) {
  .round-body {
    flex-direction: column;
    gap: 24px;
  }

  .resource {
    min-width: 0;
  }
}
</style>
