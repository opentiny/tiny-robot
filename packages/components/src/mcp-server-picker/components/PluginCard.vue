<script setup lang="ts">
import { TinySwitch, TinyPopconfirm } from '@opentiny/vue'
import { computed, ref } from 'vue'
import { IconDelete, IconArrowRight, IconArrowDown } from '@opentiny/tiny-robot-svgs'
import type { PluginCardEmits, PluginCardProps, PluginInfo } from '../index.type'

const props = withDefaults(defineProps<PluginCardProps>(), {
  mode: 'installed',
  showToolCount: true,
})

const emit = defineEmits<PluginCardEmits>()

const isExpanded = ref(props.plugin.expanded || false)
const toolCount = computed(() => props.plugin.tools?.length || 0)
// 工具数量大于0时，插件可展开
const expandable = computed(() => toolCount.value > 0)

const cardClasses = computed(() => ({
  'plugin-card--expandable': expandable.value,
  'plugin-card--expanded': isExpanded.value,
  [`plugin-card--${props.mode}`]: true,
}))

const handleToggleExpand = () => {
  if (expandable.value) {
    isExpanded.value = !isExpanded.value
  }
}

// 计算父级插件的激活状态（支持三态）
const pluginState = computed(() => {
  if (!expandable.value) {
    return { checked: props.plugin.enabled || false, indeterminate: false }
  }

  const enabledTools = props.plugin.tools.filter((tool) => tool.enabled)
  const totalTools = props.plugin.tools.length

  if (enabledTools.length === 0) {
    return { checked: false, indeterminate: false }
  } else if (enabledTools.length === totalTools) {
    return { checked: true, indeterminate: false }
  } else {
    return { checked: true, indeterminate: true }
  }
})

const handlePluginToggle = (enabled: boolean) => {
  if (expandable.value) {
    props.plugin.tools.forEach((tool) => {
      if (tool.enabled !== enabled) {
        tool.enabled = enabled
        // 通知父组件工具状态已改变
        emit('toggle-tool', tool.id, enabled)
      }
    })
  }

  emit('toggle-plugin', enabled)
}

const handleToolToggle = (toolId: string, enabled: boolean) => {
  emit('toggle-tool', toolId, enabled)
}

const handleDelete = () => {
  emit('delete-plugin')
}

// 市场插件添加状态
const addState = computed(() => props.plugin.addState || 'idle')

const handleAdd = (plugin: PluginInfo) => {
  if (addState.value !== 'idle') return
  emit('add-plugin', plugin)
}

const getHoverTitle = (isEnabled: boolean) => {
  return isEnabled ? '关闭插件' : '打开插件'
}
</script>

<template>
  <div class="plugin-card" :class="cardClasses">
    <!-- 主插件卡片 -->
    <div class="plugin-card__main">
      <img :src="plugin.icon" class="plugin-card__icon" />
      <div class="plugin-card__content">
        <div class="plugin-card__info">
          <span class="plugin-card__name">{{ plugin.name }}</span>
          <span v-if="showToolCount && toolCount" class="plugin-card__count"> {{ toolCount }} 个工具 </span>
        </div>
        <div class="plugin-card__desc" :title="plugin.description">{{ plugin.description }}</div>
      </div>
      <div class="plugin-card__actions">
        <slot name="actions" :plugin="plugin" :expanded="isExpanded" :mode="mode">
          <!-- 默认操作区域 -->
          <template v-if="mode === 'installed'">
            <div v-if="expandable" class="plugin-card__expand" @click="handleToggleExpand">
              <slot name="expand-icon" :expanded="isExpanded">
                <IconArrowRight class="common-icon" v-if="!isExpanded" />
                <IconArrowDown class="common-icon" v-else />
              </slot>
            </div>
            <div class="plugin-card__operations">
              <TinyPopconfirm
                title="确定移除该插件吗？"
                style="height: 16px"
                type="info"
                @confirm="handleDelete"
                trigger="click"
              >
                <template #reference>
                  <slot name="delete-icon">
                    <span class="plugin-card__delete-trigger" title="移除插件">
                      <IconDelete class="common-icon" />
                    </span>
                  </slot>
                </template>
              </TinyPopconfirm>
              <TinySwitch
                :title="getHoverTitle(pluginState.checked)"
                :model-value="pluginState.checked"
                :indeterminate="pluginState.indeterminate"
                @update:model-value="handlePluginToggle"
              />
            </div>
          </template>
          <template v-else-if="mode === 'market'">
            <div class="plugin-card__add">
              <slot name="add-button">
                <div
                  class="plugin-card__add-button"
                  :class="{
                    'plugin-card__add-button--loading': addState === 'loading',
                    'plugin-card__add-button--added': addState === 'added',
                  }"
                  @click="handleAdd(plugin)"
                >
                  <span v-if="addState === 'idle'">添加</span>
                  <span v-else-if="addState === 'loading'">添加中</span>
                  <span v-else>已添加</span>
                </div>
              </slot>
            </div>
          </template>
        </slot>
      </div>
    </div>

    <!-- 展开的工具列表 -->
    <transition name="plugin-card-slide" v-if="expandable">
      <div v-show="isExpanded" class="plugin-card__tools">
        <!-- 顶部分割线 -->
        <div class="plugin-card__divider"></div>

        <div v-for="(tool, index) in plugin.tools" :key="tool.id" class="plugin-card__tool-item">
          <div class="plugin-card__tool">
            <div class="plugin-card__icon plugin-card__icon--placeholder" />
            <div class="plugin-card__content">
              <div class="plugin-card__info">
                <span class="plugin-card__name">{{ tool.name }}</span>
              </div>
              <div class="plugin-card__desc" :title="tool.description">{{ tool.description }}</div>
            </div>
            <div class="plugin-card__actions plugin-card__actions--tool">
              <TinySwitch
                :title="getHoverTitle(tool.enabled)"
                :model-value="tool.enabled"
                @update:model-value="(enabled: boolean) => handleToolToggle(tool.id, enabled)"
              />
            </div>
          </div>

          <!-- 工具项之间的分割线 -->
          <div v-if="index < (plugin.tools?.length || 0) - 1" class="plugin-card__divider"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="less" scoped>
