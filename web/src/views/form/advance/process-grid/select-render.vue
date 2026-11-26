<script lang="ts" setup>
import { computed } from 'vue'

interface CompProps {
  data: Record<string, any>
  options: Array<{ value: string, label: string }>
  field: string
}

const { options, data, field } = defineProps<CompProps>()

const tranformValue = computed(() => {
  return (
    options.find(item => item.value === data.row[field])?.label ?? '--'
  )
})
</script>

<template>
  <div>{{ tranformValue }} </div>
</template>

<style scoped lang="less"></style>
