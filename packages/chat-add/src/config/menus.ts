import { IconEdit, IconHistory, IconNewSession, IconSparkles } from '@opentiny/tiny-robot-svgs'

export interface ChatMenuItem {
  id: string
  title: string
  icon: unknown
  action: 'mcp' | 'template' | 'history' | 'new-session' | 'mode'
}

export const composerMenus: ChatMenuItem[] = [
  { id: 'quick-query', title: '常用查询', icon: IconSparkles, action: 'mcp' },
  { id: 'templates', title: '模板', icon: IconEdit, action: 'template' },
]

export const windowMenus: ChatMenuItem[] = [
  { id: 'new-session', title: '新会话', icon: IconNewSession, action: 'new-session' },
  { id: 'history', title: '历史会话', icon: IconHistory, action: 'history' },
  { id: 'mode', title: '窗口模式', icon: IconSparkles, action: 'mode' },
]
