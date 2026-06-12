export interface BodyInteractionState {
  cursor: string
  userSelect: string
}

export function lockBodyInteraction(body: HTMLElement, cursor: string): BodyInteractionState {
  const state = {
    cursor: body.style.cursor,
    userSelect: body.style.userSelect,
  }

  body.style.cursor = cursor
  body.style.userSelect = 'none'

  return state
}

export function restoreBodyInteraction(body: HTMLElement, state: BodyInteractionState): void {
  body.style.cursor = state.cursor
  body.style.userSelect = state.userSelect
}
