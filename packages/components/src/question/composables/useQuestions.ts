import { ref, computed, Ref, watch } from 'vue'
import type { Category, ThemeType } from '../index.type'

export function useQuestions(categories: Ref<Category[]> = ref([])) {
  // 当前激活的分类ID
  const activeCategory = ref<string>('')

  // 是否展开悬浮面板
  const isFloatingExpanded = ref(false)

  // 弹窗是否可见
  const modalVisible = ref(false)

  // 当前主题
  const currentTheme = ref<ThemeType>('light')

  // 计算当前激活分类的问题列表
  const activeQuestions = computed(() => {
    if (!activeCategory.value && categories.value.length > 0) {
      return categories.value[0].questions
    }

    const category = categories.value.find((cat) => cat.id === activeCategory.value)
    return category ? category.questions : []
  })

  // 设置激活的分类
  const setActiveCategory = (categoryId: string) => {
    activeCategory.value = categoryId
  }

  // 打开弹窗
  const openModal = () => {
    modalVisible.value = true
  }

  // 关闭弹窗
  const closeModal = () => {
    modalVisible.value = false
  }

  // 切换悬浮面板展开状态
  const toggleFloating = () => {
    isFloatingExpanded.value = !isFloatingExpanded.value
  }

  // 防止滚动穿透的函数
  const toggleBodyScroll = (isOpen: boolean) => {
    const body = document.body

    if (isOpen) {
      // 保存当前滚动位置
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      body.style.position = 'fixed'
      body.style.width = '100%'
      body.style.top = `-${scrollTop}px`
      body.style.overflowY = 'scroll' // 保持滚动条宽度，防止页面抖动
      body.classList.add('tr-modal-open')
    } else {
      body.style.position = ''
      body.style.width = ''
      body.style.top = ''
      body.style.overflowY = ''
      body.classList.remove('tr-modal-open')
    }
  }

  // 监听弹窗变化应用滚动锁定
  watch(modalVisible, (value) => {
    toggleBodyScroll(value)
  })

  // 切换主题
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', currentTheme.value)
  }

  // 设置主题
  const setTheme = (theme: ThemeType) => {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
  }

  // 刷新数据（模拟异步操作）
  const refreshData = async () => {
    // 这里可以添加实际的数据刷新逻辑
    return Promise.resolve()
  }

  return {
    activeCategory,
    isFloatingExpanded,
    modalVisible,
    currentTheme,
    activeQuestions,
    setActiveCategory,
    openModal,
    closeModal,
    toggleFloating,
    toggleTheme,
    setTheme,
    refreshData,
    toggleBodyScroll,
  }
}
