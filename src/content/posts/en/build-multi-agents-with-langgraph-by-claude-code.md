---
title: "Building a LangGraph-Based Multi-Agent System from Scratch with Claude Code"
excerpt: "I recently used Claude Code to build a running coach agent system from scratch — it syncs Strava activity data and can answer questions about your training, backed by a Supervisor multi-agent architecture built on LangGraph. This isn't a tutorial; it's an engineering retrospective: how the methodology took shape, why the architecture is sliced the way it is, and what pitfalls I hit along the way."
date: 2026-05-25
tags: [Agent, Claude, ClaudeCode, LangGraph, LangChain, MultiAgent, Superviser]
cover: "build-multi-agents-with-langgraph-by-claude-code.png"
---

I recently used Claude Code to build a running coach agent system from scratch — it syncs Strava activity data and can answer questions about your training, backed by a Supervisor multi-agent architecture built on LangGraph. This isn't a tutorial; it's an engineering retrospective: how the methodology took shape, why the architecture is sliced the way it is, and what pitfalls I hit along the way.

If you're also planning to use Claude Code on a project of any real size, the most valuable sentence in this whole post might be the opening conclusion: **don't try to plan everything in complete detail upfront.**

## 1. Methodology: Kindergarten before elementary school

After collaborating with Claude Code on a few projects, I've gradually formed a counterintuitive judgment: laying out an exhaustively detailed plan from the start is actually an anti-pattern.

The reason is mechanical — the more detail there is, the more information enters the context, and the more easily Claude "forgets" things as the conversation goes on: constraints set early, naming conventions, module boundaries, all get diluted in a long context window. This isn't a Claude capability issue; it's a physical limit any agent system with a context window has to live with.

So my approach is to **advance in stages, like raising a child** — kindergarten, elementary, middle school, university. At the end of each stage you have a working system, and only then do you decide what to add next.

For this specific project, I used Superpowers' brainstorming flow to open. The first prompt was a single line:

```
/superpowers:brainstorming I want to build a running coach agent system
```

Superpowers didn't immediately start writing code. Instead, it asked me six questions to clarify the requirements — who is it for, which agent capabilities do I most want to explore, which framework for the agent loop, where does the data come from, how do I interact with it, and what is the coach's core scenario. I answered them one by one, and what I ended up with wasn't code but a prioritized design consensus:

- **Positioning**: a learning project, with the focus on hands-on exploration of agent architecture (tool use, memory, multi-agent collaboration, planning/reflection loops)
- **Framework**: LangGraph
- **Data source**: Strava API (OAuth2)
- **Interface**: web chat UI
- **Scenarios**: race prep planning + everyday running assistant

This opening is worth dwelling on — it converted a fuzzy wish ("I want to build a running coach") into six decidable dimensions. Every architectural choice that came later was derived from those six dimensions, which is what kept the project from drifting off course mid-build.

## 2. Why a Supervisor multi-agent setup instead of a single agent

Once requirements were locked in, Claude offered three architectural options:

- **Option A**: Supervisor + three specialized sub-agents (data / planning / dialogue)
- **Option B**: a single agent with a large tool set
- **Option C**: a fixed pipeline state machine (perceive → analyze → plan → reply)

I picked A. The reasoning is straightforward: Option B is the simplest, but the "multi-agent collaboration" learning goal barely shows up — it's just one agent calling a bunch of tools; Option C is too rigid, with casual everyday chat awkwardly forced through a fixed pipeline. Only A could **cleanly separate** tool use, memory, multi-agent collaboration, and planning/reflection into distinct pieces that don't entangle each other.

The final architecture looks like this:

```
┌─────────────────────────────────────┐
│  Web chat UI (static HTML/JS, SSE)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  FastAPI backend                     │
│  ├─ /chat   (streaming endpoint)     │
│  └─ /strava/callback (OAuth2)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  LangGraph: Supervisor multi-agent   │
│                                      │
│      ┌─────────────┐                 │
│      │ Supervisor  │ ← intent+route  │
│      └──┬───┬───┬──┘                 │
│         │   │   │                    │
│      ┌──▼┐ ┌▼──┐ ┌▼─────┐            │
│      │data│ │plan│ │chat │            │
│      └─┬─┘ └─┬─┘ └──┬──┘             │
│        └─────┴───────┘               │
└──────────┬────────┬─────────────────┘
           │        │
   ┌───────▼──┐  ┌──▼──────────────┐
   │ Tools    │  │ Memory / persist │
   │ Strava   │  │ SQLite           │
   │ Analytics│  │ - long-term data │
   └──────────┘  │ - chat checkpoint│
                 └──────────────────┘
```

