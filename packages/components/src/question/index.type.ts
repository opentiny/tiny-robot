export interface Category {
  id: string
  label: string
  icon?: string
  questions: Question[]
}

export interface Question {
  id: string
  text: string
  keywords?: string[]
}

export interface TrQuestionPanel {
  openModal: () => void
  closeModal: () => void
  toggleFloating: () => void
  setActiveCategory: (categoryId: string) => void
  refreshData: () => Promise<void>
}

export type ThemeType = 'light' | 'dark'
