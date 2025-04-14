<script setup lang="ts">
import { IconMore, IconChevronUp, IconChevronDown } from '@opentiny/vue-icon'
import { TinyButton } from '@opentiny/vue'
import { computed, ref, defineProps, defineEmits, defineExpose, watch, PropType, onMounted } from 'vue'
import { useQuestions } from './composables/useQuestions'
import CommonQuestions from './components/CommonQuestions.vue'
import HotQuestions from './components/HotQuestions.vue'
import type { Category, Question, ThemeType } from './index.type'
import './index.less'

const TinyIconMore = IconMore()
const TinyIconUp = IconChevronUp()
const TinyIconDown = IconChevronDown()

const props = defineProps({
  categories: {
    type: Array as PropType<Category[]>,
    default: () => [
      {
        id: 'basic',
        label: '基础问题',
        icon: 'icon-basic',
        questions: [
          { id: 'b1', text: '什么是弹性云服务器?' },
          { id: 'b2', text: '如何登录到Windows云服务器?' },
          { id: 'b3', text: '弹性公网IP为什么ping不通?' },
          { id: 'b4', text: '云服务器安全组如何配置?' },
          { id: 'b5', text: '如何查看云服务器密码?' },
        ],
      },
      {
        id: 'purchase',
        label: '购买咨询',
        icon: 'icon-purchase',
        questions: [
          { id: 'p1', text: '如何购买弹性云服务器?' },
          { id: 'p2', text: '无法登录弹性云服务器怎么办?' },
          { id: 'p3', text: '云服务器价格怎么计算?' },
          { id: 'p4', text: '如何查看账单详情?' },
          { id: 'p5', text: '如何续费云服务器?' },
        ],
      },
      {
        id: 'usage',
        label: '使用咨询',
        icon: 'icon-usage',
        questions: [
          { id: 'u1', text: '云服务器使用限制与须知' },
          { id: 'u2', text: '使用RDP文件连接Windows实例' },
          { id: 'u3', text: '多用户登录（Windows2016）' },
          { id: 'u4', text: '如何重置云服务器密码?' },
          { id: 'u5', text: '云服务器如何安装软件?' },
        ],
      },
    ],
  },
  floatingQuestions: {
    type: Array as PropType<Question[]>,
    default: () => [
      { id: 'f1', text: '如何注册账号?' },
      { id: 'f2', text: '购买云服务器的付款方式有哪些?' },
      { id: 'f3', text: '更换操作系统需要多久?' },
      { id: 'f4', text: '云服务器可以安装自定义镜像吗?' },
      { id: 'f5', text: '如何连接Linux云服务器?' },
    ],
  },
  initialExpanded: {
    type: Boolean,
    default: false,
  },
  modalWidth: {
    type: String,
    default: '640px',
  },
  theme: {
    type: String as () => ThemeType,
    default: 'light',
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true,
  },
  maxFloatingItems: {
    type: Number,
    default: 5,
  },
  showCategoryIcons: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showPopup: {
    type: Boolean,
    default: true,
  },
  wrapQuestions: {
    type: Boolean,
    default: false,
  },
})

// 切换问题展示
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const emit = defineEmits([
  'update:showPopup',
  'update:wrapQuestions',
  'question-click',
  'toggle-popup',
  'toggle-wrap',
  'select-category',
])

const categories = computed(() => props.categories)
const isExpanded = ref(false)

const { modalVisible, currentTheme, isWrapQuestions, setActiveCategory, openModal, closeModal, setTheme, refreshData } =
  useQuestions(categories)

// 同步 props 到内部状态
watch(
  () => props.showPopup,
  (value) => {
    modalVisible.value = value
  },
)

watch(
  () => props.wrapQuestions,
  (value) => {
    isWrapQuestions.value = value
  },
)

watch(
  () => props.theme,
  (value) => {
    setTheme(value)
  },
)

// 同步内部状态回 props
watch(modalVisible, (value) => {
  emit('update:showPopup', value)
  emit('toggle-popup', value)
})

watch(isWrapQuestions, (value) => {
  emit('update:wrapQuestions', value)
  emit('toggle-wrap', value)
})

// 处理问题点击
const handleQuestionClick = (question: Question) => {
  console.log(question)
  closeModal()
  emit('question-click', question)
}

// 处理分类选择
const handleCategorySelect = (category: Category) => {
  if (category) {
    setActiveCategory(category.id)
    emit('select-category', category)
  }
}

// 处理按钮隐藏
const showExpandButton = ref(false)

const handleShowExpandButton = (value: boolean) => {
  showExpandButton.value = value
}

// 组件挂载时初始化主题
onMounted(() => {
  document.documentElement.setAttribute('data-theme', currentTheme.value)
})

// 暴露实例方法
defineExpose({
  openModal,
  closeModal,
  setActiveCategory,
  refreshData,
})
</script>

<template>
  <div class="tr-question-container" :class="[`theme-${theme}`]" :data-theme="theme">
    <!-- 热门问题弹窗触发按钮 -->
    <div class="tr-question-trigger" @click="openModal">
      <TinyButton :icon="TinyIconMore" type="text" />
    </div>

    <!-- 热门问题弹窗 -->
    <HotQuestions
      :visible="modalVisible"
      :categories="categories"
      :modal-width="modalWidth"
      :show-category-icons="showCategoryIcons"
      :loading="loading"
      :close-on-click-outside="closeOnClickOutside"
      :wrap-questions="isWrapQuestions"
      @update:visible="modalVisible = $event"
      @close="modalVisible = false"
      @question-click="handleQuestionClick"
      @select-category="handleCategorySelect"
    />

    <!-- 常见问题胶囊 -->
    <CommonQuestions
      :isExpanded="isExpanded"
      :questions="floatingQuestions"
      :max-visible="maxFloatingItems"
      @show-expand-button="handleShowExpandButton"
      @question-click="handleQuestionClick"
    />

    <!-- 常规问题完整内容出发按钮 -->

    <div v-if="showExpandButton" class="tr-question-wrap-trigger" @click="toggleExpand">
      <TinyButton :icon="isExpanded ? TinyIconDown : TinyIconUp" type="text" />
    </div>
  </div>
</template>
