<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref } from 'vue'
import {
  TrExtensionManager,
  TrMcpExtensionDetail,
  TrSkillImportForm,
  TrSkillExtensionDetail,
  type ExtensionCardAction,
  type ExtensionManagerActionEvent,
  type ExtensionManagerTab,
  type SkillDefinition,
} from '@opentiny/tiny-robot'
import { IconFileFolder, IconPlugin, IconSparkles } from '@opentiny/tiny-robot-svgs'
import { createExtensions, type DemoExtension } from '../../fixtures/data'

const items = ref(createExtensions())
const activeTab = ref<string | undefined>('mcp')
const dialog = ref<HTMLDialogElement>()
const heading = ref<HTMLElement>()
const selected = ref<DemoExtension>()
const importing = ref(false)
const notice = ref('')
let disposed = false
let previousFocus: HTMLElement | null = null

const extensionTabs = [
  { id: 'mcp', label: 'MCP', icon: IconPlugin },
  { id: 'skill', label: 'Skills', icon: IconSparkles },
  { id: 'business', label: '业务工具', icon: IconFileFolder },
] as const

const tabs = computed<ExtensionManagerTab[]>(() =>
  extensionTabs.map(({ id, label, icon }) => ({
    id,
    label,
    items: items.value
      .filter((item) => item.kind === id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        installed: item.installed,
        tags: item.tags,
        icon,
        progress: item.progress,
        actions: item.installed
          ? ([
              { id: 'enabled', type: 'switch', label: `启用${item.name}`, checked: item.enabled },
              { id: 'uninstall', type: 'button', label: '卸载', danger: true },
            ] satisfies ExtensionCardAction[])
          : [
              {
                id: 'install',
                type: 'button',
                label: item.progress === undefined ? '安装' : '安装中',
                disabled: item.progress !== undefined,
              },
            ],
      })),
  })),
)

async function handleAction(event: ExtensionManagerActionEvent) {
  const item = items.value.find((candidate) => candidate.id === event.itemId)
  if (!item) return
  if (event.action.id === 'enabled') {
    item.enabled = Boolean(event.action.checked)
    return
  }
  if (event.action.id === 'uninstall') {
    item.installed = false
    item.enabled = false
    return
  }
  if (event.action.id === 'install' && item.progress === undefined) {
    for (const progress of [20, 65, 100]) {
      if (disposed) return
      item.progress = progress
      await new Promise((resolve) => setTimeout(resolve, 450))
    }
    if (disposed) return
    item.installed = true
    item.enabled = true
    item.progress = undefined
    notice.value = `${item.name} 已安装`
  }
}

async function openDetail(item?: DemoExtension) {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  selected.value = item
  importing.value = !item
  await nextTick()
  if (!dialog.value?.open) dialog.value?.showModal()
  heading.value?.focus()
}

function importSkill(skill: SkillDefinition) {
  let item = items.value.find((candidate) => candidate.kind === 'skill' && candidate.name === skill.name)
  if (!item) {
    item = {
      id: `local-${skill.name}`,
      kind: 'skill',
      name: skill.name,
      description: skill.description,
      installed: true,
      enabled: true,
      tags: ['本地导入'],
      skill,
    }
    items.value.push(item)
  } else {
    Object.assign(item, { skill, description: skill.description, installed: true, enabled: true })
  }
  activeTab.value = 'skill'
  importing.value = false
  notice.value = `${skill.name} 已导入`
  dialog.value?.close()
}

onUnmounted(() => {
  disposed = true
  dialog.value?.close()
})
</script>

<template>
  <section class="feature-scene extension-scene">
    <div class="extension-panel">
      <TrExtensionManager
        v-model:active-tab="activeTab"
        title="扩展管理"
        :tabs="tabs"
        @tab-change="notice = ''"
        @action="handleAction"
        @name-click="openDetail(items.find((item) => item.id === $event.itemId))"
      >
        <template #header-actions
          ><button class="primary-button" @click="openDetail()">导入本地 Skill</button></template
        >
      </TrExtensionManager>
      <p class="scene-notice" role="status">{{ notice }}</p>
    </div>
    <dialog
      ref="dialog"
      class="detail-dialog"
      aria-labelledby="extension-dialog-title"
      @close="previousFocus?.focus()"
    >
      <header class="dialog-heading">
        <h2 id="extension-dialog-title" ref="heading" tabindex="-1">
          {{ importing ? '导入 Skill' : '扩展详情' }}
        </h2>
        <button
          class="utility-button"
          :aria-label="importing ? '关闭导入' : '关闭详情'"
          @click="dialog?.close()"
        >
          关闭
        </button>
      </header>
      <TrSkillImportForm v-if="importing" source="local" @submit="importSkill" @cancel="dialog?.close()" />
      <TrSkillExtensionDetail v-else-if="selected?.skill" :definition="selected.skill" />
      <TrMcpExtensionDetail
        v-else-if="selected?.kind === 'mcp'"
        :id="selected.id"
        :name="selected.name"
        :description="selected.description"
        :tools="selected.tools ?? []"
        @tool-toggle="
          selected?.tools?.forEach((tool) => {
            if (tool.id === $event.toolId) tool.enabled = $event.enabled
          })
        "
      />
      <p v-else-if="selected">{{ selected.description }}</p>
    </dialog>
  </section>
</template>
