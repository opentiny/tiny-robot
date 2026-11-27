import { configureVanillaTheme, createTrace } from '../components/src/vanilla'
import { createTrace as createUMDTrace } from '../components/src/vanilla/trace/umd'
import type { TrajectoryEvent, TrajectoryInstance, TrajectoryItem } from '../components/src/vanilla'
import '../components/src/vanilla/style.css'

declare global {
  interface Window {
    traceFixture: {
      trace: TrajectoryInstance
      events: TrajectoryEvent[]
      items: TrajectoryItem[]
      resetEvents: () => void
      createTrace: typeof createTrace
      createUMDTrace: typeof createUMDTrace
      configureTheme: (colorMode: 'light' | 'dark' | 'auto') => void
    }
  }
}

const base = 0

const items: TrajectoryItem[] = [
  {
    id: 'prepare',
    type: 'info',
    label: '准备',
    message: '开始准备本次 Agent 执行环境',
    startTime: base,
    endTime: base + 420,
  },
  {
    id: 'load',
    type: 'success',
    label: '加载',
    message: '上下文数据加载完成，准备进入下一阶段',
    startTime: base + 420,
    endTime: base + 2_150,
  },
  {
    id: 'analysis',
    type: 'analysis',
    label: '分析中',
    message: '这是一段比较长的消息，用来展示中间内容超出容器宽度之后的省略效果',
    startTime: base + 2_150,
    endTime: base + 5_820,
  },
  {
    id: 'custom',
    type: 'custom',
    label: '自定义',
    color: 'linear-gradient(90deg, #a5f3fc 0%, #bfdbfe 50%, #ddd6fe 100%)',
    textColor: '#4f46e5',
    message: '单条数据可以覆盖标签类型的默认颜色',
    startTime: base + 5_820,
    endTime: base + 7_300,
  },
]

const eventElement = document.querySelector<HTMLElement>('#event')!

const events: TrajectoryEvent[] = []
const trace = createTrace({
  container: document.querySelector<HTMLElement>('#trace')!,
  items,
  durationFormat: 'clock',
  onEvent: (event) => {
    events.push(event)
    if (event.type === 'select') {
      eventElement.textContent = event.itemId ? `当前选中：${event.itemId}（来源：${event.source}）` : '当前没有选中项'
    }
  },
})

window.traceFixture = {
  trace,
  events,
  items,
  resetEvents: () => {
    events.length = 0
  },
  createTrace,
  createUMDTrace,
  configureTheme: (colorMode) => configureVanillaTheme({ colorMode }),
}
