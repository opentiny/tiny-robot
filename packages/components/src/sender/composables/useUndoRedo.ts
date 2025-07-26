export interface UseUndoRedoOptions<T> {
  onRemoveHistory?: (list: T[]) => void
}

export function useUndoRedo<T>(initial: T, options: UseUndoRedoOptions<T> = {}) {
  let undoStack: T[] = []
  let redoStack: T[] = []
  let currentValue: T = initial

  const commit = (newValue: T) => {
    undoStack.push(currentValue)
    currentValue = newValue
    if (redoStack.length) {
      options.onRemoveHistory?.(redoStack)
    }
    redoStack = []
  }

  const undo = () => {
    if (undoStack.length) {
      redoStack.push(currentValue)
      currentValue = undoStack.pop() as T

      return currentValue
    }

    return null
  }

  const redo = () => {
    if (redoStack.length) {
      undoStack.push(currentValue)
      currentValue = redoStack.pop() as T

      return currentValue
    }

    return null
  }

  const clear = () => {
    if (undoStack.length) {
      options.onRemoveHistory?.(undoStack)
    }
    if (redoStack.length) {
      options.onRemoveHistory?.(redoStack)
    }
    undoStack = []
    redoStack = []
  }

  const get = () => currentValue

  return { commit, undo, redo, clear, get }
}
