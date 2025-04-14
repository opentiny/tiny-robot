import DefaultTheme from 'vitepress/theme'
// import Demo from 'vitepress-theme-demoblock/dist/client/components/Demo.vue'
// import 'vitepress-theme-demoblock/dist/theme/styles/index.css'
import '@opentiny/tiny-robot/dist/style.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // app.component('Demo', Demo)
    app.mixin({
      mounted() {
        // 动态引入TinyVue/TinyRobot, 解决vitepress打包在服务端渲染没有document和window等会报错
        import('@opentiny/vue').then(function (m) {
          app.use(m.default)
        })
        import('@opentiny/tiny-robot').then(function (m) {
          app.use(m.default)
        })
      },
    })
  },
}
