<script setup lang="ts">
import { IconArrowDown, IconToolRunning } from '@opentiny/tiny-robot-svgs'
import { ref, useCssModule, computed } from 'vue'

const props = defineProps<{ name: string; status: 'running' | 'success' | 'failed' | 'cancelled'; params?: unknown }>()

const collapsed = ref(false)

const statusText = computed(() => {
  if (props.status === 'running') {
    return '正在调用'
  }
  if (props.status === 'success') {
    return '已调用'
  }

  if (props.status === 'failed') {
    return '调用失败'
  }

  return '已取消'
})

const classes = useCssModule()

const highlightJSON = (json?: unknown): string => {
  let str = ''

  if (typeof json === 'string') {
    str = JSON.stringify(JSON.parse(json), null, 2)
  } else {
    try {
      str = JSON.stringify(json, null, 2)
    } catch (error) {
      console.warn(error)
    }
  }

  return str.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'number'
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'key' : 'string'
      } else if (/true|false/.test(match)) {
        cls = 'boolean'
      } else if (/null/.test(match)) {
        cls = 'null'
      }
      return `<span class="${classes[cls]}">${match}</span>`
    },
  )
}
</script>

<template>
  <div class="tr-bubble__step-tool">
    <div class="tr-bubble__step-tool-header">
      <div class="tr-bubble__step-tool-left">
        <IconToolRunning class="tr-bubble__step-tool-icon" />
        <span class="tr-bubble__step-tool-title">
          {{ statusText }}
          <span class="tr-bubble__step-tool-name">{{ props.name }}</span>
        </span>
      </div>
      <div class="tr-bubble__step-tool-expand">
        <IconArrowDown class="expand-icon" :class="{ '-rotate-90': collapsed }" @click="collapsed = !collapsed" />
      </div>
    </div>
    <div class="tr-bubble__step-tool-params" v-if="!collapsed">
      <hr class="tr-bubble__step-tool-hr" />
      <div class="tr-bubble__step-tool-params-content" v-html="highlightJSON(props.params)"></div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble__step-tool {
  font-size: 14px;
  line-height: 24px;
  padding: 12px;
  color: rgb(89, 89, 89);
  background-color: rgb(250, 250, 250);
  border-radius: 12px;

  .tr-bubble__step-tool-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .tr-bubble__step-tool-left {
    display: flex;
    align-items: center;
    gap: 8px;

    .tr-bubble__step-tool-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .tr-bubble__step-tool-title {
      word-break: break-word;
    }

    .tr-bubble__step-tool-name {
      color: rgb(25, 25, 25);
      font-weight: 600;
    }
  }

  .tr-bubble__step-tool-expand {
    cursor: pointer;
    flex-shrink: 0;

    .expand-icon {
      font-size: 16px;

      &.-rotate-90 {
        transform: rotate(-90deg);
      }
    }
  }

  .tr-bubble__step-tool-hr {
    margin: 12px 0;
    color: rgb(219, 219, 219);
  }
}
</style>

<style module>
.number {
  color: #00f;
}

.key {
  color: #922;
}

.string {
  color: #080;
}

.boolean {
  color: #c60;
}

.null {
  color: gray;
}
</style>
