import type { Component } from 'vue'

export interface ModelOption {
  value: string
  label?: string
  providerId?: string
  icon?: Component
  disabled?: boolean
}
