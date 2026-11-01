# Renderer reference

Use this reference when an Angular host needs custom message content, a bubble box, or a scoped region. Import from `@opentiny/tiny-robot-chat/experimental`; these APIs are experimental in the pinned public alpha. Both `TrChatHTMLElement` and `TrChatUIHTMLElement` expose `bubbleRenderers` and `renderers` as JavaScript properties. Assign stable objects and arrays (for example, component fields) once to the element; replace them only when configuration intentionally changes. Do not serialize them into attributes or create arrays in Angular template expressions.

## Bubble matches

`bubbleRenderers` has optional `contentRendererMatches` and `boxRendererMatches` arrays. A content entry has `find(message, content, contentIndex)`, `renderer`, optional `priority`, and optional `attributes`. A box entry has `find(messages, content, contentIndex, context)`, `renderer`, optional `priority`, and optional `attributes` (an object or a function of `messages`, `content`, and `contentIndex`). The box context includes `contentRenderMode` and `resolvedMessageContent`. Inspect the installed declarations for the full types.

Content renderer names are `text`, `markdown`, `image`, `loading`, `reasoning`, `tools`, and `tool-role`; the box renderer name is `box`. Alternatively, `renderer` can be a DOM renderer function. Matches are combined with the defaults, sorted by ascending `priority` (default `0`), and the first `find` returning true wins. Equal priorities preserve their input order; supplied matches precede default matches at the same priority. A thrown `find` is reported as a renderer error and treated as false.

This example uses stable fields and two overlapping matches to make the order explicit. Assign `bubbleRenderers` to the typed element property after obtaining the element in the browser, following the host-modes reference.

```ts
import type { TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental';

const bubbleRenderers: NonNullable<TrChatHTMLElement['bubbleRenderers']> = {
  contentRendererMatches: [
    {
      find: (_message, content) => content.type === 'notice',
      renderer: ({ content }) => `First: ${String(content.text ?? '')}`,
      priority: -2,
    },
    {
      find: (_message, content) => content.type === 'notice',
      renderer: ({ content }) => `Second: ${String(content.text ?? '')}`,
      priority: -2,
    },
  ],
};

// Once the browser element is available:
// chatElement.bubbleRenderers = bubbleRenderers;
```

A `notice` item matches both entries, so the first custom renderer wins and displays the notice text. For an ordinary text item with no loading, reasoning, tool calls, or tool role, neither example nor default content match applies; TrChat's default content fallback renders Markdown. Unmatched boxes fall back to the default box renderer. Default matches can still handle other content (such as images) before fallback; omitting a match does not disable them.

## DOM renderers

`ExperimentalRenderer<TContext>` is `(context, lifecycle) => Node | readonly Node[] | string | null`. Use `lifecycle.signal` to clean up event listeners or other work when the renderer is replaced or cleared. Content context supplies `message`, `content`, and `contentIndex`. Box context also supplies `messages`, optional `content` and `contentIndex`, `placement`, `shape`, and `contentRoot`; insert `contentRoot` into the returned box to display the matched content.

For scoped regions, set the `renderers` property to a stable `TrChatRenderers` object keyed by a supported region name, such as `layout-header` or `bubble-suffix`; values use the same DOM renderer contract with the region's declared context. Consult `TrChatRenderers` and `SCOPED_RENDERER_NAMES` in the installed public declarations for available keys. `createRendererHost(host)` is also exported for explicitly hosting a renderer: call `render(renderer, context)`, `clear()`, or `dispose()`; clearing or replacing aborts the prior lifecycle signal.
