<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import '@opentiny/tiny-robot-chat/experimental/web-component.css'
import manifest from './examples.json'
import { examplesById } from './shared/examples'
import './shared/example.css'

const gallery = ref<HTMLElement>()
const cleanups: Array<() => void> = []

onMounted(async () => {
  if (!gallery.value) return

  for (const metadata of manifest) {
    const example = examplesById[metadata.id as keyof typeof examplesById]
    const card = document.createElement('section')
    card.className = 'tr-chat-experiment-card'
    card.dataset.exampleId = metadata.id
    card.dataset.exampleGroup = metadata.group

    const header = document.createElement('header')
    header.className = 'tr-chat-experiment-card__header'
    const copy = document.createElement('div')
    const title = document.createElement('h3')
    const summary = document.createElement('p')
    const baseline = document.createElement('a')
    title.textContent = `${metadata.group} · ${metadata.title}`
    summary.textContent = example.summary
    baseline.textContent = `Vue baseline: ${metadata.baseline}`
    baseline.href = `https://github.com/opentiny/tiny-robot/blob/SonyLeo/docs/update-chat-ui-desc/docs/demos/chat/${metadata.id}.vue`
    baseline.target = '_blank'
    baseline.rel = 'noreferrer'
    copy.append(title, summary)
    header.append(copy, baseline)

    const interactions = document.createElement('p')
    interactions.className = 'tr-chat-experiment-log'
    interactions.dataset.testedInteractions = ''
    interactions.textContent = `验证：${example.testedInteractions.join('、')}`
    const host = document.createElement('div')
    host.className = 'tr-chat-experiment-host'
    host.dataset.exampleHost = metadata.id
    card.append(header, interactions, host)
    gallery.value.append(card)

    try {
      const cleanup = await example.mount(host)
      card.dataset.mountStatus = 'ready'
      if (cleanup) cleanups.push(cleanup)
    } catch (error) {
      card.dataset.mountStatus = 'error'
      host.textContent = `示例挂载失败：${error instanceof Error ? error.message : String(error)}`
    }
  }
})

onBeforeUnmount(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
})
</script>

<template>
  <div ref="gallery" class="tr-chat-experiment-gallery" data-testid="chat-experimental-gallery" />
</template>
