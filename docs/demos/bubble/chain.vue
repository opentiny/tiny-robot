<template>
  <tr-bubble-provider :message-renderers="messageRenderers">
    <tr-bubble-list :items="items" :roles="roles"></tr-bubble-list>
  </tr-bubble-provider>
</template>

<script setup lang="ts">
import {
  BubbleChainMessageRenderer,
  BubbleListProps,
  BubbleMarkdownMessageRenderer,
  BubbleRoleConfig,
  TrBubbleList,
  TrBubbleProvider,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, useCssModule } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const roles: Record<string, BubbleRoleConfig> = {
  ai: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
}

const classes = useCssModule()

const markdownRenderer = new BubbleMarkdownMessageRenderer({ styleOptions: { class: classes.content } })

// register renderer
const messageRenderers = {
  markdown: markdownRenderer,
  chain: {
    component: BubbleChainMessageRenderer,
    defaultProps: { contentRenderer: (content: string) => markdownRenderer.md.render(content) },
  },
}

const items: BubbleListProps['items'] = [
  {
    role: 'user',
    content: '确认扩容云硬盘evs-90b0',
  },
  {
    role: 'ai',
    messages: [
      {
        type: 'markdown',
        content: '好的，下面开始执行扩容操作',
      },
      {
        type: 'chain',
        contentClass: classes.content,
        items: [
          {
            title: '查看云硬盘状态',
            content: `确认云硬盘和云主机满足一定的条件，才可以进行扩容

**已经查询**
[淘乐电商网站的云硬盘evs-90b0详情页](#) [详情页](#) [淘乐电商网站的云硬盘evs-90b0详情页](#)
`,
          },
          {
            title: '扩容分区和文件系统',
            content: `下面将开始执行扩容分区和文件系统的操作

**安装扩容工具**

\`\`\`bash
执行安装命令[root@ecs-centos76 ~]# yum install -y cloud-utils-growpart
\`\`\`

**扩容分区**

\`\`\`bash
执行扩容命令[root@ecs-centos76 ~]# growpart /dev/vda 1
\`\`\`
`,
          },
          {
            title: '确认扩容生效',
            content: '扩容操作已经完成',
          },
        ],
      },
    ],
  },
]
</script>

<style lang="less" module>
.content {
  p {
    margin: 8px 0;
    padding: 0;
    white-space: pre-line;
    word-break: break-word;
    font-size: 14px;
    line-height: 24px;
  }

  p:first-child {
    margin-top: 0;
  }

  p:last-child {
    margin-bottom: 0;
  }

  a {
    background-color: #f0f0f0;
    border-radius: 999px;
    padding: 4px 12px;
    font-size: 12px;
    border-radius: 999px;
    border: none;
    color: #595959;
    cursor: pointer;
    transition: background-color 0.3s ease;
    white-space: nowrap;
    margin: 4px 0;

    &:hover {
      color: #595959;
      background-color: #f0f0f0;
      text-decoration: underline;
    }
  }

  pre {
    margin: 8px 0;

    code[class*='language-'] {
      display: block;
      padding: 8px;
      font-size: 12px;
      background-color: #f0f0f0;
      border-radius: 12px;
      font-family: monospace;
    }
  }
}
</style>
