<script lang="ts" setup>
import type { CreateLocal } from '@/api/local'

import {
  Notify,
  Button as TinyButton,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Option as TinyOption,
  Popover as TinyPopover,
  Select as TinySelect,
} from '@opentiny/vue'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { createLang } from '@/api/lang'
import { createLocalItem } from '@/api/local'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useLocales } from '@/store/modules/locales'
import { sleep } from '@/utils/base-utils'
import langTable from './lang-table.vue'

const emits = defineEmits<{
  langChange: []
  localChange: []
  batchRemove: []
}>()
const { open, onOpen, onClose } = useDisclosure()
const { open: langPopoverOpen, onClose: setLangPopoverClose } = useDisclosure()
const {
  open: langTableOpen,
  onOpen: setLangTableOpen,
  onClose: setLangTableClose,
} = useDisclosure()
const localeForm = ref()
const langForm = ref()
const locales = useLocales()
const langes = computed(() => locales.lang)
const locale = reactive<CreateLocal>({
  key: '',
  content: '',
  lang: '' as any,
})
const lang = reactive({ name: '' })

function onBatchRemove() {
  emits('batchRemove')
}

const rules = {
  key: [
    {
      required: true,
      trigger: 'blur',
    },
  ],
  content: [
    {
      required: true,
      trigger: 'blur',
    },
  ],
  lang: [
    {
      required: true,
      trigger: 'blur',
    },
  ],
}
const langRule = {
  name: [
    {
      required: true,
      trigger: 'blur',
    },
  ],
}

async function addLang() {
  await langForm.value.validate()

  try {
    const { data } = await createLang({ name: lang.name })
    locales.pushLang(data)
    emits('langChange')
  }
  catch (reason: any) {
    Notify({
      type: 'error',
      message: reason.response.data.message,
    })
  }
  finally {
    lang.name = ''
    setLangPopoverClose()
  }
}

const i18 = useI18n()

async function addLocale() {
  await localeForm.value.validate()

  try {
    const { data } = await createLocalItem(locale)
    locale.key = ''
    locale.content = ''
    locale.lang = '' as any
    locales.pushLocale(data)
    i18.mergeLocaleMessage(data.lang.name, {
      [data.key]: data.content,
    })
    emits('localChange')
    return true
  }
  catch (reason: any) {
    Notify({
      type: 'error',
      message: reason.response.data.message,
    })
    return false
  }
  finally {
    onClose()
  }
}
watch(open, (value) => {
  if (!value && (langPopoverOpen.value || langTableOpen.value)) {
    setLangPopoverClose()
    setLangTableClose()
  }
})

const toolAbortController = new AbortController()

onMounted(async () => {
  document.modelContext.registerTool({
    name: 'add-i18n-entry',
    title: '添加国际化词条',
    description: '添加国际化词条',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: '词条关键字，请自行创建，不要询问用户',
        },
        content: { type: 'string', description: '词条内容' },
        lang: {
          type: 'number',
          enum: [1, 2],
          description: '词条语言ID，英文 enUS 为：1，中文 zhCN 为：2',
        },
      },
      required: ['key', 'content', 'lang'],
    },
    execute: async ({ key, content, lang: langId }) => {
      onOpen()
      await sleep(1000)
      locale.key = key
      locale.content = content
      locale.lang = langId
      await sleep(1000)
      const success = await addLocale()
      return {
        content: [{
          type: 'text',
          text: success
            ? `已添加国际化词条: ${key} 成功`
            : `添加国际化词条: ${key} 失败`,
        }],
      }
    },
  }, { signal: toolAbortController.signal })
})

// 页面卸载时取消注册，避免内存泄漏和消息串扰
onUnmounted(() => {
  toolAbortController.abort()
})
</script>

<template>
  <div>
    <TinyButton show-footer type="primary" round @click="onOpen">
      {{ $t('locale.add.btn') }}
    </TinyButton>
    <TinyButton
      v-permission="'i18n::batch-remove'"
      round
      @click="onBatchRemove"
    >
      {{ $t('locale.batchRemove') }}
    </TinyButton>
    <TinyDialogBox
      v-model:visible="open"
      :title="$t('locale.add.title')"
      :close-on-click-modal="false"
      dialog-class="locale-dialog-box"
    >
      <TinyForm
        ref="localeForm"
        :model="locale"
        :rules="rules"
        label-position="left"
        label-width="118px"
      >
        <TinyFormItem :label="$t('locale.add.key')" prop="key">
          <TinyInput v-model="locale.key" />
        </TinyFormItem>
        <TinyFormItem :label="$t('locale.add.content')" prop="content">
          <TinyInput v-model="locale.content" />
        </TinyFormItem>
        <TinyFormItem :label="$t('locale.add.lang')" prop="lang">
          <TinySelect v-model="locale.lang">
            <TinyOption
              v-for="item of langes"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </TinySelect>
          <TinyPopover v-model="langPopoverOpen" trigger="manual">
            <div>
              <TinyForm
                ref="langForm"
                :model="lang"
                :rules="langRule"
                label-width="90px"
              >
                <TinyFormItem :label="$t('lang.add.title')" prop="name">
                  <TinyInput v-model="lang.name" />
                </TinyFormItem>
                <TinyButton @click="addLang">
                  {{ $t('lang.add.btn') }}
                </TinyButton>
              </TinyForm>
            </div>
            <template #reference>
              <TinyButton
                v-permission="'lang::add'"
                type="text"
                :text="$t('locale.add.lang.btn')"
                class="max-sm:w-unset!"
                @click="langPopoverOpen = !langPopoverOpen"
              />
              <TinyButton
                v-permission="'lang::update'"
                type="text"
                :text="$t('lang.manage.btn')"
                class="max-sm:w-unset!"
                @click="setLangTableOpen"
              />
            </template>
          </TinyPopover>
        </TinyFormItem>
      </TinyForm>
      <template #footer>
        <TinyButton size="small" @click="onClose">
          {{ $t('menu.btn.cancel') }}
        </TinyButton>
        <TinyButton
          size="small"
          :text="$t('locale.add.btn')"
          type="primary"
          round
          @click="addLocale"
        />
      </template>
    </TinyDialogBox>
    <TinyDialogBox
      v-model:visible="langTableOpen"
      :title="$t('lang.manage.title')"
      width="60%"
    >
      <lang-table />
    </TinyDialogBox>
  </div>
</template>

<style scoped lang="less">
.locale-dialog-box :deep(.tiny-dialog-box .tiny-dialog-box__body) {
  padding-top: 0px;
  padding-bottom: 0px;
}
.tiny-button {
  width: 96px;
}
</style>
