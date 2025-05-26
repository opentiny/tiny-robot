import { Component, VNode } from 'vue'

export interface SuggestionPillBaseItem {
  id: string
}

export type SuggestionPillItem = SuggestionPillBaseItem &
  ({ text: string; icon?: VNode | Component } | { text?: string; icon: VNode | Component })

export interface SuggestionPillProps {
  items: SuggestionPillItem[]
}
