import { installVanillaStyle } from '../styles/install'
import { createTrace as create } from './core/createTrace'
import type { TrajectoryInstance, TrajectoryOptions } from './types'

/** Browser bundle entry with reference-counted, document-local automatic styles. */
export function createTrace(options: TrajectoryOptions): TrajectoryInstance {
  const instance = create(options)
  let release: (() => void) | undefined
  try {
    release = installVanillaStyle(options.container.ownerDocument)
  } catch (error) {
    instance.destroy()
    throw error
  }
  let released = false
  const destroy = instance.destroy
  return {
    ...instance,
    destroy: () => {
      if (released) return
      released = true
      try {
        destroy()
      } finally {
        release?.()
      }
    },
  }
}

export const createTrajectory = createTrace
