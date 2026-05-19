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
  - Must not own or re-export skill core logic.

## Package Manager

This repository uses pnpm for dependency and script management. Prefer `pnpm` commands over `npm` commands.

## Skill Layers

- File Adapters
  - Convert platform-specific file sources into `SkillFile[]`.
  - Examples: `loadSkillFilesFromFs`, `loadSkillFilesFromFileList`, `loadSkillFilesFromDirectoryHandle`.
- Loader
  - Converts `SkillFile[]` into `SkillDefinition`.
  - Lives in `packages/kit/src/skills/skillLoader.ts`.
- Compiler
  - Converts `SkillDefinition[]` into request instructions, tool schemas, runtime tools, and compiler state.
  - Lives in `packages/kit/src/skills/compiler.ts`.
- Plugin Adapter
  - Connects skill compiler output to message engine lifecycle.
  - Lives in `packages/kit/src/message/plugins/skillPlugin.ts`.
- Manager
  - Lives in `packages/kit/src/skills/manager.ts`.
  - Owns write/remove/list/import/select skills.
  - Must not compile request messages or tools.

## Hard Rules

- Do not move skill core modules back under `packages/kit/src/message`.
- `skillPlugin` must not own, cache, query, mutate, or manage skill collections.
- `skillPlugin` receives the current turn's skills through `getSkills()`.
- Do not use `activeSkills` naming in the skill plugin/compiler. The plugin receives skills that are already selected by outside logic.
- Compiler may compile prompts/tools/runtime tools, but must not manage persistence, selection state, or storage.
- File adapters may read platform file sources, but must not parse skill semantics.
- Loader may parse/import skill files into a skill definition, but must not own skill collections.
- Manager may call loaders to import skills and may track selected skills, but must not compile request messages/tools.
- Public skill APIs should be exported from `packages/kit/src/skills/index.ts`.
- `message/plugins/index.ts` must only export message plugin APIs; skill core APIs belong to `src/skills`.

## Current Public API Shape

```ts
skillPlugin({
  getSkills: () => [skill],
})
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
- `packages/kit/src/skills/manager.ts`
- `packages/kit/src/skills/fsSkillFiles.ts`
- `packages/kit/src/skills/browserSkillFiles.ts`
- `packages/kit/src/skills/index.ts`
- `packages/kit/src/skills/README.md`
- `packages/kit/src/skills/test/compiler.test.ts`
- `packages/kit/src/skills/test/skillLoader.test.ts`
- `packages/kit/src/skills/test/skillManager.test.ts`
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

- Add `read_skill_file` size limits and truncation strategy.
- Decide where duplicate skill name diagnostics belong, preferably in manager or selection logic rather than compiler.
- Decide which Manager TODO items in `packages/kit/src/skills/README.md` should be promoted into implementation.
- Keep manager boundaries separate from compiler boundaries.
