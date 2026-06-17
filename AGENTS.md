# Tiny Robot Agent Guide

## Current Focus

The active development track is the skill toolchain in `packages/kit`.

The goal is to make skills a standalone capability template, not a sub-feature of `message`. A skill can be loaded from sources, persisted or restored by storage, selected by application state, and connected to prompt instructions plus runtime tools for the message engine.

## Current Architecture

- `packages/kit/src/skills`
  - Core skill toolchain modules.
  - Owns skill loading, skill types, capabilities, storage, and skill tests.
  - Browser-safe skill APIs are exported from `@opentiny/tiny-robot-kit/core`.
  - Node-only skill loaders and storage APIs are exported from `@opentiny/tiny-robot-kit/node`.
- `packages/kit/src/message/plugins/skillPlugin.ts`
  - Message runtime adapter only.
  - Bridges request-level skill selection into message engine hooks.
- `packages/kit/src/message/plugins`
  - Message plugins and runtime protocols.
  - Must not own or re-export skill core logic, but may export message plugin APIs and plugin option types.

## Package Manager

This repository uses pnpm for dependency and script management. Prefer `pnpm` commands over `npm` commands.

## Skill Layers

- Definition
  - `SkillDefinition` is the runtime contract for an AI-usable skill.
  - It contains `name`, `description`, `instructions`, optional `resources`, and optional `metadata`.
  - Runtime code should consume `SkillDefinition`, regardless of whether it came from a loader, storage, or in-memory state.
- Loader
  - Converts platform-specific sources directly into `SkillDefinition`.
  - Browser-safe loader entry lives in `packages/kit/src/skills/loader/index.ts`.
  - Node-only loader entry lives in `packages/kit/src/skills/loader/node.ts`.
  - Browser sources use `{ source: 'browser', fileList }` or `{ source: 'browser', directoryHandle }`.
  - Node sources use `{ source: 'fs', root }` through the node subpath.
  - GitHub sources use `{ source: 'github', repo, ref?, path }`.
  - Source adapters inside loader may produce internal `LoadableSkillFile[]`, but `createSkillDefinition` is called by the loader entry, not by each adapter.
  - Loader owns source parsing, but must not own persistence, skill collections, or selection state.
- Storage
  - Persists and restores `SkillDefinition`; storage is a `SkillDefinition` provider parallel to loader.
  - `storage.add(skill)` stores an already loaded complete `SkillDefinition`.
  - `storage.import(options)` is a convenience composition of loader plus add; it must call loader logic rather than reimplement source parsing.
  - Browser-safe storage import uses browser/core loader sources. Node-only storage capabilities should live behind node-only entry points.
  - Storage may restore resources lazily through `resourceId`, `readText`, and `readBinary`.
  - Loader output usually keeps full resource data in memory through `text` and `binary`.
- Capabilities
  - Convert selected skills or candidate summaries into runtime tools and capability-specific instructions.
  - Selection capability lives in `packages/kit/src/skills/capabilities/selection.ts` and provides `select_skills`.
  - Resource capability lives in `packages/kit/src/skills/capabilities/resources.ts` and provides `list_skill_files` / `read_skill_file`.
  - Command capability currently only provides command-related types; `execute_skill_command` is not implemented.
- Plugin Adapter
  - Connects skill instructions and capabilities to message engine lifecycle.
  - Lives in `packages/kit/src/message/plugins/skillPlugin.ts`.
- Selection
  - Long-lived selection state is application-owned, typically a selected skill name array or selected `SkillDefinition[]`.
  - Kit does not need a manager layer for selection; applications can combine `storage.list()` / `storage.get()` with their own selected names.
  - `skillPlugin` supports request-level `manual`, `auto`, and `none` selection snapshots.
  - Auto selection is a message interaction flow: candidate summaries plus `select_skills`, followed by resolving selected names into full `SkillDefinition[]`.
  - Storage must not own selection state.

## Hard Rules

