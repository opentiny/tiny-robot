<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import * as exportedIcons from '@opentiny/tiny-robot-svgs'
import { hiddenIconNames, iconCategoryGroups, iconMetadataMap, uncategorizedTitle } from './iconMeta'

type IconComponent = (typeof exportedIcons)[keyof typeof exportedIcons]
type IconEntry = {
  name: string
  component: IconComponent
  category: string
  keywords: string[]
  previewLayout: 'regular' | 'illustration'
}

const searchQuery = shallowRef('')
const copiedName = shallowRef('')

let resetTimer: ReturnType<typeof setTimeout> | undefined

const iconEntries = Object.entries(exportedIcons)
  .map(([name, component]) => {
    const metadata = iconMetadataMap.get(name)

    return {
      name,
      component: component as IconComponent,
      category: metadata?.category ?? uncategorizedTitle,
      keywords: metadata?.keywords ?? [],
      previewLayout: metadata?.previewLayout ?? 'regular',
    } satisfies IconEntry
  })
  .filter(({ name }) => !hiddenIconNames.has(name))
  .sort((a, b) => a.name.localeCompare(b.name))

const filteredIcons = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  if (!keyword) {
    return iconEntries
  }

  return iconEntries.filter(({ name, category, keywords }) => {
    const haystack = [name, category, ...keywords].join(' ').toLowerCase()
    return haystack.includes(keyword)
  })
})

const groupedIcons = computed(() => {
  const sections = iconCategoryGroups
    .map(({ title, previewLayout = 'regular' }) => ({
      title,
      previewLayout,
      icons: filteredIcons.value.filter((icon) => icon.category === title),
    }))
    .filter(({ icons }) => icons.length)

  const uncategorizedIcons = filteredIcons.value.filter((icon) => icon.category === uncategorizedTitle)

  if (uncategorizedIcons.length) {
    sections.push({
      title: uncategorizedTitle,
      previewLayout: 'regular',
      icons: uncategorizedIcons,
    })
  }

  return sections
})

const filteredCount = computed(() => groupedIcons.value.reduce((count, section) => count + section.icons.length, 0))

async function copyName(name: string) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(name)
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.value = name
      textarea.setAttribute('readonly', 'true')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    copiedName.value = name

    if (resetTimer) {
      clearTimeout(resetTimer)
    }

    resetTimer = setTimeout(() => {
      copiedName.value = ''
    }, 1800)
  } catch (error) {
    console.error('Failed to copy icon name:', error)
  }
}
</script>

<template>
  <div class="icon-gallery">
    <div class="icon-gallery__toolbar">
      <label class="icon-gallery__search">
        <span class="icon-gallery__search-label">搜索</span>
        <input
          v-model="searchQuery"
          class="icon-gallery__search-input"
          type="text"
          placeholder="输入 Icon 名称，例如 IconSend"
        />
      </label>
      <div class="icon-gallery__meta">
        <span>当前展示 {{ filteredCount }} / {{ iconEntries.length }}</span>
        <span v-if="copiedName">已复制 {{ copiedName }}</span>
        <span v-else>点击卡片可复制图标名称</span>
      </div>
    </div>

    <div v-if="groupedIcons.length" class="icon-gallery__sections">
      <section v-for="section in groupedIcons" :key="section.title" class="icon-gallery__section">
        <h3 class="icon-gallery__section-title">{{ section.title }}</h3>
        <div
          :class="[
            'icon-gallery__grid',
            { 'icon-gallery__grid--illustration': section.previewLayout === 'illustration' },
          ]"
        >
          <button
            v-for="icon in section.icons"
            :key="icon.name"
            :class="[
              'icon-gallery__card',
              { 'icon-gallery__card--illustration': section.previewLayout === 'illustration' },
            ]"
            type="button"
            @click="copyName(icon.name)"
          >
            <span
              :class="[
                'icon-gallery__icon-preview',
                { 'icon-gallery__icon-preview--illustration': section.previewLayout === 'illustration' },
              ]"
            >
              <component
                :is="icon.component"
                :class="[
                  'icon-gallery__icon',
                  { 'icon-gallery__icon--illustration': section.previewLayout === 'illustration' },
                ]"
              />
            </span>
            <span class="icon-gallery__name">{{ icon.name }}</span>
          </button>
        </div>
      </section>
    </div>

    <div v-else class="icon-gallery__empty">未找到匹配的图标。</div>
  </div>
</template>

<style scoped>
.icon-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.icon-gallery__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.icon-gallery__search {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: min(100%, 320px);
}

.icon-gallery__search-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.icon-gallery__search-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.icon-gallery__search-input:focus {
  outline: none;
  border-color: #1476ff;
  box-shadow: 0 0 0 3px color-mix(in srgb, #1476ff 18%, transparent);
}

.icon-gallery__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.6;
  text-align: right;
}

.icon-gallery__sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.icon-gallery__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.icon-gallery__section-title {
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.icon-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 12px;
}

.icon-gallery__grid--illustration {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.icon-gallery__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 112px;
  padding: 16px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.icon-gallery__card--illustration {
  align-items: stretch;
  justify-content: flex-start;
  min-height: 220px;
}

.icon-gallery__card:hover {
  background: var(--vp-c-bg-soft);
}

.icon-gallery__card:focus-visible {
  outline: none;
  border-color: #1476ff;
  box-shadow: 0 0 0 3px color-mix(in srgb, #1476ff 18%, transparent);
}

.icon-gallery__icon-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 6px;
}

.icon-gallery__icon-preview--illustration {
  width: 100%;
  height: 132px;
  padding: 12px;
  overflow: hidden;
}

.icon-gallery__icon {
  font-size: 24px;
  transition: all 0.4s;
  transform-origin: center;
}

.icon-gallery__icon--illustration {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  font-size: 16px;
}

.icon-gallery__icon:hover {
  transform: scale(1.5);
}

.icon-gallery__icon--illustration:hover {
  transform: none;
}

.icon-gallery__name {
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
  word-break: break-word;
}

.icon-gallery__empty {
  padding: 28px 16px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  text-align: center;
  background: var(--vp-c-bg);
}

@media (max-width: 640px) {
  .icon-gallery__meta {
    text-align: left;
  }

  .icon-gallery__section-title {
    font-size: 18px;
  }

  .icon-gallery__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .icon-gallery__grid--illustration {
    grid-template-columns: 1fr;
  }
}
</style>
