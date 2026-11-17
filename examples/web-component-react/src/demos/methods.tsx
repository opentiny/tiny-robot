import { useEffect, useRef, useState } from 'react'
import { whenTrChatReady, type TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'
import { ChatDemo } from '../chat-demo'

export function MethodsDemo() {
  const ref = useRef<TrChatHTMLElement>(null)
  const [ready, setReady] = useState(false)
  const [text, setText] = useState('通过元素方法发送')
  const [result, setResult] = useState('等待操作')
  useEffect(() => {
    let active = true
    void whenTrChatReady(ref.current!).then(() => {
      if (active) setReady(true)
    })
    return () => {
      active = false
    }
  }, [])
  async function run(action: () => void | Promise<void>) {
    try {
      await action()
    } catch (error) {
      setResult(String(error))
    }
  }
  return (
    <div className="demo-workspace">
      <aside className="demo-controls" aria-label="公开方法控制">
        <section className="demo-card">
          <h2>调用元素方法</h2>
          <label>
            方法输入
            <input value={text} onChange={(event) => setText(event.target.value)} />
          </label>
          <div className="demo-buttons">
            <button
              disabled={!ready}
              onClick={() =>
                void run(() => {
                  ref.current!.setInputValue(text)
                  setResult('已设置输入')
                })
              }
            >
              设置输入
            </button>
            <button
              disabled={!ready}
              onClick={() =>
                void run(() => {
                  ref.current!.clearInput()
                  setResult('已清空输入')
                })
              }
            >
              清空输入
            </button>
            <button
              disabled={!ready}
              onClick={() => void run(async () => setResult(`聚焦结果：${await ref.current!.focusInput()}`))}
            >
              聚焦输入
            </button>
            <button
              disabled={!ready}
              onClick={() => void run(async () => setResult(`发送结果：${await ref.current!.send({ text })}`))}
            >
              调用 send
            </button>
          </div>
          <p className="demo-help">等待元素就绪后操作。send 使用组件的草稿管理与 Runtime，返回发送是否被接受。</p>
          <output data-testid="method-result" role="status">
            {result}
          </output>
        </section>
      </aside>
      <ChatDemo elementRef={ref} />
    </div>
  )
}
