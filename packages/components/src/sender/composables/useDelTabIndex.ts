import type { App } from 'vue'

// 扩展 HTMLElement 接口以支持自定义属性
declare global {
  interface HTMLElement {
    __vueDelTabIndexTimeout__?: ReturnType<typeof setTimeout>
  }
}

/**
 * 移除元素 tabindex 属性的指令
 * 解决 TinyTooltip 等组件在弹框后再次出现时的问题
 */
export const delTabIndexDirective = {
  mounted(el: HTMLElement) {
    // 使用 nextTick 确保 DOM 更新完成后再执行
    el.__vueDelTabIndexTimeout__ = setTimeout(() => {
      // 清除当前 tabindex
      el.removeAttribute('tabindex')
      clearTimeout(el.__vueDelTabIndexTimeout__)
      delete el.__vueDelTabIndexTimeout__
    }, 0)
  },
  unmounted(el: HTMLElement) {
    if (el.__vueDelTabIndexTimeout__) {
      clearTimeout(el.__vueDelTabIndexTimeout__)
      delete el.__vueDelTabIndexTimeout__
    }
  },
}

/**
 * 移除 TabIndex 指令插件
 */
export const delTabIndexPlugin = {
  install(app: App) {
    app.directive('del-tabindex', delTabIndexDirective)
  },
}
