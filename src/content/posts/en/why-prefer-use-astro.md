---
title: "Why I Recommend Astro"
excerpt: "I used to be a framework-less evangelist — for frontend sites, I'd reach for plain React. But after years of bouncing around, I've come to think Astro is the better choice."
date: 2026-01-17
tags: ["Frontend", "Next.js", "Astro", "SSR", "React", "Vue", "Vite"]
cover: "why-prefer-use-astro.webp"
---

## A Brief History of Frontend Frameworks

To explain why I landed on [Astro](https://astro.build/), I need to start with my own decade-plus in frontend. Every framework shift, looking back, was really a shift in mindset.

### The Stone Age: jQuery, the Universal Wrench

I started my career in 2009, back when "frontend framework" wasn't really a concept. The most popular library was [jQuery](https://jquery.com/), along with its companion [jQuery UI](https://jqueryui.com/). I still remember writing my own jQuery plugin for multi-select and inverse-select dropdowns. jQuery was like a good wrench — simple, direct, and useful wherever something needed tightening. But it solved the problem of *manipulating the DOM*, not the problem of *organizing your code*.

### The Sprouting Years: From BackBone to AngularJS

In 2014, I took over my first pure-frontend project at [Rakuten](https://www.rakuten.com): [Rakuten Room](https://room.rakuten.co.jp). It used [BackBone.js](https://backbonejs.org/) as the main framework and [Grunt](https://gruntjs.com/) for builds. There was one Grunt plugin that blew my mind back then — it would combine every image in the project into a single sprite sheet, and regenerate a hashed version whenever any image changed. In an era when HTTP/1.1 made you count every request, this kind of optimization was non-negotiable.

But BackBone really only gave you a convention for *where to put code* — Model, View, Controller, in their respective boxes. So one of the first big things I did as Team Lead was rewrite the whole thing in [AngularJS](https://angularjs.org/). Its two-way binding felt like sorcery at the time. It was like going from the Stone Age to the modern world overnight.

That era also had some awkward transitional artifacts, like [Bower](https://bower.io/). Some of your frontend dependencies were installed via npm (for Node), others via Bower (for the browser). Two package managers coexisting — you can imagine the chaos.

### The Maturing Years: Enter React, Exit Bower

Around 2016, "JavaScript-heavy frontend" became the default. AngularJS was on its way out, [Angular](https://angular.dev/) (2.0+) had launched as its successor, but [React](https://react.dev/) was steadily eating its market share.

React rose fast, backed by Facebook and an explosive community. If you wanted to start a React project back then, [`create-react-app`](https://github.com/facebook/create-react-app) was basically your only choice. (The React team officially deprecated it in early 2025 — sic transit gloria mundi.)

Bower quietly exited the stage in this same period. All dependencies came home to `package.json`, managed by `npm`.

### The Three Kingdoms

Around 2017, frontend entered its Three Kingdoms era:

- **React** sat firmly on the throne
- **Angular** seemed stuck in mud — doing a lot, but somehow accomplishing nothing — and its share kept slipping
- **Vue** was the dark horse, rising fast on the back of strong Chinese-community support

### Two Powers and the Birth of Vite

By around 2020, the market had largely split between React and Vue. The Vue team, not content with just owning a framework, started attacking the broader toolchain — and out came [Vite](https://vite.dev/), a new-generation build tool. Lightning-fast startup and minimal config — it won developers over almost immediately.

A war story is in order here. In 2017, while maintaining Red Hat's internal Case management system, I owned the build-tooling optimization work. The Webpack config was long and ugly, and a single build took long enough to make flowers wilt. I pulled every trick I knew and got build times down from over ten minutes to three or five. That was the floor — too many source files to push it further. We were also running AngularJS and React side by side at the time (a gradual migration), and I'd written a custom Redux Adapter so the two could talk to each other. Painful times.

What made Vite special was that it embraced ESM: in dev mode, it serves files directly via native browser ESM, no bundling at all — which feels almost like cheating. For production, it falls back to Rollup for a proper build.

Why am I spending so much ink on Vite? Because Vite's "no-bundle dev" philosophy traces back to an earlier tool, [Snowpack](https://www.snowpack.dev/). Here's the fun part: Snowpack's creator later went on to build [Astro](https://astro.build/), and [Astro](https://astro.build/) itself eventually switched over to Vite. The threads loop back. I first heard about Snowpack from an American colleague at Red Hat, [Michael Clayton](https://linkedin.com/in/mwcz) — we were both on the Red Hat Customer Portal team, and he was always tinkering with tools that could make developers' lives easier.

### The SSR Wave, and the Next.js Hostage Situation

Honestly, to this day I don't fully understand why Server-Side Rendering became such a tidal wave. That wave swept the React team into an obsession with all things server-side, and the ecosystem started drifting off course. The Next.js team gradually took over the narrative of React development — the official React docs now recommend you "use React through a framework," and Next.js is the one being pushed.

Next.js feels enchanting at first. But spend enough time with it and you start to feel split — you're writing React, but it's not really React; you can't tell if a given piece of logic runs on the client or the server, like you can't tell if you're in a dream or awake. Server Components, Client Components, `"use client"`, `"use server"`, dynamic routes, middleware, ISR... every new concept adds cognitive weight.

What bothers me even more is the lock-in. The "officially open but quietly favorite-child" relationship between Next.js and Vercel makes someone like me — who's used to deploying things to his own K8s cluster — deeply uncomfortable.

So I started looking for alternatives.

## Why Astro

It's probably my code-cleanliness OCD again. I hate being tied down. I don't want to be married to Next.js just because I want SSR. [Astro](https://astro.build/) feels like a universal charger — it gives me all the freedom I need without forcing a worldview on me.

### [Astro](https://astro.build/) Is a Static Site Generator by Default

[Astro](https://astro.build/)'s default output is HTML plus a tiny sliver of JavaScript. It doesn't ship the entire React runtime to the client the way Next.js does. In other words, **by default, the JS payload your visitors download is close to zero**. For content-driven sites — blogs, docs, marketing pages, personal homepages — that's a knockout punch.

Only when you explicitly tell [Astro](https://astro.build/) "this component needs to be interactive" does it bundle in the corresponding runtime. "Static by default, interactive on demand" — that mental model is the inverse of Next.js's "ship the whole React kitchen sink, optimize from there." I much prefer the additive approach over "install everything, then figure out how to slim it down."

### You Can Use Almost Any Framework You Already Know

* React
* Vue
* Svelte
* Preact
* SolidJS
* Alpine.js
* Web Components

All of these integrate into [Astro](https://astro.build/) effortlessly. The only new thing you need to pick up is [Astro](https://astro.build/)'s own `.astro` component syntax — and it's about as simple as it gets. [Astro](https://astro.build/) components run **only on the server**, which is refreshingly clear. None of that Next.js-style "which side am I on right now?" identity crisis.

The best part: you can **mix multiple frameworks in the same project**. Use Svelte for a lightweight search box, React for a complex comments widget, Vue for a data-visualization chart — they all run side by side without stepping on each other. That would have been unthinkable a few years ago.

### Islands Architecture: Islands by Default, Not a Continent

This is [Astro](https://astro.build/)'s core design philosophy.

A traditional SPA treats the entire page as one giant JavaScript app — everything has to go through hydration. [Astro](https://astro.build/) instead breaks the page into individual *islands*: most of the page is static HTML (the ocean), and only the interactive parts are islands. Each island loads and hydrates independently.

You control this with client directives:

* `client:load` — hydrate as soon as the page loads
* `client:idle` — hydrate when the browser is idle
* `client:visible` — hydrate when scrolled into view
* `client:media` — hydrate when a media query matches
* `client:only` — skip SSR entirely, render only on the client

That granularity lets you control performance with surgical precision. A search box tucked into the footer doesn't need its JS downloaded on initial load — a `client:visible` handles it cleanly.

### Deploy Wherever You Want

* Cloudflare
* Netlify
* Vercel
* Node

With the right adapter, you can deploy an [Astro](https://astro.build/) app pretty much anywhere. My go-to is `@astrojs/node` — package it as a standard Node.js app, drop it into a Docker image, ship it to K8s or OpenShift. That "I'm in charge" feeling matters a lot when you spend your time deploying into enterprise environments.

Next.js technically claims to "run on any Node environment," but the moment you use certain higher-end features (ISR, certain middleware behaviors, Image Optimization), you discover that you're "a first-class citizen on Vercel and a second-class citizen everywhere else." Astro doesn't have that kind of hidden tax.

### Content Collections: Built for Content-Driven Sites

This one deserves its own section.

If you write a blog, [Astro](https://astro.build/)'s Content Collections are a killer feature. You can use Zod to define schemas for your Markdown / MDX files — frontmatter field types, required fields, defaults, all validated at build time. Mistype a field name? Build fails. It can't make it to production.

```typescript
// src/content/config.ts
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    cover: z.string().optional(),
  })
});
```

I used to run into a recurring annoyance with other static site generators: someone fat-fingers a frontmatter field, the homepage list renders wrong, and you only notice in production. Content Collections catches all of that at compile time. Combined with TypeScript, the writing-and-publishing workflow is genuinely smooth.

### View Transitions: Silky Page Transitions in One Line

[Astro](https://astro.build/) ships a built-in wrapper for the browser's View Transitions API. Add one line to your layout:

```astro
---
import { ClientRouter } from 'astro:transitions';
---
<ClientRouter />
```

Suddenly every page navigation has SPA-like smooth transitions — even though what you're writing is still a multi-page app (MPA). It's one of the best "minimum effort, maximum UX gain" features I've ever seen.

### Vite by Default — Build Speed That Spoils You

[Astro](https://astro.build/) uses Vite as its bundler out of the box, and you can plug in any Vite plugin. There's almost nothing to configure.

How fast is HMR? I save a component, switch to the browser, and the update has already happened. Sometimes I genuinely wonder if it updated *before* I pressed save.

### So It Has No Downsides?

Of course it does, my friend. No framework is a silver bullet.

#### Downside 1: Communication between islands is a pain.

This is the flip side of its biggest strength.

Each client island is, in the browser, its own independent React/Vue instance — there's no shared root binding them together. Say I want to use Tanstack Query or Redux Toolkit. The old way: wrap your App in a Context at the entry point, done. In Astro, that just doesn't work — there's no single entry point. Every island is its own entry.

The community's standard answer is framework-agnostic state libraries like nanostores. nanostores isn't tied to any framework, so every island — regardless of which framework it's written in — can subscribe to the same store. That's what I'm using now: global state lives in nanostores, and each island subscribes to what it needs. The trade-off is that you give up some of the more mature solutions from the React ecosystem, and that takes some adjustment.

#### Downside 2: Not great for heavily interactive apps.

If what you're building is a SaaS dashboard, a Figma-style collaboration tool, or anything with wildly complex interactivity — Astro is the wrong choice. In those apps, almost the entire page is interactive. The "islands" grow until they cover the whole ocean, and the architecture's advantage evaporates. You're just adding complexity. Reach for Next.js, Remix, or a plain SPA instead.

#### Downside 3: The ecosystem is still young.

Yes, you can use React/Vue components, but Astro's own integrations, templates, and tutorials don't yet match Next.js in volume. For edge cases, Stack Overflow answers are scarcer. The flip side: the official docs are excellent, the Discord community is active, and most problems do eventually find a solution.

### Who Should Use [Astro](https://astro.build/)

If what you're building is:

- A personal or technical blog
- A product site or marketing landing page
- A documentation site
- A content-driven site (news, e-commerce product pages, etc.)
- A portfolio

then [Astro](https://astro.build/) is, in 2026, just about the best option out there. No real competition.

If you're building a heavily interactive application, look elsewhere. Pick the right tool for the job — don't force-fit something just because you happen to like it.

By the way, **the blog you're reading right now is built with Astro**.

And don't make the mistake of thinking [Astro](https://astro.build/) is only good for personal-blog-scale work. The [Red Hat Product Security Compliance](https://access.redhat.com/compliance) portal I led at Red Hat is built on [Astro](https://astro.build/) too — an enterprise-facing compliance site that has to serve a large volume of structured security content across multiple product lines, with hard requirements on SEO and first-paint performance. The Islands architecture keeps the pages light, and on the deployment side we run on Red Hat's own OpenShift infrastructure — no platform lock-in of any kind. We also have the flexibility to integrate the unified Red Hat Customer Portal header and footer into every page, so the whole portal stays visually consistent.

That, to me, is the best proof that [Astro](https://astro.build/) is ready for enterprise work.