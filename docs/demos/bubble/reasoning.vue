<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble content="1+1=?" :avatar="userAvatar" placement="end"></tr-bubble>
    <tr-bubble
      :content="content"
      :avatar="aiAvatar"
      placement="start"
      shape="corner"
      :reasoning="reasoning"
    ></tr-bubble>
  </div>
  <hr />
  <div>
    <label style="margin-right: 8px">推理搜索已完成</label>
    <tiny-switch v-model="reasoning.completed"></tiny-switch>
  </div>
</template>

<script setup lang="ts">
// import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, reactive } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const reasoning = reactive({
  enabled: true,
  completed: true,
  content: `好的，用户问了一个非常简单的数学问题：“1+1=？”。首先，我需要确认用户的需求是什么。。。

接下来。。。

最后，检查是否存在可能的误解。例如，用户是否输入错误，或者问题背后有其他意图。。。`,
})

const content =
  '1 + 1 = 2\n\n如果是简单数学运算的话！有其他隐藏设定吗？比如二进制（1+1=10）、布尔代数（1+1=1）或者其他脑洞场景？😉'
</script>