Division of labor across the three sub-agents:

- **Data agent**: calls the Strava API to sync activities and runs trend analysis. Tools include `sync_strava_activities`, `get_recent_runs`, `analyze_trends`.
- **Planning agent**: builds and adjusts race-prep plans. Internally runs a small "draft → self-critique → revise" loop, capped at N iterations, and finalizes with the best draft when it hits the cap.
- **Dialogue agent**: everyday Q&A, post-run feedback, casual chat. Read-only access to user profile and training data.

The Supervisor itself doesn't call any business tools. It does exactly one thing: read the conversation and memory summary, then decide which sub-agent should handle the next step — or judge that it's time to wrap up and respond to the user.

One tech-stack decision worth flagging: **the frontend is minimal static HTML/JS rather than Streamlit.** Since the Strava OAuth callback already requires a FastAPI backend, using Streamlit would mean stitching together a second stack. Better to consolidate everything on FastAPI.

## 3. Memory design: short-term and long-term, on two separate tracks

A large part of the difficulty in agent systems is memory. I called this out explicitly — short-term memory has to track the current conversation context, while long-term memory has to surface the user's training picture over time, as the basis for building plans or evaluating recent training quality.

The final design splits these into two separate tracks:

**Short-term memory** uses LangGraph's `SqliteSaver` checkpointer, keyed by `thread_id`, saving the complete message history and graph state. It survives both across requests and across restarts. When the conversation gets long, it auto-summarizes — rolling earlier messages into a summary that gets injected back in. This matters especially for local small models with tight context windows; you can't just pile history forever.

**Long-term memory** lives as structured data in SQLite — **not** as free text shoved into prompts:

| Table | Contents |
|---|---|
| `runs` | each running activity (date, distance, pace, heart rate, …) |
| `user_profile` | goals, personal bests, weekly available time, injuries/preferences |
| `training_plans` | current and historical training plans |

How long-term memory gets into the agent's reasoning is the key design choice — **don't cram all history into the prompt.** Instead, two separate paths:

