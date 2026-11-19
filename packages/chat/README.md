# @opentiny/tiny-robot-chat

TinyRobot Chat provides Vue 3 components for building an AI chat page or embedding an assistant in an application. `TrChat` combines conversation history, messages, and a composer with a chat runtime. Use `TrChatUI` to supply your own conversation data and handle UI events.

## Installation

In a Vue 3.3.11 or later Vue 3 project, install the Chat package and the base components package.

```sh
npm install @opentiny/tiny-robot-chat @opentiny/tiny-robot
```

Import both stylesheets in your application entry point.

```ts
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
```

## Usage

Configure your model service with `useChatRuntime` and pass the returned runtime to `TrChat`. The quick start includes a complete `App.vue` example.

- [Quick start](https://docs.opentiny.design/tiny-robot/suites/quick-start)
- [UI configuration and customization](https://docs.opentiny.design/tiny-robot/suites/chat)
- [Runtime configuration](https://docs.opentiny.design/tiny-robot/suites/chat-runtime)

## License

MIT
