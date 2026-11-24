<script setup lang="ts">
import { ref } from 'vue'
import { TrSkillExtensionDetail, TrSkillImportForm } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const imported = ref<SkillDefinition>()
</script>

<template>
  <section>
    <tr-skill-import-form source="archive" @submit="imported = $event" />
    <tr-skill-extension-detail v-if="imported" :definition="imported" />
  </section>
</template>
