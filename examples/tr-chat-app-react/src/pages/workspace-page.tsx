import type { ChatRuntime, ChatUIOptions } from '@opentiny/tiny-robot-chat'
import { FloatingAssistant } from '../chat/floating-assistant'

export function WorkspacePage({ runtime, ui }: { runtime: ChatRuntime; ui: ChatUIOptions }) {
  return (
    <>
      <main className="workspace">
        <p className="eyebrow">团队空间 / 产品研发</p>
        <h1>项目工作台</h1>
        <p className="workspace-description">集中查看本周工作，随时向 AI 助手提问。</p>
        <div className="project-grid">
          <article>
            <span className="project-status">进行中</span>
            <h2>客户反馈整理</h2>
            <p>归纳用户建议，为下一轮迭代确定重点。</p>
            <small>产品团队 · 本周五</small>
          </article>
          <article>
            <span className="project-status">待评审</span>
            <h2>知识库建设</h2>
            <p>整理接入指南和常见问题，完善团队知识。</p>
            <small>研发团队 · 下周一</small>
          </article>
          <article>
            <span className="project-status">进行中</span>
            <h2>版本发布准备</h2>
            <p>核对发布清单，汇总测试结果和交付材料。</p>
            <small>项目团队 · 下周三</small>
          </article>
        </div>
      </main>
      <FloatingAssistant runtime={runtime} ui={ui} />
    </>
  )
}
