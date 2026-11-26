import axios from 'axios'
import { createMockAxiosAdapter } from './axios-adapter'
import { createMockHandlers } from './handlers'

export function setupBrowserMock(
  mockServerHost = import.meta.env.VITE_MOCK_SERVER_HOST || '/mock',
) {
  axios.defaults.adapter = createMockAxiosAdapter(createMockHandlers(), {
    mockServerHost,
  })
}
