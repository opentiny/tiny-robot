<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <p style="font-size: 12px; color: #666; margin: 0">使用 Markdown 渲染器渲染运行时组件（WebComponent）</p>
    <tr-bubble-provider :store="bubbleStore">
      <tr-bubble
        :avatar="aiAvatar"
        :content="mdContent"
        :fallback-content-renderer="BubbleRenderers.Markdown"
      ></tr-bubble>
    </tr-bubble-provider>
  </div>
</template>

<script setup lang="ts">
import { BubbleRenderers, TrBubble, TrBubbleProvider } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { defineCustomElement, h, reactive, ref } from 'vue'
import SchemaCard from './schema-card.ce.vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const bubbleStore = reactive({
  mdConfig: { html: true },
  dompurifyConfig: { ADD_TAGS: ['schema-card'], ADD_ATTR: ['schema'] },
})

const schemaObj = ref(
  JSON.stringify({
    componentName: 'Page',
    children: [
      { componentName: 'Text', props: { text: '运行时渲染器文本' } },
      { componentName: 'Button', props: { text: '运行时渲染器按钮' } },
    ],
  }),
)

// 注册自定义元素
if (!customElements.get('schema-card')) {
  const CardElement = defineCustomElement(SchemaCard)
  customElements.define('schema-card', CardElement)
}

const mdContent = `# Markdown 标题

**加粗文本**

<schema-card schema='${schemaObj.value}'></schema-card>
`
</script>
