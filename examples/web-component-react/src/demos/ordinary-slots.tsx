import { useLayoutEffect, useRef, useState } from 'react'
import type { TrChatHTMLElement, TrChatUIHTMLElement } from '@opentiny/tiny-robot-chat/experimental'
import { PROMPT_GROUPS, SLOT_UI } from '../../../web-component-shared/ordinary-slots.js'
import { createLocalRuntime } from '../runtime'

export function OrdinarySlotsDemo() {
  const [kind, setKind] = useState('chat')
  const [topic, setTopic] = useState('产品接入')
  const [slots, setSlots] = useState({
    welcome: false,
    prompts: false,
    header: true,
    prefix: false,
    footer: false,
    footerRight: false,
  })
  const [welcomeText, setWelcomeText] = useState('支持产品咨询、接入指导与问题排查。')
  const [badge, setBadge] = useState('AI')
  const [footerText, setFooterText] = useState('请勿发送密码等敏感信息。')
  const [footerRightText, setFooterRightText] = useState('Enter 发送')
  const [empty, setEmpty] = useState(true)
  const [mounted, setMounted] = useState(true)
  const [promptGroup, setPromptGroup] = useState(0)
  const chatRef = useRef<TrChatHTMLElement>(null)
  const uiRef = useRef<TrChatUIHTMLElement>(null)

  useLayoutEffect(() => {
    if (!mounted || kind !== 'chat') return
    const owned = createLocalRuntime()
    chatRef.current!.runtime = owned.runtime
    return () => {
      void owned.dispose()
    }
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
    <div className="demo-workspace demo-slot-workspace">
      <aside className="demo-controls">
        <section className="demo-card">
          <label>
            组件
            <select value={kind} onChange={(event) => setKind(event.target.value)}>
              <option value="chat">TrChat</option>
              <option value="ui">TrChatUI</option>
            </select>
          </label>
          <label className="toggle">
            <input type="checkbox" checked={empty} onChange={(event) => setEmpty(event.target.checked)} />
            显示欢迎区
          </label>
          <p className="demo-help">welcome-footer、prompts-footer 在欢迎区显示。</p>
          <div className="demo-buttons">
            <button onClick={() => setMounted(!mounted)}>{mounted ? '卸载元素' : '挂载元素'}</button>
          </div>
        </section>
        <section className="demo-card demo-slot-options">
          <h2>Slot 配置</h2>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.welcome}
              onChange={(event) => setSlots({ ...slots, welcome: event.target.checked })}
            />
            welcome-footer · 欢迎区页脚
          </label>
          <label>
            welcome-footer 内容
            <input value={welcomeText} onChange={(event) => setWelcomeText(event.target.value)} />
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.prompts}
              onChange={(event) => setSlots({ ...slots, prompts: event.target.checked })}
            />
            prompts-footer · 提示词页脚
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.header}
              onChange={(event) => setSlots({ ...slots, header: event.target.checked })}
            />
            sender-header · 输入区顶部
          </label>
          <label>
            咨询主题
            <input value={topic} onChange={(event) => setTopic(event.target.value)} />
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.prefix}
              onChange={(event) => setSlots({ ...slots, prefix: event.target.checked })}
            />
            input-prefix · 输入框前缀
          </label>
          <label>
            input-prefix 标识
            <input value={badge} onChange={(event) => setBadge(event.target.value)} />
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.footer}
              onChange={(event) => setSlots({ ...slots, footer: event.target.checked })}
            />
            sender-footer · 输入区底部
          </label>
          <label>
            sender-footer 内容
            <input value={footerText} onChange={(event) => setFooterText(event.target.value)} />
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.footerRight}
              onChange={(event) => setSlots({ ...slots, footerRight: event.target.checked })}
            />
            sender-footer-right · 输入区右下角
          </label>
          <label>
            sender-footer-right 内容
            <input value={footerRightText} onChange={(event) => setFooterRightText(event.target.value)} />
          </label>
        </section>
      </aside>
      <section className="demo-preview">
        <div className="demo-chat" data-testid="slot-preview">
          {mounted &&
            (kind === 'chat' ? (
              <tr-chat ref={chatRef} data-slot-host>
                {slots.welcome && (
                  <div slot="welcome-footer">
                    <p className="demo-welcome-footer">{welcomeText}</p>
                  </div>
                )}
                {slots.prompts && (
                  <div slot="prompts-footer">
                    <div className="demo-prompts-footer">
                      <button type="button" onClick={changePrompts}>
                        换一组问题
                      </button>
                    </div>
                  </div>
                )}
                {slots.header && (
                  <div slot="sender-header">
                    <p className="demo-sender-note">
                      正在咨询：<strong>{topic}</strong>
                    </p>
                  </div>
                )}
                {slots.prefix && (
                  <div slot="input-prefix">
                    <span className="demo-input-badge" aria-label="助手">
                      {badge}
                    </span>
                  </div>
                )}
                {slots.footer && (
                  <div slot="sender-footer">
                    <small className="demo-sender-hint">{footerText}</small>
                  </div>
                )}
                {slots.footerRight && (
                  <div slot="sender-footer-right">
                    <small className="demo-sender-hint">{footerRightText}</small>
                  </div>
                )}
              </tr-chat>
            ) : (
              <tr-chat-ui ref={uiRef} data-slot-host>
                {slots.welcome && (
                  <div slot="welcome-footer">
                    <p className="demo-welcome-footer">{welcomeText}</p>
                  </div>
                )}
                {slots.prompts && (
                  <div slot="prompts-footer">
                    <div className="demo-prompts-footer">
                      <button type="button" onClick={changePrompts}>
                        换一组问题
                      </button>
                    </div>
                  </div>
                )}
                {slots.header && (
                  <div slot="sender-header">
                    <p className="demo-sender-note">
                      正在咨询：<strong>{topic}</strong>
                    </p>
                  </div>
                )}
                {slots.prefix && (
                  <div slot="input-prefix">
                    <span className="demo-input-badge" aria-label="助手">
                      {badge}
                    </span>
                  </div>
                )}
                {slots.footer && (
                  <div slot="sender-footer">
                    <small className="demo-sender-hint">{footerText}</small>
                  </div>
                )}
                {slots.footerRight && (
                  <div slot="sender-footer-right">
                    <small className="demo-sender-hint">{footerRightText}</small>
                  </div>
                )}
              </tr-chat-ui>
            ))}
        </div>
      </section>
    </div>
  )
}
