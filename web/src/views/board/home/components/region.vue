<script lang="ts" setup>
import { TinyHuichartsMap as TinyChartMap } from '@opentiny/vue-huicharts'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import chinaData from '@/assets/china.json'
import { debounce } from '@/hooks/responsive'
import RegionTable from './regiontable.vue'

const props = defineProps<{
  region?: { name: string, value: number }[]
  regionTable?: { id: string, space: string, pv: string, play: string, page: string }[]
}>()

const mapChartsRef = ref()
const chartData = ref({
  columns: ['name', 'value'],
  rows: [] as { name: string, value: number }[],
})

// mock 数据异步到达后填充地图
watch(() => props.region, (region) => {
  if (region) {
    chartData.value.rows = region
    mapChartsRef.value?.resize()
  }
}, { deep: true, immediate: true })
const chartSettings = ref({
  position: 'china',
  mapOrigin: chinaData, // 用户自己的地图数据
  roam: false,
  zoom: 1.5,
  center: [98, 36], // 视角中心西移，地图视觉上右移；经度越小右移越多
  itemStyle: {
    borderColor: 'skyblue',
    borderWidth: 1,
    shadowColor: '#ccc',
    shadowBlur: 30,
    opacity: 1,
  },
  label: {
    show: true,
    fontSize: 5,
  },
  selectedMode: false,
  markPoint: {
    symbol: 'none',
    symbolSize: 0,
  },
})
const legendVisible = ref(false)
const visualMap = ref({
  show: true,
  top: '32px',
  left: '32px',
  realtime: false,
  splitList: [
    { start: 5000, end: 500000 },
    { start: 4000, end: 5000 },
    { start: 3000, end: 4000 },
    { start: 2000, end: 3000 },
    { start: 1000, end: 2000 },
    { start: 0, end: 1000 },
  ],
  color: ['#9feaa5', '#5475f5', '#85daef', '#74e2ca', '#e6ac53', '#9fb5ea'],
})

onMounted(() => {
  const resizeHandler = debounce(() => {
    mapChartsRef.value?.resize()
  }, 200)

  window.addEventListener('resize', resizeHandler)

  const el = mapChartsRef.value?.$el || mapChartsRef.value
  let observer: ResizeObserver | null = null
  if (el) {
    observer = new ResizeObserver(() => mapChartsRef.value?.resize())
    observer.observe(el)
  }

  resizeHandler()

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
    observer?.disconnect()
  })
})
</script>

<template>
  <div class="region-box">
    <h3 class="region-title">
      {{ $t('home.region.title') }}
    </h3>

    <div class="region-body">
      <div class="region">
        <TinyChartMap
          v-if="chartSettings.mapOrigin"
          ref="mapChartsRef"
          width="100%"
          height="460px"
          :settings="chartSettings"
          :data="chartData"
          :visual-map="visualMap"
          :legend-visible="legendVisible"
        />
      </div>
      <div class="region-table">
        <RegionTable :table-data="regionTable ?? []" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.region-box {
  min-height: 600px;
  margin-top: 20px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 10px #4062e133;
}

.region-body {
  display: flex;
  align-items: flex-start;
  gap: 40px;
}

.region {
  flex: 1;
  min-width: 0;
}

.region-table {
  flex: 1;
  min-width: 0;
  position: relative;
  top: -16px;
}

.region-title {
  margin-bottom: 16px;
  color: #191919;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
}

.image {
  width: 25px;
  height: 25px;
  margin-top: 1.5%;
  margin-left: 1.5%;
  background: tomato;
  border-radius: 4px;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .region-body {
    flex-direction: column;
    gap: 24px;
  }
}
</style>
