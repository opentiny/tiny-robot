import type { CollaborationDocument, RichTextDocument } from '@/mock/editor'
import axios from 'axios'

// 富文本栏目（开始创作 / 多人协同）文档接口，纯演示数据始终由 tinyvue 的 mock 提供。

function editorBaseUrl(): string {
  return `${import.meta.env.VITE_BASE_API}/editor`
}

// 开始创作文档列表（加载失败时抛出，由调用方提示并允许重试）
export async function getEditorDocuments(): Promise<RichTextDocument[]> {
  const res = await axios.get<RichTextDocument[]>(`${editorBaseUrl()}/documents`)
  return res.data ?? []
}

// 新建开始创作文档
export async function createEditorDocument(data: Pick<RichTextDocument, 'name' | 'department' | 'content'>): Promise<RichTextDocument | null> {
  try {
    const res = await axios.post<RichTextDocument>(`${editorBaseUrl()}/document`, data)
    return res.data ?? null
  }
  catch {
    return null
  }
}

// 更新开始创作文档（自动保存）
export async function updateEditorDocument(id: number, patch: Partial<Omit<RichTextDocument, 'id'>>): Promise<boolean> {
  try {
    const res = await axios.post<boolean>(`${editorBaseUrl()}/document/update`, { id, patch })
    return res.data ?? false
  }
  catch {
    return false
  }
}

// 删除开始创作文档
export async function deleteEditorDocument(id: number): Promise<boolean> {
  try {
    const res = await axios.delete<boolean>(`${editorBaseUrl()}/document?id=${id}`)
    return res.data ?? false
  }
  catch {
    return false
  }
}

// 多人协同文档列表（加载失败时抛出，由调用方提示并允许重试）
export async function getCollaborationDocuments(): Promise<CollaborationDocument[]> {
  const res = await axios.get<CollaborationDocument[]>(`${editorBaseUrl()}/collaboration-documents`)
  return res.data ?? []
}

// 新建多人协同文档
export async function createCollaborationDocument(data: Pick<CollaborationDocument, 'name' | 'content'> & { members?: string[] }): Promise<CollaborationDocument | null> {
  try {
    const res = await axios.post<CollaborationDocument>(`${editorBaseUrl()}/collaboration-document`, data)
    return res.data ?? null
  }
  catch {
    return null
  }
}

// 更新多人协同文档（自动保存 / 远端协同内容回流）
export async function updateCollaborationDocument(id: number, patch: Partial<Omit<CollaborationDocument, 'id'>>): Promise<boolean> {
  try {
    const res = await axios.post<boolean>(`${editorBaseUrl()}/collaboration-document/update`, { id, patch })
    return res.data ?? false
  }
  catch {
    return false
  }
}

// 删除多人协同文档（调用前需先清理本地 IndexedDB 房间数据）
export async function deleteCollaborationDocument(id: number): Promise<boolean> {
  try {
    const res = await axios.delete<boolean>(`${editorBaseUrl()}/collaboration-document?id=${id}`)
    return res.data ?? false
  }
  catch {
    return false
  }
}
