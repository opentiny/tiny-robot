<script lang="ts" setup>
import {
  Modal,
  TinyButton,
  TinyDatePicker,
  TinyGrid,
  TinyGridColumn,
  TinyInput,
  TinyPopconfirm,
  TinySelect,
} from '@opentiny/vue'
import { iconDel, iconEdit, iconSave } from '@opentiny/vue-icon'
import { t } from '@opentiny/vue-locale'
import { ref } from 'vue'
import SelectRender from './select-render.vue'
import StatusRender from './status-render.vue'

interface CompProps {
  options?: {
    status: any[]
    department: any[]
  }
}
defineProps<CompProps>()

const gridRef = ref()
const IconDel = iconDel()
const IconSave = iconSave()
const IconEdit = iconEdit()

const gridTable = ref({
  data: [],
})

const defaultRender = (h, { row, column }) => row[column.property] ?? '--'

function addRow() {
  if (gridRef.value.getActiveRow()) {
    Modal.message({
      message: t('advanceForm.form.validError.add'),
      status: 'warning',
    })
    return
  }
  gridRef.value.insert({}).then((res) => {
    gridRef.value.setActiveRow(res.row)
  })
}

function saveRow(row) {
  gridRef.value.clearActived()
}

function deleteRow(row) {
  gridRef.value.remove(row)
}

function editRow(row) {
  gridRef.value.setActiveRow(row)
}

function resetGrid() {
  gridTable.value.data = []
}

defineExpose({
  resetGrid,
})
</script>

<template>
  <div>
    <div class="mb-4">
      <TinyButton @click="addRow">
        {{ $t('advanceForm.form.process.add') }}
      </TinyButton>
    </div>
    <TinyGrid
      ref="gridRef"
      :data="gridTable.data"
      :edit-config="{
        trigger: 'manual',
        mode: 'row',
        autoClear: false,
        showStatus: true,
      }"
      align="center"
    >
      <TinyGridColumn
        :title="$t('advanceForm.form.process.name')"
        field="name"
        min-width="120px"
        :show-icon="false"
        :editor="{ component: TinyInput, autoselect: true }"
        :renderer="defaultRender"
      />
      <TinyGridColumn
        :title="$t('advanceForm.form.process.number')"
        field="number"
        min-width="120px"
        :show-icon="false"
        :editor="{ component: TinyInput, autoselect: true }"
        :renderer="defaultRender"
      />
      <TinyGridColumn
        :title="$t('advanceForm.form.process.department')"
        field="department"
        min-width="120px"
        :show-icon="false"
        :editor="{
          component: TinySelect,
          autoselect: true,
          attrs: {
            options: options.department,
          },
        }"
      >
        <template #default="data">
          <SelectRender
            :data="data"
            :options="options.department"
            field="department"
          />
        </template>
      </TinyGridColumn>
      <TinyGridColumn
        :title="$t('advanceForm.form.process.status')"
        field="status"
        :show-icon="false"
        min-width="120px"
        :editor="{
          component: TinySelect,
          autoselect: true,
          attrs: {
            options: options.status,
          },
        }"
      >
        <template #default="data">
          <SelectRender
            :data="data"
            :options="options.status"
            field="status"
          />
        </template>
      </TinyGridColumn>
      <TinyGridColumn
        :title="$t('advanceForm.form.process.runningStatus')"
        field="runningStatus"
        :show-icon="false"
        min-width="120px"
        :editor="{
          component: TinySelect,
          autoselect: true,
          attrs: {
            options: options.status,
          },
        }"
        :renderer="{ component: StatusRender }"
      />
      <TinyGridColumn
        :title="$t('advanceForm.form.process.createTime')"
        field="createTime"
        :show-icon="false"
        min-width="160px"
        :editor="{
          component: TinyDatePicker,
          autoselect: true,
          attrs: {
            type: 'datetime',
          },
        }"
        format-text="longDateTime"
      />

      <TinyGridColumn
        :title="$t('advanceForm.form.process.operation')"
        field="operation"
        min-width="120px"
      >
        <template #default="data">
          <a
            v-if="gridRef && gridRef.hasActiveRow(data.row)"
            class="mr-2"
            @click="saveRow(data.row)"
          >
            <IconSave class="operation-icon" />{{ $t('advanceForm.form.process.save') }}
          </a>
          <a
            v-if="gridRef && !gridRef.hasActiveRow(data.row)"
            class="mr-2"
            @click="editRow(data.row)"
          >
            <IconEdit class="operation-icon" />{{ $t('advanceForm.form.process.edit') }}
          </a>
          <TinyPopconfirm
            :title="$t('advanceForm.form.delete.title')"
            type="warning"
            trigger="click"
            @confirm="deleteRow(data.row)"
          >
            <template #reference>
              <a class="operation">
                <IconDel class="operation-icon" />{{ $t('advanceForm.form.process.delete') }}
              </a>
            </template>
          </TinyPopconfirm>
        </template>
      </TinyGridColumn>
      <template #empty>
        <span>{{ $t('advanceForm.form.nodata') }}</span>
      </template>
    </TinyGrid>
  </div>
</template>

<style scoped lang="less">
.operation-icon {
  margin-right: 3px;
  fill: currentColor;
}
</style>
