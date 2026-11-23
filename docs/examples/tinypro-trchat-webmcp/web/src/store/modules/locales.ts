import type { Lang } from '@/api/lang'
import type { CreateLocalReturn, I18Table, Local } from '@/api/local'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'
import { getAllLang } from '@/api/lang'
import { getLocalTable } from '@/api/local'

export const useLocales = defineStore('locals', {
  state: () => ({
    shouldFetch: true,
    locales: [] as Local[],
    lang: [] as Lang[],
    localTable: {} as I18Table,
    shouldMerge: true,
  }),
  actions: {
    async fetchLocalTable(lang?: string) {
      return getLocalTable(lang).then(({ data }) => {
        this.localTable = data
      })
    },
    async fetchLang() {
      return getAllLang().then(({ data }) => {
        this.lang = data
      })
    },
    pushLang(lang: Lang) {
      this.lang.push(lang)
    },
    pushLocale(data: CreateLocalReturn) {
      this.locales.push(data)
    },
    flushI18(lang: string, key: string, content: string) {
      const i18n = useI18n()
      i18n.mergeLocaleMessage(lang, {
        [key]: content,
      })
    },
  },
})
