import { createMockHandlers } from './handlers'
import { startMockServer } from './server'

startMockServer(createMockHandlers())
