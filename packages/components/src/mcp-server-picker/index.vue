<script setup lang="ts">
import TinySwitch from '@opentiny/vue-switch'
import TinyButton from '@opentiny/vue-button'
import TinyTabs from '@opentiny/vue-tabs'
import TinyTabItem from '@opentiny/vue-tab-item'
import TinyInput from '@opentiny/vue-input'
import { ref, reactive } from 'vue'
import { IconDel, IconPlus, IconChevronRight, IconChevronDown } from '@opentiny/vue-icon'

const TinyIconDel = IconDel()
const TinyIconPlus = IconPlus()
const TinyIconChevronRight = IconChevronRight()
const TinyIconChevronDown = IconChevronDown()

const activeTab = ref('installed')
const search = ref('')

// 模拟数据结构
const pluginData = reactive({
  id: 'deepseek',
  name: 'DeepSeek',
  icon: 'https://cdn.deepseek.com/chat/icon.png',
  description: 'DeepSeek 的官方扩展',
  toolCount: 3,
  enabled: true,
  expanded: false,
  tools: [
    {
      id: 'tool1',
      name: '代码生成工具',
      description: '智能代码生成和优化工具',
      enabled: true,
    },
    {
      id: 'tool2',
      name: '文档分析工具',
      description: '自动分析和总结文档内容',
      enabled: false,
    },
    {
      id: 'tool3',
      name: 'API 调用工具',
      description: '自动化API接口调用和测试',
      enabled: true,
    },
  ],
})

// 切换展开/折叠状态
const toggleExpand = () => {
  pluginData.expanded = !pluginData.expanded
}
</script>

<template>
  <div class="mcp-server-picker">
    <div class="mcp-server-picker__header">
      <div class="mcp-server-picker__header-left">插件</div>
      <div class="mcp-server-picker__header-right">
        <TinyButton :icon="TinyIconPlus" circle> 自定义添加 </TinyButton>
      </div>
    </div>
    <div class="mcp-server-picker__content">
      <TinyTabs v-model="activeTab">
        <TinyTabItem title="已安装插件" name="installed">
          <div class="mcp-server-picker__content-item">
            <div class="mcp-server-picker__content-item-search">
              <TinyInput v-model="search" placeholder="搜索插件" />
            </div>

            <div class="mcp-server-picker__content-item-list">
              <!-- 可折叠的插件容器 -->
              <div class="mcp-server-expandable" :data-expanded="pluginData.expanded">
                <!-- 总插件描述 -->
                <div class="mcp-server-picker__content-item-list-item mcp-server-main">
                  <img :src="pluginData.icon" class="mcp-server-icon" />
                  <div class="mcp-server-plugin">
                    <div class="mcp-server-plugin-info">
                      <span class="mcp-server-plugin-info-name">{{ pluginData.name }}</span>
                      <span class="mcp-server-plugin-info-count">{{ pluginData.toolCount }} 个工具</span>
                    </div>
                    <div class="mcp-server-plugin-desc">{{ pluginData.description }}</div>
                  </div>
                  <div class="mcp-server-action">
                    <div class="mcp-server-action-expand" @click="toggleExpand">
                      <TinyIconChevronRight v-if="!pluginData.expanded" />
                      <TinyIconChevronDown v-else />
                    </div>
                    <div class="mcp-server-action-operation">
                      <TinyIconDel />
                      <TinySwitch v-model="pluginData.enabled" />
                    </div>
                  </div>
                </div>

                <!-- 展开的工具列表 -->
                <transition name="slide-down">
                  <div v-show="pluginData.expanded" class="mcp-server-tools">
                    <!-- 顶部分割线 -->
                    <div class="mcp-server-divider"></div>

                    <div v-for="(tool, index) in pluginData.tools" :key="tool.id" class="mcp-server-tool-item">
                      <div class="mcp-server-picker__content-item-list-item mcp-server-sub">
                        <div class="mcp-server-icon mcp-server-icon-placeholder" />
                        <div class="mcp-server-plugin">
                          <div class="mcp-server-plugin-info">
                            <span class="mcp-server-plugin-info-name">{{ tool.name }}</span>
                          </div>
                          <div class="mcp-server-plugin-desc">{{ tool.description }}</div>
                        </div>
                        <div class="mcp-server-action" style="justify-content: flex-end">
                          <div class="mcp-server-action-operation" style="justify-content: flex-end">
                            <TinySwitch v-model="tool.enabled" />
                          </div>
                        </div>
                      </div>

                      <!-- 工具项之间的分割线 -->
                      <div v-if="index < pluginData.tools.length - 1" class="mcp-server-divider"></div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </TinyTabItem>
        <TinyTabItem title="插件市场" name="market">
          <div class="mcp-server-picker__content-item">
            <h2>MCP Server Picker</h2>
          </div>
        </TinyTabItem>
      </TinyTabs>
    </div>
  </div>
