---
title: "The Painful Story of Migrating from TailwindCSS v3 to v4"
excerpt: "How I upgraded TailwindCSS for the Red Hat ProdSec Compliance project"
date: 2026-03-23
tags: ["frontend", "TailwindCSS", "CSS", "migration", "Bootstrap"]
cover: "tailwindcss-v3-to-v4.webp"
---

TailwindCSS v4 officially shipped back in January 2025, but I held off on upgrading my project for almost a year. The reason was simple: the migration cost looked enormous. The syntax, the configuration, the mental model — almost everything had changed.

## The setup: a project surrounded by legacy CSS

Back in 2023, when I started building the Red Hat ProdSec Compliance project, I used TailwindCSS v3. The project had one unavoidable constraint: the site had to integrate the header and footer from the Red Hat Customer Portal.

Sounds harmless, right? The problem was that the header's HTML was packed with legacy CSS, including a fairly ancient copy of Bootstrap. That meant my utility class namespace was constantly stepping on landmines like `.container`, `.row`, `.col-*`, `.btn`, and `.text-center` — class names identical to Tailwind's, but with completely different CSS rules behind them.

## The v3 solution: prefix

In v3, the official recommendation for this scenario was clean. Just add one line to `tailwind.config.js`:

```js
module.exports = {
  prefix: "tw-",
  // ...
}
```

After that, every utility class gets a `tw-` prefix automatically:

```html
<div class="tw-flex tw-items-center tw-bg-blue-500 hover:tw-bg-blue-700">
  ...
</div>
```

Notice where the prefix sits in `hover:tw-bg-blue-700` — it's attached to the utility itself, and the whole class still reads like normal Tailwind. Bootstrap's `.bg-blue` can't collide with my `.tw-bg-blue-500` because they're literally different names. Perfect isolation.

Since this was a greenfield project at the time, and the IDE's autocomplete handled `tw-` prefixes well, writing classes this way felt almost transparent. You stopped noticing the prefix after a day.

## The v4 redesign: prefix becomes a variant

Then I upgraded to v4, and things got interesting.

First, `tailwind.config.js` is no longer the recommended config home. All configuration moves into your CSS file:

```css
@import "tailwindcss" prefix(tw);
```

That part is fine. What actually threw me off was that the **behavior** of `prefix` changed. In v4, the prefix is no longer attached to the utility. Instead, it becomes a **variant** that sits at the very front of the entire class:

```html
<!-- v3 -->
<div class="tw-flex hover:tw-bg-blue-700">...</div>

<!-- v4 -->
<div class="tw:flex tw:hover:bg-blue-700">...</div>
```

Three things changed at once:

1. The separator changed from `-` to `:`
2. The prefix moved from "attached to the utility" to "in front of the whole class"
3. Variants like `hover:` now come *after* the prefix, not before

It sounds like a minor syntactic shift. But for a project with thousands of lines of JSX, it means **every single class needs to be rewritten** — and not in a way that a quick find-and-replace can handle, because the position of `hover:` relative to `tw-` literally swapped. Any regex you write will be ugly and prone to false positives.

## Why I call this part painful

To be fair, the official upgrade tool `@tailwindcss/upgrade` can migrate prefixes for you. The problem isn't the migration itself — it's living with the result:

- **The generated class names are ugly.** Reading `tw:lg:hover:bg-red-500` is mentally exhausting.
- **IDE support is worse.** Some versions of Tailwind IntelliSense don't autocomplete the prefix variant cleanly, and the typing experience is noticeably worse than v3.
- **Prettier plugins need extra config** to sort classes correctly — otherwise the order goes off.
- **Cognitive load goes up.** Anyone joining the team now has to learn this new syntax just to read existing classes.
- **You're never sure where the prefix should go.** In `tw:lg:hover:bg-red-500`, does the `tw:` only go in front? Or should it appear before `hover:` too? The answer is "only in front," but the syntax doesn't make that obvious.

And the worst part: this ugliness shows up at **every** call site. Unlike v3's `tw-`, which faded into the background, v4's `tw:` is loud everywhere.

## What I actually did: a dumb but effective fix

After weighing the options, I decided to upgrade to v4 but **drop the prefix entirely**. The trade-off was that I'd have to face the collisions head-on — and my solution isn't elegant, but it works.

The collisions are finite and enumerable. Bootstrap only really clashes with Tailwind on a handful of classes: `container`, `grid`, `row`, `col`, `text-center`, and a few others. It seemed wasteful to prefix the entire project just for those.

So here's what I did: **append a `!` suffix to just those conflicting classes**, using Tailwind v4's important modifier.

```html
<!-- Before — collides with Bootstrap's .grid -->
<div class="grid grid-cols-3">...</div>

<!-- After -->
<div class="grid! grid-cols-3">...</div>
```

This single change solves two problems at once:

**First, it becomes a different class name.** When Tailwind compiles `grid!`, it generates a CSS selector called `.grid\!` (the `!` is escaped with a backslash). At the CSS level, this is a **completely different selector** from Bootstrap's `.grid` — the browser won't match them as the same class.

**Second, it carries `!important`.** Even if some legacy rule wins on specificity or load order, `!important` is the tiebreaker. In a clean codebase `!important` is usually a code smell, but when your opponent is ten-year-old Bootstrap, it becomes the most pragmatic tool you have.

So in the end, only a handful of high-conflict utilities in my code carry `!`. The other 99% of classes stay clean:

```html
<div class="container! mx-auto px-8 mb-10 max-w-364 pt-4">
  <div class="grid! grid-cols-1 gap-12 pb-10 md:grid-cols-2">
    ...
  </div>
</div>
```

The upside: minimal changes. I only had to touch a few classes, not migrate the entire project's naming convention. The downside: I've introduced `!important`, which makes future style overrides on these elements a bit harder. But for a project that integrates a legacy header and footer, I think the trade-off is worth it.

## A few takeaways

v4 is genuinely more modern in a lot of ways. The Oxide engine is absurdly fast, and the CSS-first configuration feels more natural once you adapt. But the prefix change is a classic case of trading practicality for architectural purity. For a greenfield project, v4's prefix syntax is probably fine. For projects like mine — ones that have to coexist with legacy CSS — it went from "an isolation mechanism that just works" to "something you technically can use, but feels heavy at every call site."

Solving the problem with the `!` modifier isn't elegant, but it's practical. Framework upgrades tend to work this way: in the ideal world you follow the official guide and migrate cleanly; in the real world you find some small compromise that fits your specific project.

If you're working on a similar integration project, I'd suggest asking yourself before upgrading: is your prefix there for **namespace aesthetics**, or for **hard isolation from conflicts**? If it's the latter, plan your alternative ahead of time. Figuring it out halfway through the migration is much more painful than deciding up front.