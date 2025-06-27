<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { IconArrowUp as IconArrowLeft, IconArrowDown as IconArrowRight, IconClose } from '@opentiny/tiny-robot-svgs'
import type { Attachment } from '../index.type'

const props = defineProps<{
  visible: boolean
  images: Attachment[]
  currentIndex: number
}>()

const emit = defineEmits(['close', 'update:currentIndex'])

const localCurrentIndex = ref(props.currentIndex)

const currentImage = computed(() => props.images[localCurrentIndex.value])

watch(
  () => props.currentIndex,
  (newIndex) => {
    localCurrentIndex.value = newIndex
  },
)

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      localCurrentIndex.value = props.currentIndex
    }
  },
)

// 切换图片
const prevImage = () => {
  if (localCurrentIndex.value > 0) {
    localCurrentIndex.value--
    emit('update:currentIndex', localCurrentIndex.value)
  }
}

const nextImage = () => {
  if (localCurrentIndex.value < props.images.length - 1) {
    localCurrentIndex.value++
    emit('update:currentIndex', localCurrentIndex.value)
  }
}

const selectImage = (index: number) => {
  localCurrentIndex.value = index
  emit('update:currentIndex', localCurrentIndex.value)
}

// 关闭预览
function close() {
  emit('close')
}
</script>

<template>
  <div class="tr-image-preview" v-if="visible" @click.self="close">
    <button class="tr-image-preview__close" @click="close"><IconClose /></button>

    <div class="tr-image-preview__main">
      <button
        class="tr-image-preview__nav tr-image-preview__nav--left"
        @click.stop="prevImage"
        :disabled="localCurrentIndex === 0"
      >
        <IconArrowRight />
      </button>

      <div class="tr-image-preview__content">
        <img :src="currentImage?.previewUrl" :alt="currentImage?.name" class="tr-image-preview__image" />
      </div>

      <button
        class="tr-image-preview__nav tr-image-preview__nav--right"
        @click.stop="nextImage"
        :disabled="localCurrentIndex === images.length - 1"
      >
        <IconArrowLeft />
      </button>
    </div>

    <div class="tr-image-preview__footer">
      <div class="tr-image-preview__thumbnails">
        <div
          v-for="(image, index) in images"
          :key="image.uid"
          class="tr-image-preview__thumbnail"
          :class="{ 'tr-image-preview__thumbnail--active': index === localCurrentIndex }"
          @click="selectImage(index)"
        >
          <img :src="image.previewUrl" :alt="image.name" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-image-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;

  &__main {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  &__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: #898989;
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;

    &:disabled {
      display: none;
    }

    &--left {
      font-size: 16px;
      transform: rotate(90deg);
      left: 100px;
    }

    &--right {
      font-size: 16px;
      transform: rotate(90deg);
      right: 100px;
    }
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 80%;
    max-height: 80vh;
  }

  &__image {
    max-width: 100%;
    max-height: calc(80vh - 120px); // 留出底部工具栏和缩略图空间
    object-fit: contain;
    transition: transform 0.2s ease;
  }

  &__footer {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  &__thumbnails {
    display: flex;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    max-width: 80vw;
    overflow-x: auto;
  }

  &__thumbnail {
    width: 60px;
    height: 60px;
    cursor: pointer;
    border-radius: 8px;
    overflow: hidden;
    transition: border-color 0.2s;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.2);
      transition: background-color 0.2s;
    }

    &--active {
      background-color: transparent;

      &::after {
        background-color: transparent;
      }
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #595959;
    border: none;
    color: white;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
