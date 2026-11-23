<script lang="ts" setup>
import {
  Loading,
  TabItem as TinyTabItem,
  Tabs as TinyTabs,
} from '@opentiny/vue'
import { iconChevronDown } from '@opentiny/vue-icon'
import { onClickOutside } from '@vueuse/core'
import { defineAsyncComponent, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'
import { getUserData } from '@/api/user'
import { useResponsive } from '@/hooks/responsive'
import { useUserStore } from '@/store'

const InfoCard = defineAsyncComponent(() => import('./info-card.vue'))
const InfoChart = defineAsyncComponent(() => import('./info-chart.vue'))
const InfoFilter = defineAsyncComponent(() => import('./info-filter.vue'))
const InfoTable = defineAsyncComponent(() => import('./info-table.vue'))
const InfoTasksTip = defineAsyncComponent(() => import('./info-tasksTip.vue'))

const { md } = useResponsive()

// 加载效果
const state = reactive<{
  loading: any
  chartData: any
  tableData: any
  taskSummary: { status: string, value: number }[]
}>({
  loading: null,
  chartData: [] as any,
  tableData: [] as any,
  taskSummary: [],
})

// 变量设置
const userStore = useUserStore()
const ChevronDown = iconChevronDown()
const activeName = ref('1')

const timeList = [
  { label: 'userInfo.end.positiveOrder', value: 1 },
  { label: 'userInfo.end.reverseOrder', value: 2 },
  { label: 'userInfo.start.positiveOrder', value: 3 },
  { label: 'userInfo.start.reverseOrder', value: 4 },
]
const filterInfo = ref()

// 请求数据接口方法
async function fetchData() {
  userStore.setInfo({ reset: false, submit: false })
  state.loading = Loading.service({
    text: 'loading...',
    target: document.getElementById('contain'),
  })
  try {
    const { data } = await getUserData(userStore.$state as any)
    state.chartData = data.chartData
    state.tableData = data.tableData
    state.taskSummary = data.taskSummary ?? []
  }
  finally {
    state.loading.close()
  }
}

// 初始化请求数据
onMounted(() => {
  fetchData()
})

// 筛选函数
function changeTime(value: number) {
  userStore.setInfo({ sort: value })
  fetchData()
}

const filter = ref(false)
const sort = ref(false)

const filterInfoBoxRef = useTemplateRef('filterInfoBoxRef')

function changeFilter() {
  sort.value = false
  filter.value = true
}

onClickOutside(filterInfoBoxRef, () => {
  filter.value = false
}, {
  ignore: ['.tiny-date-picker', '.tiny-popup'],
})

function changeSort() {
  filter.value = false
  sort.value = !sort.value
}

watch(userStore.$state, (newValue) => {
  if (newValue.reset || newValue.submit) {
    fetchData()
    filter.value = false
  }
})

watch(activeName, () => {
  filterInfo.value.reset()
})
</script>

<template>
  <div id="contain">
    <TinyTabs v-model="activeName">
      <TinyTabItem :title="$t('userInfo.tab.one')" name="1">
        <InfoCard :tasks="state.taskSummary" />
        <div v-if="md" class="contentFilter">
          <transition-slide-group>
            <div class="left" @click="changeSort">
              {{ $t('userInfo.filter.sort') }}
              <ChevronDown />
              <div v-show="sort" class="sort" @click.stop>
                <li
                  v-for="(item, index) in timeList"
                  :key="index"
                  :value="item.value"
                  @click="changeTime(timeList[index].value)"
                >
                  {{ $t(item.label) }}
                </li>
              </div>
            </div>
            <div ref="filterInfoBoxRef" class="right" @click="changeFilter">
              <img src="@/assets/images/filter.png">
              <div v-show="filter" class="filter" @click.stop>
                <InfoFilter ref="filterInfo" :active-name="activeName" />
              </div>
            </div>
          </transition-slide-group>
        </div>

        <InfoTable :table-data="state.tableData" />
      </TinyTabItem>
      <TinyTabItem :title="$t('userInfo.tab.two')" name="2">
        <InfoTasksTip :tasks="state.taskSummary" />
        <div class="chartLength">
          <InfoChart :chart-data="state.chartData" />
        </div>
      </TinyTabItem>
    </TinyTabs>
  </div>

  <div v-if="!md" class="contentFilter">
    <transition-slide-group>
      <div class="left" @click="changeSort">
        {{ $t('userInfo.filter.sort') }}
        <ChevronDown />
        <div v-show="sort" class="sort">
          <li
            v-for="(item, index) in timeList" :key="index" :value="item.value"
            @click="changeTime(timeList[index].value)"
          >
            {{ $t(item.label) }}
          </li>
        </div>
      </div>
      <div ref="filterInfoBoxRef" class="right" @click="changeFilter">
        <img src="@/assets/images/filter.png">
        <div v-show="filter" class="filter">
          <InfoFilter ref="filterInfo" :active-name="activeName" />
        </div>
      </div>
    </transition-slide-group>
  </div>
</template>

<style scoped lang="less">
#contain {
  height: 100%;
  padding: 15px;
  overflow: auto;
}

.contentFilter {
  position: absolute;
  top: 10px;
  right: 24px;
  z-index: 99;
  display: flex;
  height: 30px;
  cursor: pointer;

  @media (max-width: 768px) {
    position: relative; // 移动端时进入正常文档流
    top: auto;
    right: auto;
    margin: 10px 0;
    width: 100%;
    justify-content: flex-end;
  }

  .left,
  .right {
    position: relative;
    height: 34px;
    line-height: 34px;
    text-align: center;
    background: #eff1f7;
    border-radius: 17px;
  }

  .left {
    width: 122px;
  }

  .right {
    width: 60px;
    margin: 0 15px;
  }

  img {
    width: 14px;
    height: 14px;
  }
}

.sort {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 99;
  width: 150px;
  margin-top: 10px;
  margin-left: -7px;
  color: #606266;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);

  li {
    position: relative;
    padding: 0 12px;
    color: #333;
    font-size: 14px;
    line-height: 36px;
    text-align: center;
    list-style-type: none;
    background-color: #fff;
    border-radius: 6px;
    cursor: pointer;
  }

  li:hover {
    color: #2f5bea;
    background-color: #f5f6f7;
  }
}

.filter {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 99;
  width: 522px;
  padding: 30px;
  color: #606266;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 0 2px 2px var(--tv-common-color-bg-normal);

  div {
    padding-top: 3px;
  }
}
</style>
