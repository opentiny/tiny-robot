import { Component, VNode } from 'vue'

export interface IconButtonProps {
  icon: VNode | Component
  size?: string
  svgSize?: string
}
