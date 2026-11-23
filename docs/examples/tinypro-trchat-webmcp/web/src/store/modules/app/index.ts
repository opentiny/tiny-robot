import type { AppState } from './types'
import { defineStore } from 'pinia'
import defaultSettings from '@/config/settings.json'

export const CONSTANT = {
  APP_STATE: 'APP_STATE',
}

function initState(): AppState {
  return {
    ...defaultSettings,
    ...JSON.parse(localStorage.getItem(CONSTANT.APP_STATE) ?? '{}'),
  }
}

const useAppStore = defineStore('app', {
  state: () => {
    return initState()
  },

  getters: {
    appCurrentSetting(state: AppState): AppState {
      return state
    },
    appDevice(state: AppState) {
      return state.device
    },
  },

  actions: {
    get() {
      return {
        theme: this.theme,
        colorWeek: this.colorWeek,
        navbar: this.navbar,
        menu: this.menu,
        hideMenu: this.hideMenu,
        menuCollapse: this.menuCollapse,
        footer: this.footer,
        themelist: this.themelist,
        themeColor: this.themeColor,
        themeValue: this.themeValue,
        themeContent: this.themeContent,
        menuWidth: this.menuWidth,
        Settings: this.Settings,
        device: this.device,
        tabBar: this.tabBar,
        step: this.step,
        themeLightColors: this.themeLightColors,
      }
    },
    // Update app settings
    updateSettings(partial: Partial<AppState>) {
      this.$patch(partial)
      localStorage.setItem(CONSTANT.APP_STATE, JSON.stringify(this.get()))
    },

    // updateStep
    updateStep(step: number) {
      this.step = step
      localStorage.setItem(CONSTANT.APP_STATE, JSON.stringify(this.get()))
    },

    toggleDevice(device: string) {
      this.device = device
      localStorage.setItem(CONSTANT.APP_STATE, JSON.stringify(this.get()))
    },
    toggleMenu(value: boolean) {
      this.hideMenu = value
      localStorage.setItem(CONSTANT.APP_STATE, JSON.stringify(this.get()))
    },
    setthemeLightColors(themeLightColors: any) {
      this.themeLightColors = themeLightColors
      localStorage.setItem(CONSTANT.APP_STATE, JSON.stringify(this.get()))
    },
  },
})

export default useAppStore
