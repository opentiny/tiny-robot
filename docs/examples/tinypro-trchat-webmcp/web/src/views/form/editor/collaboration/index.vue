<script lang="ts" setup>
import type { CollaborationDocument } from '@/mock/editor'
import { Modal, Grid as TinyGrid, GridColumn as TinyGridColumn } from '@opentiny/vue'
import { iconDel, iconEdit } from '@opentiny/vue-icon'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteCollaborationDocument, getCollaborationDocuments } from '@/api/editor'
import { clearCollabRoomData } from '../util'

const IconEdit = iconEdit()
const IconDel = iconDel()

const router = useRouter()

const documents = ref<CollaborationDocument[]>([])

async function loadDocuments() {
  try {
    documents.value = await getCollaborationDocuments()
  }
  catch {
    console.warn(`请补充后端接口`)
  }
}

onMounted(() => {
  loadDocuments()
})

function handleCellClick({ row }: any, event: MouseEvent) {
  // 点击“删除”操作列时不触发行跳转
  if ((event.target as HTMLElement).closest('.editor-collaboration-op--danger')) {
    return
  }
  router.push({ name: 'EditorCreate', query: { id: row.id, from: 'collaboration' } })
}

function handleEdit(row: any) {
  router.push({ name: 'EditorCreate', query: { id: row.id, from: 'collaboration' } })
}

function handleDelete(row: any) {
  Modal.confirm({
    title: '删除确认',
    message: `确定要删除协同文档「${row.name}」吗？删除后不可恢复。`,
  }).then(async (res: string) => {
    if (res === 'confirm') {
      // 先清理本地 IndexedDB 中的房间数据，清理失败不删除服务端记录，避免同 id 重建文档时复活旧内容
      const cleared = await clearCollabRoomData(row.id)
      const removed = cleared ? await deleteCollaborationDocument(row.id) : false
      if (removed) {
        documents.value = documents.value.filter(doc => doc.id !== row.id)
      }
      Modal.message({
        message: removed ? '删除成功' : '删除失败：本地协同数据清理未完成，请重试',
        status: removed ? 'success' : 'error',
      })
    }
  })
}
</script>

<template>
  <div class="editor-collaboration">
    <div class="editor-collaboration-header">
      <h3 class="editor-collaboration-title">
        多人协同文档列表
      </h3>
    </div>
    <TinyGrid :data="documents" :show-header="false" :border="false" size="medium" @cell-click="handleCellClick">
      <TinyGridColumn field="name" title="文档标题" />
      <TinyGridColumn field="members" title="成员">
        <template #default="{ row }">
          {{ row.members.join('、') }}
        </template>
      </TinyGridColumn>
      <TinyGridColumn field="time" title="最后更新时间" width="220" />
      <TinyGridColumn title="操作" width="120" align="center">
        <template #default="{ row }">
          <div class="editor-collaboration-ops">
            <span class="editor-collaboration-op" title="编辑" @click.stop="handleEdit(row)">
              <IconEdit />
            </span>
            <span class="editor-collaboration-op editor-collaboration-op--danger" title="删除" @click.stop="handleDelete(row)">
              <IconDel />
            </span>
          </div>
        </template>
      </TinyGridColumn>
    </TinyGrid>
  </div>
</template>

<style scoped lang="less">
.editor-collaboration {
  padding: 24px 32px;
}

.editor-collaboration-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 30px;
}

.editor-collaboration-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.editor-collaboration-ops {
  display: inline-flex;
  align-items: center;
  gap: 16px;
}

.editor-collaboration-op {
  display: inline-flex;
  padding: 0;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  background: transparent;
  border: none;

  &:hover {
    color: #1890ff;
  }

  &:focus-visible {
    outline: 2px solid #1890ff;
    outline-offset: 2px;
    border-radius: 2px;
  }
}

.editor-collaboration-op--danger {
  &:hover {
    color: #f56c6c;
  }
}
</style>
