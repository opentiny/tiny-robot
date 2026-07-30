import { App } from 'vue'
import Attachments from './index.vue'

Attachments.name = 'TrAttachments'

const install = function <T>(app: App<T>) {
  app.component(Attachments.name!, Attachments)
}

Attachments.install = install

export default Attachments as typeof Attachments & { install: typeof install }

export { ATTACHMENTS_CONTENT_CONTEXT_KEY } from './context'
export type { AttachmentsContentContext, AttachmentsContentRegistration, AttachmentsContentSourceId } from './context'
