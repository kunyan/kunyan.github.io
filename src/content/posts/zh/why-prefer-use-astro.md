---
title: "为什么我更推荐使用 Astro"
excerpt: "我曾经是 framework-less 的推崇者，做前端网站更倾向直接用 React。但折腾了一圈之后，我发现 Astro 才是更好的选择。"
date: 2026-01-17
tags: ["前端开发", "Next.js", "Astro", "SSR", "React", "Vue", "Vite"]
cover: "why-prefer-use-astro.webp"
---
## 前端开发框架进化史

要讲清楚我为什么最后落在 [Astro](https://astro.build/)，得先从我自己这十几年的前端经历说起。每一次框架的更替，背后其实都是一种思路的转变。

### 蛮荒时期：jQuery 一把扳手走天下
2009 年我刚参加工作，那时的前端还没有"框架"这个概念。最流行的库是[jQuery](https://jquery.com/)，还有它的增强集[jQuery UI](https://jqueryui.com/)。我仍然记得当时我自己做了一个[jQuery](https://jquery.com/)的plugin，主要是为了实现下拉列表的多选，反选等功能。[jQuery](https://jquery.com/)就像一把好用的扳手——简单、直接、哪里需要拧一下都能上。但它解决的是"操作 DOM"的问题，不解决"组织代码"的问题。

### 萌芽期：从 BackBone 到 AngularJS
2014年。 我在[Rakuten](https://www.rakuten.com)接手了我的第一个纯前端项目：[Rakuten Room](https://room.rakuten.co.jp). 它采用[BackBone.js](https://backbonejs.org/)作为主要的开发框架。当时还使用[Grunt](https://gruntjs.com/)作为打包工具。我仍然记得当时让我极其惊艳的一个Grunt插件。它的作用是把项目中用到的所有图片合成为一张，以雪碧图的形式在项目中应用，同时能够根据图片的变化来生成带有hash值的雪碧图。

但[BackBone.js](https://backbonejs.org/)提供的更多是一套代码布局的方式。你要按照它的套路把代码写成Model, View, Controller三块。所以我作为Team Lead接手后的第一个比较大的改动就是和团队一起用[AngularJS](https://angularjs.org/)把它全部重写。[AngularJS](https://angularjs.org/)当时提供的双向绑定简直就是神器。似乎一下子就从原始社会进化到了现代社会。

那个年代还有些尴尬的过渡产物，比如 [Bower](https://bower.io/)。前端依赖一部分用 npm 装（给 Node 用的），另一部分得用 [Bower](https://bower.io/) 装（给浏览器用的）。两套包管理共存，混乱程度可想而知。

### 成熟期：React 登场，Bower 退场

2016 年前后，重前端的开发方式成为主流。AngularJS 已经走到生命末期，[Angular](https://angular.dev/)（2.0+）作为继任者发布，但市场份额开始被 [React](https://react.dev/) 一点点蚕食。

[React](https://react.dev/) 凭着 Facebook 的背书和活跃的社区迅速崛起。那时候要起一个 React 项目，[`create-react-app`](https://github.com/react/create-react-app) 几乎是唯一选择（这个工具在 2025 年初被 React 团队官方弃用了，时代的眼泪）。

而[Bower](https://bower.io/)也在这个阶段悄无声息地退出历史舞台，所有依赖统一回到 `package.json`，由 `npm` 一把抓。

### 三国时期

2017 年前后，前端进入三国时代：

- **React** 凭实力坐稳第一把交椅
- **Angular** 像是陷进了泥潭，做了很多但又好像什么都没做，份额持续下滑
- **Vue** 作为后起之秀，加上中文社区的强力支持，成了增长最快的黑马


### 双雄争霸：React 与 Vue，以及 Vite 的诞生

到了 2020 年前后，市场基本被 React 和 Vue 瓜分。Vue 团队不甘心只做一个框架，开始向整个工具链发力，造出了新一代打包工具 [Vite](https://vite.dev/)。极快的启动速度加上简洁的配置，迅速征服了开发者。

讲到这儿我得插一段往事。2017 年我在维护 Red Hat 内部的 Case 管理系统时，负责过打包配置的优化。那套 Webpack 配置又臭又长，打包一次能让人等到花都谢了。我使出浑身解数，最终把构建时间从十几分钟压到了 3 到 5 分钟。但再往下就压不动了——代码文件实在太多。我们当时还在 AngularJS 和 React 双框架并行（渐进式迁移），靠一套自研的 Redux Adapter 让两边通信。那是一段非常折磨人的时光。

Vite 的厉害之处在于它拥抱了 ESM 标准：开发阶段直接走浏览器原生 ESM，根本不打包，所以快得像作弊；生产环境再用 Rollup 做正经构建。

为什么要在这里花笔墨讲 Vite？因为 Vite 的"不打包开发"思路，和更早的 [Snowpack](https://www.snowpack.dev/) 是一脉相承的。有意思的是，Snowpack 的作者后来创建了 [Astro](https://astro.build/)，而 [Astro](https://astro.build/) 自己后来也切换到了 Vite——这条线绕回来了。Snowpack 这个工具我最早是从 Red Hat 的美国同事 [Michael Clayton](https://linkedin.com/in/mwcz) 那里知道的，我们都在 Red Hat Customer Portal 大组，他当时也在折腾各种能提升开发者效率的工具。


### SSR 浪潮，以及 Next.js 的"绑架"

老实讲，我到现在都没完全想通 SSR 为什么能成为一股浪潮。这股风让 React 团队疯狂迷上了服务端的各种花活，然后整个生态开始走偏。Next.js 团队逐渐掌握了 React 开发的话语权——React 官方文档现在更推荐你"通过框架使用 React"，而 Next.js 就是被力推的那个。

Next.js 初用的时候确实迷人。但用久了你会陷入一种精神分裂：你写的还是 React 代码，但又不是 React 代码；你分不清这段逻辑到底跑在客户端还是服务端，就像分不清自己在现实还是在梦里。Server Component、Client Component、`"use client"`、`"use server"`、动态路由、middleware、ISR……每多一个概念，认知负担就重一分。

更让我难受的是绑定感。Next.js 和 Vercel 之间那种"明面上开放、暗地里偏心"的关系，让我这种习惯把东西部署在自己 K8s 集群里的人非常不舒服。

于是我开始寻找替代方案。

## 为什么是[Astro](https://astro.build/) ？

似乎又是因为我的代码洁癖。我讨厌被一些东西捆绑。我不想因为要采用 SSR 就被 Next.js 绑定死。而 [Astro](https://astro.build/) 似乎是一个万能充电器，它给足了我足够的自由度。


### Astro 默认是一个静态站点生成器

[Astro](https://astro.build/) 默认输出的就是 HTML + 极少量的 JavaScript。它不会像 Next.js 那样默认把整个 React Runtime 塞给客户端。换句话说，默认状态下，你的网站访客下载的 JS 体积接近于零。这对内容型网站（博客、文档、营销页、个人主页）来说是降维打击。
只有在你明确告诉 Astro "这个组件需要交互"的时候，它才会把对应的运行时打包进去。这种"默认为静态，按需交互"的心智模型，和 Next.js 那种"默认 React 全家桶，按需优化"是反过来的。我个人非常喜欢这种"做加法"的设计，而不是"先全装上，再想办法瘦身"。

### 你可以用几乎任何你熟悉的框架

* React
* Vue
* Svelte
* Preact
* SolidJS
* Alpine.js
* Web Component

这些前端框架都可以轻松和 [Astro](https://astro.build/) 集成。你只需要简单学习下 [Astro](https://astro.build/) 自己的 component 语法，一些简单到不能再简单的代码。Astro 组件只运行在服务端，这一点非常清晰，不会有 Next.js 那种"我现在到底在哪一端"的精神分裂感。
更妙的是，你可以在同一个项目里混用多个框架。比如我可以用 Svelte 写一个轻量的搜索框，用 React 写一个复杂的评论组件，用 Vue 写一个数据可视化的图表。它们各跑各的，互不干扰。这在以前是不可想象的。


### Islands Architecture：默认是岛，不是大陆

这是 [Astro](https://astro.build/) 最核心的设计哲学。

传统的 SPA 是把整个页面当成一个巨大的 JavaScript 应用，所有内容都要走 hydration。而 [Astro](https://astro.build/) 把页面拆成一座座"岛"——大部分内容是静态 HTML（海洋），只有需要交互的部分才是岛屿，每座岛独立加载、独立 hydrate。

这套机制通过几个 client directive 来控制：

* `client:load` —— 页面加载就 hydrate
* `client:idle` —— 浏览器空闲时再 hydrate
* `client:visible` —— 滚动到可视区域才 hydrate
* `client:media` —— 满足某个媒体查询时才 hydrate
* `client:only` —— 完全跳过 SSR，仅在客户端渲染

这些 directive 的颗粒度让你可以非常精细地控制性能。一个折叠在页脚的搜索框，没必要在首屏加载就把它的 JS 全下载下来。用 `client:visible` 就能优雅解决。

### 你可以把程序部署在任意环境

* Cloudflare
* Netlify
* Vercel
* Node

通过对应的 adapter，[Astro](https://astro.build/) 程序可以部署在几乎任何地方。我个人最常用的是 `@astrojs/node`，把它打成一个标准的 Node.js 程序，塞进 Docker image，部署在 K8s 或 OpenShift 上。这种"我说了算"的感觉，对一个常年和企业内部环境打交道的人来说太重要了。
相比之下，Next.js 虽然官方也说"可以部署在任意 Node 环境"，但你一旦用了它的某些高级特性（比如 ISR、某些 middleware 行为、Image Optimization），你就会发现"在 Vercel 上是一等公民，在别处是二等公民"。[Astro](https://astro.build/) 没有这种暗中绑定。


### Content Collections：为内容型站点而生

这个功能我必须单独拿出来说。
如果你写博客，[Astro](https://astro.build/) 的 Content Collections 是杀手锏。你可以用 Zod 给你的 Markdown / MDX 文件定义 schema，frontmatter 的字段类型、必填项、默认值，全部在编译期校验。写错一个字段名，构建就失败，根本到不了线上。


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

我以前用其他静态站点生成器写博客，经常出现"某篇文章 frontmatter 写错了，导致首页列表渲染异常"这种问题。Content Collections 把这类问题在编译期就拦截了。配合 TypeScript，整个开发体验是丝滑的。


### View Transitions：一行代码搞定丝滑过渡

[Astro](https://astro.build/) 内置了对浏览器 View Transitions API 的封装。你只要在 Layout 里加一行：

```astro
---
import { ClientRouter } from 'astro:transitions';
---
<ClientRouter />
```
整个站点的页面跳转就会有 SPA 一样的丝滑过渡效果，但你写的依然是多页应用（MPA）。这是我见过的"用最小代价获得最大用户体验提升"的功能之一。


### 它默认采用 Vite，你可以获得极致的打包速度

Astro 本身自带的打包工具就是 Vite，你还可以和任意 Vite 插件集成，几乎不需要配置任何东西。
热更新快到什么程度？我修改一个组件，Cmd+S 之后切到浏览器，更新已经完成了。我经常怀疑是不是自己保存之前它就已经更新了。

### 那它没有缺点吗？

有的，朋友。任何框架都不是银弹。

#### 第一个缺点，也是它最大优点的副作用——Islands 之间的通信很麻烦。

每个 client island 在客户端其实是独立的 React/Vue 实例，它们之间没有共享的根。举个例子，我想用 Tanstack Query 或 Redux Toolkit，按照以前的方式，你只需要在 React 的入口文件给 App 包一层 Context 就行。但在 [Astro](https://astro.build/) 项目里你做不到，因为入口文件不是一个，每个 client island 都是一个独立入口。

社区的解决方案通常是用框架无关的状态管理库，比如 nanostores。nanostores 不绑定任何框架，所有 island 都可以订阅同一个 store，跨框架通信也没问题。我目前的做法就是这个——把全局状态放在 nanostores 里，需要的 island 各自订阅。但这意味着你要放弃一些 React 生态里成熟的方案，做一些心理建设。

#### 第二个缺点：它不适合做重度交互的应用。

如果你要做的是一个 SaaS 后台、一个 Figma 那样的协作工具、一个交互极其复杂的 Dashboard——[Astro](https://astro.build/) 不是合适的选择。这类应用整个页面几乎都是交互，"岛"会大到覆盖整个海洋，这时候 Islands 架构的优势就没了，反而引入了不必要的复杂度。这种场景下 Next.js、Remix、或者纯 SPA 反而更合适。


#### 第三个缺点：生态相对年轻
虽然能用 React/Vue 的组件，但 [Astro](https://astro.build/) 自己的集成插件、模板、教程的数量肯定比不上 Next.js。遇到边角问题的时候，Stack Overflow 上的答案会少一些。不过官方文档质量非常高，Discord 社区也活跃，大部分问题最终都能解决。


### 谁该用 Astro ？

如果你在做的是：

- 个人博客、技术博客
- 产品官网、营销落地页
- 文档站点
- 内容驱动的网站（新闻、电商商品展示页等）
- 作品集


那 [Astro](https://astro.build/) 几乎是 2026 年最好的选择，没有之一。
如果你在做的是重交互的应用，那可以考虑绕道。工具要选对，不要因为喜欢就硬上。
顺便一提，**你正在看的这个博客就是用 Astro 写的**。

而且别以为 [Astro](https://astro.build/) 只能拿来做个人博客这种小打小闹的东西。我在 Red Hat 主导开发的 [Red Hat Product Security Compliance](https://access.redhat.com/compliance) 门户也是用 [Astro](https://astro.build/) 做的——这是一个面向企业客户的合规信息站点，需要承载大量结构化的安全合规内容、覆盖多个产品线、对 SEO 和首屏性能都有严格要求。Islands 架构保证了页面足够轻量，部署上我们走的是 Red Hat 自己的 OpenShift 基础设施，完全没有被任何平台绑定。同时我们还能非常灵活地把 Red Hat Customer Portal 的统一头部和尾部集成进页面里，保持整个门户网站的视觉一致性。

这是 [Astro](https://astro.build/) 能撑起企业级项目的最好证明。
