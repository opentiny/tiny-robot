// Geometry and paint values from the supplied QuickAssist SVG assets.
// Build DOM SVG directly: no image request, HTML sink or runtime XML parser.
const namespace = 'http://www.w3.org/2000/svg'
const aiPath =
  'M6.58714 2.44734L6.63152 2.2765C6.7605 1.78002 7.46422 1.77652 7.59812 2.27168L7.66962 2.53634C8.43147 5.17188 10.5532 7.22438 13.2155 7.8947C13.7194 8.02156 13.7194 8.73744 13.2156 8.8644C10.4624 9.5582 8.2941 11.7267 7.60096 14.4796C7.47412 14.9835 6.75822 14.9835 6.63126 14.4797C5.93746 11.7265 3.769 9.5582 1.01605 8.86506C0.512205 8.73822 0.512125 8.02232 1.01594 7.89536C3.71242 7.21586 5.8519 5.12012 6.58714 2.44734ZM12.9628 11.9643L12.9746 11.9186C13.0778 11.5214 13.6408 11.5186 13.7479 11.9147L13.7658 11.9811C13.9435 12.5957 14.4388 13.0749 15.0595 13.2312C15.4626 13.3326 15.4627 13.9054 15.0596 14.0069C14.4177 14.1687 13.9115 14.6749 13.7499 15.3168C13.6484 15.7199 13.0757 15.7199 12.9741 15.3169C12.8123 14.6749 12.3061 14.1687 11.6642 14.0071C11.2611 13.9056 11.2611 13.3329 11.6641 13.2314C12.2929 13.0729 12.7924 12.5836 12.9628 11.9643Z'
const sendPath =
  'M22.5 12C22.5 6.20102 17.799 1.5 12 1.5C6.20102 1.5 1.5 6.20102 1.5 12C1.5 17.799 6.20102 22.5 12 22.5C17.799 22.5 22.5 17.799 22.5 12ZM3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12ZM7.22602 12.5835C7.5189 12.8764 7.99378 12.8764 8.28668 12.5835L11.249 9.6212L11.249 16.4999C11.249 16.9141 11.5848 17.2499 11.999 17.2499C12.4132 17.2499 12.749 16.9141 12.749 16.4999L12.749 9.6212L15.7113 12.5835C16.0042 12.8764 16.4791 12.8764 16.772 12.5835C17.0649 12.2906 17.0649 11.8158 16.772 11.5229L12.5293 7.28022C12.2364 6.98732 11.7616 6.98732 11.4687 7.28022L7.22602 11.5229C6.93312 11.8158 6.93312 12.2906 7.22602 12.5835Z'
const palettes = {
  light: {
    coordinates: {
      x1: '14.4994431',
      x2: '4.99943829',
      y1: '15.4998856',
      y2: '3.49988651',
    },
    stops: [
      ['0.0282627884', 'rgb(253,140,110)'],
      ['0.451714516', 'rgb(217,83,248)'],
      ['0.667800486', 'rgb(141,35,255)'],
      ['1', 'rgb(83,2,252)'],
    ],
  },
  dark: {
    coordinates: {
      x1: '15.3618937',
      x2: '-1.50006199',
      y1: '8.76068878',
      y2: '9.00000572',
    },
    stops: [
      ['0', 'rgb(253,133,103)'],
      ['0.367787778', 'rgb(238,107,255)'],
      ['0.797216117', 'rgb(192,120,255)'],
    ],
  },
} as const

let iconId = 0
function node<K extends keyof SVGElementTagNameMap>(document: Document, tag: K, attrs: Record<string, string>) {
  const element = document.createElementNS(namespace, tag)
  for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value)
  return element
}
function svg(document: Document, size: number, variant: string) {
  return node(document, 'svg', {
    viewBox: `0 0 ${size} ${size}`,
    fill: 'none',
    class: `tr-quick-assist__icon--${variant}`,
    'aria-hidden': 'true',
    focusable: 'false',
  })
}
export function makeAiIcon(document: Document, mode: 'light' | 'dark'): SVGSVGElement {
  const icon = svg(document, 16, mode)
  let id: string
  do {
    id = `tr-quick-assist-ai-${++iconId}`
  } while (document.getElementById(id))
  const palette = palettes[mode]
  const gradient = node(document, 'linearGradient', {
    id,
    ...palette.coordinates,
    gradientUnits: 'userSpaceOnUse',
  })
  for (const [offset, color] of palette.stops) {
    gradient.append(node(document, 'stop', { offset, 'stop-color': color }))
  }
  const defs = node(document, 'defs', {})
  defs.append(gradient)
  icon.append(defs, node(document, 'path', { d: aiPath, fill: `url(#${id})`, 'fill-rule': 'evenodd' }))
  return icon
}
export function makeSendIcon(document: Document, variant: 'black' | 'gray'): SVGSVGElement {
  const icon = svg(document, 24, variant)
  icon.append(
    node(document, 'path', {
      d: sendPath,
      fill: variant === 'black' ? 'rgb(25,25,25)' : 'rgb(194,194,194)',
      'fill-rule': 'evenodd',
    }),
  )
  return icon
}
