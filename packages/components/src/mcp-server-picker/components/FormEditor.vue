<script setup lang="ts">
import { TinyRadioGroup } from '@opentiny/vue'
import { ref, onUnmounted, watch } from 'vue'
import { useFileDialog } from '@vueuse/core'
import type { PluginFormData } from '../index.type'

// 图片预览相关
const previewImageUrl = ref<string>('')
const defaultImageUrl = 'https://res.hc-cdn.com/tinyui-design/1.1.0.20250526191525/home/images/tiny-ng.svg'

// 表单数据
const formData = defineModel<PluginFormData>('formData', { required: true })

// 类型选项
const typeOptions = [
  { label: 'sse', text: '服务器发送事件（SSE）' },
  { label: 'streamableHttp', text: '流式HTTP（Streamable HTTP）' },
]

const { open: openFileDialog, files } = useFileDialog({
  accept: 'image/*', // 只接受图片文件
  multiple: false, // 只允许选择单个文件
})

// 清理预览图片URL
const cleanupPreviewUrl = () => {
  if (previewImageUrl.value && previewImageUrl.value !== defaultImageUrl) {
    URL.revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = ''
  }
}

// 监听文件选择
watch(files, (newFiles) => {
  if (newFiles && newFiles.length > 0) {
    const file = newFiles[0]

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return
    }

    // 验证文件大小（限制为5MB）
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return
    }

    // 清理之前的预览URL
    cleanupPreviewUrl()

    // 创建新的预览URL
    previewImageUrl.value = URL.createObjectURL(file)

    // 更新表单数据
    formData.value.thumbnail = file
  }
})

const handleOpenFileDialog = () => {
  openFileDialog()
}

// 组件卸载时清理
onUnmounted(() => {
  cleanupPreviewUrl()
})
</script>

<template>
  <form class="form-editor__container">
    <!-- 名称 -->
    <div class="form-editor__item">
      <label class="form-editor__label">名称</label>
      <input v-model="formData.name" class="form-editor__input" type="text" placeholder="请输入插件名称" />
    </div>

    <!-- 描述 -->
    <div class="form-editor__item">
      <label class="form-editor__label">描述</label>
      <textarea v-model="formData.description" class="form-editor__textarea" placeholder="请输入插件描述"></textarea>
    </div>

    <!-- 类型 -->
    <div class="form-editor__item">
      <label class="form-editor__label">类型</label>
      <tiny-radio-group v-model="formData.type" :options="typeOptions" class="form-editor__radio-group" />
    </div>

    <!-- URL -->
    <div class="form-editor__item">
      <label class="form-editor__label">URL</label>
      <input v-model="formData.url" class="form-editor__input" type="url" placeholder="请输入插件URL" />
    </div>

    <!-- 请求头 -->
    <div class="form-editor__item">
      <label class="form-editor__label">请求头</label>
      <textarea
        v-model="formData.headers"
        class="form-editor__textarea"
        placeholder="请输入请求头，格式为JSON"
      ></textarea>
    </div>

    <!-- 缩略图 -->
    <div class="form-editor__item">
      <label class="form-editor__label">缩略图</label>
      <div class="form-editor__file-upload" @click="handleOpenFileDialog">
        <img :src="previewImageUrl || defaultImageUrl" alt="缩略图预览" class="form-editor__file-preview-image" />
        <!-- 悬浮遮罩层 -->
        <div class="form-editor__file-overlay">
          <div class="form-editor__file-icon"></div>
        </div>
      </div>
    </div>
  </form>
</template>

<style lang="less" scoped>
.form-editor {
  &__container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: #191919;
    line-height: 22px;
  }

  &__input {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    height: 32px;
    font-size: 14px;
    line-height: 22px;
    color: #191919;
    background-color: #ffffff;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }

    &::placeholder {
      color: #999999;
    }
  }

  &__radio-group {
    height: 22px;
    box-sizing: border-box;
  }

  &__textarea {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;
    line-height: 22px;
    color: #191919;
    background-color: #ffffff;
    resize: none;
    height: 60px;
    font-family: inherit;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }

    &::placeholder {
      color: #999999;
    }
  }

  &__file-upload {
    position: relative;
    width: 48px;
    height: 48px;
    cursor: pointer;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.2s ease;

    & > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.2s ease;
    }

    // 悬浮时显示遮罩
    &:hover {
      .form-editor__file-overlay {
        opacity: 1;
      }
    }
  }

  // 悬浮遮罩层
  &__file-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.25s ease;
    pointer-events: none; // 默认不拦截事件
    backdrop-filter: blur(1px); // 添加轻微模糊效果
  }

  // 悬浮图标
  &__file-icon {
    width: 24px;
    height: 24px;
    background-image: url('../../assets/svgs/edit.svg');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
  }

  &__file-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  &__file-label {
    display: inline-block;
    padding: 8px 16px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background-color: #fafafa;
    font-size: 14px;
    line-height: 22px;
    color: #191919;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #1890ff;
      background-color: #f0f9ff;
    }
  }

  &__file-preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
}
</style>
