<script setup lang="ts">
import { ref } from 'vue'
import { createMemorySkillStorage } from '@opentiny/tiny-robot-kit'
import { TrSkillExtensionDetail } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const definition = ref<SkillDefinition>({
  name: 'release-notes',
  description: '整理版本更新内容。',
  instructions: ['# 发布说明', '', '列出本次版本的重要变更。', '', '## 输出格式', '- 新增功能', '- 修复问题'].join(
    '\n',
  ),
  resources: [
    {
      path: 'references/style.md',
      kind: 'text',
      resourceId: 'references/style.md',
      text: '# 写作规范\n\n使用简洁、清晰的语言。',
    },
  ],
  directories: ['references/drafts'],
})

const saveMessage = ref('')
const storage = createMemorySkillStorage()

const handleSave = async (nextDefinition: SkillDefinition) => {
  definition.value = await storage.add(nextDefinition)
  saveMessage.value = '已保存到当前示例状态。'
}

const reload = async () => {
  const restored = await storage.get(definition.value.name)
  if (restored) definition.value = restored
  saveMessage.value = '已从 Storage 重新读取当前 Skill。'
}

void storage.add(definition.value)
</script>

<template>
  <div class="skill-editing-demo">
    <p class="skill-editing-demo__hint">
      默认会选中入口文件。可以切换左侧文件、编辑文本内容或管理文件树；保存后会写入示例 Storage。
    </p>
    <button type="button" class="skill-editing-demo__reload" @click="reload">从 Storage 重新读取</button>
    <TrSkillExtensionDetail mode="edit" :definition="definition" @save="handleSave" />
    <p v-if="saveMessage" class="skill-editing-demo__status" role="status">{{ saveMessage }}</p>
  </div>
</template>

<style scoped>
.skill-editing-demo__hint,
.skill-editing-demo__status {
  margin: 0 0 12px;
  color: var(--tr-text-secondary, #595959);
  font-size: 13px;
}

.skill-editing-demo__status {
  margin: 12px 0 0;
}

.skill-editing-demo__reload {
  margin-bottom: 12px;
}
</style>
