<script setup lang="ts">
import type { SuggestionData, SuggestionItem, TemplateItem } from '@opentiny/tiny-robot'
import { TrDropdownMenu, TrSuggestionPillButton, TrSuggestionPills, TrSuggestionPopover } from '@opentiny/tiny-robot'
import type { ChatSenderSlotProps } from '@opentiny/tiny-robot-chat'
import { IconSparkles } from '@opentiny/tiny-robot-svgs'
import type { ChatMenuItem, TemplateCategory, TemplateSuggestionItem } from '../config/chat-ui'
import type { McpExample } from '../config/chat-runtime'
import { computed } from 'vue'

const props = defineProps<{
  templateCategories: readonly TemplateCategory[]
  mcpExamples: readonly McpExample[]
  menus: readonly ChatMenuItem[]
  submit: ChatSenderSlotProps['submit']
}>()

const currentTemplate = defineModel<TemplateItem[]>('currentTemplate', { required: true })
const suggestionData: SuggestionData = props.mcpExamples.map((item) => ({ id: item.id, text: item.request }))
const mcpMenuItems = props.mcpExamples.map((item) => ({ id: item.id, text: item.request }))
const mcpMenu = computed(() => props.menus.find((menu) => menu.action === 'mcp'))
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

function submitSuggestion(item: SuggestionItem): void {
  props.submit({ text: item.text })
}
</script>

<template>
  <div class="chat-add-tools">
    <TrSuggestionPopover :append-to="overlayTarget" :data="suggestionData" @item-click="submitSuggestion">
      <template #trigger>
        <TrSuggestionPillButton title="常用查询"
          ><IconSparkles style="font-size: 16px; color: #1476ff"
        /></TrSuggestionPillButton>
      </template>
    </TrSuggestionPopover>
    <TrSuggestionPills class="chat-add-tools__pills">
      <TrDropdownMenu
        v-if="mcpMenu"
        :append-to="overlayTarget"
        :items="mcpMenuItems"
        trigger="click"
        @item-click="(item) => submitSuggestion(item as SuggestionItem)"
      >
        <template #trigger
          ><TrSuggestionPillButton>{{ mcpMenu.title }}</TrSuggestionPillButton></template
        >
      </TrDropdownMenu>
      <TrDropdownMenu
        v-for="category in templateMenus"
        :key="category.id"
        :append-to="overlayTarget"
        :items="category.items as never"
        trigger="click"
        @item-click="(item) => fillTemplate((item as unknown as { template: TemplateSuggestionItem }).template)"
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
