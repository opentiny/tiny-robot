<template>
  <div class="shortcut-submit-demo">
    <div class="submit-type-selector">
      <label>选择提交方式：</label>
      <div class="radio-group">
        <label class="radio-item">
          <input type="radio" value="enter" v-model="submitType" />
          <span>Enter 提交</span>
        </label>
        <label class="radio-item">
          <input type="radio" value="ctrlEnter" v-model="submitType" />
          <span>Ctrl+Enter 提交</span>
        </label>
        <label class="radio-item">
          <input type="radio" value="shiftEnter" v-model="submitType" />
          <span>Shift+Enter 提交</span>
        </label>
      </div>
    </div>

    <tr-sender
      v-model="defaultValue"
      :submitType="submitType"
      mode="multiple"
      :placeholder="placeholderText"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const defaultValue = ref('')
const submitType = ref<'enter' | 'ctrlEnter' | 'shiftEnter'>('ctrlEnter')

const placeholderText = computed(() => {
  const placeholderMap = {
    enter: '按 Enter 提交',
    ctrlEnter: '按 Ctrl+Enter 提交，Enter 换行',
    shiftEnter: '按 Shift+Enter 提交，Enter 换行',
  }
  return placeholderMap[submitType.value]
})

const handleSubmit = (value: string) => {
  console.log('提交内容:', value)
  console.log('提交方式:', submitType.value)
  defaultValue.value = ''
}
</script>

<style scoped>
.shortcut-submit-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submit-type-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.submit-type-selector label {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.radio-group {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--vp-c-text-2);
  transition: color 0.2s;
}

.radio-item:hover {
  color: var(--vp-c-text-1);
}

.radio-item input[type='radio'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--vp-c-brand-1);
}

.radio-item span {
  user-select: none;
}
</style>
