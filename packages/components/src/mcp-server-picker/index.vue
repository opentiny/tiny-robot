<script setup lang="ts">
import TinySwitch from '@opentiny/vue-switch'
import TinyButton from '@opentiny/vue-button'
import TinyTabs from '@opentiny/vue-tabs'
import TinyTabItem from '@opentiny/vue-tab-item'
import TinyInput from '@opentiny/vue-input'
import { ref } from 'vue'
import { IconDel, IconPlus, IconChevronRight } from '@opentiny/vue-icon'

const TinyIconDel = IconDel()
const TinyIconPlus = IconPlus()
const TinyIconChevronRight = IconChevronRight()

const activeTab = ref('installed')
const search = ref('')
const active = ref(true)
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
              <div class="mcp-server-picker__content-item-list-item">
                <img src="https://cdn.deepseek.com/chat/icon.png" class="mcp-server-icon" />
                <div class="mcp-server-plugin">
                  <div class="mcp-server-plugin-info">
                    <span class="mcp-server-plugin-info-name">DeepSeek</span>
                    <span class="mcp-server-plugin-info-count">3 个工具</span>
                  </div>
                  <div class="mcp-server-plugin-desc">DeepSeek 的官方扩展</div>
                </div>
                <div class="mcp-server-action">
                  <div class="mcp-server-action-expand">
                    <TinyIconChevronRight />
                  </div>
                  <div class="mcp-server-action-operation">
                    <TinyIconDel />
                    <TinySwitch v-model="active" />
                  </div>
                </div>
              </div>

              <div class="mcp-server-picker__content-item-list-item">
                <img src="https://cdn.deepseek.com/chat/icon.png" class="mcp-server-icon" />
                <div class="mcp-server-plugin">
                  <div class="mcp-server-plugin-info">
                    <span class="mcp-server-plugin-info-name">DeepSeek</span>
                    <span class="mcp-server-plugin-info-count">3 个工具</span>
                  </div>
                  <div class="mcp-server-plugin-desc">DeepSeek 的官方扩展</div>
                </div>
                <div class="mcp-server-action">
                  <div class="mcp-server-action-expand">
                    <TinyIconChevronRight />
                  </div>
                  <div class="mcp-server-action-operation">
                    <TinyIconDel />
                    <TinySwitch v-model="active" />
                  </div>
                </div>
              </div>

              <div class="mcp-server-picker__content-item-list-item">
                <img src="https://cdn.deepseek.com/chat/icon.png" class="mcp-server-icon" />
                <div class="mcp-server-plugin">
                  <div class="mcp-server-plugin-info">
                    <span class="mcp-server-plugin-info-name">工具一</span>
                  </div>
                  <div class="mcp-server-plugin-desc">工具一的描述</div>
                </div>
                <div class="mcp-server-action" style="justify-content: flex-end">
                  <div class="mcp-server-action-operation">
                    <TinyIconDel />
                    <TinySwitch v-model="active" />
                  </div>
                </div>
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
</style>
