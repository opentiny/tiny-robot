<script lang="ts" setup>
import { IconArrowDown, IconArrowUp, IconCopy, IconDislike, IconLike, IconRefresh } from '@opentiny/tiny-robot-svgs'
import TinyButton from '@opentiny/vue-button'
import { ref, VNode } from 'vue'
import ActionGroup, { ActionGroupItem } from '../action-group'
import IconButton from '../icon-button'

const props = defineProps<{
  operations?: {
    name: string
    label: string
  }[]
  sources?: {
    label: string
    link: string
  }[]
  actions?: {
    name: string
    label: string
    icon: 'copy' | 'refresh' | 'like' | 'dislike' | VNode
    onClick?: () => void
  }[]
}>()

const iconMap = {
  copy: IconCopy,
  refresh: IconRefresh,
  like: IconLike,
  dislike: IconDislike,
}

const emit = defineEmits<{
  (e: 'operation', name: string): void
  (e: 'action', name: string): void
}>()

const handleOperation = (name: string) => {
  emit('operation', name)
}

const showSourceList = ref(false)

const handleSourceList = () => {
  showSourceList.value = !showSourceList.value
}

const handleAction = (name: string) => {
  props.actions?.find((action) => action.name === name)?.onClick?.()
  emit('action', name)
}
</script>

<template>
  <div class="tr-feedback">
    <div class="tr-feedback__operations">
      <div class="tr-feedback__operations-left">
        <tiny-button
          v-for="operation in props.operations"
          :key="operation.name"
          round
          :reset-time="0"
          size="mini"
          @click="handleOperation(operation.name)"
        >
          {{ operation.label }}
        </tiny-button>
      </div>
      <div class="tr-feedback__operations-right">
        <action-group :max-num="2" @click="handleAction">
          <action-group-item
            v-for="action in props.actions"
            :key="action.name"
            :name="action.name"
            :label="action.label"
          >
            <tiny-tooltip
              :content="action.label"
              effect="dark"
              placement="top"
              :open-delay="500"
              @click="handleAction(action.name)"
            >
              <icon-button v-if="typeof action.icon === 'string'" :icon="iconMap[action.icon]"></icon-button>
              <component v-else :is="action.icon"></component>
            </tiny-tooltip>
          </action-group-item>
        </action-group>
      </div>
    </div>
    <div class="tr-feedback__footer">
      <div>
        <div class="tr-feedback__source" @click="handleSourceList">
          <span>3条来源</span>
          <component :is="showSourceList ? IconArrowUp : IconArrowDown" />
        </div>
      </div>
      <div class="tr-feedback__source-list" v-if="showSourceList">
        <a v-for="source in props.sources" :key="source.label" :href="source.link" target="_blank">
          {{ source.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-feedback {
  .tr-feedback__operations {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .tr-feedback__operations-left {
    }

    .tr-feedback__operations-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  .tr-feedback__footer {
    margin-top: 8px;

    .tr-feedback__source {
      height: 24px;
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      line-height: 20px;
      color: rgb(128, 128, 128);
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }

      svg {
        font-size: 16px;
        margin-left: 2px;
      }
    }

    .tr-feedback__source-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      a {
        padding: 4px 12px;
        font-size: 12px;
        line-height: 20px;
        border-radius: 999px;
        border: none;
        background-color: rgba(20, 118, 255, 0.06);
        color: rgb(20, 118, 255);

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
