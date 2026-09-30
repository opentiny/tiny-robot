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

`add chat` is an all-in-one feature injection for an existing Vue project. It creates the isolated `src/tiny-robot-chat/` feature from `packages/cli/templates/chat`, adds the runtime dependencies (including `@vueuse/core@13.9.0`), and merges `.env.example`. The operation checks all files, dependencies, and environment variables before applying changes, and rolls back the complete operation if writing fails. Existing files with different contents are reported as conflicts and are never silently overwritten.

`add chat` never modifies `src/main.ts`, `src/main.js`, `src/App.vue`, or `vite.config.*`. Import the generated styles, render `TinyRobotChat`, and add the MCP proxy manually. Interactive mode asks once for confirmation; `--dry-run` prints the complete plan without changing files and `--yes` skips confirmation:

```bash
npx @opentiny/tiny-robot-cli add chat --dry-run
npx @opentiny/tiny-robot-cli add chat --yes
npx @opentiny/tiny-robot-cli add chat --yes --runtime-version 0.5.2-rc.2
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

Copy the generated `.env.example` to `.env.local`, then configure the provider API key before starting the project. Provider API URL variables are optional overrides and can be added when a proxy or custom endpoint is required. `add chat` does not create or modify `.env`. `VITE_*` values are embedded in the client bundle, so do not use production keys; production deployments must protect provider credentials behind a server-side proxy.

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
