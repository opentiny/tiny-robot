<script lang="ts" setup>
import { TinyHuichartsPie as TinyChartPie, TinyHuichartsScatter as TinyChartScatter } from '@opentiny/vue-huicharts'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import useLocale from '@/hooks/locale'

const { t } = useI18n()
const { currentLocale } = useLocale()

const scatterYears = ['2023', '2024', '2025', '2026'] as const
const monthlySales: Record<(typeof scatterYears)[number], number[]> = {
  2023: [6, 62, 35, 64, 16, 87, 31, 10, 63, 10, 44, 11],
  2024: [22, 34, 62, 38, 41, 70, 23, 40, 82, 38, 25, 41],
  2025: [30, 21, 95, 49, 87, 65, 15, 71, 48, 82, 86, 58],
  2026: [43, 51, 26, 55, 68, 55, 6, 57, 13, 54, 66, 74],
}

function monthLabel(month: number) {
  return t(`work.chart.month${month}`)
}

const scatterOptions = computed(() => {
  const data: Record<string, Array<[string, number, number, string, string]>> = {}

  scatterYears.forEach((year) => {
    data[year] = monthlySales[year].map((value, index) => {
      const month = monthLabel(index + 1)
      return [month, value, value, month, year]
    })
  })

  return {
    padding: [48, 0, 4, 0],
    tooltip: {
      formatter(params: { seriesName: string, data: [string, number, number, string, string] }) {
        const point = params.data
        return `${params.seriesName}<br/>${point[3]}：${point[1]}${t('work.chart.unitWan')}`
      },
    },
    legend: {
      show: true,
      position: {
        top: 4,
        right: '0',
      },
      textStyle: {
        padding: [-2, 0, 0, 0],
      },
    },
    xAxisType: 'category',
    yAxis: {
      max: 100,
      min: 0,
      interval: 20,
      name: t('work.chart.unitWan'),
      show: true,
    },
    bubbleSize: [10, 10],
    symbolOpacity: 1,
    color: ['#2070f3', '#715afb', '#2cb8c9', '#f69e39'],
    data,
  }
})

const roseOptions = computed(() => ({
  type: 'pie',
  roseType: 'radius',
  legend: {
    show: true,
    orient: 'vertical',
    position: {
      right: '6%',
      top: 'center',
    },
  },
  label: {
    show: true,
    type: 'percent',
    line: true,
  },
  position: {
    center: ['38%', '52%'],
    radius: ['0%', '68%'],
  },
  color: ['#1476ff', '#0bb8b2', '#6E51E0', '#5CB300', '#FFB700'],
  data: [
    { value: 12, name: '2022' },
    { value: 16, name: '2023' },
    { value: 21, name: '2024' },
    { value: 24, name: '2025' },
    { value: 27, name: '2026' },
  ],
}))

const scatterRef = ref()
const roseRef = ref()
const scatterWrap = ref<HTMLElement>()
const roseWrap = ref<HTMLElement>()

function resizeCharts() {
  scatterRef.value?.resize()
  roseRef.value?.resize()
}

watch(currentLocale, async () => {
  await nextTick()
  resizeCharts()
})

onMounted(() => {
  const observer = new ResizeObserver(() => {
    resizeCharts()
  })

  if (scatterWrap.value) {
    observer.observe(scatterWrap.value)
  }
  if (roseWrap.value) {
    observer.observe(roseWrap.value)
  }

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div class="sales-panel">
    <div class="min-h-[272px] w-full flex gap-10 max-md:flex-col">
      <div ref="scatterWrap" class="w-1/2 max-md:w-full">
        <div class="card-title mb-2">
          {{ $t('work.chart.monthlySales') }}
        </div>
        <TinyChartScatter :key="currentLocale" ref="scatterRef" width="100%" height="272px" :options="scatterOptions" />
      </div>
      <div ref="roseWrap" class="w-1/2 max-md:w-full">
        <div class="card-title mb-2">
          {{ $t('work.chart.annualRatio') }}
        </div>
        <TinyChartPie :key="currentLocale" ref="roseRef" width="100%" height="272px" :options="roseOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.sales-panel {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.card-title {
  height: 24px;
  line-height: 24px;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}
</style>