- Do not move skill core modules back under `packages/kit/src/message`.
- `skillPlugin` must not own, cache, query, mutate, or manage skill collections.
- `skillPlugin` receives a request-level `selection` snapshot and resolves skills through caller-provided `getSkillByName` / `getSkillCandidates`.
- Do not use `activeSkills` naming in the skill plugin or capabilities. Use selected/enabled skill terminology.
- Capabilities may compile capability-specific prompt instructions and runtime tools, but must not manage persistence, long-lived selection state, or storage.
- Capability factories are internal to `skillPlugin`; do not export `createSkillResource*` or `createSkillSelection*` from public skill APIs.
- Selected skill instructions are injected inside `skillPlugin`; do not reintroduce a public skill instruction compiler unless there is a clear non-plugin use case.
- Loader source adapters may read platform file sources, but must not create `SkillDefinition`; loader entries call `createSkillDefinition`.
- Loader may parse/import skill sources into a `SkillDefinition`, but must not own skill collections or persistence.
- Storage may persist and restore `SkillDefinition`, but source import paths must reuse loader logic.
- Selection state belongs to application code; kit core should not reintroduce a manager that owns skill collections or long-lived selection state.
- Public skill APIs should be exported from `packages/kit/src/skills/index.ts`.
- Node-only skill APIs should use dedicated subpath exports instead of the browser package root.
- `message/plugins/index.ts` must only export message plugin APIs and plugin option types; skill core APIs belong to `src/skills`.
- Skill command execution is not implemented in `skillPlugin`. Do not add PPT/PDF/browser/document backends to kit; future command execution should route tool calls to application-provided sandbox executors.

## Current Public API Shape

```ts
skillPlugin({
  selection: {
    mode: 'manual',
    skillNames: requestedSkillNames,
  },
  getSkillByName: (name) => storage.get(name),
})

skillPlugin({
  selection: {
    mode: 'auto',
    preferredSkillNames,
  },
  getSkillCandidates: () => storage.list(),
  getSkillByName: (name) => storage.get(name),
})
```

Vue adapter also accepts reactive selected skills:

```ts
skillPlugin({
  skills: selectedSkills,
})
```

`SkillDefinition` currently contains `name`, `description`, `instructions`, optional `resources`, and optional `metadata`.

Resources can hold eager in-memory content with `text` / `binary`, lazy readers with `readText` / `readBinary`, or both. These fields do not need to be mutually exclusive; consumers should prefer eager content when available and fall back to readers.

Skill request context uses:

```ts
skillContext.skills
skillContext.skillNames
skillContext.requestedSkillNames
skillContext.unresolvedSkillNames
skillContext.runtimeTools
skillContext.selection
```

## Important Files

- `packages/kit/src/skills/types/index.ts`
- `packages/kit/src/skills/loader/index.ts`
- `packages/kit/src/skills/loader/node.ts`
- `packages/kit/src/skills/loader/browser.ts`
- `packages/kit/src/skills/loader/fs.ts`
- `packages/kit/src/skills/loader/github.ts`
- `packages/kit/src/skills/loader/definition.ts`
- `packages/kit/src/skills/loader/type.ts`
- `packages/kit/src/skills/loader/utils.ts`
- `packages/kit/src/skills/storage/index.ts`
- `packages/kit/src/skills/storage/node.ts`
- `packages/kit/src/skills/storage/importSkill.ts`
- `packages/kit/src/skills/storage/memory.ts`
- `packages/kit/src/skills/storage/types.ts`
- `packages/kit/src/skills/capabilities/selection.ts`
- `packages/kit/src/skills/capabilities/resources.ts`
- `packages/kit/src/skills/capabilities/commands.ts`
- `packages/kit/src/skills/index.ts`
- `packages/kit/src/skills/README.md`
- `packages/kit/src/skills/test/resourceCapability.test.ts`
- `packages/kit/src/skills/test/loaderDefinition.test.ts`
- `packages/kit/src/skills/test/loaderNode.test.ts`
- `packages/kit/src/skills/test/memoryStorage.test.ts`
- `packages/kit/src/skills/test/skillPlugin.test.ts`
- `packages/kit/src/message/plugins/skillPlugin.ts`

## Validation

Run from `packages/kit`:

```bash
pnpm lint
pnpm test
pnpm build
```

## Near-Term Next Steps

- Keep resource usage conservative: model instructions should list files before reading. Future large-file support may add `search_skill_files` for centered snippets and offsets, plus read size limits, truncation diagnostics, and optional range reads.
- Keep duplicate skill name diagnostics in storage or selection logic, not instructions or capabilities.
- Keep selection boundaries separate from storage and loader boundaries.
- Keep command execution as an application-provided sandbox concern.
