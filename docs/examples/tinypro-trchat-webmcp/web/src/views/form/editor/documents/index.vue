<script lang="ts" setup>
import type { RichTextDocument } from '@/mock/editor'
import { Modal, Grid as TinyGrid, GridColumn as TinyGridColumn } from '@opentiny/vue'
import { iconDel, iconEdit } from '@opentiny/vue-icon'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteEditorDocument, getEditorDocuments } from '@/api/editor'

const IconEdit = iconEdit()
const IconDel = iconDel()

const router = useRouter()

const documents = ref<RichTextDocument[]>([])

async function loadDocuments() {
  try {
    documents.value = await getEditorDocuments()
  }
  catch {
    console.warn(`请补充后端接口`)
  }
}

onMounted(() => {
  loadDocuments()
})

function handleCellClick({ row }: any, event: MouseEvent) {
  // 点击“编辑 / 删除”操作列时不触发行跳转
  if ((event.target as HTMLElement).closest('.editor-documents-ops')) {
    return
  }
  router.push({ name: 'EditorCreate', query: { id: row.id } })
}

function handleEdit(row: any) {
  router.push({ name: 'EditorCreate', query: { id: row.id } })
}

function handleDelete(row: any) {
  Modal.confirm({
    title: '删除确认',
    message: `确定要删除文档「${row.name}」吗？删除后不可恢复。`,
  }).then(async (res: string) => {
    if (res === 'confirm') {
      const removed = await deleteEditorDocument(row.id)
      if (removed) {
        documents.value = documents.value.filter(doc => doc.id !== row.id)
      }
      Modal.message({
        message: removed ? '删除成功' : '删除失败：文档不存在或已被删除',
        status: removed ? 'success' : 'error',
      })
    }
  })
}
</script>

<template>
  <div class="editor-documents">
    <div class="editor-documents-header">
      <h3 class="editor-documents-title">
        文档列表
      </h3>
    </div>
    <TinyGrid :data="documents" :show-header="false" :border="false" size="medium" @cell-click="handleCellClick">
      <TinyGridColumn field="name" title="文档标题" />
      <TinyGridColumn field="time" title="最后更新时间" width="220" />
      <TinyGridColumn title="操作" width="120" align="center">
        <template #default="{ row }">
          <div class="editor-documents-ops">
            <span class="editor-documents-op" title="编辑" @click.stop="handleEdit(row)">
              <IconEdit />
            </span>
            <span class="editor-documents-op editor-documents-op--danger" title="删除" @click.stop="handleDelete(row)">
              <IconDel />
            </span>
          </div>
        </template>
      </TinyGridColumn>
    </TinyGrid>
  </div>
</template>

<style scoped lang="less">
.editor-documents {
  padding: 24px 32px;
}

.editor-documents-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 30px;
}

.editor-documents-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #191919;
}

.editor-documents-ops {
  display: inline-flex;
  align-items: center;
  gap: 16px;
}

.editor-documents-op {
  display: inline-flex;
  font-size: 16px;
  color: #666;
  cursor: pointer;

  &:hover {
    color: #1890ff;
  }
}
</style>
