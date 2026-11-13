import ChatDemo from './demos/chat/Demo.vue'
import AnchorDemo from './demos/anchor/Demo.vue'
import FloatingDemo from './demos/floating/Demo.vue'
import ModelDemo from './demos/model/Demo.vue'
import ExtensionsDemo from './demos/extensions/Demo.vue'
import ApprovalDemo from './demos/approval/Demo.vue'
import InputPrefixDemo from './demos/input-prefix/Demo.vue'

export const demos = [
  {
    id: 'chat',
    title: '会话与附件',
    description:
      '切换历史会话、发送图片消息，查看逐步出现的回复。默认使用本地模拟，切换到百炼后可接入真实视觉模型。',
    component: ChatDemo,
  },
  {
    id: 'anchor',
    title: '长对话导航',
    description: '悬停在右侧标记上展开消息目录，点击提问跳转；手动滚动时高亮同步变化。',
    component: AnchorDemo,
  },
  {
    id: 'floating',
    title: '聊天浮窗',
    description: '在业务页面中打开可拖动、可缩放的聊天窗口，体验完整会话界面随窗口调整布局。',
    component: FloatingDemo,
  },
  {
    id: 'model',
    title: '模型选择',
    description: '按分组浏览、搜索并选择模型，再调整思考强度。这里只展示选择界面，不调用模型服务。',
    component: ModelDemo,
  },
  {
    id: 'extensions',
    title: '扩展管理',
    description:
      '体验 MCP、Skills 与业务工具的统一管理。服务安装使用模拟状态，本地 Skill 导入使用实际文件解析。',
    component: ExtensionsDemo,
  },
  {
    id: 'approval',
    title: '工具调用确认',
    description:
      '发送“请保存周报”，允许或拒绝这次工具调用。等待确认时刷新页面，也能继续处理同一条请求；保存结果使用本地模拟。',
    component: ApprovalDemo,
  },
  {
    id: 'input-prefix',
    title: '多行输入首行提示',
    description:
      '选择任务后编辑正文，再切换任务或按 Enter 换行。应用保留草稿，标签只占首行空间；Ctrl/Cmd + Enter 提交。',
    component: InputPrefixDemo,
  },
] as const
