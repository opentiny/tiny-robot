import { useLayoutEffect, useRef, useState } from 'react'
import type { TrChatHTMLElement, TrChatUIHTMLElement } from '@opentiny/tiny-robot-chat/experimental'
import { PROMPT_GROUPS, SLOT_UI } from '../../../web-component-shared/ordinary-slots.js'
import { createLocalRuntime } from '../runtime'

export function OrdinarySlotsDemo() {
  const [kind, setKind] = useState('chat')
  const [topic, setTopic] = useState('产品接入')
  const [showContent, setShowContent] = useState(true)
  const [empty, setEmpty] = useState(true)
  const [mounted, setMounted] = useState(true)
  const [promptGroup, setPromptGroup] = useState(0)
  const chatRef = useRef<TrChatHTMLElement>(null)
  const uiRef = useRef<TrChatUIHTMLElement>(null)

  useLayoutEffect(() => {
    if (!mounted || kind !== 'chat') return
    const owned = createLocalRuntime()
    chatRef.current!.runtime = owned.runtime
    return () => owned.release()
  }, [kind, mounted])
  useLayoutEffect(() => {
    const element = kind === 'chat' ? chatRef.current : uiRef.current
    if (!element) return
    element.ui = { ...SLOT_UI, prompts: { items: PROMPT_GROUPS[promptGroup] } }
    element.isEmpty = empty
  }, [kind, mounted, promptGroup, empty])

  function changePrompts() {
    setPromptGroup((group) => (group + 1) % PROMPT_GROUPS.length)
  }
  return (
    <div className="demo-workspace">
      <aside className="demo-controls">
        <section className="demo-card">
          <label>
            组件
            <select value={kind} onChange={(event) => setKind(event.target.value)}>
              <option value="chat">TrChat</option>
              <option value="ui">TrChatUI</option>
            </select>
          </label>
          <label>
            咨询主题
            <input value={topic} onChange={(event) => setTopic(event.target.value)} />
          </label>
          <label className="toggle">
            <input type="checkbox" checked={showContent} onChange={(event) => setShowContent(event.target.checked)} />
            显示 Slot 内容
          </label>
          <div className="demo-buttons">
            <button onClick={() => setEmpty(!empty)}>切换空状态</button>
            <button onClick={() => setMounted(!mounted)}>{mounted ? '卸载元素' : '挂载元素'}</button>
          </div>
        </section>
      </aside>
      <section className="demo-preview">
        <div className="demo-chat" data-testid="slot-preview">
          {mounted &&
            (kind === 'chat' ? (
              <tr-chat ref={chatRef} data-slot-host>
                {showContent && (
                  <div slot="welcome-footer">
                    <p className="demo-welcome-footer">支持产品咨询、接入指导与问题排查。</p>
                  </div>
                )}
                {showContent && (
                  <div slot="prompts-footer">
                    <div className="demo-prompts-footer">
                      <button type="button" onClick={changePrompts}>
                        换一组问题
                      </button>
                    </div>
                  </div>
                )}
                {showContent && (
                  <div slot="sender-header">
                    <p className="demo-sender-note">
                      正在咨询：<strong>{topic}</strong>
                    </p>
                  </div>
                )}
                {showContent && (
                  <div slot="input-prefix">
                    <span className="demo-input-badge" aria-label="助手">
                      AI
                    </span>
                  </div>
                )}
              </tr-chat>
            ) : (
              <tr-chat-ui ref={uiRef} data-slot-host>
                {showContent && (
                  <div slot="welcome-footer">
                    <p className="demo-welcome-footer">支持产品咨询、接入指导与问题排查。</p>
                  </div>
                )}
                {showContent && (
                  <div slot="prompts-footer">
                    <div className="demo-prompts-footer">
                      <button type="button" onClick={changePrompts}>
                        换一组问题
                      </button>
                    </div>
                  </div>
                )}
                {showContent && (
                  <div slot="sender-header">
                    <p className="demo-sender-note">
                      正在咨询：<strong>{topic}</strong>
                    </p>
                  </div>
                )}
                {showContent && (
                  <div slot="input-prefix">
                    <span className="demo-input-badge" aria-label="助手">
                      AI
                    </span>
                  </div>
                )}
              </tr-chat-ui>
            ))}
        </div>
      </section>
    </div>
  )
}
