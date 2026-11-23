<script lang="ts" setup>
import {
  Modal,
  Button as TinyButton,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
} from '@opentiny/vue'
import { computed, ref } from 'vue'
import { deleteLang } from '@/api/lang'
import useLoading from '@/hooks/loading'
import { useLocales } from '@/store/modules/locales'

const localeStore = useLocales()
const lang = computed(() => localeStore.lang)
const { loading, setLoading } = useLoading()
const grid = ref()
if (!localeStore.lang.length) {
  setLoading(true)
  localeStore.fetchLang().finally(() => {
    setLoading(false)
  })
}
function removeLang(row: any) {
  setLoading(true)
  deleteLang(row.id)
    .then(() => {
      localeStore.$patch({
        lang: lang.value.filter(language => language.id !== row.id),
      })
      return grid.value.remove(row)
    })
    .catch((reason) => {
      Modal.message({
        status: 'error',
        message: reason.response.data.message,
      })
      grid.value.revertData(row)
    })
    .finally(() => {
      setLoading(false)
    })
}
</script>

<template>
  <TinyGrid ref="grid" :loading="loading" :data="lang" :auto-resize="true">
    <TinyGridColumn title="id" field="id" />
    <TinyGridColumn title="name" field="name" />
    <TinyGridColumn>
      <template #default="data">
        <TinyButton
          v-permission="'lang::remove'"
          @click="removeLang(data.row)"
        >
          {{ $t('lang.manage.remove') }}
        </TinyButton>
      </template>
    </TinyGridColumn>
  </TinyGrid>
</template>
