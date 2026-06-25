> 仅内部参考 · 版权归原作者所有；请以原文链接为准，不用于公开转载。
> 标题：5 CSS snippets every front-end developer should know in 2024
> 作者：Adam Argyle (web.dev / Google Chrome)
> 出处 URL：https://web.dev/articles/5-css-snippets-every-front-end-developer-should-know-in-2024
> 采集日期：2026-06-25

---
# 5 CSS snippets every front-end developer should know in 2024

Toolbelt worthy, powerful, and stable CSS you can use today.

I believe every front-end developer should know `:has()` is more than a "parent selector", the how and why of a `subgrid`, how to nest with built-in CSS syntax, how to let the browser balance headline text wrapping, and how use container query units.

This post is a continuation of [last year's 6 CSS snippets every front-end developer should know in 2023](https://web.dev/articles/6-css-snippets-every-front-end-developer-should-know-in-2023).

## CSS `:has()` beyond a parent selector

`:has()`

`:has()` landed across all major browsers at the end 2023! This new selector seems small and innocent but you'll be surprised at all the use cases it can unlock: games, reactivity, content aware layout, smart components, and [much more that's well explored in this article by Jhey](https://developer.chrome.com/blog/has-m105).

![4 panels shown, each with an image and caption. Each image shows a brain activating more and more brain power. The first panel is says :has(). Second panel says figure:has(caption) as a parent selector. Third panel says .layout:has(> :nth-child(5)) as a quantity selector. Forth panel says html:has(#checked) .new-subject as conditional subject changing selector.](https://web.dev/static/articles/5-css-snippets-every-front-end-developer-should-know-in-2024/image/has-meme.jpg)

Here's a couple examples of using `:has()` as a parent selector. It got this name because usually the subject of a selector is at the end, like `ul li`, where `li` is the subject and gets the styles. With `:has()`, the element at the beginning of the selector can become the subject. In the following example, the button has a gap if there's an element inside with a class of `.icon`. The card changes orientation if there's an image inside.

```
button:has(.icon) {
  gap: 1ch;
}

.card:has(img) {
  grid-auto-flow: row;
}
```

A long desired selector is to change a layout based on how many items it has. This is now possible with `:has()` because it can keep the container as the subject while querying the number of children.

```
main:has(> :nth-child(5)) {…}
```

Another higher level example, change styles set on the entire document when a specific checkbox on the page is enabled:

```
html:has(#dark-mode:checked) {…}
```

These are simple use cases that don't change the subject of the selector, if you just look at examples like this, you might think `:has()` is limited to being a parent selector. Consider the following examples though. These check for something based on a common ancestor, then pivot the selector subject to a child somewhere deeper in the page.

This one shows a form error element if any of its inputs are invalid:

```
form:has(:user-invalid) .error {
  display: block;
}
```

This one slides out the main content area when a sidenav has a class of `.--is-open`:

```
html:has(#sidenav.--is-open) main {
  translate: -320px;
}
```

Here's a fun demo that uses `:has()` as a parent selector, `:has()` with quantity queries, and container queries to make a grid layout that's capable of elegantly displaying 1-12 elements in portrait or landscape orientations:

[Try on Codepen](https://codepen.io/web-dot-dev/pen/wvOzRPM)

## Create a subgrid

`subgrid`

For many years the front-end web community asked for subgrid to help round out and finish the massively popular and powerful CSS grid layout engine. It's now available in all three major engines.

[Learn more about subgrid here](https://web.dev/articles/css-subgrid), if you'd like an overview.

```
body {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30ch, 1fr));

  > article {
    display: grid;
    grid-row: span 4;
    grid-template-rows: subgrid;
  }
}
```

## Nest the CSS way

`nesting`

Built-in CSS nesting became available in all major browsers in 2023. I even updated my website to remove the build process that compiled nesting away, and now I ship a smaller stylesheet! Yep, stylesheets with nesting are smaller and all the browser devtools are ready to represent it.

You can find an overview of the [CSS nesting syntax here](https://developer.chrome.com/docs/css-ui/css-nesting), for all the details. The following code example shows a syntax example.

```
.you {
  .can-totally-ship-this {
    &.if-you-wanted {
      /* it's VERY MUCH like SCSS */

      &:is(:hover, :focus-visible) {
        /* put a bird on it */
      }
    }
  }
}

.for-theming {
  @media (prefers-color-scheme: dark) {
    /* you can nest media queries */
  }
}

/* or for theming with [data-theme="dark"] */
.button {
  background: black;
  color: white;

  /* nest and do more than just append, flip it and reverse it */
  [data-theme="dark"] & {
    background: white;
    color: black;
  }
}
```

## Let the browser balance headlines

`balance`

`pretty`

Without `text-wrap: balance`, developers and copy writers are left to line break hints such as`<wbr>` elements or `&shy;`. It's mostly a losing battle because as soon as the content is translated, zoomed or modified in any way, there's no guarantee that those wrapping hints will be in the right place for the new presentation of the content.

With balanced text wrapping, you can leave this work to the browser. You can see a comparison in the following Codepen.

## Use container query units

`cqw`

Last year's post suggested that every front-end developer should know how to write a container query. If you've not yet learned, make 2024 the year to take the plunge, and check out container query units too. As an overview, [Ahmad Shadeed wrote a great article about container query units](https://ishadeed.com/article/container-query-units/) in 2021.

There are six new **c**ontainer **q**uery units:

1.  An inline variant `cqi`.
2.  A width variant `cqw`.
3.  A block variant `cqb`.
4.  A height variant `cqh`.
5.  A variant for whichever length is smaller `cqmin`.
6.  A variant for whichever length is larger `cqmax`.

Consider a scenario for relative and intrinsic animations to a container. A child element that slides out entirely from its container by using 100cqi—that's 100% of the container inline size.

```
@keyframes slide-out-of-container {
  to {
    translate: -100cqi;
  }
}
```

Here's a card with container responsive typography, and an image that adapts to the orientation of the container, becoming half the size if the orientation is landscape.

```
.card {
  :is(h2,h3) {
    font-size: clamp(1.5rem, 5cqi, 4rem);
  }

  img {
    inline-size: 100cqi;

    @container (orientation: landscape) {
      inline-size: 50cqi;
    }
  }
}
```

If these units are new to you it's probably a good idea to [review all the units available to you in 2024](https://nerdy.dev/new-relative-units-ric-rex-rlh-and-rch).
