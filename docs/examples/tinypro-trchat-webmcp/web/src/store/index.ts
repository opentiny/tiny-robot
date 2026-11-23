import { createPinia } from 'pinia'
import useAppStore from './modules/app'
import useTabBarStore from './modules/tab-bar'
import { useTabStore } from './modules/tabs'
import useUserStore from './modules/user'

const pinia = createPinia()

export { useAppStore, useTabBarStore, useTabStore, useUserStore }
export default pinia
