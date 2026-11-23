import { defineConfig, presetAttributify, presetMini } from 'unocss'

const breakpoints = {
  'sm': '641px', // 手机（小屏，iPhone SE、Mini 等）
  'md': '769px', // 平板（竖屏，iPad Mini、iPad）
  'lg': '1025px', // 平板横屏 / 小型笔记本（iPad 横屏、Surface Go）
  'xl': '1367px', // 笔记本主流分辨率（MacBook Air、13寸笔记本）
  '2xl': '1441px', // 高分辨率笔记本（MacBook Pro 14、部分高清显示器）
  '3xl': '1921px', // 全高清显示器 / 桌面大屏（1080p 显示器）
}

export default defineConfig({
  presets: [
    presetMini({
      breakpoints,
    }),
    presetAttributify(),
  ],
  variants: [
    (matcher) => {
      const match = matcher.match(/^max-([a-z0-9]+):/)
      if (match) {
        const bp = match[1] as keyof typeof breakpoints

        const value = breakpoints[bp]
        if (!value) {
          return
        }

        return {
          matcher: matcher.replace(`max-${bp}:`, ''),
          parent: `@media (max-width: ${value})`,
        }
      }
    },
  ],
  theme: {
    breakpoints,
  },
  shortcuts: {
    'line-clamp-2': 'overflow-hidden text-ellipsis [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box]',
  },
  safelist: [
    'line-clamp-2',
  ],
})
