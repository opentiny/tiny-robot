import type { MockMethod } from './dispatch'
import froms from '../views/form/step/mock'
import application from './application'
import { createBackendMocks } from './backend'
import board from './board'
import boardHome from './board-home'
import { createEditorMocks } from './editor'
import list from './list'
import profile from './profile'
import project from './project'
import user from './user'

export function createMockHandlers(): MockMethod[] {
  return [
    ...createBackendMocks(),
    ...list,
    ...project,
    ...froms,
    ...profile,
    ...board,
    ...boardHome,
    ...user,
    ...application,
    ...createEditorMocks(),
  ]
}
