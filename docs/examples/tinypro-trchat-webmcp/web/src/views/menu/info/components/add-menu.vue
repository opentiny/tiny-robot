<script lang="ts" setup>
import type { CreateMenuDto } from '@/api/menu'
import type { ITreeNodeData } from '@/router/guard/menu'
import { icons } from '@opentiny/icons/json/icons.json'
import {
  TinyCol,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  TinyRow,
  Select as TinySelect,
} from '@opentiny/vue'
import { computed, h, reactive, ref, unref } from 'vue'
import { useDeepClone } from '@/hooks/useDeepClone'

const props = defineProps<{
  menus: ITreeNodeData[]
  locales: { value: string, label: string }[]
}>()

interface TreeSelectMenu {
  label: string
  id: number
  children: TreeSelectMenu[]
}

const menuForm = ref()

// 校验规则
const rulesType = {
  required: true,
  trigger: 'blur',
}
const rulesSelect = {
  required: true,
  message: '必选',
  trigger: 'blur',
}
const rules = computed(() => {
  return {
    name: [rulesType],
    order: [rulesType],
    component: [rulesType],
    path: [rulesType],
    locale: [rulesSelect],
  }
})

function cover(data: ITreeNodeData[]) {
  const menus = useDeepClone(data)
  const ans: TreeSelectMenu[] = []
  const dfs = (menu: ITreeNodeData) => {
    const ret: TreeSelectMenu = {
      label: menu.label,
      id: Number(menu.id),
      children: [],
    }
    for (let i = 0; i < menu.children.length; i += 1) {
      const child = menu.children[i]
      ret.children.push(dfs(child))
    }
    return ret
  }
  for (let i = 0; i < menus.length; i += 1) {
    const menu = menus[i]
    ans.push(dfs(menu))
  }
  return ans
}

const treeSelectMenu = computed(() => ({ data: cover(props.menus) }))

const iconDatas = Object.keys(icons).map((key) => {
  return {
    label: key,
    value: key,
    icon: h('i', { class: `ci-${key}`, style: { fontSize: '18px', marginRight: '6px' } }),
  }
})

const menuInfo = reactive<Omit<CreateMenuDto, 'id'>>({
  name: '',
  path: '',
  component: '',
  icon: '',
  menuType: '/',
  parentId: null,
  order: 0,
  locale: '',
})

defineExpose({
  getMenuInfo: () => {
    return {
      ...unref(menuInfo),
      parentId:
          (menuInfo.parentId as string | number) === ''
          || menuInfo.parentId === null
            ? null
            : Number(menuInfo.parentId),
    }
  },
  setMenuInfo: (data: Omit<CreateMenuDto, 'id'>) => {
    menuInfo.name = data.name
    menuInfo.path = data.path
    menuInfo.component = data.component
    menuInfo.icon = data.icon
    menuInfo.menuType = data.menuType
    menuInfo.parentId = data.parentId
    menuInfo.order = data.order
    menuInfo.locale = data.locale
  },
  valid: async () => {
    return menuForm.value.validate()
  },
})
</script>

<template>
  <TinyForm
    ref="menuForm"
    :rules="rules"
    :model="menuInfo"
  >
    <TinyRow class="flex flex-wrap">
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.name')" prop="name">
          <TinyInput v-model="menuInfo.name" />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.order')" prop="order">
          <TinyInput v-model="menuInfo.order" />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.parentId')" prop="parentId">
          <TinySelect
            v-model="menuInfo.parentId"
            :placeholder="$t('baseForm.form.label.placeholder')"
            value-field="id"
            text-field="label"
            render-type="tree"
            :tree-op="treeSelectMenu"
            clearable
          />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.icon')" prop="icon">
          <TinySelect
            v-model="menuInfo.icon"
            :placeholder="$t('baseForm.form.label.placeholder')"
            filterable
            no-match-text="No Match"
            :options="iconDatas"
            optimization
          />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.component')" prop="component">
          <TinyInput v-model="menuInfo.component" />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.path')" prop="path">
          <TinyInput v-model="menuInfo.path" />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.locale')" prop="locale">
          <TinySelect
            v-model="menuInfo.locale"
            :placeholder="$t('baseForm.form.label.placeholder')"
            filterable
            no-match-text="No Match"
            :options="locales"
            optimization
          />
        </TinyFormItem>
      </TinyCol>
    </TinyRow>
  </TinyForm>
</template>
