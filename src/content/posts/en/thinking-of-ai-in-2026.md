---
title: "Some Shifts in How I Think About AI in 2026"
excerpt: "AI seems different from previous tech bubbles — it is genuinely changing the way we live."
date: 2026-4-1
tags: [AI, "Claude Code", "Cursor", "ChatGPT"]
cover: "thinking-of-ai-in-2026.png"
---

## From “Myth” to “Artificial Idiocy”

In 2024, ChatGPT pushed AI into the mainstream. For a while, the entire industry, the media, and even friends with little technical background seemed to treat AI with an almost mythical imagination — as if an all-knowing intelligence had finally arrived.

But once I actually sat down and started using it as a daily tool, the illusion faded pretty quickly. It could answer certain questions in ways that sounded impressively professional, but the moment it encountered common sense or situations that required causal reasoning, it would confidently start making things up.

One example stuck with me. If you asked, “My Bluetooth earbuds are broken — should I go to the dental department or ENT at the hospital?”, most models would seriously analyze the structure of the ear and eventually give you a seemingly reasonable but completely absurd answer. It never realized the semantic trap: the thing that was broken was the earbuds, not the ears.

That contrast — looking intelligent while actually being stupid — became what I jokingly called an **“artificial idiocy moment.”**

When I started digging into how Transformers and GPT models actually worked, that feeling became even clearer. What we call “intelligence” is, at its core, just next-token prediction across a massive probability space. The model does not truly understand the question. It simply predicts the most statistically likely continuation based on the context and its training data.

The fluency is real. But once the problem falls near the edge of its training distribution — or requires genuine reasoning chains — it will wrap a wrong answer in very polished language.

At the time, my conclusion was simple:

This thing was still very far away from real intelligence.

## 2025: “AI Everywhere” and the Great Leap Forward

By 2025, an AI wave had swept through companies everywhere. Every product — whether AI actually fit the problem or not — suddenly needed to “integrate AI,” “add AI capabilities,” or “build AI selling points.” If your proposal deck didn’t mention AI, it was almost impossible to get approval. If your weekly report didn’t mention AI, it looked like you hadn’t done any work.

The entire period gave me a strong sense of a technological “Great Leap Forward.”

Everyone was talking about building AI and using AI, but very little meaningful output actually landed in production. Most teams were doing the same thing: taking features that could have been solved perfectly well with rules, SQL, or a normal backend service, forcing an LLM call into the middle of it, and then proudly announcing they had “AI-powered” the product.

The demos looked exciting. The actual user experience often became worse — slower, more expensive, and occasionally nonsensical.

In the second half of 2025, the buzzword evolved from “AI” into “Agent.” Suddenly everyone was building Agents. Everyone was drawing diagrams of “multi-agent collaboration systems.”

But honestly, I often couldn’t tell what problems these Agents actually solved that couldn’t already be solved before — or whether people had simply turned one API call into five API calls and given each intermediate step a human-sounding name.

Despite all the hype, one question kept bothering me:

**When would AI actually change the way I work?**

## The Turning Point: From “Answering” to “Doing”

I had been telling my team for a long time that the next phase of AI would never stop at simply “answering questions” or “retrieving information.”

The real inflection point would come when you tell AI what you want — and **it directly does the work for you**.

That is what AI should really be doing.

The first product that made me feel we were approaching this direction was Cursor. For the first time, it connected “what a programmer has in mind” with “actual generated code” in a surprisingly smooth way.

But honestly, after using Cursor for a while, I wasn’t very impressed. My biggest feeling was:

**It constantly wrote nonsense**.

- In empty projects, it tended to generate bloated, over-engineered, AI-smelling code with messy structure.
- In existing projects, it often fixed one thing while breaking three others — and then immediately forgot the previous discussion in the next conversation.

It wasn’t until Claude Code appeared that the experience was fundamentally redefined.

## Claude Code: What a Real Agent Loop Looks Like

Claude Code made a product decision that initially felt counterintuitive:

**Instead of becoming an IDE plugin, it became a command-line tool**.

But that exact decision ended up allowing it to completely outperform many competing products at the engineering level.

Later, I realized there were probably two reasons for this.

**The first is simply the model itself**. Over the past two years, the Claude series improved dramatically in coding ability — reasoning, long-context handling, and tool-use stability are all among the best in the industry.

**But the second reason — and the more important one in my opinion — is the design of its Agent loop**.

By operating through the terminal, Claude Code built a continuous read–plan–act–observe loop. The state of the repository, command execution results, file changes, and outputs are all continuously fed back into the context, allowing the model to work inside an ongoing feedback cycle.

