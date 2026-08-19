<script setup lang="ts">
import type { SuggestionItem, TemplateItem } from '@opentiny/tiny-robot'
import { TrDropdownMenu, TrSuggestionPillButton, TrSuggestionPills, TrSuggestionPopover } from '@opentiny/tiny-robot'
import type { ChatSenderSlotProps } from '@opentiny/tiny-robot-chat'
import { IconEdit, IconSparkles } from '@opentiny/tiny-robot-svgs'
import { computed, markRaw } from 'vue'
import {
  DROPDOWN_MENU_ITEMS,
  PILL_ITEMS_CONFIG,
  suggestionPopoverData,
  templateSuggestions,
  type UserItem,
} from './assistantConfig'

const props = defineProps<{
  currentTemplate: TemplateItem[]
  submit: ChatSenderSlotProps['submit']
}>()

const emit = defineEmits<{
  'update:currentTemplate': [value: TemplateItem[]]
}>()

function clearTemplate() {
  emit('update:currentTemplate', [])
}

function handlePopoverItemClick(item: SuggestionItem) {
  props.submit({ text: item.text })
  clearTemplate()
}

function handleFillTemplate(template: UserItem[]) {
  emit(
    'update:currentTemplate',
    template.map((item) => (item.type === 'template' ? { type: 'block', content: item.content } : item)),
  )
}

const pillItems = computed(() =>
  PILL_ITEMS_CONFIG.map((config) => {
    const base = { text: config.text, icon: markRaw(IconEdit) }

    if (config.type === 'dropdown') {
      return {
        ...base,
        menu: {
          items: DROPDOWN_MENU_ITEMS,
          onItemClick: (item: unknown) => {
            props.submit({ text: (item as { text: string }).text })
            clearTemplate()
          },
        },
      }
    }

    const [start, end] = config.range
    const items = end === undefined ? templateSuggestions.slice(start) : templateSuggestions.slice(start, end)

    return {
      ...base,
      menu: {
        items,
        onItemClick: (item: unknown) => handleFillTemplate((item as { template: UserItem[] }).template),
      },
    }
  }),
)
</script>

<template>
  <div class="tiny-robot-assistant__composer-tools">
    <div class="tiny-robot-assistant__pills">
      <TrSuggestionPopover
        class="tiny-robot-assistant__popover"
        :data="suggestionPopoverData"
        @item-click="handlePopoverItemClick"
      >
        <template #trigger>
          <TrSuggestionPillButton>
            <template #icon>
              <IconSparkles style="font-size: 16px; color: #1476ff" />
            </template>
          </TrSuggestionPillButton>
        </template>
      </TrSuggestionPopover>
      <TrSuggestionPills class="tiny-robot-assistant__pills-list">
        <TrDropdownMenu
          v-for="(item, index) in pillItems"
          :key="index"
          :items="item.menu.items"
          trigger="click"
          @item-click="item.menu.onItemClick"
        >
          <template #trigger>
            <TrSuggestionPillButton>{{ item.text }}</TrSuggestionPillButton>
          </template>
        </TrDropdownMenu>
      </TrSuggestionPills>
    </div>
  </div>
</template>

<style scoped>
.tiny-robot-assistant__composer-tools {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  flex-shrink: 0;
  gap: 8px;
  padding: 8px 12px;
}

.tiny-robot-assistant__pills {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.tiny-robot-assistant__popover {
  flex-shrink: 0;
  --tr-suggestion-popover-width: 440px;
}

.tiny-robot-assistant__pills-list {
  overflow: hidden;
  min-width: 0;
  flex: 1;
}

.tiny-robot-assistant__pills-list :deep(.tr-suggestion-pills__container) {
  min-width: 0;
  mask: linear-gradient(to right, rgb(0 0 0 / 100%) 80%, rgb(0 0 0 / 0%) 100%);
}

@container (max-width: 519px) {
  .tiny-robot-assistant__composer-tools {
    padding: 8px;
  }
}
</style>
