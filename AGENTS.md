# Tiny Robot Agent Guide

## Current Focus

The active development track is the skill toolchain in `packages/kit`.

The goal is to make skills a standalone capability template, not a sub-feature of `message`. A skill can be loaded from files, managed later by a manager, and compiled into prompt instructions plus tools for the message engine.

## Current Architecture

- `packages/kit/src/skills`
  - Core skill toolchain modules.
  - Owns skill loading, skill types, compiler helpers, fixtures, and skill tests.
- `packages/kit/src/message/plugins/skillPlugin.ts`
  - Message runtime adapter only.
  - Bridges `getSkills()` into message engine hooks.
- `packages/kit/src/message/plugins`
  - Message plugins and runtime protocols.
  - May re-export skill APIs for compatibility, but must not own skill core logic.

## Package Manager

This repository uses pnpm for dependency and script management. Prefer `pnpm` commands over `npm` commands.

## Skill Layers

- Loader
  - Converts external sources into `SkillDefinition`.
  - Examples: `SkillLoader`, `loadSkillFilesFromFs`, browser file loaders.
- Compiler
  - Converts `SkillDefinition[]` into request instructions, tool schemas, runtime tools, and compiler state.
  - Lives in `packages/kit/src/skills/compiler.ts`.
- Plugin Adapter
  - Connects skill compiler output to message engine lifecycle.
  - Lives in `packages/kit/src/message/plugins/skillPlugin.ts`.
- Manager
  - Not implemented yet.
  - Future responsibility: add/remove/update/list/import/select skills.
  - Must not compile request messages or tools.

## Hard Rules

- Do not move skill core modules back under `packages/kit/src/message`.
- `skillPlugin` must not own, cache, query, mutate, or manage skill collections.
- `skillPlugin` receives the current turn's skills through `getSkills()`.
- Do not use `activeSkills` naming in the skill plugin/compiler. The plugin receives skills that are already selected by outside logic.
- Compiler may compile prompts/tools/runtime tools, but must not manage persistence, selection state, or storage.
- Loader may parse/import skill files, but must not own skill collections.
- Future manager may call loaders to import skills and may track selected skills, but must not compile request messages/tools.
- Public skill APIs should be exported from `packages/kit/src/skills/index.ts`.
- Keep `message/plugins/index.ts` compatibility exports when useful, but prefer `src/skills` as the source of truth.

## Current Public API Shape

```ts
skillPlugin({
  getSkills: () => [skill],
})
```

Skill runtime context uses:

```ts
context.skill
context.skills
```

Compiler state uses:

```ts
state.skills
state.skillNames
state.runtimeTools
```

## Important Files

- `packages/kit/src/skills/types.ts`
- `packages/kit/src/skills/compiler.ts`
- `packages/kit/src/skills/skillLoader.ts`
- `packages/kit/src/skills/fsSkillLoader.ts`
- `packages/kit/src/skills/browserSkillLoader.ts`
- `packages/kit/src/skills/index.ts`
- `packages/kit/src/skills/test/skillLoader.test.ts`
- `packages/kit/src/skills/test/skillPlugin.test.ts`
- `packages/kit/src/skills/test/fixtures`
- `packages/kit/src/message/plugins/skillPlugin.ts`

## Validation

Run from `packages/kit`:

```bash
pnpm lint
pnpm test
pnpm build
```

## Near-Term Next Steps

- Add focused compiler unit tests.
- Add `read_skill_file` size limits and truncation strategy.
- Design `skillManager` under `packages/kit/src/skills`.
- Keep manager boundaries separate from compiler boundaries.
