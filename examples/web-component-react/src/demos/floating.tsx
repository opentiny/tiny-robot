import { useState } from 'react'
import type { LayoutFloatingState } from '@opentiny/tiny-robot-chat'
import { INITIAL_FLOATING } from '../../../web-component-shared/data.js'
import { BASE_UI, ChatDemo } from '../chat-demo'

export function FloatingDemo() {
  const [floating, setFloating] = useState(true)
  const [state, setState] = useState<LayoutFloatingState>({ ...INITIAL_FLOATING })
  const [placement, setPlacement] = useState<LayoutFloatingState['placement']>('bottom-right')
  const [width, setWidth] = useState('500')
  const [height, setHeight] = useState('400')
  const [offsetX, setOffsetX] = useState('24')
  const [offsetY, setOffsetY] = useState('24')
  return (
    <div className="demo-workspace">
      <aside className="demo-controls" aria-label="浮窗配置">
        <section className="demo-card">
          <h2>浮窗配置</h2>
          <label className="toggle">
            <input type="checkbox" checked={floating} onChange={(event) => setFloating(event.target.checked)} />
            浮窗模式
          </label>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setState({
                placement,
                width: Number(width),
                height: Number(height),
                offsetX: Number(offsetX),
                offsetY: Number(offsetY),
              })
            }}
          >
            <label>
              浮窗位置
              <select
                value={placement}
                onChange={(event) => setPlacement(event.target.value as LayoutFloatingState['placement'])}
              >
                <option value="bottom-right">右下</option>
                <option value="top-right">右上</option>
                <option value="top-left">左上</option>
                <option value="bottom-left">左下</option>
                <option value="center">居中</option>
              </select>
            </label>
            <div className="demo-grid">
              <label>
                浮窗宽度
                <input
                  type="number"
                  value={width}
                  min="320"
                  required
                  onChange={(event) => setWidth(event.target.value)}
                />
              </label>
              <label>
                浮窗高度
                <input
                  type="number"
                  value={height}
                  min="300"
                  required
                  onChange={(event) => setHeight(event.target.value)}
                />
              </label>
              <label>
                横向偏移
                <input
                  type="number"
                  value={offsetX}
                  min="0"
                  required
                  onChange={(event) => setOffsetX(event.target.value)}
                />
              </label>
              <label>
                纵向偏移
                <input
                  type="number"
                  value={offsetY}
                  min="0"
                  required
                  onChange={(event) => setOffsetY(event.target.value)}
                />
              </label>
            </div>
            <button>应用浮窗状态</button>
          </form>
          <p className="demo-help">拖动浮窗顶部手柄可更新状态；切换模式会重建聊天，清空对话。</p>
        </section>
      </aside>
      <ChatDemo
        key={String(floating)}
        ui={{ ...BASE_UI, layout: { ...BASE_UI.layout, surface: { mode: floating ? 'floating' : 'normal' } } }}
        floatingState={state}
        onFloatingState={setState}
      />
    </div>
  )
}
