import { App } from 'vue'
import Sender from './sender.vue'
import type {
  SenderProps,
  SenderEmits,
  ThemeType,
  InputMode,
  SubmitTrigger,
  SpeechConfig,
  ButtonConfig,
  SpeechState,
  SpeechHookOptions,
  InputHandler,
  SubmitHandler,
  FileHandler,
} from './types'

Sender.name = 'TinySender'

const install = function <T>(app: App<T>) {
  app.component(Sender.name!, Sender)
}

Sender.install = install

export {
  Sender,
  type SenderProps,
  type SenderEmits,
  type ThemeType,
  type InputMode,
  type SubmitTrigger,
  type SpeechConfig,
  type ButtonConfig,
  type SpeechState,
  type SpeechHookOptions,
  type InputHandler,
  type SubmitHandler,
  type FileHandler,
}

export default Sender as typeof Sender & { install: typeof install }
