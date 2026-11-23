<script lang="ts" setup>
import { TinyHuichartsBar as TinyChartBar } from '@opentiny/vue-huicharts'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { debounce } from '@/hooks/responsive'

const props = defineProps<{ falls?: { pv: number[], play: number[], page: number[] } }>()
const { t } = useI18n()

function getPhases() {
  return ['DNS', t('home.falls.tcp'), t('home.falls.ssl'), 'Dns', t('home.falls.tcp'), t('home.falls.ssl')]
}

function buildRows() {
  const phases = getPhases()
  const { pv = [], play = [], page = [] } = props.falls ?? {}
  return phases.map((phase, index) => ({
    phase,
    [t('home.curve.play')]: play[index],
    [t('home.curve.page')]: page[index],
    [t('home.main.down')]: pv[index],
  }))
}

const barRef = ref()
// options 用 computed 整体重建：props 数据或语言变化时图表自动更新
// （huicharts 对初始化后的嵌套 mutation 不敏感，必须整体替换 options）
const options = computed(() => ({
  data: buildRows(),
  xAxis: [
    {
      keyName: 'phase',
    },
  ],
}))
const chartExtend = {
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  color: ['#4e85f4', '#5f45ff', '#ff9e03'],
  legend: {
    top: '10',
    left: 'auto',
    right: '24',
    icon: 'circle',
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 24,
    textStyle: {
      fontSize: 14,
    },
  },
  yAxis: [
    {
      min: 0,
      max: 40,
      interval: 5,
    },
  ],
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  series: [
    {
      barWidth: 10,
      itemStyle: {
        borderRadius: [3, 3, 0, 0],
      },
    },
    {
      barWidth: 10,
      itemStyle: {
        borderRadius: [3, 3, 0, 0],
      },
    },
    {
      barWidth: 10,
      itemStyle: {
        borderRadius: [3, 3, 0, 0],
      },
    },
  ],
}

onMounted(() => {
  const resizeHandler = debounce(() => barRef.value?.resize(), 200)
  window.addEventListener('resize', resizeHandler)

  const el = barRef.value?.$el || barRef.value
  let observer: ResizeObserver | null = null
  if (el) {
    observer = new ResizeObserver(() => barRef.value?.resize())
    observer.observe(el)
  }

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
    observer?.disconnect()
  })
})
</script>

<template>
  <div class="falls-box">
    <h3 class="title">
      {{ $t('home.falls.line') }}
    </h3>

    <div class="falls">
      <TinyChartBar
        ref="barRef"
        width="100%"
        height="100%"
        :options="options"
        :extend="chartExtend"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.falls-box {
  margin-top: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 10px #4062e133;
}

.falls {
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
