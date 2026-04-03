# create-tiny-robot

A lightweight CLI for scaffolding TinyRobot-based product projects.

## Usage

```bash
pnpm create tiny-robot@latest my-app
npm create tiny-robot@latest my-app
```

Or use `dlx` directly:

```bash
pnpm dlx create-tiny-robot@latest my-app
npx create-tiny-robot@latest my-app
```

For local development in this monorepo:

```bash
pnpm --filter create-tiny-robot start my-app
node ./packages/cli/bin/cli.js my-app
```

## Options

- `-t, --template <name>`: template name, currently supports `basic`
- `-h, --help`: show help

## Output

The `basic` template includes:

- Vue 3 + Vite + TypeScript
- TinyRobot dependencies
- AI chat page with `TrBubbleList` + `TrSender`
- `useMessage` data flow with SSE `responseProvider`
- Assistant markdown rendering support
