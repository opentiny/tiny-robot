<script lang="ts" setup>
import { TinyHuichartsBar as TinyChartBar, TinyHuichartsLine as TinyChartLine } from '@opentiny/vue-huicharts'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import useLocale from '@/hooks/locale'

const { t } = useI18n()
const { currentLocale } = useLocale()

function monthLabel(month: number) {
  return t(`work.chart.month${month}`)
}

const options1 = computed(() => {
  const unfinished = t('work.index.Unfinished')
  const finished = t('work.chart.finished')
  const completed = [380, 420, 780, 600, 680, 80, 380, 380, 380, 380]

  return {
    xAxis: {
      data: 'xkey',
      show: true,
      ellipsis: {
        labelWidth: 30,
        overflow: 'truncate',
      },
    },
    yAxis: {
      name: 'Mbps',
      show: true,
      splitNumber: 5,
      axisLabel: {
        show: true,
      },
    },
    direction: 'vertical',
    type: 'stack',
    padding: [48, 0, 4, 0],
    legend: {
      show: true,
      position: {
        top: 4,
        right: '0',
      },
      textStyle: {
        padding: [-2, 0, 0, 0],
      },
      type: 'scroll',
      pageIconSize: 10,
    },
    dataZoom: {
      show: false,
    },
    color: ['#1476ff', '#0bb8b2'],
    data: completed.map((value, index) => ({
      [unfinished]: 100,
      [finished]: value,
      xkey: monthLabel(index + 1),
    })),
  }
})

const options2 = computed(() => {
  const finance = t('work.chart.finance')
  const rd = t('work.chart.rd')
  const ops = t('work.chart.ops')
  const hr = t('work.chart.hr')
  const rows = [
    [200, 150, 100, 50],
    [400, 350, 300, 250],
    [200, 100, 500, 100],
    [500, 450, 400, 300],
    [300, 350, 300, 250],
    [200, 150, 100, 50],
  ]

  return {
    smooth: true,
    area: true,
    stack: true,
    xAxis: {
      data: 'xkey',
      show: true,
    },
    yAxis: {
      name: t('work.index.Person'),
      show: true,
      axisLabel: {
        intervar: 0,
        show: true,
      },
    },
    padding: [48, 0, 4, 0],
    legend: {
      show: true,
      position: {
        top: 4,
        right: '0',
      },
      textStyle: {
        padding: [-2, 0, 0, 0],
      },
      type: 'scroll',
      pageIconSize: 10,
    },
    dataZoom: {
      show: false,
    },
    color: ['#F2E70C', '#FFB700', '#FF8800', '#F23030'],
    data: rows.map((row, index) => ({
      [finance]: row[0],
      [rd]: row[1],
      [ops]: row[2],
      [hr]: row[3],
      xkey: monthLabel(index + 1),
    })),
  }
})

const barRef = ref()
const lineRef = ref()
const barWrap = ref<HTMLElement>()
const lineWrap = ref<HTMLElement>()

function resizeCharts() {
  barRef.value?.resize()
  lineRef.value?.resize()
}

watch(currentLocale, async () => {
  await nextTick()
  resizeCharts()
})

onMounted(() => {
  const observer = new ResizeObserver(() => {
    resizeCharts()
  })

  if (barWrap.value) {
    observer.observe(barWrap.value)
  }
  if (lineWrap.value) {
    observer.observe(lineWrap.value)
  }

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div>
    <div class="min-h-[272px] w-full flex gap-10 max-md:flex-col">
      <div ref="barWrap" class="w-1/2 max-md:w-full">
        <div class="card-title mb-2">
          {{ $t('work.index.trainees') }}
        </div>
        <TinyChartBar :key="currentLocale" ref="barRef" width="100%" height="272px" :options="options1" />
      </div>
      <div ref="lineWrap" class="w-1/2 max-md:w-full">
        <div class="card-title mb-2">
          {{ $t('work.index.coachNum') }}
        </div>
        <TinyChartLine :key="currentLocale" ref="lineRef" width="100%" height="272px" :options="options2" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.card-title {
  height: 24px;
  line-height: 24px;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}
</style>
