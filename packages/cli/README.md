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
- `--runtime-version <version>`: override the TinyRobot runtime version for local CLI development or diagnosis
- `-h, --help`: show help

`create` is an overall project scaffold. The `basic` template is aligned with `packages/chat-basic` and is copied into a new project.

`add chat` is a local feature injection for an existing Vue project. It creates the isolated `src/tiny-robot-chat/` feature from `packages/cli/templates/chat`, adds the runtime dependencies (including `@vueuse/core@13.9.0`), and imports feature-scoped CSS that does not reset the host document. It does not modify the host project's Vite configuration. Existing files with different contents are reported as conflicts and are never silently overwritten.

By default, `add chat` mounts `TinyRobotChat` into a standard `src/App.vue` when a safe template and script setup block are available, so the generated project includes the floating AI trigger. Use `--no-mount` to keep `App.vue` unchanged and print the mount snippet. Use `--dry-run` to inspect the plan without changing files and `--yes` to skip prompts:

```bash
npx @opentiny/tiny-robot-cli add chat --dry-run
npx @opentiny/tiny-robot-cli add chat --yes
npx @opentiny/tiny-robot-cli add chat --yes --no-mount
```

The feature adds or preserves these dependencies. Compatible versions are kept, and higher versions are not downgraded:

- `@opentiny/tiny-robot`
- `@opentiny/tiny-robot-chat`
- `@opentiny/tiny-robot-kit`
- `@opentiny/tiny-robot-svgs`
- `@vueuse/core`

Both `create` and `add chat` derive TinyRobot runtime dependency versions from the CLI package version. Prerelease CLI versions use the same exact runtime version, while stable CLI versions use a caret range:

```text
CLI 0.5.2-alpha.15 -> runtime 0.5.2-alpha.15
CLI 0.5.2-beta.3   -> runtime 0.5.2-beta.3
CLI 0.5.3          -> runtime ^0.5.3
```

An existing dependency range is preserved when it accepts the target runtime version; for example, `^0.5.1` is kept for a stable `0.5.3` target. Use `--runtime-version` only when testing an unpublished CLI checkout or diagnosing version resolution. The override follows the same prerelease-exact and stable-caret rules.

Copy the generated `.env.example` to `.env.local`, then configure the provider API URL and API key before starting the project. `add chat` does not create or modify `.env`.

The Model Context MCP example uses `/modelcontextprotocol-mcp`. Add this proxy manually to the existing `vite.config.*` file under `server.proxy`, then restart Vite:

```ts
server: {
  proxy: {
    '/modelcontextprotocol-mcp': {
      target: 'https://modelcontextprotocol.io/mcp',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/modelcontextprotocol-mcp/, ''),
    },
  },
},
```

## Template Documentation

Template-specific features and environment variables are documented in each template directory, for example:

- `packages/cli/templates/basic/README.md`
