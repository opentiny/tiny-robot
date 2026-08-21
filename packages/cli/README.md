# @opentiny/tiny-robot-cli

A lightweight CLI for scaffolding TinyRobot-based product projects.

## Usage

```bash
npx @opentiny/tiny-robot-cli create my-app
pnpm dlx @opentiny/tiny-robot-cli create my-app
npx @opentiny/tiny-robot-cli add chat
```

## Options

- `-t, --template <name>`: template name, currently supports `basic`
- `-h, --help`: show help

`add chat` copies the complete Chat example from the `chat-add` template, including its runtime, UI configuration, composables, components, and styles. It updates these dependencies to `0.5.2-alpha.10`:

- `@opentiny/tiny-robot`
- `@opentiny/tiny-robot-chat`
- `@opentiny/tiny-robot-kit`
- `@opentiny/tiny-robot-svgs`

Configure the generated `.env` file with the provider API URL and API key before starting the project.

## Template Documentation

Template-specific features and environment variables are documented in each template directory, for example:

- `packages/cli/templates/basic/README.md`
