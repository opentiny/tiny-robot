import { defineCustomElement } from 'vue'
import App from './App.vue'
import style from './style.css?inline'

const ShadowTest = defineCustomElement(App, {
  styles: [style],
})
customElements.define('shadow-test', ShadowTest)
