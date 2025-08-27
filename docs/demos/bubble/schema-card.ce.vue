<template>
  <schema-renderer :schema="schemaObj"></schema-renderer>
</template>

<script setup lang="ts">
import SchemaRenderer from '@opentiny/tiny-schema-renderer'
import { computed } from 'vue'

const props = defineProps({
  schema: {
    type: String,
    required: true,
  },
})

const schemaObj = computed(() => {
  return JSON.parse(props.schema)
})
</script>
<style>
@import url('@opentiny/vue-theme/index.css');
</style>
