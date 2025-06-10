import { createApp, defineCustomElement } from 'vue'
import './style.css'
// import '@opentiny/tiny-robot/dist/style.css'
import App from './App.vue'
import SenderShadow from './components/sender.ce.vue'

customElements.define('sender-shadow', defineCustomElement(SenderShadow))

createApp(App).mount('#app')
