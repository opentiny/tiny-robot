<script setup lang="ts">
import { withBase } from 'vitepress'
import { ref } from 'vue'
import { TrSkillExtensionDetail, TrSkillImportForm } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const imported = ref<SkillDefinition>()
</script>

<template>
  <section>
    <p>
      下载
      <a :href="withBase('/skill-import-example.zip')" download="skill-example.zip">Skill 示例压缩包</a>，或者按照
      <code>SKILL.md</code> 在压缩包根目录及单层目录中的布局自行打包。
    </p>
    <tr-skill-import-form source="archive" @submit="imported = $event" />
    <tr-skill-extension-detail v-if="imported" :definition="imported" />
  </section>
</template>
