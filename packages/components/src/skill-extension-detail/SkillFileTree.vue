<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { IconAddFile, IconAddFolder, IconFile, IconFolder, IconMore } from '@opentiny/tiny-robot-svgs'
import type {
  SkillFileNode,
  SkillFolderNode,
  SkillInlineRenameState,
  SkillTreeAction,
  SkillTreeRow,
} from './useSkillFileTree'

const props = defineProps<{
  skillName: string
  treeId: string
  rows: SkillTreeRow[]
  selectedResourceId?: string
  collapsedFolders: ReadonlySet<string>
  openActionMenuKey?: string
  inlineRename?: SkillInlineRenameState
  mode?: 'view' | 'edit'
  switchingFile: boolean
}>()

const emit = defineEmits<{
  createRootFile: []
  createRootFolder: []
  toggleFolder: [key: string]
  toggleActionMenu: [key: string]
  selectResource: [resourceId: string | null]
  treeAction: [action: SkillTreeAction, row: SkillFileNode | SkillFolderNode]
  updateInlineRename: [value: string]
  submitInlineRename: []
  cancelInlineRename: []
  clearInlineRenameError: []
}>()

const inlineRenameInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.inlineRename?.row.key,
  (key) => {
    if (!key) return
    void nextTick(() => {
      inlineRenameInput.value?.focus()
      inlineRenameInput.value?.select()
    })
  },
  { flush: 'post' },
)

