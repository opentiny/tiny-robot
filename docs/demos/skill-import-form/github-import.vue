<script setup lang="ts">
import { ref } from 'vue'
import { TrSkillExtensionDetail, TrSkillImportForm } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const exampleUrl = 'https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling'
const formKey = ref(0)
const imported = ref<SkillDefinition>()

const reset = () => {
  imported.value = undefined
  formKey.value += 1
}
</script>

<template>
  <section>
    <div class="demo-aux-controls">
      <button type="button" class="demo-aux-control" @click="reset">重置示例</button>
    </div>
    <p>将这个真实 Skill 的目录地址复制到下方 URL 输入框：</p>
    <p class="example-url">
      <a :href="exampleUrl" target="_blank" rel="noopener noreferrer">{{ exampleUrl }}</a>
    </p>
    <TrSkillImportForm :key="formKey" source="github" @submit="imported = $event" />
    <div v-if="imported" class="imported-result">
      <p role="status">已导入：{{ imported.name }}</p>
      <TrSkillExtensionDetail :definition="imported" />
    </div>
    <p v-else aria-live="polite">尚未导入 Skill。</p>
  </section>
</template>

<style scoped>
.example-url {
  overflow-wrap: anywhere;
}
</style>
