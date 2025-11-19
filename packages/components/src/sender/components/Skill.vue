<script setup lang="ts">
import { useAttrs } from 'vue'

// 技能块数据类型（在此文件中定义）
export interface SkillDataItem {
  id: string
  type: 'skill'
  label: string // 技能显示名称
  value: string // 技能实际值
  prefix?: string // 前置零宽字符
  suffix?: string // 后置零宽字符
}

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<SkillDataItem>()
const attrs = useAttrs()
</script>

<template>
  <!-- 技能块结构：prefix + skill + suffix -->
  <span :data-id="props.id" data-type="prefix" v-bind="attrs">{{ props.prefix }}</span>
  <span :data-id="props.id" :data-type="props.type" v-bind="attrs">
    {{ props.label }}
  </span>
  <span :data-id="props.id" data-type="suffix" v-bind="attrs">{{ props.suffix }}</span>
</template>

<style lang="less" scoped>
/* 技能块样式 - 蓝色背景 */
[data-type='skill'] {
  color: white;
  background: #3b82f6;
  padding: 2px 8px;
  margin: 0 2px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: text;
  caret-color: white;
  user-select: none;
  box-decoration-break: clone;
}

[data-type='skill']:empty {
  display: inline-block;
  min-width: 16px;
}
</style>
