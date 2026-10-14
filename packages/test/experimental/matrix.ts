import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const EXAMPLE_IDS = [
  'basic',
  'layout-presets',
  'welcome-prompts',
  'sender-options',
  'bubble-options',
  'runtime-error',
  'history-groups',
  'slots-basic',
  'right-aside-panel',
  'floating-layout',
  'responsive-layout',
  'controlled-ui',
  'runtime-actions',
  'runtime-before-send',
  'runtime-composer',
  'runtime-conversations',
  'runtime-send',
  'runtime-adapter',
] as const

export type MatrixStatus = 'direct' | 'adapted' | 'partial' | 'blocked' | 'not-applicable' | 'not-run'

export interface MatrixResult {
  readonly id: (typeof EXAMPLE_IDS)[number]
  readonly group: 'Chat' | 'Runtime'
  readonly baseline: string
  readonly behavior: { readonly status: MatrixStatus; readonly evidence: string }
  readonly visual: { readonly status: MatrixStatus; readonly evidence: string }
  readonly browsers: Readonly<
    Record<'chromium' | 'firefox' | 'webkit', { readonly status: MatrixStatus; readonly evidence: string }>
  >
}

export interface CompatibilityMatrix {
  readonly schemaVersion: 1
  readonly generatedAt: string
  readonly examples: readonly MatrixResult[]
  readonly summary: {
    readonly behaviorCoverage: Coverage
    readonly browserValidation: {
      readonly chromiumExamplesPassed: number
      readonly chromiumExamplesTotal: number
      readonly percent: number
      readonly uiAssertions: boolean
      readonly interactionAssertions: boolean
      readonly pixelDiff: boolean
    }
  }
}

export interface Coverage {
  readonly covered: number
  readonly applicable: number
  readonly percent: number
}

const matrixPath = fileURLToPath(
  new URL('../../../docs/experiments/tr-chat-web-component-matrix.json', import.meta.url),
)

export function readCompatibilityMatrix(): CompatibilityMatrix {
  return JSON.parse(readFileSync(matrixPath, 'utf8')) as CompatibilityMatrix
}

export function calculateCoverage(examples: readonly MatrixResult[]): Coverage {
  const applicableResults = examples.filter(({ behavior }) => !['not-applicable', 'not-run'].includes(behavior.status))
  const covered = applicableResults.filter(({ behavior }) => ['direct', 'adapted'].includes(behavior.status)).length

  return {
    covered,
    applicable: applicableResults.length,
    percent: applicableResults.length === 0 ? 0 : Math.round((covered / applicableResults.length) * 10_000) / 100,
  }
}
