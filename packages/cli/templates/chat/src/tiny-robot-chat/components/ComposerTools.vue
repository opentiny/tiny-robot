<script setup lang="ts">
import type { TemplateItem } from '@opentiny/tiny-robot'
import { TrDropdownMenu, TrSuggestionPillButton, TrSuggestionPills } from '@opentiny/tiny-robot'
import type { TemplateCategory, TemplateSuggestionItem } from '../config/chat-ui'
import { computed } from 'vue'

const props = defineProps<{
  templateCategories: readonly TemplateCategory[]
}>()

const currentTemplate = defineModel<TemplateItem[]>('currentTemplate', { required: true })
const templateMenus = computed(() =>
  props.templateCategories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({ id: item.id, text: item.text, template: item })),
  })),
)
const overlayTarget = '.chat-add-window'

function fillTemplate(template: TemplateSuggestionItem): void {
  currentTemplate.value = template.template.map((item) => ({ ...item }))
}

function handleTemplateSelect(item: unknown): void {
  fillTemplate((item as { template: TemplateSuggestionItem }).template)
}
</script>

<template>
  <div class="chat-add-tools">
    <TrSuggestionPills class="chat-add-tools__pills">
      <TrDropdownMenu
        v-for="category in templateMenus"
        :key="category.id"
        :append-to="overlayTarget"
        :items="category.items as never"
        trigger="click"
        @item-click="handleTemplateSelect"
      >
        <template #trigger
          ><TrSuggestionPillButton>{{ category.title }}</TrSuggestionPillButton></template
        >
      </TrDropdownMenu>
    </TrSuggestionPills>
  </div>
</template>

<style scoped>
.chat-add-tools {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}
.chat-add-tools__pills {
  min-width: 0;
  flex: 1;
}
.chat-add-tools__pills :deep(.tr-suggestion-pills__container) {
  min-width: 0;
  mask: linear-gradient(to right, rgb(0 0 0 / 100%) 80%, rgb(0 0 0 / 0%) 100%);
}
@container (max-width: 519px) {
  .chat-add-tools {
    padding: 8px;
  }
}
</style>
