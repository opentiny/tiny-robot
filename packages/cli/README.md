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

`add chat` adds a self-contained floating Chat component, including its runtime, UI configuration, composables, component-scoped styles, and supporting components. It updates these OpenTiny dependencies to `0.5.2-alpha.10`:

- `@opentiny/tiny-robot`
- `@opentiny/tiny-robot-chat`
- `@opentiny/tiny-robot-kit`
- `@opentiny/tiny-robot-svgs`

It also adds `@vueuse/core@13.9.0`. The command does not modify the application entry file or create `src/index.css`. Configure a private environment file from the generated `.env.example` before starting the project; the CLI never creates or modifies `.env`.

## Template Documentation

Template-specific features and environment variables are documented in each template directory, for example:

- `packages/cli/templates/basic/README.md`