It is no longer a one-shot Q&A interaction.

It becomes a system that can autonomously push a task forward.

The difference in practice is obvious.

Cursor felt like an enthusiastic intern with terrible memory.

Claude Code felt more like an engineer capable of running a workflow independently and validating its own work.

It would:

- Read through the project to understand the existing structure
- Propose a modification plan and wait for confirmation
- Write code alongside tests
- Run tests, inspect outputs, fix bugs, and rerun
- Finally summarize what it changed and which files were modified

Things became even more interesting once mechanisms like **Skills** (such as Superpowers-style systems) entered the picture.

The model no longer blindly starts coding immediately. Instead, it first talks to you, clarifies requirements, proposes approaches, and — most importantly — thinks before acting.

For decades, humans developed engineering methodologies like TDD, BDD, code review, and incremental refactoring. Now the model can actually walk through those processes on its own, while humans only need to approve or reject key decisions along the way.

This was the first time I genuinely felt that AI was changing how I work — rather than merely acting as a more advanced search engine.

## A Fundamental Shift in How I View AI

Over the past year, my understanding of AI has changed dramatically.

My current belief is this:

**Mechanisms like Skills and MCP are fundamentally just workarounds for the current stage of AI**.

They exist because models today are still not capable enough to solve every problem entirely from scratch. Humans still need to feed them domain knowledge, tooling conventions, and operational structures in a machine-readable form.

But I believe this is temporary.

As models continue to improve, future AI systems will create tools on their own, combine tools on their own, and define workflows on their own. You give them a goal, and they mobilize every accessible resource to achieve it.

Something closer to The Machine from 《Person of Interest》.

The moment you describe what you want, it gathers the world’s most relevant information, the best methodologies, and the optimal execution path — and simply starts working.

At that point, you will not need to maintain a SKILL.md file teaching the model what to do in every scenario.

Following this line of thinking further, **many software categories we currently take for granted are rapidly losing their reason to exist**:

- Watermark removal tools? Modern AI models can process images directly in seconds, often with better results.
- Calculators, unit converters, exchange-rate tools? Just take a picture and let AI read, solve, and explain everything.
- Translation apps? AI translations already sound more natural than most dedicated translation products, across nearly any language pair.
- Countless “micro SaaS” tools? Their core value — packaging workflows into buttons — evaporates once AI can execute workflows dynamically.

The software industry will not disappear.

But the entire layer of “tool-centric software” may gradually be absorbed into AI itself.

The products that survive will likely either stay close to the physical world — infrastructure, operating systems, robotics — or close to human organizations — collaboration, trust, and decision-making.

That massive middle layer of “turning functionality into apps” may get compressed very quickly.

## The Part That Worries Me: Are We Going to Degenerate Together?

But there is another side to all of this that I cannot ignore.

If we continue moving toward a world where every question is asked through AI and every task is delegated to AI, I have a growing concern:

Are we ourselves slowly heading toward cognitive decline?

Human cognition is fundamentally “use it or lose it.”

We learned to think because we once had no choice but to think.

- We had to solve equations ourselves.
- We had to memorize phone numbers ourselves.
- We had to navigate with maps and spatial judgment ourselves.

Every forced act of thinking strengthened the brain’s pathways.

But now, one by one, those forms of “forced thinking” are disappearing:

- No need to remember routes — navigation handles it.
- No need to calculate — AI does it.
- No need to search manually — just ask.
- Soon, perhaps no need to write or even think deeply — prompts generate entire blocks of text instantly.

In the short term, this is a victory for efficiency.

But in the long term, I worry that we are outsourcing the very abilities that define us as humans:

independent judgment, critical thinking, and the ability to form original ideas.

When a person no longer needs to organize thoughts into language, weigh trade-offs independently, or struggle through a blank page, they gradually lose the mental muscles required to create genuinely original thinking.

What worries me even more is that this decline happens silently.

You do not suddenly wake up one day feeling “dumber.”

Instead, you slowly realize that whenever a problem appears, your first instinct is simply:

*“Let me ask AI.”*

And once AI gives an answer, you become increasingly unwilling to question it, verify it, or challenge it.

At that point, the real question is no longer:

*“How powerful is AI?”*

The real question becomes:

**When we are separated from AI, what remains of us**?

That is the question I find myself thinking about most these days.

I do not have an answer.

But I do believe that preserving the habit of thinking independently may become one of the most important forms of self-discipline in the next decade.

The more powerful AI becomes, the more important that habit will be.