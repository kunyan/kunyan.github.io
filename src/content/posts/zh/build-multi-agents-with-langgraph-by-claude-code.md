---
title: "用 Claude Code 从零搭一个基于 LangGraph 的 Multi-Agent 系统"
excerpt: "最近我用 Claude Code 从零写了一个跑步教练 agent 系统——能同步 Strava 运动记录，能针对训练数据做问答，背后是一个基于 LangGraph 的 Supervisor 多 agent 架构。这篇文章不是教程，而是一份工程复盘：方法论怎么定的、架构为什么这么切、过程中踩了哪些坑。"
date: 2026-05-25
tags: [Agent, Claude, ClaudeCode, LangGraph, LangChain, MultiAgent, Superviser]
cover: "build-multi-agents-with-langgraph-by-claude-code.png"
---

最近我用 Claude Code 从零写了一个跑步教练 agent 系统——能同步 Strava 运动记录，能针对训练数据做问答，背后是一个基于 LangGraph 的 Supervisor 多 agent 架构。这篇文章不是教程，而是一份工程复盘：方法论怎么定的、架构为什么这么切、过程中踩了哪些坑。

如果你也打算用 Claude Code 做稍微有点规模的项目，开篇这个结论可能是整篇文章里最值钱的一句：**不要一开始就把计划做得完整周密**。

## 一、方法论：先上幼儿园，再上小学

我和 Claude Code 协作过几个项目之后，逐渐形成了一个反直觉的判断：一上来就把方案设计得事无巨细，反而是反模式。

原因很机械——细节越多，进入 context 的信息越多，越往后 Claude 越容易"忘事"：早期定下的约束、命名规范、模块边界，会在长上下文里被稀释。这不是 Claude 的能力问题，是任何带上下文窗口的 agent 系统都绕不开的物理限制。

所以我的做法是**像养孩子一样分阶段推进**——幼儿园、小学、中学、大学，每个阶段结束都是一个可运行的系统，再决定下一阶段加什么。

具体到这个项目，我用了 Superpowers 的 brainstorming 流程来开局。第一句 prompt 只有一行：

```
/superpowers:brainstorming 我希望做一个跑步教练的agent系统
```

Superpowers 没有立刻动手写代码，而是反过来问了我六个问题来澄清需求——给谁用、想探索哪些 agent 能力、agent 循环用什么框架、数据从哪来、怎么交互、教练的核心场景是什么。我一个一个回答下去，最后得到的不是代码，而是一份排好优先级的设计共识：

- **定位**：学习项目，重点是亲手探索 agent 架构（工具调用、记忆、多 agent 协作、规划/反思循环）
- **框架**：LangGraph
- **数据源**：Strava API（OAuth2）
- **界面**：Web 聊天界面
- **场景**：备赛计划 + 日常跑步助手

这个开局值得说一下——它把"我想做个跑步教练"这种模糊愿望，变成了六个可决策的维度。后面的所有架构选择都从这六个维度推下来，不会出现"做着做着方向偏了"的情况。

## 二、为什么选 Supervisor 多 agent 而不是单 agent

确认需求之后，Claude 给了我三种架构方案：

- **方案 A**：Supervisor + 三个专职子 agent（数据 / 规划 / 对话）
- **方案 B**：单 agent + 大工具集
- **方案 C**：固定流水线状态机（感知→分析→规划→回复）

我选了 A。理由不复杂：方案 B 最简单，但"多 agent 协作"这个学习目标基本体现不出来——只是一个 agent 在调工具而已；方案 C 太死板，日常闲聊硬塞进固定流水线很别扭。只有 A 能把工具调用、记忆、多 agent 协作、规划/反思这四种能力**干净地各占一块**，互不纠缠。

最终的架构形态是这样：

```
┌─────────────────────────────────────┐
│  Web 聊天界面 (静态 HTML/JS, SSE)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  FastAPI 后端                        │
│  ├─ /chat   (流式对话端点)            │
│  └─ /strava/callback  (OAuth2 回调)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  LangGraph 图: Supervisor 多 agent   │
│                                      │
│      ┌─────────────┐                 │
│      │ Supervisor  │ ← 意图理解+路由 │
│      └──┬───┬───┬──┘                 │
│         │   │   │                    │
│      ┌──▼┐ ┌▼──┐ ┌▼────┐             │
│      │数据│ │规划│ │对话 │             │
│      └─┬─┘ └─┬─┘ └──┬──┘             │
│        └─────┴───────┘               │
└──────────┬────────┬─────────────────┘
           │        │
   ┌───────▼──┐  ┌──▼──────────────┐
   │ 工具层    │  │ 记忆/持久化      │
   │ Strava   │  │ SQLite           │
   │ 数据分析  │  │ - 长期领域数据    │
   └──────────┘  │ - 对话 checkpoint │
                 └──────────────────┘
```

