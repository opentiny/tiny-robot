import { useState } from 'react'
import { ChatDemo } from '../chat-demo'

export function RuntimeDemo() {
  const [enabled, setEnabled] = useState(true)
  const [mounted, setMounted] = useState(true)
  const [generation, setGeneration] = useState(0)
  function mount(withRuntime: boolean) {
    setEnabled(withRuntime)
    setMounted(true)
    setGeneration((value) => value + 1)
  }
  return (
    <div className="demo-workspace">
      <aside className="demo-controls" aria-label="Runtime 控制">
        <section className="demo-card">
          <h2>生命周期</h2>
          <div className="demo-buttons">
            <button onClick={() => mount(false)}>延后接入</button>
            <button onClick={() => setEnabled(true)} disabled={!mounted || enabled}>
              接入 Runtime
            </button>
            <button onClick={() => setMounted(false)} disabled={!mounted}>
              卸载组件
            </button>
            <button onClick={() => mount(true)}>重新挂载</button>
          </div>
          <p className="demo-help">延后接入会创建一个尚未绑定 Runtime 的元素。重新挂载创建独立的 Runtime。</p>
        </section>
      </aside>
      <ChatDemo key={generation} mounted={mounted} enabled={enabled} />
    </div>
  )
}
