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
      'IconAgent',
      'IconConsultation',
      'IconDeepThink',
      'IconGenerativeUi',
      'IconHistory',
      'IconNewSession',
      'IconRecordingWave',
      'IconSend',
      'IconSparkles',
      'IconStop',
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
      'IconCollapseLeft',
      'IconCollapseRight',
      'IconEnterFullScreen',
      'IconExitFullScreen',
      'IconMenuCollapse',
      'IconMenuExpand',
      'IconMore',
      'IconMoreCircle',
      'IconRefresh',
      'IconSearch',
    ],
  },
  {
    title: '语义状态',
    keywords: ['语义', 'semantic', 'status', 'success', 'warning', 'error', 'info'],
    icons: ['IconSelected', 'IconSuccess', 'IconWarning', 'IconSuccessFilled', 'IconErrorFilled', 'IconInfoFilled'],
  },
  {
    title: '状态与选择',
    keywords: ['状态', 'status', 'selection', 'feedback', 'result'],
    icons: [
      'IconCancelled',
      'IconCheck',
      'IconClose',
      'IconDislike',
      'IconDislikeFilled',
      'IconError',
      'IconInfo',
      'IconLike',
      'IconLikeFilled',
      'IconLoading',
      'IconUnselected',
    ],
  },
  {
    title: '文件与上传',
    keywords: ['文件', 'file', 'attachment', 'upload', 'image'],
    icons: [
      'IconFileExcel',
      'IconFileFolder',
      'IconFileImage',
      'IconFileNone',
      'IconFileOther',
      'IconFilePdf',
      'IconFilePpt',
      'IconFileRemove',
      'IconFileWord',
      'IconImageUpload',
      'IconImageWarning',
      'IconRiskyImage',
      'IconUpload',
      'IconUploadFailed',
      'IconUploadLoading',
    ],
  },
  {
    title: '编辑与操作',
    keywords: ['编辑', 'edit', 'action', 'operation'],
    icons: [
      'IconCopy',
      'IconDelete',
      'IconDownload',
      'IconEdit',
      'IconEditPen',
      'IconExit',
      'IconFavorite',
      'IconPin',
      'IconPlus',
      'IconScan',
      'IconShare',
      'IconTop',
    ],
  },
  {
    title: '系统与能力',
    keywords: ['系统', 'system', 'capability', 'plugin', 'shell', 'user', 'setting'],
    icons: [
      'IconAnalytics',
      'IconAssociate',
      'IconAtom',
      'IconBell',
      'IconBrowser',
      'IconControls',
      'IconPhone',
      'IconPlugin',
      'IconSetting',
      'IconShell',
      'IconTable',
      'IconTypeAll',
      'IconUser',
      'IconVideo',
    ],
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
    icons: ['IconEmptyFile', 'IconEmptySearch', 'IconNoData'],
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
