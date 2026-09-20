import type { ExtensionCardGridItem } from '../index.type'
import type { ExtensionManagerSectionKey } from '../index.type'

export interface ExtensionManagerSectionState {
  key: ExtensionManagerSectionKey
  title: string
  items: ExtensionCardGridItem[]
}
