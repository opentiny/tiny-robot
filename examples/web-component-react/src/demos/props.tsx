import { useState } from 'react'
import { BASE_UI, ChatDemo } from '../chat-demo'

export function PropsDemo() {
  const [title, setTitle] = useState('我的助手')
  const [draftTitle, setDraftTitle] = useState('我的助手')
  const [header, setHeader] = useState(true)
  const [empty, setEmpty] = useState(false)
  return (
    <div className="demo-workspace">
      <aside className="demo-controls" aria-label="属性配置">
        <section className="demo-card">
          <h2>属性绑定</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setTitle(draftTitle)
            }}
          >
            <label>
              标题
              <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} required />
            </label>
            <button className="primary">应用标题</button>
          </form>
          <label className="toggle">
            <input type="checkbox" checked={header} onChange={(event) => setHeader(event.target.checked)} />
            显示页头
          </label>
          <label className="toggle">
            <input type="checkbox" checked={empty} onChange={(event) => setEmpty(event.target.checked)} />
            强制空状态
          </label>
          <small>标题为字符串，ui 为普通对象，isEmpty 为布尔值。输入框使用本地回复，无需密钥。</small>
        </section>
      </aside>
      <ChatDemo
        title={title}
        ui={{ ...BASE_UI, header: header ? undefined : false }}
        isEmpty={empty ? true : undefined}
      />
    </div>
  )
}
