<script lang="ts" setup>
import { TinyTag } from '@opentiny/vue'
import { computed } from 'vue'

const props = defineProps({
  value: String,
})

const tagType = {
  running: 'info',
  finished: 'success',
  delayed: 'warning',
}

const type = computed(() => {
  return tagType[props.value]
})
</script>

<template>
  <div>
    <TinyTag v-if="value" :value="value" :type="type" />
    <div v-else>
      --
    </div>
  </div>
</template>

<style scoped lang="less"></style>
