<template>
  <div class="pills-container">
    <TrSuggestionPopover :data="[]">
      <TrSuggestionPillButton>
        <template #icon>
          <IconSparkles style="font-size: 16px; color: #1476ff" />
        </template>
      </TrSuggestionPillButton>
    </TrSuggestionPopover>
    <TrSuggestionPills
      class="pills"
      v-model:showAll="showAll"
      :show-all-button-on="showAllButtonOn"
      :overflow-mode="overflowMode"
      :auto-scroll-on-hover="autoScrollOnHover"
      @click-outside="handleClickOutside"
    >
      <TrDropdownMenu
        v-for="(button, index) in buttons"
        :items="dropdownMenuItems"
        @item-click="handleDropdownMenuItemClick"
        :key="index"
        trigger="hover"
      >
        <template #trigger>
          <TrSuggestionPillButton>{{ button.text }}</TrSuggestionPillButton>
        </template>
      </TrDropdownMenu>
    </TrSuggestionPills>
  </div>
  <hr />
  <span>点击第一个图标会打开Popover弹出框</span>
  <hr />
  <div style="display: flex; flex-direction: column; gap: 10px">
    <div>
      <label>showAll：</label>
      <tiny-switch v-model="showAll" ref="showAllRef"></tiny-switch>
    </div>
    <div>
      <label>showAllButtonOn：</label>
      <tiny-radio-group v-model="showAllButtonOn" :options="showAllButtonOnOptions"></tiny-radio-group>
    </div>
    <div style="display: flex; align-items: center; gap: 10px">
      <label>overflowMode：</label>
      <tiny-radio-group v-model="overflowMode" :options="overflowModeOptions"></tiny-radio-group>
    </div>
    <div style="display: flex; align-items: center; gap: 10px">
      <label>autoScrollOnHover：</label>
      <tiny-switch v-model="autoScrollOnHover"></tiny-switch>
    </div>
    <div style="display: flex; align-items: center; gap: 10px">
      <button ref="addButtonRef" @click="handleClickAddButton">点我增加按钮</button>
      <button ref="removeButtonRef" @click="handleClickRemoveButton">点我删除按钮</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrDropdownMenu, TrSuggestionPillButton, TrSuggestionPills, TrSuggestionPopover } from '@opentiny/tiny-robot'
import { IconSparkles } from '@opentiny/tiny-robot-svgs'
import { TinyRadioGroup, TinySwitch } from '@opentiny/vue'
import { ref } from 'vue'

const showAll = ref(false)
const showAllRef = ref<InstanceType<typeof TinySwitch>>()
const addButtonRef = ref<HTMLButtonElement | null>(null)
const removeButtonRef = ref<HTMLButtonElement | null>(null)

const showAllButtonOn = ref<'hover' | 'always'>('hover')
const showAllButtonOnOptions = ref([
  { label: 'hover', value: 'hover' },
  { label: 'always', value: 'always' },
])

const overflowMode = ref<'expand' | 'scroll'>('expand')
const overflowModeOptions = ref([
  { label: 'expand', value: 'expand' },
  { label: 'scroll', value: 'scroll' },
])

const autoScrollOnHover = ref(false)

const dropdownMenuItems = ref([
  { id: '1', text: '去续费' },
  { id: '2', text: '去退订' },
  { id: '3', text: '查账单' },
  { id: '4', text: '导账单' },
  { id: '5', text: '对帐单' },
])

const handleClickOutside = (event: MouseEvent) => {
  if (event.composedPath().includes(showAllRef.value?.$el)) {
    return
  }
  if (addButtonRef.value && event.composedPath().includes(addButtonRef.value)) {
    return
  }
  if (removeButtonRef.value && event.composedPath().includes(removeButtonRef.value)) {
    return
  }
  showAll.value = false
}

const handleDropdownMenuItemClick = (item) => {
  console.log('DropdownMenu item clicked,', item)
}

const buttons = ref([
  {
    text: '资源管理1',
  },
  {
    text: '资源管理2',
  },
  {
    text: '资源管理3',
  },
  {
    text: '资源管理4',
  },
  {
    text: '资源管理5',
  },
  {
    text: '资源管理6',
  },
  {
    text: '资源管理7',
  },
])

const handleClickAddButton = () => {
  buttons.value.push({
    text: '新增按钮',
  })
}

const handleClickRemoveButton = () => {
  buttons.value.pop()
}
</script>

<style lang="less" scoped>
.pills-container {
  display: flex;
  gap: 8px;
}

.pills {
  width: calc(100% - 40px);
}
</style>
