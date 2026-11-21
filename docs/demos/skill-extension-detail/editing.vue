<script setup lang="ts">
import { ref } from 'vue'
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
})

const saveMessage = ref('')

const handleSave = (nextDefinition: SkillDefinition) => {
  definition.value = nextDefinition
  saveMessage.value = '已保存到当前示例状态。'
}
</script>

<template>
  <div class="skill-editing-demo">
    <p class="skill-editing-demo__hint">
      当前选中 <strong>SKILL.md</strong>。点击右侧文件标题栏的
      <strong>编辑</strong>，修改后点保存；也可以先选择左侧文本资源再编辑。
    </p>
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
</style>
