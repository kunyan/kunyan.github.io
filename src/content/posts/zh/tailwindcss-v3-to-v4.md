---
title: "TailwindCSS v3 迁移到 v4 的痛苦故事"
excerpt: "为Red Hat ProdSec Compliance项目升级TailwindCSS的故事"
date: 2026-03-23
tags: ["前端开发", "TailwindCSS", "CSS", "迁移升级", "Bootstrap"]
cover: "tailwindcss-v3-to-v4.webp"
---

TailwindCSS v4其实早在2025年1月就正式推出了，但我的项目一直都没有升级。主要的原因就是迁移的成本太高了。很多的语法，配置已经完全变了，改动极大。

## 起因：一个被 legacy CSS 包围的项目

在2023 年开始构建 Red Hat ProdSec Compliance 这个项目时，我使用的是 TailwindCSS v3。这个项目有一个绕不开的约束：站点必须集成 Red Hat Customer Portal 的 header 和 footer。

听起来很普通，对吧？问题是，那段 header 的 HTML 里塞满了 legacy CSS，其中包括一份相当古老的 Bootstrap 样式。这意味着我的 utility class 命名空间里随时可能撞上一堆 `.container`、`.row`、`.col-*`、`.btn`、`.text-center` 之类的"地雷"——它们的 CSS 规则和 TailwindCSS 完全不一样，但名字一模一样。

## v3 的解法：prefix

在 v3 里，这种场景的官方推荐方案非常干净——在 `tailwind.config.js` 里加一行：

```js
module.exports = {
  prefix: "tw-",
  // ...
}
```

之后所有 utility class 都自动带上 `tw-` 前缀：

```html
<div class="tw-flex tw-items-center tw-bg-blue-500 hover:tw-bg-blue-700">
  ...
</div>
```

注意变体的位置——`hover:tw-bg-blue-700`，前缀贴在 utility 本身上，整体仍然是合法的"看起来像 Tailwind"的语法。Bootstrap 的 `.bg-blue` 想撞也撞不上，因为我的全叫 `tw-bg-blue-500`。完美隔离。


由于当时是新建项目，加上配置好tailwindcss后，IDE本身的自动补全，让你写`tw-`这种类型的class时候没有很强的不适感。

## v4 的"新设计"：prefix 变成了 variant

升级到 v4 之后，事情变得有趣起来。

首先，`tailwind.config.js` 这个文件官方已经不再主推，所有配置迁移到 CSS 文件里：

```css
@import "tailwindcss" prefix(tw);
```

写法变了，问题不大。真正让我头大的是 prefix 的**行为**变了。在 v4 里，prefix 不再附着在 utility 上，而是作为一个 **variant** 出现在整个 class 的最前面：

```html
<!-- v3 -->
<div class="tw-flex hover:tw-bg-blue-700">...</div>

<!-- v4 -->
<div class="tw:flex tw:hover:bg-blue-700">...</div>
```

注意三个变化：

1. 分隔符从 `-` 变成了 `:`
2. 前缀从"贴在 utility 上"变成了"贴在整个 class 串最前面"
3. `hover:` 这种 variant 现在跟在 prefix 之后，而不是之前

听起来好像只是语法糖换了个写法。但对一个已经有几千行 JSX 的项目来说，这意味着**每一个 class 都要重写**——而且不是简单的查找替换能搞定的，因为 `hover:tw-bg-blue-700` 到 `tw:hover:bg-blue-700` 的位置关系变了，正则会写得很难看，还容易误伤。

## 为什么我说"很惆怅"

其实 v4 的官方升级工具 `@tailwindcss/upgrade` 是可以自动迁移 prefix 的——它会把 v3 的写法批量替换成 v4 的语法。但问题不在迁移本身，而在迁移之后：

- **生成的 class 名字真的很丑**。`tw:lg:hover:bg-red-500` 这种东西，读起来心累。
- **跟 IDE 的兼容性变差**。某些版本的 Tailwind IntelliSense 对带 prefix variant 的补全支持得不够好，输入体验明显不如 v3。
- **prettier 插件需要额外配置**才能正确排序，否则 class 顺序会乱。
- **认知负担变重**。团队里其他人看到 `tw:` 开头的 class，需要重新学习这套语法。
- **无法分清前缀到底该放在什么位置**。譬如`tw:lg:hover:bg-red-500`，`tw:`是放在最前面还是应该在`hover:`前面也加呢？

最关键的是——这个"丑"是要在每一处使用 utility class 的地方都付出代价的。它不像 v3 的 `tw-` 那样几乎隐形。

## 最后我怎么处理的：一个简单粗暴的方案

权衡之后，我决定升级 v4，但**不使用 prefix**。代价是必须直面冲突——而我的解法可能不优雅，但是有效。

冲突的 class 其实是有限的、可枚举的。Bootstrap 跟 Tailwind 真正会撞的就那么几个：`container`、`grid`、`row`、`col`、`text-center` 之类。我没必要为了这几个 class 给整个项目套一层前缀。

办法是：**给这些冲突 class 单独加一个 `!` 后缀**，利用 Tailwind v4 的 important 修饰符。

```html
<!-- 冲突的写法 -->
<div class="grid grid-cols-3">...</div>

<!-- 改成 -->
<div class="grid! grid-cols-3">...</div>
```

这一下解决了两个问题：

**第一，它实际上变成了一个不同的 class 名。** Tailwind 编译 `grid!` 时，会生成一个名为 `.grid\!` 的 CSS 选择器（`!` 被反斜杠转义）。这个选择器跟 Bootstrap 的 `.grid` 在 CSS 层面**完全是两个东西**，浏览器不会把它们当作同一个 class 来匹配。

**第二，它带上了 `!important`。** 即使有其他地方因为选择器特异性或加载顺序的关系试图覆盖它，`!important` 也能兜底。对于这种和 legacy CSS 共存的场景，`!important` 通常被视为代码气味——但当对手本身就是十年前的 Bootstrap，它就成了最务实的选择。

所以最终我的代码里只有少数几个高冲突的 utility 带了 `!`，其他 99% 的 class 保持干净：

```html
<div class="container! mx-auto px-8 mb-10 max-w-364 pt-4">
  <div class="grid! grid-cols-1 gap-12 pb-10 md:grid-cols-2">
    ...
  </div>
</div>
```

这个方案的优点是改动量极小——只需要修改有限的几个 class，不用迁移整个项目的命名约定。缺点是引入了 `!important`，未来如果想在这些元素上做样式覆盖会稍微麻烦。但对一个集成 legacy header/footer 的项目来说，这个 trade-off 我觉得值。

## 一点感想

v4 在很多地方确实更现代——Oxide 引擎快得离谱，CSS-first 的配置方式也更符合直觉。但 prefix 这个改动，是一个典型的"为了架构纯粹性牺牲实用性"的决定。对于纯粹的新项目，v4 的 prefix 写法也许够用；但对于像我这样必须和 legacy CSS 共存的场景，它从"开箱即用的隔离方案"退化成了"看起来还行但用起来心累的东西"。

最后用 `!` 修饰符这种取巧的办法解决问题，谈不上优雅，但够实用。框架升级本来就是这样——理想情况下你跟着官方文档一路顺畅迁移完，现实情况下你会找到一个属于自己项目的小妥协。

如果你也在做类似的集成项目，建议在升级前先评估一下：你的 prefix 到底是为了"命名空间美观"还是"硬隔离冲突"？如果是后者，提前规划好替代方案，会比升级到一半再回头省心得多。