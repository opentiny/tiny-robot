<template>
  <div class="tr-image-preview" v-if="visible" @click.self="close">
    <div class="tr-image-preview__content">
      <img :src="imageUrl" alt="预览图片" class="tr-image-preview__image" />
      <div class="tr-image-preview__tools">
        <button class="tr-image-preview__btn" @click="zoomIn">
          <span>+</span>
        </button>
        <button class="tr-image-preview__btn" @click="resetZoom">
          <span>100%</span>
        </button>
        <button class="tr-image-preview__btn" @click="zoomOut">
          <span>-</span>
        </button>
        <button class="tr-image-preview__btn tr-image-preview__btn--download" @click="download">
          <span>下载</span>
        </button>
      </div>
      <button class="tr-image-preview__close" @click="close">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  visible: boolean
  imageUrl: string
}>()

const emit = defineEmits(['close', 'download'])

const zoomLevel = ref(1)
const zoomStep = 0.1

// 放大图片
function zoomIn() {
  zoomLevel.value += zoomStep
  updateZoom()
}

// 缩小图片
function zoomOut() {
  if (zoomLevel.value > zoomStep) {
    zoomLevel.value -= zoomStep
    updateZoom()
  }
}

// 重置缩放
function resetZoom() {
  zoomLevel.value = 1
  updateZoom()
}

// 更新图片缩放
function updateZoom() {
  const img = document.querySelector('.tr-image-preview__image') as HTMLElement
  if (img) {
    img.style.transform = `scale(${zoomLevel.value})`
  }
}

// 关闭预览
function close() {
  emit('close')
}

// 下载图片
function download() {
  emit('download')
}
</script>

<style lang="less" scoped>
.tr-image-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 90%;
    max-height: 90%;
  }

  &__image {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    transition: transform 0.2s ease;
  }

  &__tools {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  &__btn {
    padding: 6px 12px;
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    &--download {
      background-color: rgba(61, 112, 178, 0.8);
      margin-left: 8px;

      &:hover {
        background-color: rgba(61, 112, 178, 1);
      }
    }
  }

  &__close {
    position: absolute;
    top: -40px;
    right: -40px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
