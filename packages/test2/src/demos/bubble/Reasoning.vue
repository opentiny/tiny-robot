<template>
  <section>
    <p><strong>推理消息</strong></p>

    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
      <div>
        <label>
          <input type="checkbox" v-model="reasoningState.open" />
          Expanded
        </label>
      </div>
      <div>
        <button @click="replayThinking">Replay Thinking</button>
      </div>
    </div>

    <Bubble :content="content" :reasoning_content="reasoningContent" :avatar="Avatar" :state="reasoningState"> </Bubble>
  </section>
</template>

<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import Avatar from '../Avatar.vue'

const rawContent = `二进制中1+1的结果是10。`

const rawReasoningContent = `首先，用户的问题是：“二进制中1+1的结果是多少，请给出简要回答”。这是一个关于二进制加法的问题。

在二进制系统中，只有两个数字：0和1。当我们将1和1相加时，根据二进制加法规则，1 + 1等于10。这是因为在二进制中，1 + 1产生一个进位，所以结果为0，并进位1，因此写作10。

所以，二进制中1+1的结果是10。

用户要求简要回答，所以我应该直接给出答案，不需要过多解释。

最终回答：二进制中1+1的结果是10。`

const content = ref(rawContent)
const reasoningContent = ref(rawReasoningContent)

const reasoningState = ref({
  thinking: false,
  open: true,
})

const replayThinking = async () => {
  reasoningState.value.thinking = true
  reasoningContent.value = ''
  content.value = ''

  for (const char of rawReasoningContent) {
    await new Promise((resolve) => setTimeout(resolve, 10))
    reasoningContent.value += char
  }

  reasoningState.value.thinking = false

  for (const char of rawContent) {
    await new Promise((resolve) => setTimeout(resolve, 10))
    content.value += char
  }
}
</script>
