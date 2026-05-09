export const uncategorizedTitle = '未分类'

export interface IconCategoryGroup {
  title: string
  keywords: string[]
  icons: string[]
  previewLayout?: 'regular' | 'illustration'
}

export const hiddenIconNames = new Set<string>()

export const iconCategoryGroups: IconCategoryGroup[] = [
  {
    title: '会话与 AI',
    keywords: ['会话', 'chat', 'conversation', 'assistant', 'ai', 'robot'],
    icons: [
      'IconAi',
      'IconHistory',
      'IconNewSession',
      'IconRecordingWave',
      'IconSend',
      'IconSparkles',
      'IconStop',
      'IconThink',
      'IconVoice',
    ],
  },
  {
    title: '导航与布局',
    keywords: ['导航', 'layout', 'navigation', 'arrow', 'menu'],
    icons: [
      'IconArrowDown',
      'IconArrowLeft',
      'IconArrowRight',
      'IconArrowUp',
      'IconCancelFullScreen',
      'IconFullScreen',
      'IconMenu',
      'IconMenu2',
      'IconRefresh',
      'IconSearch',
    ],
  },
  {
    title: '状态与选择',
    keywords: ['状态', 'status', 'selection', 'feedback', 'result'],
    icons: [
      'IconCancelled',
      'IconCheck',
      'IconClear',
      'IconClose',
      'IconDislike',
      'IconError',
      'IconLike',
      'IconLoading',
      'IconSelected',
      'IconSuccess',
      'IconUnselected',
    ],
  },
  {
    title: '文件与上传',
    keywords: ['文件', 'file', 'attachment', 'upload', 'image'],
    icons: [
      'IconAccessory',
      'IconFileExcel',
      'IconFileFolder',
      'IconFileImage',
      'IconFileNone',
      'IconFileOther',
      'IconFilePdf',
      'IconFilePpt',
      'IconFileRemove',
      'IconFileWord',
      'IconImageLoading',
      'IconImageWarning',
      'IconUpload',
      'IconUploadFailed',
      'IconUploadLoading',
    ],
  },
  {
    title: '编辑与操作',
    keywords: ['编辑', 'edit', 'action', 'operation'],
    icons: ['IconCopy', 'IconDelete', 'IconEdit', 'IconEditPen', 'IconPin', 'IconPlus'],
  },
  {
    title: '系统与能力',
    keywords: ['系统', 'system', 'capability', 'plugin', 'shell', 'user'],
    icons: ['IconAssociate', 'IconAtom', 'IconPlugin', 'IconShell', 'IconTypeAll', 'IconUser'],
  },
  {
    title: '品牌',
    keywords: ['品牌', 'brand', 'logo'],
    icons: ['IconLogo'],
  },
  {
    title: '插画与场景态',
    keywords: ['插画', 'illustration', 'scene', 'empty'],
    previewLayout: 'illustration',
    icons: ['IconEmptySearch'],
  },
]

export interface IconMetadata {
  category: string
  keywords: string[]
  previewLayout: 'regular' | 'illustration'
}

export const iconMetadataMap = new Map<string, IconMetadata>(
  iconCategoryGroups.flatMap(({ title, keywords, icons, previewLayout = 'regular' }) =>
    icons.map((name) => [name, { category: title, keywords, previewLayout }]),
  ),
)
