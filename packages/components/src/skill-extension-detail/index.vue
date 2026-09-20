<script setup lang="ts">
import { computed } from 'vue'
import ExtensionDetailSummary from '../shared/components/ExtensionDetailSummary.vue'
import type { SkillResourceDescriptor } from '../skill-add/index.type'
import type { SkillExtensionDetailProps } from './index.type'

defineOptions({ name: 'SkillExtensionDetail' })

const props = defineProps<SkillExtensionDetailProps>()

const resources = computed(() => props.definition.resources ?? [])
const summaryBadges = computed(() => [
  resources.value.length + ' 个资源',
  ...(props.updatedAt ? ['更新于 ' + props.updatedAt] : []),
])

const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return Number((size / 1024).toFixed(1)) + ' KB'
  return Number((size / 1024 / 1024).toFixed(1)) + ' MB'
}

const formatResourceMetadata = (resource: SkillResourceDescriptor) => {
  const kind = resource.kind === 'text' ? '文本' : '二进制'
  return resource.size === undefined ? kind : kind + ' · ' + formatFileSize(resource.size)
}
</script>

<template>
  <div class="skill-extension-detail">
    <ExtensionDetailSummary
      :name="props.definition.name"
      :description="props.definition.description"
      :badges="summaryBadges"
    />

    <section class="skill-extension-detail__section">
      <h3 class="skill-extension-detail__heading">技能说明</h3>
      <pre
        class="skill-extension-detail__instructions"
        role="region"
        aria-label="技能说明"
        tabindex="0"
        v-text="props.definition.instructions"
      ></pre>
    </section>

    <section class="skill-extension-detail__section">
      <h3 class="skill-extension-detail__heading">资源文件</h3>
      <ul v-if="resources.length" class="skill-extension-detail__resources">
        <li v-for="resource in resources" :key="resource.resourceId" class="skill-extension-detail__resource">
          <span class="skill-extension-detail__resource-path">{{ resource.path }}</span>
          <span class="skill-extension-detail__resource-metadata">{{ formatResourceMetadata(resource) }}</span>
        </li>
      </ul>
      <p v-else class="skill-extension-detail__empty">暂无资源文件</p>
    </section>
  </div>
</template>

<style lang="less" scoped>
.skill-extension-detail {
  color: var(--tr-text-primary);
}

.skill-extension-detail__section {
  margin-top: 20px;
}

.skill-extension-detail__heading {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.skill-extension-detail__instructions {
  max-height: 240px;
  margin: 0;
  padding: 12px 16px;
  overflow: auto;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 4px;
  background: var(--tr-container-bg-hover);
  color: var(--tr-text-secondary);
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.skill-extension-detail__resources {
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--tr-border-color-default);
  list-style: none;
}

.skill-extension-detail__resource {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 52px;
  padding: 0 16px;
  border-bottom: 1px solid var(--tr-border-color-default);
}

.skill-extension-detail__resource-path {
  min-width: 0;
  overflow-wrap: anywhere;
}

.skill-extension-detail__resource-metadata {
  flex: none;
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 18px;
}

.skill-extension-detail__empty {
  margin: 0;
  padding: 32px 0;
  border-top: 1px solid var(--tr-border-color-default);
  color: var(--tr-text-secondary);
  font-size: 13px;
  text-align: center;
}
</style>