三个子 agent 的分工：

- **数据 agent**：调 Strava API 同步活动、做趋势分析。工具有 `sync_strava_activities`、`get_recent_runs`、`analyze_trends`。
- **规划 agent**：制定/调整备赛计划。内部跑一个"生成草稿 → 自我批评 → 修正"的小循环，最多 N 轮，到顶用当前最佳草稿定稿。
- **对话 agent**：日常问答、跑后反馈、闲聊。只读访问用户档案和训练数据。

Supervisor 自己不调业务工具，只做一件事：读对话 + 记忆摘要，决定下一步交给哪个子 agent，或者判断"可以收尾回复用户了"。

技术栈方面，有一个值得说的决定：**前端用极简静态 HTML/JS 而不是 Streamlit**。因为 Strava OAuth 回调本来就需要 FastAPI 后端，用 Streamlit 反而要再拼一套，不如统一在 FastAPI 上。

## 三、记忆设计：短期 + 长期分两条路

Agent 系统的难点很大程度上是记忆。我特别要求了这一点——短期记忆要理解当前聊天上下文，长期记忆要了解用户一段时间的训练情况，以此为依据制定计划或评价训练效果。

最终方案是两条路分开走：

**短期记忆**用 LangGraph 的 `SqliteSaver` checkpointer，按 `thread_id` 保存完整消息历史和图状态，跨请求、跨重启都能恢复。对话过长时自动摘要压缩——把早期消息滚动汇总成一段 summary 注入。这点对本地小模型尤其重要，它们上下文窗口小，不能无限堆历史。

**长期记忆**存为 SQLite 里的结构化数据，**不是**塞进 prompt 的纯文本：

| 表 | 内容 |
|---|---|
| `runs` | 每次跑步活动（日期、距离、配速、心率…） |
| `user_profile` | 目标、个人最好成绩、每周可训练时间、伤病/偏好 |
| `training_plans` | 当前及历史训练计划 |

长期记忆怎样进入 agent 的推理，这里有个关键设计——**不把全部历史硬塞进 prompt**，而是分两条路：

1. **按需检索**：规划 agent 要制定/调整计划时，主动调 `get_recent_runs` + `analyze_trends`，拿到"近 4 周跑量趋势、配速变化、计划完成率"这样的训练快照作为依据。
2. **会话级记忆摘要**：每次会话开始，Supervisor 往系统提示里注入一段轻量摘要（当前目标、计划进度、近 7 天跑量），让所有 agent 一上来就有基本盘感。

这个分法之所以重要：把结构化数据当数据库用（精确查询、聚合计算），把摘要当上下文用（让 agent 有基本判断力）。混在一起塞 prompt 是新手最常见的陷阱，token 烧得快、模型还容易抓不到重点。

## 四、一次典型对话的数据流

以"帮我看看最近训练状态，然后调整下半马计划"为例：

1. 用户消息 → FastAPI `/chat` → LangGraph 图
2. Supervisor：注入会话记忆摘要，判断意图 → 路由到「数据 agent」
3. 数据 agent：`sync_strava_activities`（增量同步）→ `analyze_trends` → 训练快照写回图状态
4. Supervisor：已有数据，意图含"调整计划" → 路由到「规划 agent」
5. 规划 agent：`get_current_plan` + 训练快照 → 进入规划子图（草稿 → 自我批评 → 修正 → 定稿）→ `save_plan`
6. Supervisor：任务完成 → 收尾，交「对话 agent」组织成自然回复
7. 流式 token 经 SSE 推回前端

所有步骤的图状态由 checkpointer 持续落盘。这意味着如果服务在第 4 步崩了，重启之后能从第 4 步继续，不用从头再来。

## 五、踩坑：可配置 LLM 带来的隐藏复杂度

设计阶段我提了一个看起来人畜无害的需求：**让用户可以提供自己的 LLM API 和 Key**，开发阶段我用 Ollama 或 DeepSeek。

实现方式很直接——不绑定某家厂商，走 OpenAI 兼容接口（`langchain-openai` 的 `ChatOpenAI`），用户只要在 `.env` 里填三样就能切换：

```
LLM_BASE_URL  # Ollama: http://localhost:11434/v1 / DeepSeek: https://api.deepseek.com/v1
LLM_API_KEY   # DeepSeek 的 key；Ollama 填任意占位符
LLM_MODEL     # deepseek-chat / qwen2.5 等
```

但这个"开放性"带来两个实际约束：

**约束一:模型必须支持工具调用。** 整套多 agent 系统重度依赖 function calling——Supervisor 路由要靠它、子 agent 调工具要靠它。DeepSeek 支持；Ollama 则要选支持工具的模型（qwen2.5、llama3.1），纯文本模型直接让 agent 失效。这点必须写进文档的"前置要求"。

