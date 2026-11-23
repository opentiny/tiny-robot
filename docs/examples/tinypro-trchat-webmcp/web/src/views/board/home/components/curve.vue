<script lang="ts" setup>
import { TinyHuichartsLine as TinyChartLine } from '@opentiny/vue-huicharts'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { debounce } from '@/hooks/responsive'

const props = defineProps<{ curve?: { pv: number[], play: number[], page: number[] } }>()
const { t } = useI18n()

function getLegendConfig(width = window.innerWidth) {
  const isMobile = width < 768
  return {
    top: '10',
    left: 'auto',
    right: '24',
    icon: 'circle',
    itemHeight: 10,
    itemWidth: 10,
    itemGap: isMobile ? 10 : 24,
    textStyle: {
      fontSize: isMobile ? 11 : 14,
    },
  }
}

function getAreaStyle(startColor: string) {
  return {
    color: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: startColor,
        },
        {
          offset: 1,
          color: 'rgba(58,132,255, 0)',
        },
      ],
      global: false,
    },
  }
}

const timeData = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

function buildRows() {
  const { pv = [], play = [], page = [] } = props.curve ?? {}
  return pv.map((_, index) => ({
    time: timeData[index],
    [t('home.main.down')]: pv[index],
    [t('home.curve.play')]: play[index],
    [t('home.curve.page')]: page[index],
  }))
}

const chartRef = ref()
const viewportWidth = ref(window.innerWidth)
// options 用 computed 整体重建：props 数据或语言变化时图表自动更新
// （huicharts 对初始化后的嵌套 mutation 不敏感，必须整体替换 options）
const options = computed(() => ({
  data: buildRows(),
  xAxis: [
    {
      keyName: 'time',
    },
  ],
}))
const chartExtend = computed(() => {
  const legend = getLegendConfig(viewportWidth.value)
  return {
    grid: {
      left: '8%',
      right: '8%',
    },
    color: ['#fcc800', '#62b42e', '#bfb9fa'],
    legend,
    yAxis: [
      {
        min: 0,
        max: 40,
        interval: 5,
        axisLabel: {
          formatter: '{value} s',
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
    series: [
      {
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#fcc800',
        },
        areaStyle: getAreaStyle('rgba(252,200,0,0.25)'),
      },
      {
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#62b42e',
        },
        areaStyle: getAreaStyle('rgba(98,180,46,0.25)'),
      },
      {
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#bfb9fa',
        },
        areaStyle: getAreaStyle('rgba(191,185,250,0.25)'),
      },
    ],
  }
})

onMounted(() => {
  const resizeHandler = debounce(() => {
    viewportWidth.value = window.innerWidth
    chartRef.value?.resize()
  }, 200)

  window.addEventListener('resize', resizeHandler)

  const el = chartRef.value?.$el || chartRef.value
  let observer: ResizeObserver | null = null
  if (el) {
    observer = new ResizeObserver(() => chartRef.value?.resize())
    observer.observe(el)
  }

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
    observer?.disconnect()
  })
})
</script>

<template>
  <div class="curve-box">
    <h3 class="title">
      {{ $t('home.curve.trend') }}
    </h3>

    <div class="curve">
      <TinyChartLine
        ref="chartRef"
        width="100%"
        height="100%"
        :options="options"
        :extend="chartExtend" class="max-md:pt-[26px]"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.curve-box {
  margin-top: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 10px #4062e133;
}

.curve {
  width: 100%;
  height: 400px;
}

.title {
  margin-bottom: 16px;
  color: #191919;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
}
</style>
