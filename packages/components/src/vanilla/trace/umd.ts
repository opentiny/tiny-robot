import { installVanillaStyle } from '../styles/install'
import { createTrace as create } from './core/createTrace'
import type { TrajectoryInstance, TrajectoryOptions } from './types'

/** Browser bundle entry with reference-counted, document-local automatic styles. */
export function createTrace(options: TrajectoryOptions): TrajectoryInstance {
  const release = installVanillaStyle(options.container.ownerDocument)
  let released = false
  let instance: TrajectoryInstance
  try {
    instance = create(options)
  } catch (error) {
    release()
    throw error
  }
  const destroy = instance.destroy
  return {
    ...instance,
    destroy: () => {
      if (released) return
      released = true
      try {
        destroy()
      } finally {
        release()
      }
    },
  }
}

export const createTrajectory = createTrace
