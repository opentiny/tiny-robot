<script setup lang="ts">
import { computed, ref } from 'vue'
import ExtensionDetailSummary from '../shared/components/ExtensionDetailSummary.vue'
import { useStableId } from '../shared/composables'
import type { SkillExtensionDetailProps } from './index.type'

defineOptions({ name: 'SkillExtensionDetail' })

const props = defineProps<SkillExtensionDetailProps>()

type DetailTab = 'skill' | 'resources'

const activeTab = ref<DetailTab>('skill')
const skillTabButton = ref<HTMLButtonElement>()
const resourcesTabButton = ref<HTMLButtonElement>()
const idPrefix = `skill-extension-detail-${useStableId()}`
const skillTabId = `${idPrefix}-skill-tab`
const resourcesTabId = `${idPrefix}-resources-tab`
const skillPanelId = `${idPrefix}-skill-panel`
const resourcesPanelId = `${idPrefix}-resources-panel`

const resources = computed(() => props.definition.resources ?? [])
const instructionRows = computed(() => Math.max(props.definition.instructions.split('\n').length, 2))
const summaryBadges = computed(() => [
  resources.value.length + ' 个资源',
  ...(props.updatedAt ? ['更新于 ' + props.updatedAt] : []),
])

const handleTabKeydown = (event: KeyboardEvent) => {
  let nextTab: DetailTab | undefined

  if (event.key === 'Home') nextTab = 'skill'
  else if (event.key === 'End') nextTab = 'resources'
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    nextTab = activeTab.value === 'skill' ? 'resources' : 'skill'
  }

  if (!nextTab) return

  event.preventDefault()
  activeTab.value = nextTab
  ;(nextTab === 'skill' ? skillTabButton : resourcesTabButton).value?.focus()
}

const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return Number((size / 1024).toFixed(1)) + ' KB'
  return Number((size / 1024 / 1024).toFixed(1)) + ' MB'
}
</script>

<template>
  <div class="skill-extension-detail">
    <ExtensionDetailSummary
      :name="props.definition.name"
      :description="props.definition.description"
      :badges="summaryBadges"
    />

    <div class="skill-extension-detail__tabs" role="tablist" aria-label="Skill 详情">
      <button
        :id="skillTabId"
        ref="skillTabButton"
        class="skill-extension-detail__tab"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'skill'"
        :aria-controls="skillPanelId"
        :tabindex="activeTab === 'skill' ? 0 : -1"
        @click="activeTab = 'skill'"
        @keydown="handleTabKeydown"
      >
        SKILL.md
      </button>
      <button
        :id="resourcesTabId"
        ref="resourcesTabButton"
        class="skill-extension-detail__tab"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'resources'"
        :aria-controls="resourcesPanelId"
        :tabindex="activeTab === 'resources' ? 0 : -1"
        @click="activeTab = 'resources'"
        @keydown="handleTabKeydown"
      >
        资源文件
      </button>
    </div>

    <div
      v-show="activeTab === 'skill'"
      :id="skillPanelId"
      class="skill-extension-detail__panel"
      role="tabpanel"
      :aria-labelledby="skillTabId"
    >
      <textarea
        class="skill-extension-detail__instructions"
        aria-label="SKILL.md"
        :value="props.definition.instructions"
        :rows="instructionRows"
        readonly
        spellcheck="false"
        wrap="off"
      ></textarea>
    </div>

    <div
      v-show="activeTab === 'resources'"
      :id="resourcesPanelId"
      class="skill-extension-detail__panel skill-extension-detail__resources-panel"
      role="tabpanel"
      :aria-labelledby="resourcesTabId"
      tabindex="0"
    >
      <ul v-if="resources.length" class="skill-extension-detail__resources">
        <li v-for="resource in resources" :key="resource.resourceId" class="skill-extension-detail__resource">
          <span class="skill-extension-detail__resource-path">{{ resource.path }}</span>
          <span v-if="resource.size !== undefined" class="skill-extension-detail__resource-size">
            {{ formatFileSize(resource.size) }}
          </span>
        </li>
      </ul>
      <p v-else class="skill-extension-detail__empty">暂无资源文件</p>
    </div>
  </div>
</template>

<style lang="less" scoped>
@detail-divider-color: color-mix(in srgb, var(--tr-border-color-default) 42%, transparent);

.skill-extension-detail {
  color: var(--tr-text-primary);
}

.skill-extension-detail__tabs {
  display: flex;
  margin-top: 20px;
}

.skill-extension-detail__tab {
  position: relative;
  min-height: 36px;
  padding: 4px 10px 8px;
  border: 0;
  background: transparent;
  color: var(--tr-text-secondary);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  line-height: 22px;

  &[aria-selected='true'] {
    border-radius: 4px 4px 0 0;
    background: var(--tr-container-bg-hover);
    color: var(--tr-text-primary);
    font-weight: 600;

    &::after {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 1.5px;
      background: var(--tr-text-primary);
      content: '';
    }
  }

  &:focus-visible {
    outline: 2px solid var(--tr-color-primary);
    outline-offset: 2px;
  }
}

.skill-extension-detail__panel {
  margin-top: 12px;
}

.skill-extension-detail__resources-panel {
  max-height: var(--tr-skill-extension-detail-content-max-height, 240px);
  overflow: auto;
}

.skill-extension-detail__instructions {
  display: block;
  box-sizing: border-box;
  width: 100%;
  max-height: var(--tr-skill-extension-detail-content-max-height, 240px);
  margin: 0;
  padding: 12px 16px;
  overflow: auto;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 4px;
  background: var(--tr-container-bg-default, #fff);
  color: var(--tr-text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 20px;
  resize: none;
  user-select: text;
  white-space: pre;
}

.skill-extension-detail__resources {
  margin: 0;
  padding: 0;
  border-top: 1px solid @detail-divider-color;
  list-style: none;
}

.skill-extension-detail__resource {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 52px;
  padding: 0 16px;
  border-bottom: 1px solid @detail-divider-color;
}

.skill-extension-detail__resource-path {
  min-width: 0;
  overflow-wrap: anywhere;
}

.skill-extension-detail__resource-size {
  flex: none;
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 18px;
}

.skill-extension-detail__empty {
  margin: 0;
  padding: 32px 0;
  border-top: 1px solid @detail-divider-color;
  color: var(--tr-text-secondary);
  font-size: 13px;
  text-align: center;
}
</style>
