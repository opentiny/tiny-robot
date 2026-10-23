export type VanillaResolvedColorMode = 'light' | 'dark'
export type VanillaColorMode = VanillaResolvedColorMode | 'auto'

export type VanillaThemeSource =
  | {
      type: 'attribute'
      selector?: string
      attribute?: string
      values?: { light?: string; dark?: string }
      defaultMode?: VanillaResolvedColorMode
    }
  | {
      type: 'class'
      selector?: string
      darkClass?: string
      lightClass?: string
      defaultMode?: VanillaResolvedColorMode
    }

export type VanillaThemeConfig =
  | { colorMode: VanillaColorMode; source?: never }
  | { source: VanillaThemeSource; colorMode?: never }
  | { colorMode?: never; source?: never }
