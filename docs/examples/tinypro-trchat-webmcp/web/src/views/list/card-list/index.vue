<script lang="ts" setup>
import {
  TinyButton,
  TinyButtonGroup,
  TinyCard,
  TinyLoading,
  TinyPager,
  TinySearch,
  TinyTag,
} from '@opentiny/vue'
import { iconRefresh } from '@opentiny/vue-icon'
import { t } from '@opentiny/vue-locale'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { getServicesList } from '@/api/card'
import Image from './components/image.vue'

const IconRefresh = iconRefresh()
const serviceOptions = reactive([
  { text: t(`cardList.options.all`), value: 'all' },
  { text: t(`cardList.options.services`), value: 'dev' },
  { text: t(`cardList.options.design`), value: 'design' },
])
const filterDataModel = reactive({
  keywords: '',
  classify: 'all',
})

const pager = ref({
  currentPage: 1,
  pageSize: 10,
  total: 2,
  pageSizes: [10, 20, 50],
  layout: 'total, sizes, pre, pager, next, jumper',
})

const pagerRef = ref(null)
let observer = null

onMounted(() => {
  handleResizePager()
  fetchData()
})

onUnmounted(() => {
  observer?.disconnect()
})

function handleResizePager() {
  let resizeTimer = null
  const handleResize = (entries: ResizeObserverEntry[]) => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      entries.forEach((entry) => {
        const { width } = entry?.contentRect
        pager.value.layout
          = width < 600
            ? 'total, pre, pager, next'
            : 'total, sizes, pre, pager, next, jumper'
      })
    }, 150)
  }
  observer = new ResizeObserver(handleResize)
  observer.observe(pagerRef.value.$el)
}

function search() {
  pager.value.currentPage = 1
  fetchData()
}

function handleRefresh() {
  fetchData()
}

function classifyChange(val: string) {
  filterDataModel.classify = val
  pager.value.currentPage = 1
  fetchData()
}

function currentChange(current: number) {
  pager.value.currentPage = current
  fetchData()
}

function sizeChange(size: number) {
  pager.value.pageSize = size
  fetchData()
}

const cards = ref([])

const cardLoadingState = ref(null)

async function fetchData() {
  const queryParams = {
    page: pager.value.currentPage,
    limit: pager.value.pageSize,
    ...filterDataModel,
  }

  try {
    cardLoadingState.value = TinyLoading.service({
      target: document.getElementById('card-list'),
    })
    const { data } = await getServicesList(queryParams)
    cards.value = data.data
    pager.value.total = data.total
  }
  catch (error) {
    console.error('Failed to fetch card list:', error)
  }
  finally {
    cardLoadingState.value?.close()
  }
}
</script>

<template>
  <div class="container-list">
    <Breadcrumb :items="['menu.list', 'menu.list.cardList']" />
    <div class="content">
      <div class="header mb-4">
        {{ $t('cardList.title') }}
      </div>
      <div class="mb-4 flex flex-wrap justify-between gap-2">
        <TinyButtonGroup
          v-model="filterDataModel.classify"
          class="card-list-button-group"
          :data="serviceOptions"
          @change="classifyChange"
        />
        <div class="search-box-container flex gap-2">
          <TinySearch
            v-model="filterDataModel.keywords"
            class="flex-1"
            :placeholder="$t('cardList.search.placeholder')"
            @change="search"
          />
          <TinyButton :icon="IconRefresh" @click="handleRefresh" />
        </div>
      </div>

      <div id="card-list" class="card-container">
        <TinyCard v-for="card in cards" :key="card.id" custom-class="card-item">
          <Image :src="card.icon" />
          <div class="header mb-2 mt-2">
            {{ card.name }}
          </div>
          <div class="line-clamp-2">
            {{ card.description }}
          </div>
          <div class="mt2">
            <TinyTag
              v-for="(item, index) in card.tag"
              :key="index"
              class="mr-1"
              :type="item.type"
              :value="item.value"
              effect="light"
            />
          </div>
        </TinyCard>
      </div>
      <TinyPager
        ref="pagerRef"
        :current-page="pager.currentPage"
        :total="pager.total"
        :page-size="pager.pageSize"
        :page-sizes="pager.pageSizes"
        :layout="pager.layout"
        :auto-resize="true"
        @current-change="currentChange"
        @size-change="sizeChange"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.container-list {
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: space-between;
  overflow-x: hidden;
  overflow-y: auto;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: calc(100% - 53px); // 53px is the height of breadcrumb
  overflow: auto;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
}

.header {
  color: var(--tv-color-text);
  font-weight: bold;
  font-size: 16px;
}

.search-box-container {
  flex: 1;
  max-width: 330px;
  min-width: 130px;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  row-gap: 12px;
}

.card-item {
  width: auto;
}

@media (max-width: @screen-mm) {
  :deep(.card-list-button-group.tiny-button-group .tiny-group-item li button) {
    padding: 0 20px;
  }
}
</style>
