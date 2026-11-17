import { DEMOS, resolveDemo } from './catalog.js'

/**
 * 展示框架管理布局与导航。outlet 的视图由各宿主创建和销毁。
 * @param {HTMLElement} root
 * @param {{host: string}} options
 */
export function createDemoShell(root, { host }) {
  root.innerHTML = `
    <div class="demo-shell">
      <header class="demo-header">
        <div><p class="demo-eyebrow">WEB COMPONENT / 能力演示</p><h1>TrChat Web Component</h1></div>
        <span class="demo-host"></span>
      </header>
      <div class="demo-app-layout">
        <aside class="demo-sidebar"><nav aria-label="能力导航"></nav></aside>
        <main class="demo-main" tabindex="0" aria-labelledby="demo-page-title">
          <header class="demo-page-header"><h2 id="demo-page-title" data-testid="demo-title"></h2><p></p></header>
          <div class="demo-outlet"></div>
        </main>
      </div>
    </div>`
  /** @template {Element} T @param {string} selector @returns {T} */
  function find(selector) {
    return /** @type {T} */ (root.querySelector(selector))
  }
  find('.demo-host').textContent = host
  const nav = find('nav')
  const main = /** @type {HTMLElement} */ (find('.demo-main'))
  const outlet = /** @type {HTMLElement} */ (find('.demo-outlet'))
  /** @type {Map<string, HTMLAnchorElement>} */
  const links = new Map()
  for (const group of new Set(DEMOS.map((demo) => demo.group))) {
    const heading = document.createElement('h2')
    heading.textContent = group
    nav.append(heading)
    for (const demo of DEMOS.filter((item) => item.group === group)) {
      const link = document.createElement('a')
      link.href = `#${demo.path}`
      link.textContent = demo.title
      nav.append(link)
      links.set(demo.id, link)
    }
  }
  let current = resolveDemo(window.location.hash)
  /** @type {Set<(demo: import('./catalog.js').Demo) => void>} */
  const listeners = new Set()
  function update() {
    const next = resolveDemo(window.location.hash)
    if (window.location.hash !== `#${next.path}`) {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}#${next.path}`,
      )
    }
    find('[data-testid="demo-title"]').textContent = next.title
    find('.demo-page-header p').textContent = next.description
    for (const [id, link] of links) {
      if (id === next.id) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    }
    if (next !== current) {
      current = next
      main.scrollTop = 0
      listeners.forEach((listener) => listener(current))
    }
  }
  update()
  window.addEventListener('hashchange', update)
  return {
    outlet,
    getCurrentDemo: () => current,
    /** @param {(demo: import('./catalog.js').Demo) => void} listener */
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    destroy() {
      window.removeEventListener('hashchange', update)
      listeners.clear()
      root.replaceChildren()
    },
  }
}
