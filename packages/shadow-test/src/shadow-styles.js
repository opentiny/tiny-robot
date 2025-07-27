if (import.meta.env.MODE === 'development') {
  const observer = new MutationObserver((mutations) => {
    const addMap = new Map()
    const removeSet = new Set()

    mutations.forEach((mutation) => {
      if (mutation.target.nodeName === 'HEAD') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'STYLE' && node instanceof HTMLStyleElement) {
            const devId = node.getAttribute('data-vite-dev-id')
            if (devId) {
              addMap.set(devId, node.textContent || '')
            }
          }
        })

        mutation.removedNodes.forEach((node) => {
          if (node.nodeName === 'STYLE' && node instanceof HTMLStyleElement) {
            const devId = node.getAttribute('data-vite-dev-id')
            if (devId) {
              removeSet.add(devId)
            }
          }
        })
      } else if (mutation.target.nodeName === 'STYLE') {
        const node = mutation.target
        const devId = node.getAttribute('data-vite-dev-id')
        if (devId) {
          addMap.set(devId, node.textContent || '')
        }
      }
    })

    setTimeout(() => {
      const shadowRoot = document.querySelector('shadow-test')?.shadowRoot
      if (!shadowRoot) {
        return
      }

      removeSet.forEach((devId) => {
        const styleElement = shadowRoot.querySelector(`style[data-vite-dev-id="${devId}"]`)
        if (styleElement) {
          styleElement.remove()
        }
      })

      removeSet.clear()

      addMap.forEach((style, devId) => {
        const styleElement = shadowRoot.querySelector(`style[data-vite-dev-id="${devId}"]`)
        if (styleElement) {
          styleElement.textContent = style
        } else {
          const styleElement = document.createElement('style')
          styleElement.setAttribute('data-vite-dev-id', devId)
          styleElement.textContent = style
          shadowRoot.appendChild(styleElement)
        }
      })

      addMap.clear()
    }, 0)
  })

  observer.observe(document.head, {
    childList: true,
    subtree: true,
  })
}