.plugin-card {
  --plugin-card-padding-inline: 24px;
  --plugin-card-padding-block: 14px;
  --plugin-card-icon-size: 40px;
  --plugin-card-row-gap: 16px;
  --plugin-card-divider-inset-start: calc(
    var(--plugin-card-padding-inline) + var(--plugin-card-icon-size) + var(--plugin-card-row-gap)
  );
  --plugin-card-divider-inset-end: var(--plugin-card-padding-inline);

  position: relative;
  background: var(--tr-mcp-server-picker-card-bg-color);
  border-radius: 12px;

  &--installed:hover,
  &--installed:focus-within {
    .plugin-card__delete-trigger {
      visibility: visible;
    }
  }

  &__main {
    display: flex;
    align-items: center;
    gap: var(--plugin-card-row-gap);
    box-sizing: border-box;
    border-radius: 16px;
    padding: var(--plugin-card-padding-block) var(--plugin-card-padding-inline);
    transition: border-radius 0.3s ease;
  }

  &__icon {
    width: var(--plugin-card-icon-size);
    height: var(--plugin-card-icon-size);
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;

    &--placeholder {
      border: none;
      opacity: 0;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0; // 防止内容溢出
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    line-height: 24px;
    color: var(--tr-text-primary);
    text-align: justify;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__count {
    height: 18px;
    padding: 0 6px;
    border-radius: 4px;
    box-sizing: content-box;
    background: var(--tr-mcp-server-picker-tool-count-color);
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    text-align: left;
    color: var(--tr-text-primary);
    white-space: nowrap;
  }

  &__desc {
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
    text-align: justify;
    color: var(--tr-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__actions {
    max-width: 80px;
    height: 52px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-shrink: 0;

    &--tool {
      justify-content: flex-end;
    }
  }

  &__expand {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  &__operations {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    :deep(.tiny-popconfirm) {
      height: 24px !important;
    }
  }

  &__delete-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    visibility: hidden;
  }

  &__add {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    padding: 16px 0;

    &-button {
      min-width: 64px;
      height: 28px;
      padding: 0 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      text-align: center;
      color: var(--tr-text-primary);
      border-radius: 999px;
      white-space: nowrap;
      border: 1px solid var(--tr-mcp-server-picker-market-button-border-color);
      cursor: pointer;
      box-sizing: border-box;

      &--loading {
        background: var(--tr-color-primary-light);
        border-color: var(--tr-color-primary);
        color: var(--tr-color-primary);
        cursor: not-allowed;
      }

      &--added {
        color: var(--tr-text-disabled);
        background-color: var(--tr-mcp-server-picker-market-button-added-bg-color);
        border-color: transparent;
        fill: var(--tr-text-disabled);
        cursor: not-allowed;
      }
    }
  }

  // 工具列表样式
  &__tools {
    border-radius: 0 0 16px 16px;
  }

  &__tool {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--plugin-card-row-gap);
    box-sizing: border-box;
    padding: var(--plugin-card-padding-block) var(--plugin-card-padding-inline);
    min-height: 68px;
    height: auto;

    .plugin-card__actions {
      width: 68px;
      height: 46px;
      justify-content: flex-end;
      align-items: flex-end;
    }
  }

  // 分割线样式
  &__divider {
    height: 1px;
    background: var(--tr-mcp-server-picker-divider-color);
    margin-left: var(--plugin-card-divider-inset-start);
    margin-right: var(--plugin-card-divider-inset-end);
    flex-shrink: 0;
  }
}

// 展开/折叠过渡动画
.plugin-card-slide {
  &-enter-active,
  &-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
  }

  &-enter-from,
  &-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
  }

  &-enter-to,
  &-leave-from {
    max-height: 1000px;
    opacity: 1;
    transform: translateY(0);
  }
}

.tiny-button {
  --tv-Button-height-small: 16px;
}

.common-icon {
  width: 24px;
  height: 24px;
  padding: 4px;
  cursor: pointer;
  box-sizing: border-box;
  color: var(--tr-icon-color-default);
}

.common-icon:hover {
  border-radius: 8px;
  background: var(--tr-mcp-server-picker-bg-hover);
}
</style>
