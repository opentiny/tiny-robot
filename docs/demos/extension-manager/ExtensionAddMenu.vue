<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ExtensionAddIcon from './ExtensionAddIcon.vue'

type AddAction = 'mcp' | 'skill-local' | 'skill-github'

const emit = defineEmits<{
  (event: 'select', action: AddAction, trigger: HTMLButtonElement): void
}>()

const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const open = ref(false)

const close = () => {
  open.value = false
}

const select = (action: AddAction) => {
  const button = trigger.value
  close()
  if (button) emit('select', action, button)
}

const handlePointerDown = (event: PointerEvent) => {
  if (root.value && !root.value.contains(event.target as Node)) close()
}

const handleEscape = () => {
  if (!open.value) return
  close()
  trigger.value?.focus()
}

onMounted(() => document.addEventListener('pointerdown', handlePointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handlePointerDown))
</script>

<template>
  <div ref="root" class="extension-add-menu" @keydown.esc.stop.prevent="handleEscape">
    <button
      ref="trigger"
      class="extension-add-menu__trigger"
      type="button"
      aria-controls="integrated-demo-add-options"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="extension-add-menu__plus" aria-hidden="true" />
      添加
    </button>
    <div v-if="open" id="integrated-demo-add-options" class="extension-add-menu__options">
      <button type="button" class="extension-add-menu__option" @click="select('mcp')">
        <ExtensionAddIcon kind="mcp" />
        添加MCP
      </button>
      <button type="button" class="extension-add-menu__option" @click="select('skill-local')">
        <ExtensionAddIcon kind="skill" />
        上传Skill技能包
      </button>
      <button type="button" class="extension-add-menu__option" @click="select('skill-github')">
        <ExtensionAddIcon kind="skill" />
        从GitHub导入Skill
      </button>
    </div>
  </div>
</template>

<style scoped>
.extension-add-menu {
  position: relative;
}

.extension-add-menu__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 6px 14px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 999px;
  background: var(--tr-container-bg-default);
  color: var(--tr-text-primary);
  cursor: pointer;
  font: inherit;
  font-size: var(--tr-font-size-sm, 14px);
}

.extension-add-menu__plus {
  position: relative;
  width: 16px;
  height: 16px;
}

.extension-add-menu__plus::before,
.extension-add-menu__plus::after {
  position: absolute;
  top: 7px;
  left: 0;
  width: 16px;
  height: 1.5px;
  border-radius: 2px;
  background: var(--tr-text-tertiary);
  content: '';
}

.extension-add-menu__plus::after {
  transform: rotate(90deg);
}

.extension-add-menu__options {
  position: absolute;
  z-index: var(--tr-z-index-dropdown, 1000);
  top: calc(100% + 8px);
  right: 0;
  width: min(232px, calc(100vw - 32px));
  overflow: hidden;
  padding: 6px 0;
  border-radius: 10px;
  background: var(--tr-container-bg-default);
  box-shadow: var(--tr-dropdown-menu-box-shadow, 0 8px 24px rgb(0 0 0 / 10%));
}

.extension-add-menu__option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 44px;
  padding: 10px 16px;
  border: 0;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
  font: inherit;
  font-size: var(--tr-font-size-sm, 14px);
  text-align: left;
  white-space: nowrap;
}

.extension-add-menu__option:hover {
  background: var(--tr-container-bg-hover);
}

.extension-add-menu__option svg {
  flex: none;
  width: 20px;
  height: 20px;
}

.extension-add-menu__trigger:focus-visible,
.extension-add-menu__option:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: -2px;
}
</style>
