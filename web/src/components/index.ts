import type { App } from 'vue'
import Breadcrumb from './breadcrumb/index.vue'
import TransitionFadeDownGroup from './transition/transition-fade-down-group.vue'
import TransitionFadeDown from './transition/transition-fade-down.vue'
import TransitionFadeSlideGroup from './transition/transition-fade-slide-group.vue'
import TransitionFadeSlide from './transition/transition-fade-slide.vue'

export default {
  install(Vue: App) {
    Vue.component('Breadcrumb', Breadcrumb)
    Vue.component('TransitionFadeDownGroup', TransitionFadeDownGroup)
    Vue.component('TransitionFadeDown', TransitionFadeDown)
    Vue.component('TransitionSlideGroup', TransitionFadeSlideGroup)
    Vue.component('TransitionSlide', TransitionFadeSlide)
  },
}
