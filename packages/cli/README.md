# @opentiny/tiny-robot-cli

A lightweight CLI for scaffolding TinyRobot-based product projects.

## Usage

```bash
npx @opentiny/tiny-robot-cli create my-app
pnpm dlx @opentiny/tiny-robot-cli create my-app
npx @opentiny/tiny-robot-cli add chat --yes
```

## Options

- `-t, --template <name>`: template name; `basic` generates the Chat Basic project and `chat` generates the standalone Chat project
- `--runtime-version <version>`: override the TinyRobot runtime version used in the generated or updated project
- `-h, --help`: show help

`create` scaffolds a new project. The `basic` template creates the Chat Basic project, and the `chat` template creates a standalone Chat project.

`add chat` creates the isolated `src/tiny-robot-chat/` feature from `packages/cli/templates/chat`, adds the runtime dependencies (including `@vueuse/core@13.9.0`), and merges `.env.example`. Existing files with different contents are reported as conflicts and are never silently overwritten. If a write fails, the CLI attempts to roll back the changes that were already applied and reports any residual paths.

`add chat` never modifies `src/main.ts`, `src/main.js`, `src/App.vue`, or `vite.config.*`, and it does not mount the component automatically. Render `TinyRobotChat` in the host application and add the MCP proxy manually; the generated component imports its required styles. Interactive mode shows the plan and asks for confirmation; `--dry-run` previews the plan without changing files and `--yes` applies it without confirmation:

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

An existing stable dependency range is preserved when it accepts the target runtime version; for example, `^0.5.1` is kept for a stable `0.5.3` target. Prerelease targets always use the exact requested version. The override follows the same prerelease-exact and stable-caret rules.

Copy the generated `.env.example` to `.env.local`, then configure the provider API key before starting the project. Optional provider endpoints are configured with `VITE_QWEN_API_URL` and `VITE_DEEPSEEK_API_URL`; the MCP endpoint uses `VITE_AMAP_MCP_URL`. `add chat` does not create or modify `.env`. `VITE_*` values are embedded in the client bundle, so do not use production keys; production deployments must protect provider credentials behind a server-side proxy.

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
- `packages/cli/templates/chat/README.md`
