<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import previewTemplate from './release-preview.html?raw'

type SourceId = 'requirements' | 'api' | 'regression'
type Source = {
  id: SourceId
  title: string
  meta: string
  summary: string
}

defineProps<{
  panelId?: string
}>()

const emit = defineEmits<{
  'open-panel': [panelId: 'preview']
}>()

const selectedSourceId = shallowRef<SourceId>('requirements')
const sources: readonly Source[] = [
  { id: 'requirements', title: '需求文档', meta: 'PRD-2026-04', summary: '需求范围和验收口径已完成确认。' },
  { id: 'api', title: '接口说明', meta: 'API-RELEASE-07', summary: '接口契约稳定，联调结果满足发布前校验要求。' },
  { id: 'regression', title: '回归报告', meta: 'QA-2026-04-17', summary: '核心流程和兼容性验证通过，暂无阻塞缺陷。' },
]

const selectedSource = computed(() => sources.find((source) => source.id === selectedSourceId.value) ?? sources[0])
const previewSrcdoc = computed(() =>
  previewTemplate
    .replace('__SOURCE_TITLE__', selectedSource.value.title)
    .replace('__SOURCE_META__', selectedSource.value.meta)
    .replace('__SOURCE_SUMMARY__', selectedSource.value.summary),
)

function openSource(sourceId: SourceId) {
  selectedSourceId.value = sourceId
  emit('open-panel', 'preview')
}
</script>

<template>
  <section v-if="panelId === 'preview'" class="business-panel business-panel--preview">
    <iframe class="preview-frame" title="发布方案网页预览" sandbox="allow-same-origin" :srcdoc="previewSrcdoc" />
  </section>

  <section v-else-if="panelId === 'sources'" class="business-panel business-panel--sources">
    <p class="sources-intro">点击资料返回发布预览，并查看对应引用信息。</p>
    <div class="source-list">
      <button
        v-for="source in sources"
        :key="source.id"
        class="source-list__item"
        type="button"
        @click="openSource(source.id)"
      >
        <span class="source-list__title">{{ source.title }}</span>
        <span class="source-list__meta">{{ source.meta }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.business-panel {
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  padding: 16px;
}

.business-panel--preview {
  display: flex;
  overflow: hidden;
}

.preview-frame {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1 1 auto;
  border: 0;
  background: #f7f9fc;
}

.sources-intro {
  margin: 0 0 16px;
  color: #667890;
  font-size: 13px;
  line-height: 1.6;
}

.source-list {
  display: grid;
  gap: 10px;
}

.source-list__item {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  border: 1px solid #c8d6e6;
  border-radius: 8px;
  padding: 13px 14px;
  color: #27567e;
  background: #fff;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.source-list__item:hover {
  border-color: #5d8db7;
  background: #f1f7fc;
}

.source-list__title {
  color: #1f3854;
  font-size: 14px;
  font-weight: 600;
}

.source-list__meta {
  margin-top: 5px;
  color: #7a8ba0;
  font-size: 12px;
}

@media (max-width: 640px) {
  .business-panel {
    padding: 12px;
  }
}
</style>
