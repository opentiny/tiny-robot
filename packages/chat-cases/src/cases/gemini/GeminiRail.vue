<script setup lang="ts">
import { IconMenuExpand, IconNewSession, IconSetting } from '@opentiny/tiny-robot-svgs'
import geminiMask from './icons/gemini-mask.svg'

const emit = defineEmits<{
  open: []
  create: []
}>()
</script>

<template>
  <aside class="gemini-rail" aria-label="Gemini 导航">
    <button class="gemini-rail__logo" type="button" aria-label="展开侧栏" title="展开侧栏" @click="emit('open')">
      <img :src="geminiMask" alt="Gemini" />
    </button>

    <nav class="gemini-rail__navigation">
      <button class="gemini-rail__button" type="button" aria-label="展开侧栏" title="展开侧栏" @click="emit('open')">
        <IconMenuExpand :size="20" />
      </button>
      <button class="gemini-rail__button" type="button" aria-label="新建对话" title="新建对话" @click="emit('create')">
        <IconNewSession :size="20" />
      </button>
    </nav>

    <div class="gemini-rail__bottom">
      <button class="gemini-rail__button" type="button" aria-label="设置" title="设置">
        <IconSetting :size="19" />
      </button>
      <button class="gemini-rail__avatar" type="button" aria-label="用户账户" title="用户账户">sl</button>
    </div>
  </aside>
</template>

<style scoped>
.gemini-rail {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 30;
  display: flex;
  box-sizing: border-box;
  width: 56px;
  flex-direction: column;
  align-items: center;
  padding: 14px 8px 16px;
  pointer-events: auto;
}

.gemini-rail__logo,
.gemini-rail__button,
.gemini-rail__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.gemini-rail__logo {
  width: 32px;
  height: 32px;
}

.gemini-rail__logo img {
  display: block;
  width: 24px;
  height: 24px;
}

.gemini-rail__navigation {
  display: grid;
  gap: 8px;
  margin-top: 18px;
}

.gemini-rail__button {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: #1f1f1f;
}

.gemini-rail__button:hover,
.gemini-rail__avatar:hover {
  background: #f1f3f4;
}

.gemini-rail__bottom {
  display: grid;
  gap: 16px;
  justify-items: center;
  margin-top: auto;
}

.gemini-rail__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #4268a8;
  background: #d8e5f8;
  font-size: 11px;
  font-weight: 600;
}
</style>