</template>

<style lang="less" scoped>
.mcp-server-picker {
  width: 482px;
  height: calc(100vh - 20px);
  box-sizing: border-box;
  background: rgb(248, 248, 248);
  border-left: 1px solid rgb(219, 219, 219);
  border-right: 1px solid rgb(219, 219, 219);
  border-radius: 4px;
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;

    &-left {
      font-size: 16px;
      font-weight: 600;
    }

    &-right {
      font-size: 14px;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 10px;

    :deep(.tiny-tabs__content) {
      margin: 0;
      overflow: visible;
    }

    &-item-search {
      margin: 16px 0;
    }

    &-item-list {
      display: flex;
      flex-direction: column;
      overflow: visible;
      gap: 16px;

      &-item {
        width: 440px;
        display: flex;
        align-items: center;
        gap: 16px;
        box-sizing: border-box;
        border-radius: 12px;
        padding: 16px 16px 20px 16px;
        background: rgb(255, 255, 255);
        box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);

        /* 独立插件项的默认样式 */
        &:not(.mcp-server-main):not(.mcp-server-sub) {
          margin-bottom: 16px;
        }

        .mcp-server-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          background: rgb(255, 255, 255);
        }

        .mcp-server-plugin {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;

          &-info {
            display: flex;
            align-items: center;
            gap: 8px;

            &-name {
              font-size: 14px;
              font-weight: 600;
              line-height: 22px;
              color: rgb(25, 25, 25);
              text-align: justify;
            }

            &-count {
              width: 49px;
              height: 18px;
              padding: 0 4px;
              border-radius: 4px;
              background: rgb(230, 230, 230);

              font-size: 12px;
              font-weight: 400;
              line-height: 18px;
              text-align: left;
              color: rgb(25, 25, 25);
            }
          }

          &-desc {
            font-size: 12px;
            font-weight: 400;
            line-height: 20px;
            text-align: justify;
            color: rgb(89, 89, 89);
          }
        }

        .mcp-server-action {
          width: 68px;
          height: 52px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          &-expand {
            display: flex;
            justify-content: flex-end;
            align-items: center;
          }

          &-operation {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }
    }
  }
}

:deep(.tiny-tabs__nav-wrap) {
  width: 100%;
}

:deep(.tiny-tabs__item) {
  height: 32px;
}

:deep(.tiny-tabs__item__title) {
  font-size: 14px;
  font-weight: 600;
  color: rgb(25, 25, 25);
  line-height: 22px;
}

// 可展开插件容器
.mcp-server-expandable {
  position: relative;
  background: rgb(255, 255, 255);
  border-radius: 12px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  // 展开状态下的圆角处理
  &[data-expanded='true'] {
    .mcp-server-main {
      border-radius: 12px 12px 0 0 !important;
    }
  }
}

/* 主插件项样式重置 */
.mcp-server-main {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 12px !important;
  padding: 16px 16px 16px 16px !important;
  margin: 0 !important;

  .mcp-server-plugin {
    gap: 6px; // 保持主项内容间距
  }

  .mcp-server-action {
    &-expand {
      cursor: pointer;
      transition: all 0.3s ease;

      .tiny-svg {
        transition: all 0.3s ease;
      }

      &:hover {
        opacity: 0.7;
      }
    }
  }
}

// 子工具列表容器
.mcp-server-tools {
  background: rgb(255, 255, 255);
}

// 工具项容器
.mcp-server-tool-item {
  position: relative;

  // 最后一个子项的底部圆角
  &:last-child .mcp-server-sub {
    border-radius: 0 0 12px 12px;
  }
}

/* 分割线样式 - 统一规格 */
.mcp-server-divider {
  width: calc(100% - 32px);
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 16px;
  flex-shrink: 0;
  border: none;
  outline: none;
}

/* 子项样式调整 - 统一尺寸 */
.mcp-server-sub {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 12px 16px !important;
  margin: 0 !important;
  width: 100% !important;
  min-height: 68px;
  height: auto;

  .mcp-server-plugin {
    gap: 4px !important;
  }

  .mcp-server-icon-placeholder {
    width: 46px;
    height: 46px;
    background: transparent;
    border: none;
    opacity: 0;
    flex-shrink: 0;
  }

  .mcp-server-action {
    width: 68px;
    height: 46px;
    display: flex;
    flex-direction: column;
    justify-content: space-between; // 改为space-between以与主项保持一致

    &-operation {
      justify-content: flex-end;
    }
  }
}

// 展开/折叠过渡动画
.slide-down {
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
</style>
