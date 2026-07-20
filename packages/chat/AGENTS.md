# AGENTS.md

## Scope

- This file applies to `packages/chat` only.
- `packages/chat` is the standalone chat suite package `@opentiny/tiny-robot-chat`.
- Do not use `packages/cli` or `packages/cli/templates/chat` as implementation reference.

## Package Boundaries

- `packages/components`: UI primitives and shared styles.
- `packages/kit`: runtime core, including message, conversation, provider, and storage logic.
- `packages/chat`: application assembly and UI adapter for chat experiences.
- `packages/test`: Playwright-based verification sandbox.

## Design Rules

- Build the chat suite on top of existing `components` and `kit` capabilities.
- Do not change existing props in shared base components.
- New props are allowed only when backward compatibility is preserved.
- Prefer package-local wrappers and composition over intrusive shared-component changes.
- Keep exported chat API explicit: `props`, `emits`, `slots`, and exported types.

## Source Of Truth

- Current design, API, Demo evidence, and migration roadmap: `packages/chat/docs/architecture.md`
- Review decisions, open questions, and acceptance criteria: `packages/chat/docs/review-checklist.md`


## Build And Test

- Before any e2e or Playwright verification, run `pnpm build:components` first.
- If shared components were rebuilt, restart any running test server before testing again.
- Reason: `packages/test/playwright.config.ts` may reuse an existing server outside CI.

## Recommended Flow

1. Run `pnpm build:components`.
2. Stop any existing `packages/test` dev server or Playwright web server.
3. Start a fresh server with `pnpm -F tiny-robot-test dev`, or let Playwright start one.
4. Run `pnpm -F tiny-robot-test test`.

## Change Checklist

- Check whether the change belongs in `packages/chat`, `packages/components`, or `packages/kit`.
- If shared package behavior changes, verify downstream impact before finishing.
- Ignore `packages/cli` when making chat suite decisions.
