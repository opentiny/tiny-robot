/**
 * 附件类型检测与判断工具。
 */

// ---------------------------------------------------------------------------
// 文件类型检测
// ---------------------------------------------------------------------------

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'tiff', 'tif', 'heic'])
const PDF_EXTENSIONS = new Set(['pdf'])
const WORD_EXTENSIONS = new Set(['doc', 'docx'])
const EXCEL_EXTENSIONS = new Set(['xls', 'xlsx'])
const PPT_EXTENSIONS = new Set(['ppt', 'pptx'])

const MIME_TYPE_MAP: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'application/vnd.ms-excel': 'excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ppt',
}

const EXTENSION_MAP: Array<[Set<string>, string]> = [
  [IMAGE_EXTENSIONS, 'image'],
  [PDF_EXTENSIONS, 'pdf'],
  [WORD_EXTENSIONS, 'word'],
  [EXCEL_EXTENSIONS, 'excel'],
  [PPT_EXTENSIONS, 'ppt'],
]

function getExtension(name: string): string {
  return (name.split('.').pop() ?? '').toLowerCase()
}

/**
 * 根据 File 对象或文件名字符串检测文件类型。
 * 返回 'image' | 'pdf' | 'word' | 'excel' | 'ppt' | 'other'
 */
export function detectFileType(file: File | string): string {
  if (typeof file !== 'string') {
    // File 对象：先查 MIME，再查扩展名
    const mime = file.type ?? ''
    if (mime.startsWith('image/')) return 'image'
    if (MIME_TYPE_MAP[mime]) return MIME_TYPE_MAP[mime]
    // fallback 到文件名
    const ext = getExtension(file.name)
    for (const [set, type] of EXTENSION_MAP) {
      if (set.has(ext)) return type
    }
    return 'other'
  }

  // 字符串：按扩展名匹配
  const ext = getExtension(file)
  for (const [set, type] of EXTENSION_MAP) {
    if (set.has(ext)) return type
  }
  return 'other'
}

// ---------------------------------------------------------------------------
// 附件图片判断
// ---------------------------------------------------------------------------

export interface AttachmentLike {
  fileType?: string
  rawFile?: File | Record<string, unknown>
  name?: string
  url?: string
}

/**
 * 判断附件是否为图片。
 * 优先级：fileType > rawFile MIME > 文件名后缀
 * 对持久化后 rawFile 退化为普通对象的情况做了防御。
 */
export function isImageAttachment(attachment: AttachmentLike): boolean {
  if (attachment.fileType === 'image') return true
  if (attachment.rawFile instanceof File && attachment.rawFile.type.startsWith('image/')) return true
  if (typeof attachment.name === 'string' && attachment.name) {
    return detectFileType(attachment.name) === 'image'
  }
  return false
}
