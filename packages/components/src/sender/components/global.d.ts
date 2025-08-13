declare global {
  interface Selection {
    getComposedRanges?: (options?: { shadowRoots: ShadowRoot[] } | ShadowRoot) => StaticRange[]
  }

  interface ShadowRoot {
    getSelection?: () => Selection
  }
}

export {}
