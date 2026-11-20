import assert from 'node:assert/strict'
import test from 'node:test'

import { collectPeerDependencies } from './test-package-install.js'

test('collects required external peers and combines duplicate ranges', () => {
  const packages = [
    {
      packageJson: {
        peerDependencies: {
          '@opentiny/tiny-robot-kit': '^1.0.1',
          'markdown-it': '^14.1.0',
          vue: '^3.3.11',
          'optional-editor': '^2.0.0',
        },
        peerDependenciesMeta: {
          'optional-editor': { optional: true },
        },
      },
    },
    {
      packageJson: {
        peerDependencies: {
          vue: '>=3.0.0',
          dompurify: '^3.3.1',
        },
      },
    },
  ]

  assert.deepEqual(collectPeerDependencies(packages, new Set(['@opentiny/tiny-robot-kit'])), {
    'markdown-it': '^14.1.0',
    vue: '^3.3.11 >=3.0.0',
    dompurify: '^3.3.1',
  })
})
