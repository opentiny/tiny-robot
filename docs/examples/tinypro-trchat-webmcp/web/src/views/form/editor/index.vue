<script lang="ts" setup>
import { iconEdit, iconGroup } from '@opentiny/vue-icon'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Collaboration from './collaboration/index.vue'
import Documents from './documents/index.vue'

const IconEdit = iconEdit()
const IconGroup = iconGroup()

const route = useRoute()
const router = useRouter()

type EditorView = 'documents' | 'collaboration'

// 从创作页返回时,按来源高亮对应列表（多人协同 / 开始创作）
const currentView = ref<EditorView>(route.query.view === 'collaboration' ? 'collaboration' : 'documents')

const menus = [
  {
    key: 'create' as const,
    title: '开始创作',
    desc: '创建文档',
    icon: IconEdit,
  },
  {
    key: 'collaboration' as EditorView,
    title: '多人协同',
    desc: '多人协同编辑',
    icon: IconGroup,
  },
]

// 创作页是独立子路由，激活时不展示左侧菜单栏
const isStandalonePage = computed(() => route.name === 'EditorCreate')

function handleMenuClick(key: 'create' | EditorView) {
  if (key === 'create') {
    currentView.value = 'documents'
    router.push({ name: 'EditorCreate' })
    return
  }
  currentView.value = key
}
</script>

<template>
  <router-view v-if="isStandalonePage" />
  <div v-else class="editor-page-wrap">
    <Breadcrumb :items="['menu.form', 'menu.form.editor']" />
    <div class="editor-page">
      <div class="editor-menu">
        <div
          v-for="menu in menus"
          :key="menu.key"
          class="editor-menu-item"
          :class="{ 'editor-menu-item--active': menu.key !== 'create' && currentView === menu.key }"
          @click="handleMenuClick(menu.key)"
        >
          <div class="editor-menu-item-icon">
            <component :is="menu.icon" />
          </div>
          <div class="editor-menu-item-text">
            <div class="editor-menu-item-title">
              {{ menu.title }}
            </div>
            <div class="editor-menu-item-desc">
              {{ menu.desc }}
            </div>
          </div>
        </div>
      </div>
      <div class="editor-content">
        <Collaboration v-if="currentView === 'collaboration'" />
        <Documents v-else />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.editor-page-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.editor-page {
  display: flex;
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 10px;
}

.editor-menu {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 300px;
  padding: 32px;
  overflow-y: auto;
  border-right: 1px solid #e8e8e8;
}

.editor-menu-item {
  display: flex;
  align-items: center;
  height: 76px;
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  background: #fff;
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #f6f8f9;
  }
}

.editor-menu-item--active {
  background: #f6f8f9;
}

.editor-menu-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-right: 12px;
  font-size: 20px;
  color: #333;
}

.editor-menu-item-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.editor-menu-item-title {
  font-size: 14px;
  font-weight: 700;
  line-height: 16px;
  color: #595959;
}

.editor-menu-item-desc {
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  color: #808080;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-top: 4px;
}

.editor-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}
</style>
