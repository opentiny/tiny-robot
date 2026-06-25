> 仅内部参考 · 版权归原作者所有；请以原文链接为准，不用于公开转载。
> 标题：An Interactive Guide to Flexbox
> 作者：Josh W. Comeau
> 出处 URL：https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/
> 采集日期：2026-06-25

---
# An Interactive Guide to Flexbox


## Introduction

Flexbox is a remarkably powerful layout mode. When we _truly_ understand how it works, we can build dynamic layouts that respond automatically, rearranging themselves as-needed.

For example, check this out:

This demo is heavily inspired by Adam Argyle’s incredible [“4 layouts for the price of 1”](https://codepen.io/argyleink/pen/LYEegOO) codepen. _It uses no media/container queries._ Instead of setting arbitrary breakpoints, it uses _fluid principles_ to create a layout that flows seamlessly.

Here's the relevant CSS:

```
form {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
}
.name {
  flex-grow: 1;
  flex-basis: 160px;
}
.email {
  flex-grow: 3;
  flex-basis: 200px;
}
button {
  flex-grow: 1;
  flex-basis: 80px;
}
```

I remember running into demos like this and being completely baffled. I knew the basics of Flexbox, but this seemed like absolute wizardry!

**In this blog post, I want to refine your mental model for Flexbox.** We'll build an intuition for how the Flexbox algorithm works, by learning about each of these properties. Whether you're a CSS beginner, or you've been using Flexbox for years, I bet you'll learn quite a bit!

Let's do this!

## Introduction to Flexbox

CSS is comprised of many different layout algorithms, known officially as “layout modes”. Each layout mode is its own little sub-language within CSS. The default layout mode is _Flow layout_, but we can opt in to Flexbox by changing the `display` property on the parent container:

When we flip `display` to `flex`, we create a “flex formatting context”. This means that, by default, all children will be positioned according to the Flexbox layout algorithm.

![Clippy, the helpful paperclip assistant from Microsoft Word](https://www.joshwcomeau.com/images/interactive-guide-to-flexbox/clippy.png)

 **Each layout algorithm is designed to solve a specific problem.** The default “Flow” layout is meant to create digital documents; it's essentially the _Microsoft Word_ layout algorithm. Headings and paragraphs stack vertically as blocks, while things like text, links, and images sit inconspicuously within these blocks.

**So, what problem does Flexbox solve?** Flexbox is all about arranging a group of items in a row or column, and giving us a _ridiculous_ amount of control over the distribution and alignment of those items. As the name suggests, Flexbox is all about _flexibility_. We can control whether items grow or shrink, how the extra space is distributed, and more.

## Flex direction

As mentioned, Flexbox is all about controlling the distribution of elements in a row or column. By default, items will stack side-by-side in a row, but we can flip to a column with the `flex-direction` property:

With `flex-direction: row`, the _primary axis_ runs horizontally, from left to right. When we flip to `flex-direction: column`, the primary axis runs vertically, from top to bottom.

**In Flexbox, everything is based on the primary axis.** The algorithm doesn't care about vertical/horizontal, or even rows/columns. All of the rules are structured around this primary axis, and the _cross axis_ that runs perpendicularly.

**This is pretty cool.** When we learn the rules of Flexbox, we can switch seamlessly from horizontal layouts to vertical ones. All of the rules adapt automatically. This feature is unique to the Flexbox layout mode.

The children will be positioned by default according to the following 2 rules:

1.  **Primary axis:** Children will be bunched up at the _start_ of the container.

2.  **Cross axis:** Children will stretch out to fill the entire container.

Here's a quick visualization of these rules:

![](https://www.joshwcomeau.com/images/interactive-guide-to-flexbox/flex-row.svg)

![](https://www.joshwcomeau.com/images/interactive-guide-to-flexbox/flex-column.svg)

In Flexbox, we decide whether the primary axis runs horizontally or vertically. This is the root that all Flexbox calculations are pegged to.

## Alignment

We can change how children are distributed along the primary axis using the `justify-content` property:

When it comes to the primary axis, we don't generally think in terms of aligning a single child. Instead, it's all about the _distribution of the group._

We can bunch all the items up in a particular spot (with `flex-start`, `center`, and `flex-end`), or we can spread them apart (with `space-between`, `space-around`, and `space-evenly`).

**For the cross axis, things are a bit different.** We use the `align-items` property:

It's interesting… With `align-items`, we have _some_ of the same options as `justify-content`, but there isn't a perfect overlap.

Why don't they share the same options? We'll unravel this mystery shortly, but first, I need to share one more alignment property: **`align-self`**.

Unlike `justify-content` and `align-items`, `align-self` is applied to the _child element_, not the container. It allows us to change the alignment of a specific child along the cross axis:

`align-self` has all the same values as `align-items`. In fact, **they change the exact same thing.** `align-items` is _syntactic sugar_, a convenient shorthand that automatically sets the alignment on all the children at once.

There is no `justify-self` in Flexbox. The property is implemented in Grid. To understand why not, we need to dig deeper into the Flexbox algorithm.

### Content vs. items

So, based on what we've learned so far, Flexbox might seem pretty arbitrary. Why is it `justify-content` and `align-items`, and not `justify-_items_`, or `align-_content_`?

For that matter, why is there an `align-self`, but not a `_justify_-self`??

**These questions get at one of the most important and misunderstood things about Flexbox.** To help me explain, I'd like to use a metaphor.

In Flexbox, items are distributed along the primary axis. By default, they're nicely lined up, side-by-side. I can draw a straight horizontal line that skewers _all_ of the children, like meat on a stick: skewers, souvlaki, or shish-kabob.

![Illustration of a kebab: 3 pieces of meat horizontally skewered on a wooden stick. The stick is labeled 'Primary axis'](https://www.joshwcomeau.com/_next/image/?url=%2Fimages%2Finteractive-guide-to-flexbox%2Fsouvlaki-labeled.png&w=1920&q=75)

The cross axis is different, though. A straight vertical line will only ever intersect _one_ of the children.

It's less like a kebab, and more like a group of cocktail wieners:

![3 separate cocktail wieners, each with their own toothpick skewering them vertically. The toothpicks are labeled 'cross axis'](https://www.joshwcomeau.com/_next/image/?url=%2Fimages%2Finteractive-guide-to-flexbox%2Fbunched-wieners-fixed-outline.png&w=1080&q=75)

There's a significant difference here. With the cocktail wieners, each item can move along its stick _without interfering_ with any of the other items:

![](https://www.joshwcomeau.com/images/interactive-guide-to-flexbox/purple-toothpick-outline.png)

![](https://www.joshwcomeau.com/images/interactive-guide-to-flexbox/purple-wiener-bottom.png)

![](https://www.joshwcomeau.com/images/interactive-guide-to-flexbox/purple-toothpick.png)

![](https://www.joshwcomeau.com/images/interactive-guide-to-flexbox/arrow.png)

By contrast, with our primary axis skewering each sibling, a single item _can’t_ move along its stick without bumping into its siblings! **Try dragging the middle piece side to side:**

**This is the fundamental difference between the primary/cross axis.** When we're talking about alignment in the _cross_ axis, each item can do whatever it wants. In the _primary_ axis, though, we can only think about how to distribute the _group_.

**That's why there's no** `justify-self`**.** What would it mean for that middle piece to set `justify-self: flex-start`? There's already another piece there!

With all of this context in mind, let's give a proper definition to all 4 terms we've been talking about:

-   `justify` — to position something along the _primary axis_.

-   `align` — to position something along the _cross axis_.

-   `content` — a group of “stuff” that can be distributed.

-   `items` — single items that can be positioned individually.

**And so:** we have `justify-content` to control the distribution of the group along the primary axis, and we have `align-items` to position each item individually along the cross axis. These are the two main properties we use to manage layout with Flexbox.

There's no `justify-items` for the same reason that there's no `justify-self`; when it comes to the primary axis, _we have to think of the items as a group,_ as content that can be distributed.

What about `align-content`? Actually, this _does_ exist within Flexbox! We'll cover it a little later on, when we talk about the `flex-wrap` property.

## Hypothetical size

Let's talk about one of the most eye-opening realizations I've had about Flexbox.

Suppose I have the following CSS:

```
.item {
  width: 2000px;
}
```

A reasonable person might look at this and say: “alright, so we'll get an item that is 2000 pixels wide”. _But will that always be true?_

Let's test it:

This is interesting, isn't it?

**Both items have the exact same CSS applied.** They each have `width: 2000px`. And yet, the first item is much wider than the second!

The difference is the _layout mode_. The first item is being rendered using Flow layout, and in Flow layout, `width` is a _hard constraint_. When we set `width: 2000px`, we'll get a 2000-pixel wide element, even if it has to burst through the side of the viewport like the Kool-Aid Man.

In a Flexbox row, however, the `width` property is implemented differently. It's more of a suggestion than a hard constraint.

The specification has a name for this: the _hypothetical size_. It's the size an element _would_ be, in a perfect utopian world, with nothing getting in the way.

Alas, things are rarely so simple. In this case, the limiting factor is that the parent _doesn't have room_ for a 2000px-wide child. And so, the child's size is reduced so that it fits.

This is a core part of the Flexbox philosophy. Things are fluid and flexible and can adjust to the constraints of the world.

## Growing and shrinking

So, we've seen that the Flexbox algorithm has some built-in flexibility, with _hypothetical sizes_. But to _really_ see how fluid Flexbox can be, we need to talk about 3 properties: `flex-grow`, `flex-shrink`, and `flex-basis`.

Let's look at each property.

### flex-basis

I admit it: for a long time, I didn't really understand what the _deal_ was with `flex-basis`. 😅

**To put it simply:** In a Flexbox row, `flex-basis` does the same thing as `width`. In a Flexbox column, `flex-basis` does the same thing as `height`.

As we've learned, everything in Flexbox is _pegged to the primary/cross axis_. For example, `justify-content` will distribute the children along the primary axis, and it works exactly the same way whether the primary axis runs horizontally or vertically.

`width` and `height` don't follow this rule, though! `width` will always affect the horizontal size. It doesn't suddenly become `height` when we flip `flex-direction` from `row` to `column`.

**And so, the Flexbox authors created a generic “size” property called `flex-basis`.** It's like `width` or `height`, but pegged to the _primary axis_, like everything else. It allows us to set the _hypothetical size_ of an element in the primary-axis direction, regardless of whether that's horizontal or vertical.

Give it a shot here. Each child has been given `flex-basis: 50px`, but you can tweak the first child:

Like we saw with `width`, `flex-basis` is more of a suggestion than a hard constraint. At a certain point, there just isn't enough space for all of the elements to sit at their assigned size, and so they have to compromise, in order to avoid an overflow.

### flex-grow

By default, elements in a Flexbox context will shrink down to their minimum comfortable size along the primary axis. This often creates extra space.

We can specify how that space should be consumed with the `flex-grow` property:

The default value for `flex-grow` is 0, which means that growing is opt-in. If we want a child to gobble up any extra space in the container, we need to explicitly tell it so.

**What if _multiple_ children set `flex-grow`?** In this case, the extra space is divided proportionally between children based on their `flex-grow` value.

I think it'll be easier to explain visually. Try incrementing/decrementing each child:

The first child wants 1 unit of extra space, while the second child wants 1 unit. That means the total # of units is **2** (1 + 1). Each child gets a proportional share of that extra space.

### flex-shrink

In most of the examples we've seen so far, we've had extra space to work with. But what if our children are _too big_ for their container?

**Let's test it.** Try shrinking the container to see what happens:

Interesting, right? Both items shrink, **but they shrink proportionally.** The first child is always 2x the width of the second child. You might see rounding issues that suggest it's off by a pixel or two; this is likely a flaw with the demo.

As a friendly reminder, `flex-basis` serves the same purpose as `width`. We'll use `flex-basis` because it's conventional, but we'd get the **exact same result** if we used `width`!

`flex-basis` and `width` set the elements' _hypothetical size_. The Flexbox algorithm might shrink elements below this desired size, but by default, they'll always scale together, preserving the ratio between both elements.

Now, what if we _don't_ want our elements to scale down proportionally? **That's where the `flex-shrink` property comes in.**

Take a couple of minutes and poke at this demo. **See if you can figure out what's going on here.** We'll explore below.

Alright, so: we have two children, each with a hypothetical size of 250px. The container needs to be at least 500px wide to contain these children at their hypothetical size.

Let's suppose we shrink the container to **400px**. Well, we can't stuff 500px worth of content into a 400px bag! _We have a deficit of 100px._ Our elements will need to give up 100px total, in order for them to fit.

**The `flex-shrink` property lets us decide how that balance is paid.**

Like `flex-grow`, it's a ratio. By default, both children have `flex-shrink: 1`, and so each child pays ½ of the balance. They each forfeit 50px, their actual size shrinking from 250px to 200px.

Now, let's suppose we crank that first child up to `flex-shrink: 3`:

![Screenshot showing the demo above, locked at 400px wide, with the first child having a flex-shrink of 3](https://www.joshwcomeau.com/_next/image/?url=%2Fimages%2Finteractive-guide-to-flexbox%2Fflex-shrink-locked.png&w=1080&q=75)

We have a total deficit of _100px_. Normally, each child would pay ½, but because we've tinkered with `flex-shrink`, the first element winds up paying ¾ (75px), and the second element pays ¼ (25px).

Note that the absolute values don't matter, **it's all about the ratio.** If both children have `flex-shrink: 1`, each child will pay ½ of the total deficit. If both children are cranked up to `flex-shrink: 1000`, each child will pay 1000/2000 of the total deficit. Either way, it works out to the same thing.

I had an epiphany a while back about `flex-shrink`: we can think of it as the “inverse” of `flex-grow`. They're two sides of the same coin:

-   `flex-grow` controls how the _extra space is distributed_ when the items are smaller than their container.

-   `flex-shrink` controls how _space is removed_ when the items are bigger than their container.

This means that **only _one_ of these properties can be active at once.** If there's extra space, `flex-shrink` has no effect, since the items don't need to shrink. And if the children are too big for their container, `flex-grow` has no effect, because there's no extra space to divvy up.

I like to think of it as two separate realms. You're either on Earth, or in the Upside Down from Stranger Things. Each world has its own rules.

### Preventing shrinking

Sometimes, we don't _want_ some of our Flexbox children to shrink.

I notice this all the time with SVG icons and shapes. Let's look at a simplified example:

When the container gets narrow, our two circles get squashed into gross ovals. **What if we want them to stay circular?**

We can do this by setting `flex-shrink: 0`:

When we set `flex-shrink` to 0, **we essentially “opt out” of the shrinking process altogether.** The Flexbox algorithm will treat `flex-basis` (or `width`) as a hard minimum limit.

## The minimum size gotcha

There's _one more thing_ we need to talk about here, and it's super important. It may be the single most helpful thing in this entire article!

Let's suppose we're building a fluid search form for an e-commerce store:

When the container shrinks below a certain point, **the content overflows!**

_But why??_ `flex-shrink` has a default value of `1`, and we haven't removed it, so the search input _should_ be able to shrink as much as it needs to! Why is it refusing to shrink?

**Here's the deal:** In addition to the _hypothetical_ size, there's another important size that the Flexbox algorithm cares about: _the minimum size_.

The Flexbox algorithm refuses to shrink a child below its minimum size. The content will overflow rather than shrink further, _no matter how high we crank `flex-shrink`!_

Text inputs have a default minimum size of 170px-200px (it varies between browsers). That's the limitation we're running into above.

In other cases, the limiting factor might be the element's content. For example, try resizing this container:

For an element containing text, the minimum width is the length of the _longest unbreakable string of characters._

**Here's the good news:** We can redefine the minimum size with the `min-width` property.

By setting `min-width: 0px` directly on the Flexbox child, we tell the Flexbox algorithm to overwrite the “built-in” minimum width. Because we've set it to 0px, the element can shrink as much as necessary.

This same trick can work in Flexbox columns with the `min-height` property (although the problem doesn't seem to come up as often).

## Gaps

One of the biggest Flexbox quality-of-life improvements in recent years has been the `gap` property:

`gap` allows us to create space _in-between_ each Flexbox child. This is great for things like navigation headers:

`gap` is a relatively new addition to the Flexbox language, but it's been [implemented across all modern browsers](https://caniuse.com/?search=gap) since early 2021.

### Auto margins

There's one other spacing-related trick I want to share. It's been around since the early days of Flexbox, but it's relatively obscure, and it _blew my mind_ when I first discovered it.

The `margin` property is used to add space around a specific element. In some layout modes, like Flow and Positioned, it can even be used to center an element, with `margin: auto`.

Auto margins are much more interesting in Flexbox:

Earlier, we saw how the `flex-grow` property can gobble up any extra space, applying it to a child.

**Auto margins will gobble up the extra space, and apply it to the element's margin.** It gives us precise control over where to distribute the extra space.

A common header layout features the logo on one side, and some navigation links on the other side. Here's how we can build this layout using auto margins:

The **Corpatech** logo is the first list item in the list. By giving it `margin-right: auto`, we gather up all of the extra space, and force it between the 1st and 2nd item.

We can see what's going on here using the browser devtools:

![Screenshot showing the above playground with an orange rectangle representing margin between the first item and the others](https://www.joshwcomeau.com/_next/image/?url=%2Fimages%2Finteractive-guide-to-flexbox%2Fmargin.png&w=828&q=75)

There are lots of other ways we could have solved this problem: we could have grouped the navigation links in their own Flexbox container, or we could have grown the first list item with `flex-grow`. But personally, I love the auto-margins solution. We're treating the extra space _as a resource_, and deciding exactly where it should go.

## Wrapping

Phew! We've covered _a lot_ of stuff so far. There's just one more big takeaway I want to share.

So far, all of our items have sat side-by-side, in a single row/column. The `flex-wrap` property allows us to change that.

Check it out:

Most of the time when we work in two dimensions, we'll want to use CSS Grid, but Flexbox + `flex-wrap` definitely has its uses! This particular example showcases the [“deconstructed pancake”](https://web.dev/patterns/layout/deconstructed-pancake/) layout, where 3 items stack into an inverted pyramid on mid-sized screens.

When we set `flex-wrap: wrap`, **items won't shrink below their hypothetical size**. At least, not when wrapping onto the next row/column is an option!

**But wait!** What about our kebab / cocktail weenie metaphor??

With `flex-wrap: wrap`, we no longer have a single primary axis line that can skewer each item. Effectively, **each row acts as its own mini flex container.** Instead of 1 big skewer, each row gets its own skewer:

![Two kebabs, each with two pieces of chicken](https://www.joshwcomeau.com/_next/image/?url=%2Fimages%2Finteractive-guide-to-flexbox%2Fmultiple-souvlaki.png&w=1080&q=75)

All of the rules we've learned so far continue to apply, within this reduced scope. `justify-content`, for example, will distribute the two pieces on each stick.

But hmm... How does `align-items` work, now that we have multiple rows? The cross axis _could_ intersect multiple items now!

**Take a moment to consider.** What do you _think_ will happen when we change this property? Once you have your answer (or at least an idea), see if it's right:

Each row is its own mini Flexbox environment. `align-items` will move each item up or down within the invisible box that wraps around each row.

But what if we want to _align the rows themselves_? We can do that with the `align-content` property:

To summarize what's happening here:

-   `flex-wrap: wrap` gives us two rows of stuff.

-   Within each row, `align-items` lets us slide each individual child up or down

-   Zooming out, however, we have these two rows within a single Flexbox context! The cross axis will now intersect _two_ rows, not one. And so, we can't move the rows individually, we need to distribute them _as a group_.

-   Using our definitions from above, we're dealing with _content_, not _items_. But we're also still talking about the cross axis! And so the property we want is `align-content`.

## You made it!

So I want to acknowledge something: **this has been a dense tutorial.** We've gone _way_ down the rabbit hole, and unless you're already a Flexbox pro, I expect your head is spinning a bit. 😅

Like so much in CSS, Flexbox might _seem_ simple when you first get started, but the complexity ramps up quickly when you get beyond the basics.

As a result, so many of us hit an early plateau with CSS. We know enough to get things done, but it's a constant struggle. The language feels rickety and unpredictable, like an ancient rope bridge that could give out at any second. When it snaps, we hurl random StackOverflow snippets at the problem, hoping something will help.

It's no fun. And that sucks, since CSS is a pretty big part of most front-end dev jobs!

The thing is, **CSS is actually a deeply robust and consistent language.** The problem is that most of our mental models are incomplete and inaccurate. When we take the time to build a proper intuition for the language, things start to click, and CSS becomes an _absolute joy to use_. ✨



Thanks so much for reading! This blog post was _a ton_ of work, and I'm thrilled to have it out in the world! I hope you found it useful. 💖

April 27th, 2026