1. **On-demand retrieval**: when the planning agent needs to build or adjust a plan, it actively calls `get_recent_runs` + `analyze_trends` to fetch a training snapshot — "4-week mileage trend, pace changes, plan completion rate" — as evidence for the plan.
2. **Session-level memory summary**: at the start of each session, the Supervisor injects a lightweight summary (current goal, plan progress, last 7 days' mileage) into the system prompt, so every agent starts with baseline awareness.

Why this split matters: treat structured data as a database (precise queries, aggregations), and treat the summary as context (just enough for the agent to have basic judgment). Mixing the two and stuffing both into the prompt is the most common rookie trap — it burns tokens fast and makes it harder for the model to focus.

## 4. The data flow for a typical turn

Take the request "give me a read on my recent training and adjust my half-marathon plan":

1. User message → FastAPI `/chat` → LangGraph
2. Supervisor: injects the session memory summary, classifies intent → routes to the data agent
3. Data agent: `sync_strava_activities` (incremental sync) → `analyze_trends` → writes the training snapshot back into graph state
4. Supervisor: data is in hand, intent includes "adjust plan" → routes to the planning agent
5. Planning agent: `get_current_plan` + training snapshot → enters the planning subgraph (draft → self-critique → revise → finalize) → `save_plan`
6. Supervisor: task complete → wraps up, hands off to the dialogue agent to phrase a natural-language reply
7. Tokens stream back to the frontend via SSE

The graph state from every step is continuously persisted by the checkpointer. Which means: if the service crashes at step 4, after restart it can pick up from step 4 instead of starting over.

## 5. Pitfall: the hidden complexity in "configurable LLM"

During design I floated what looked like an innocuous requirement: **let users supply their own LLM API endpoint and key.** During development I'd be using Ollama or DeepSeek.

The implementation is straightforward — don't bind to any specific vendor; go through an OpenAI-compatible interface (`ChatOpenAI` from `langchain-openai`). Users fill in three things in `.env` to switch:

```
LLM_BASE_URL  # Ollama: http://localhost:11434/v1 / DeepSeek: https://api.deepseek.com/v1
LLM_API_KEY   # DeepSeek's key; any placeholder works for Ollama
LLM_MODEL     # deepseek-chat / qwen2.5 / etc.
```

But that "openness" brings two real constraints:

**Constraint 1: the model must support tool calling.** The whole multi-agent system depends heavily on function calling — Supervisor routing depends on it, and so do sub-agent tool calls. DeepSeek supports it. For Ollama you have to pick a tool-capable model (qwen2.5, llama3.1); a plain text-completion model will make the agent flat-out fail. This has to go into the README under "prerequisites."

**Constraint 2: DeepSeek v4's thinking mode is on by default, and it chokes LangGraph's loop.** This is where I actually had to manually fix code. Claude Code's training data predates DeepSeek v4, so the `build_llm` it wrote didn't account for this. At runtime I hit:

```
openai.BadRequestError: Error code: 400 - {'error': {'message':
'The reasoning_content in the thinking mode must be passed back to the API.',
'type': 'invalid_request_error', ...}}
```

Translation: in thinking mode, v4 returns a `reasoning_content` field, and the next call has to pass it back verbatim. LangGraph's message accumulation has no idea about this new convention, so the loop 400s on its second iteration.

The fix is to disable thinking mode outright ([DeepSeek docs](https://api-docs.deepseek.com/en/guides/thinking_mode)):

```python
def build_llm(config: Config) -> ChatOpenAI:
    """Build an OpenAI-compatible chat model from user config.

    Supports any OpenAI-compatible endpoint (Ollama, DeepSeek, etc.).
    The chosen model MUST support tool calling (function calling),
    or the later agent stages will not work.
    """
    return ChatOpenAI(
        model=config.llm_model,
        base_url=config.llm_base_url,
        api_key=config.llm_api_key,
        temperature=0,
        extra_body={"thinking": {"type": "disabled"}},
    )
```

The bug itself isn't complex, but it points to a more general problem: **Claude Code has a knowledge cutoff, and it doesn't know the new behaviors of newer models.** Which means for anything involving concrete API behavior, running it and debugging is more efficient than trying to "think it through" — the error message is the best prompt you'll get.

## 6. Stage-by-stage execution, every stage runnable

Once the design doc was locked, I cut the implementation into four stages, each of them resulting in a **fully runnable** system:

| Stage | Contents | What it can do |
|---|---|---|
| P1 Foundation | Project skeleton, SQLite storage layer, Strava OAuth + sync, FastAPI backend skeleton, configurable LLM | Sync Strava data into the database from the command line |
| P2 Single agent | Data agent (ReAct + tools), minimal web chat UI (SSE streaming) | Ask "how's my recent mileage?" in the browser and get a real answer |
| P3 Multi-agent + memory | Supervisor routing, dialogue agent, checkpointer + long-term memory summary | Coherent multi-turn conversation, intents routed correctly |
| P4 Planning agent | Planning agent + explicit "plan → reflect → revise" subgraph, race-prep scenario | Full system: build plans + post-run review + everyday Q&A |

At the end of every stage, I **manually reviewed it** — read the code, ran the main flow, checked for drift from the design. This step can't be skipped. Claude Code occasionally takes "creative liberties" in long contexts; the earlier you catch them, the easier they are to fix.

Looking back, the upside of this slicing isn't just lower context pressure. The bigger one is: **every stage forces you to answer "what counts as done for this stage?"** That question forces the vague "build an agent system" into verifiable milestones.

## 7. Takeaways

If I could only bring three lessons out of this project, they'd be these:

1. **Don't plan everything in exhaustive detail upfront.** Expecting Claude Code to retain every detail across a long context is fighting the medium. Stage-by-stage advancement, with a runnable system at the end of each stage, is the more stable approach.

2. **Architecture choices should serve learning goals.** I picked Supervisor multi-agent over single-agent specifically because I wanted hands-on practice with multi-agent collaboration — if I just wanted a working running coach, Option B would have been faster. **First figure out what you want to learn, then figure out which architecture to use.**

3. **For anything involving external APIs or new models, running and debugging beats theorizing.** That DeepSeek v4 thinking-mode pitfall — you could read docs all day and not see it coming; one 400 error and it's obvious. Claude Code writes 80% of it; the other 20% is feeding real error messages back so it can fix them.

The "running coach" shell was never the point — the point was getting a single project that walked through tool use, memory, multi-agent collaboration, and planning/reflection **end-to-end.** As it happens, after a few more iterations I extended it into a triathlon-capable agent, since running is only part of what I do. Which itself is a live example of the stage-by-stage methodology: even the project's own scope grew over time, rather than being planned out from the start.

The code lives at [kunyan/triathlon-coach-agent](https://github.com/kunyan/triathlon-coach-agent) — clone it and you can run it locally. The next time I tackle a more complex agent system, this methodology should still be reusable.