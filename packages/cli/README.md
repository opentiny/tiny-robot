# @opentiny/tiny-robot-cli

A lightweight CLI for scaffolding TinyRobot-based product projects.

## Usage

```bash
npx @opentiny/tiny-robot-cli create my-app
pnpm dlx @opentiny/tiny-robot-cli create my-app
npx @opentiny/tiny-robot-cli add chat --yes
```

## Options

- `-t, --template <name>`: template name; `basic` generates the Chat Basic project
- `-h, --help`: show help

`create` is an overall project scaffold. The `basic` template is aligned with `packages/chat-basic` and is copied into a new project.

`add chat` is a local feature injection for an existing Vue project. It creates the isolated `src/tiny-robot-chat/` feature from `packages/chat-add`, adds the runtime dependencies (including `@vueuse/core`), imports the feature CSS, and safely adds the MCP proxy. Existing files with different contents are reported as conflicts and are never silently overwritten.

By default, `add chat` mounts `TinyRobotChat` into a standard `src/App.vue` when a safe template and script setup block are available, so the generated project has the same floating AI trigger as `chat-add`. Use `--no-mount` to keep `App.vue` unchanged and print the mount snippet. Use `--dry-run` to inspect the plan without changing files and `--yes` to skip prompts:

```bash
npx @opentiny/tiny-robot-cli add chat --dry-run
npx @opentiny/tiny-robot-cli add chat --yes
npx @opentiny/tiny-robot-cli add chat --yes --no-mount
```

The feature adds or preserves these dependencies:

- `@opentiny/tiny-robot`
- `@opentiny/tiny-robot-chat`
- `@opentiny/tiny-robot-kit`
- `@opentiny/tiny-robot-svgs`
- `@vueuse/core`

Configure the generated `.env` file with the provider API URL and API key before starting the project.

## Template Documentation

Template-specific features and environment variables are documented in each template directory, for example:

- `packages/cli/templates/basic/README.md`
