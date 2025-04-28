<script lang="ts" setup>
import { IconArrowDown, IconArrowUp, IconCopy, IconDislike, IconLike, IconRefresh } from '@opentiny/tiny-robot-svgs'
import TinyButton from '@opentiny/vue-button'
import { ref } from 'vue'
import ActionGroup, { ActionGroupItem } from '../action-group'
import IconButton from '../icon-button'
import { SourceList } from './components'
import type { FeedbackEvents, FeedbackProps } from './index.type'

const props = withDefaults(defineProps<FeedbackProps>(), {
  operationsLimit: Number.MAX_SAFE_INTEGER,
  actionsLimit: Number.MAX_SAFE_INTEGER,
  sourcesLinesLimit: Number.MAX_SAFE_INTEGER,
})

const iconMap = {
  copy: IconCopy,
  refresh: IconRefresh,
  like: IconLike,
  dislike: IconDislike,
}

const emit = defineEmits<FeedbackEvents>()

const handleOperation = (name: string) => {
  props.operations?.find((operation) => operation.name === name)?.onClick?.()
  emit('operation', name)
}

const handleAction = (name: string) => {
  props.actions?.find((action) => action.name === name)?.onClick?.()
  emit('action', name)
}

const showSourceList = ref(false)

const handleSourceList = () => {
  showSourceList.value = !showSourceList.value
}
</script>

<template>
  <div class="tr-feedback">
    <div class="tr-feedback__operations">
      <div v-if="props.operations?.length" class="tr-feedback__operations-left">
        <action-group
          :max-num="props.operationsLimit"
          :drop-down-show-label-only="true"
          @item-click="handleOperation"
          class="tr-feedback__operations-left-action-group"
        >
          <action-group-item
            v-for="operation in props.operations"
            :key="operation.name"
            :name="operation.name"
            :label="operation.label"
          >
            <tiny-button round :reset-time="0" size="mini">
              {{ operation.label }}
            </tiny-button>
          </action-group-item>
          <template #moreBtn>
            <tiny-button round size="mini" :reset-time="0" class="tr-feedback__operations-more-btn">
              <span>更多</span>
              <icon-arrow-down />
            </tiny-button>
          </template>
        </action-group>
      </div>
      <div v-else-if="props.sources?.length">
        <span class="tr-feedback__source" @click="handleSourceList">
          <span>{{ props.sources?.length }}条来源</span>
          <component :is="showSourceList ? IconArrowUp : IconArrowDown" />
        </span>
      </div>
      <div class="tr-feedback__operations-right">
        <action-group :max-num="props.actionsLimit" @item-click="handleAction">
          <action-group-item
            v-for="action in props.actions"
            :key="action.name"
            :name="action.name"
            :label="action.label"
          >
            <icon-button
              v-if="typeof action.icon === 'string'"
              :icon="iconMap[action.icon]"
              :tooltip="action.label"
            ></icon-button>
            <component v-else :is="action.icon"></component>
          </action-group-item>
        </action-group>
      </div>
    </div>
    <div class="tr-feedback__footer">
      <div v-if="props.operations?.length && props.sources?.length">
        <span class="tr-feedback__source" @click="handleSourceList">
          <span>{{ props.sources?.length }}条来源</span>
          <component :is="showSourceList ? IconArrowUp : IconArrowDown" />
        </span>
      </div>
      <source-list
        v-if="showSourceList && props.sources"
        :sources="props.sources"
        :lines-limit="props.sourcesLinesLimit"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-feedback {
  .tr-feedback__operations {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    .tr-feedback__operations-left {
      .tr-feedback__operations-left-action-group {
        gap: 8px;
      }

      .tr-feedback__operations-more-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;

        svg {
          font-size: 12px;
        }
      }
    }

    .tr-feedback__operations-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  .tr-feedback__footer {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tr-feedback__source {
    height: 24px;
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    line-height: 20px;
    color: rgb(128, 128, 128);
    cursor: pointer;
    gap: 2px;

    &:hover {
      text-decoration: underline;
    }

    svg {
      font-size: 16px;
    }
  }
}
</style>