**约束二：DeepSeek v4 的思考模式默认开启，而 LangGraph 的图循环会把它噎住。** 这是真正让我手动改代码的地方。Claude Code 的训练数据里 DeepSeek 还没出 v4，所以它写出来的 `build_llm` 没考虑这点。运行时我撞到了这个错误：

```
openai.BadRequestError: Error code: 400 - {'error': {'message':
'The reasoning_content in the thinking mode must be passed back to the API.',
'type': 'invalid_request_error', ...}}
```

意思是：v4 在思考模式下返回 `reasoning_content` 字段，下一轮调用必须把它原样传回去。LangGraph 的消息累积机制并不知道这个新约定，于是循环到第二轮就 400 了。

解决方法是直接关掉思考模式（[DeepSeek 文档说明](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode)）：

```python
def build_llm(config: Config) -> ChatOpenAI:
    """根据用户配置构造一个 OpenAI 兼容的聊天模型。

    支持任意 OpenAI 兼容端点(Ollama、DeepSeek 等)。所选模型
    必须支持工具调用(function calling),否则后续阶段的 agent 会失效。
    """
    return ChatOpenAI(
        model=config.llm_model,
        base_url=config.llm_base_url,
        api_key=config.llm_api_key,
        temperature=0,
        extra_body={"thinking": {"type": "disabled"}},
    )
```

这个坑本身不复杂，但它揭示了一个更普遍的问题：**Claude Code 的知识有截止时间，新模型的新行为它不知道**。所以涉及具体 API 的部分，跑起来再调试比花时间让它"想清楚"更高效——错误信息本身就是最好的提示。

## 六、分阶段推进，每一阶段都可运行

设计文档定下来之后，我把实现切成了四个阶段，每个阶段结束都是一个**完整可运行**的系统：

| 阶段 | 内容 | 完成后能做什么 |
|---|---|---|
| P1 地基 | 项目骨架、SQLite 存储层、Strava OAuth + 同步、FastAPI 后端骨架、可配置 LLM | 命令行能把 Strava 数据同步进库 |
| P2 单 agent 跑通 | 数据 agent（ReAct + 工具）、极简 Web 聊天界面（SSE 流式） | 网页里问"我最近跑量怎样"，agent 查数据回答 |
| P3 多 agent + 记忆 | Supervisor 路由、对话 agent、checkpointer + 长期记忆摘要 | 多轮连贯对话，意图被正确分流 |
| P4 规划 agent | 规划 agent + 显式"规划→反思→修正"子图、备赛计划场景 | 完整：制定计划 + 跑后评价 + 日常问答 |

每个阶段实现完，我都会**手动检查一遍**——读代码、跑一遍主流程、看看有没有偏离设计。这一步不能省。Claude Code 在长上下文里偶尔会做一些"自作主张"的优化，越早发现越好改。

回头看，这种切法的好处不只是降低 context 压力，更重要的是：**每一阶段都强迫你回答"这一阶段算交付完成的标准是什么"**。这个问题逼着你把模糊的"做一个 agent 系统"具象成可验证的里程碑。

## 七、一些可以带走的东西

如果只能从这个项目里带走三条经验，我会选这三条：

1. **不要一开始就规划得完整周密**。让 Claude Code 在长上下文里记住所有细节是反人性的。分阶段推进，每阶段都是可运行的系统，是更稳的做法。

2. **架构选择要服务于学习目标**。这个项目选 Supervisor 多 agent 而不是单 agent，本质上是因为我想亲手探索多 agent 协作——如果只是想跑通一个跑步教练功能，方案 B 更快。**先想清楚"我要学什么"，再想"用什么架构"**。

3. **涉及外部 API 和新模型的部分，跑起来调试比想清楚更有效率**。DeepSeek v4 思考模式那个坑，看文档看一天可能也想不到，跑一次 400 错误立刻就明白了。Claude Code 帮你写 80%，剩下 20% 是用真实错误信息喂回去让它修。

跑步教练这个壳本来就不重要——重要的是这次能把工具调用、记忆、多 agent 协作、规划/反思**完整走一遍**的练习。事实上后来我又调了几轮，把它扩成了一个支持铁人三项的 agent，毕竟跑步只是我运动的一部分。这本身也算是"分阶段推进"方法论的一个活例证：连项目的定位都是慢慢长出来的，而不是一开始就规划好的。

代码在 [kunyan/triathlon-coach-agent](https://github.com/kunyan/triathlon-coach-agent)，克隆后可以本地跑起来。下次再做更复杂的 agent 系统，这套方法论应该还能复用。