const handleRenameInput = (event: Event) => {
  emit('updateInlineRename', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <nav class="skill-extension-detail__sidebar" :aria-label="props.skillName + ' 文件'">
    <div
      :id="props.treeId"
      class="skill-extension-detail__sidebar-title"
      role="heading"
      aria-level="3"
      aria-label="文件"
    >
      <span>文件</span>
      <div v-if="props.mode === 'edit'" class="skill-extension-detail__sidebar-actions">
        <button
          type="button"
          class="skill-extension-detail__sidebar-action"
          :disabled="props.switchingFile"
          aria-label="新增文件"
          title="新增文件"
          @click="emit('createRootFile')"
        >
          <IconAddFile aria-hidden="true" />
        </button>
        <button
          type="button"
          class="skill-extension-detail__sidebar-action"
          :disabled="props.switchingFile"
          aria-label="新增文件夹"
          title="新增文件夹"
          @click="emit('createRootFolder')"
        >
          <IconAddFolder aria-hidden="true" />
        </button>
      </div>
    </div>

    <ul class="skill-extension-detail__tree">
      <li v-for="row in props.rows" :key="row.key" class="skill-extension-detail__tree-item">
        <button
          v-if="row.type === 'skill'"
          type="button"
          class="skill-extension-detail__tree-button"
          :class="{ 'skill-extension-detail__tree-button--selected': props.selectedResourceId === undefined }"
          :aria-current="props.selectedResourceId === undefined ? 'page' : undefined"
          @click="emit('selectResource', null)"
        >
          <IconFile class="skill-extension-detail__file-icon" aria-hidden="true" />
          <span>SKILL.md</span>
        </button>

        <div v-else-if="row.type === 'folder'" class="skill-extension-detail__tree-node">
          <div v-if="props.inlineRename?.row.key === row.key" class="skill-extension-detail__inline-rename-wrapper">
            <div class="skill-extension-detail__tree-inline-editor" :style="{ paddingLeft: `${8 + row.depth * 16}px` }">
              <span
                class="skill-extension-detail__chevron"
                :class="{ 'skill-extension-detail__chevron--collapsed': props.collapsedFolders.has(row.key) }"
                aria-hidden="true"
              ></span>
              <IconFolder class="skill-extension-detail__folder-icon" aria-hidden="true" />
              <input
                ref="inlineRenameInput"
                :value="props.inlineRename.value"
                type="text"
                :aria-label="`重命名 ${row.name}`"
                :aria-invalid="Boolean(props.inlineRename.error)"
                :title="props.inlineRename.error || undefined"
                @keydown.enter.prevent="emit('submitInlineRename')"
                @keydown.esc.prevent="emit('cancelInlineRename')"
                @blur="emit('submitInlineRename')"
                @input="handleRenameInput"
              />
            </div>
            <p v-if="props.inlineRename.error" class="skill-extension-detail__inline-rename-error" role="alert">
              {{ props.inlineRename.error }}
            </p>
          </div>
          <button
            v-else
            type="button"
            class="skill-extension-detail__tree-button skill-extension-detail__tree-button--folder"
            :style="{ paddingLeft: `${8 + row.depth * 16}px` }"
            :aria-expanded="!props.collapsedFolders.has(row.key)"
            @click="emit('toggleFolder', row.key)"
          >
            <span
              class="skill-extension-detail__chevron"
              :class="{ 'skill-extension-detail__chevron--collapsed': props.collapsedFolders.has(row.key) }"
              aria-hidden="true"
            ></span>
            <IconFolder class="skill-extension-detail__folder-icon" aria-hidden="true" />
            <span>{{ row.name }}</span>
          </button>
          <button
            v-if="props.mode === 'edit' && props.inlineRename?.row.key !== row.key"
            type="button"
            class="skill-extension-detail__tree-action-trigger"
            :disabled="props.switchingFile"
            :aria-label="`${row.name} 操作`"
            :aria-expanded="props.openActionMenuKey === row.key"
            title="文件夹操作"
            @click.stop="emit('toggleActionMenu', row.key)"
          >
            <IconMore aria-hidden="true" />
          </button>
          <div
            v-if="props.mode === 'edit' && props.openActionMenuKey === row.key"
            class="skill-extension-detail__tree-action-menu"
            role="menu"
          >
            <button type="button" role="menuitem" @click="emit('treeAction', 'create-folder', row)">新增文件夹</button>
            <button type="button" role="menuitem" @click="emit('treeAction', 'create-file', row)">新增文件</button>
            <button type="button" role="menuitem" @click="emit('treeAction', 'rename', row)">重命名</button>
            <button
              type="button"
              role="menuitem"
              class="skill-extension-detail__tree-action-menu-item--danger"
              @click="emit('treeAction', 'delete-folder', row)"
            >
              删除文件夹
            </button>
          </div>
        </div>

        <div v-else class="skill-extension-detail__tree-node">
          <div v-if="props.inlineRename?.row.key === row.key" class="skill-extension-detail__inline-rename-wrapper">
            <div
              class="skill-extension-detail__tree-inline-editor"
              :style="{ paddingLeft: `${24 + row.depth * 16}px` }"
            >
              <IconFile class="skill-extension-detail__file-icon" aria-hidden="true" />
              <input
                ref="inlineRenameInput"
                :value="props.inlineRename.value"
                type="text"
                :aria-label="`重命名 ${row.name}`"
                :aria-invalid="Boolean(props.inlineRename.error)"
                :title="props.inlineRename.error || undefined"
                @keydown.enter.prevent="emit('submitInlineRename')"
                @keydown.esc.prevent="emit('cancelInlineRename')"
                @blur="emit('submitInlineRename')"
                @input="handleRenameInput"
              />
            </div>
            <p v-if="props.inlineRename.error" class="skill-extension-detail__inline-rename-error" role="alert">
              {{ props.inlineRename.error }}
            </p>
          </div>
          <button
            v-else
            type="button"
            class="skill-extension-detail__tree-button"
            :class="{
              'skill-extension-detail__tree-button--selected': props.selectedResourceId === row.resource.resourceId,
            }"
            :style="{ paddingLeft: `${24 + row.depth * 16}px` }"
            :aria-current="props.selectedResourceId === row.resource.resourceId ? 'page' : undefined"
            @click="emit('selectResource', row.resource.resourceId)"
          >
            <IconFile class="skill-extension-detail__file-icon" aria-hidden="true" />
            <span class="skill-extension-detail__tree-name">{{ row.name }}</span>
          </button>
          <button
            v-if="props.mode === 'edit' && props.inlineRename?.row.key !== row.key"
            type="button"
            class="skill-extension-detail__tree-action-trigger"
            :disabled="props.switchingFile"
            :aria-label="`${row.name} 操作`"
            :aria-expanded="props.openActionMenuKey === row.key"
            title="文件操作"
            @click.stop="emit('toggleActionMenu', row.key)"
          >
            <IconMore aria-hidden="true" />
          </button>
          <div
            v-if="props.mode === 'edit' && props.openActionMenuKey === row.key"
            class="skill-extension-detail__tree-action-menu"
            role="menu"
          >
            <button type="button" role="menuitem" @click="emit('treeAction', 'rename', row)">重命名</button>
            <button
              type="button"
              role="menuitem"
              class="skill-extension-detail__tree-action-menu-item--danger"
              @click="emit('treeAction', 'delete-file', row)"
            >
              删除文件
            </button>
          </div>
        </div>
      </li>
    </ul>
  </nav>
</template>

<style lang="less" scoped>
@detail-divider-color: color-mix(in srgb, var(--tr-border-color-default) 55%, transparent);

.skill-extension-detail__sidebar {
  box-sizing: border-box;
  flex: 0 0 232px;
  width: 232px;
  overflow: auto;
  border-right: 1px solid @detail-divider-color;
}

.skill-extension-detail__sidebar-title {
  display: flex;
  box-sizing: border-box;
  min-height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0;
  padding: 0 16px;
  border-bottom: 1px solid @detail-divider-color;
  color: var(--tr-text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.skill-extension-detail__sidebar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.skill-extension-detail__sidebar-action {
  position: relative;
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
}

.skill-extension-detail__sidebar-action:hover,
.skill-extension-detail__sidebar-action:focus-visible {
  background: var(--tr-page-bg-default);
  color: var(--tr-text-primary);
}

.skill-extension-detail__sidebar-action:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 1px;
}

.skill-extension-detail__sidebar-action:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.skill-extension-detail__sidebar-action > svg {
  width: 16px;
  height: 16px;
}

.skill-extension-detail__tree {
  margin: 0;
  padding: 8px;
  list-style: none;
}

.skill-extension-detail__tree-item,
.skill-extension-detail__tree-node,
.skill-extension-detail__inline-rename-wrapper {
  min-width: 0;
}

.skill-extension-detail__tree-node {
  position: relative;
}

.skill-extension-detail__tree-button {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 30px;
  align-items: center;
  gap: 7px;
  padding: 4px 8px;
  padding-right: 32px;
  overflow: hidden;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
}

.skill-extension-detail__tree-button:hover,
.skill-extension-detail__tree-button--selected,
.skill-extension-detail__tree-button--selected:hover {
  background: var(--tr-page-bg-default);
}

.skill-extension-detail__tree-button:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 1px;
}

.skill-extension-detail__tree-button > span:not(.skill-extension-detail__chevron) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-extension-detail__tree-button small {
  flex: none;
  margin-left: auto;
  color: var(--tr-text-secondary);
  font-size: 11px;
}

.skill-extension-detail__tree-inline-editor {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  min-height: 30px;
  align-items: center;
  gap: 7px;
  padding: 4px 32px 4px 8px;
  color: var(--tr-text-primary);
}

.skill-extension-detail__tree-inline-editor input {
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  height: 26px;
  padding: 2px 6px;
  border: 1px solid var(--tr-text-primary);
  border-radius: 4px;
  background: var(--tr-container-bg-default);
  color: var(--tr-text-primary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  outline: none;
}

.skill-extension-detail__tree-inline-editor input[aria-invalid='true'] {
  border-color: var(--tr-color-error);
}

.skill-extension-detail__inline-rename-error {
  margin: 0 8px 4px;
  color: var(--tr-color-error);
  font-size: 11px;
  line-height: 16px;
  overflow-wrap: anywhere;
}

.skill-extension-detail__tree-action-trigger {
  position: absolute;
  top: 3px;
  right: 4px;
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: var(--tr-page-bg-default);
  color: var(--tr-text-secondary);
  cursor: pointer;
  opacity: 0;
}

.skill-extension-detail__tree-node:hover .skill-extension-detail__tree-action-trigger,
.skill-extension-detail__tree-action-trigger:focus-visible,
.skill-extension-detail__tree-action-trigger[aria-expanded='true'] {
  opacity: 1;
}

.skill-extension-detail__tree-action-trigger:hover {
  color: var(--tr-text-primary);
}

.skill-extension-detail__tree-action-trigger:disabled {
  cursor: not-allowed;
  opacity: 0;
}

.skill-extension-detail__tree-action-trigger svg {
  width: 16px;
  height: 16px;
}

.skill-extension-detail__tree-action-menu {
  position: absolute;
  z-index: 3;
  top: 30px;
  right: 4px;
  display: flex;
  min-width: 120px;
  flex-direction: column;
  padding: 4px 0;
  border-radius: 6px;
  background: var(--tr-container-bg-default);
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}

.skill-extension-detail__tree-action-menu button {
  width: 100%;
  padding: 5px 12px;
  border: 0;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  white-space: nowrap;
}

.skill-extension-detail__tree-action-menu button:hover {
  background: var(--tr-page-bg-default);
}

.skill-extension-detail__tree-action-menu-item--danger {
  color: var(--tr-color-error, #f23030) !important;
}

.skill-extension-detail__tree-action-menu-item--danger:hover {
  background: var(--tr-page-bg-default) !important;
}

.skill-extension-detail__file-icon,
.skill-extension-detail__folder-icon {
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.25;
}

.skill-extension-detail__chevron {
  flex: 0 0 7px;
  width: 7px;
  height: 7px;
  margin-right: 1px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: translateY(-2px) rotate(45deg);
}

.skill-extension-detail__chevron--collapsed {
  transform: translate(-2px, 0) rotate(-45deg);
}

@media (max-width: 640px) {
  .skill-extension-detail__sidebar {
    flex: 0 0 auto;
    width: 100%;
    max-height: 180px;
    border-right: 0;
    border-bottom: 1px solid @detail-divider-color;
  }
}
</style>
