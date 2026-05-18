---
title: Google ADK 使用 vLLM 做 Provider 时，MCP tools 不会被调用
excerpt: "在使用 Google ADK 开发 Agent 时，发现如果用 vLLM 作为模型 provider，MCP tools 能被识别，但永远不会被调用"
date: 2025-12-12
tags: ["Google ADK", "Agent", "AI", "MCP", "vLLM"]
cover: "google-adk-vllm-mcp-failed.png"
---

我最近在用 Google ADK 开发一个 Agent 项目。Red Hat 内部很多同事也在用 ADK，但奇怪的是这个问题他们都没遇到——大概是因为他们都直接用 Gemini，没走 vLLM 这条路。我加入项目时间晚，刚好踩进了这个坑里。

## 背景：为什么要用 vLLM

Red Hat 内部 IT 提供了一个 MaaS（Model as a Service）平台，把 Llama4、DeepSeek 等开源模型用 vLLM 部署在 Red Hat OpenShift AI 上，对外暴露 OpenAI 兼容的 API。对我这种没有 GPU 的开发者来说很友好——拿到 URL 和 API Key 就能直接用。

Google ADK 的 Python SDK 是目前更新最频繁、最完整的官方 SDK。要让 ADK 接非 Google 的 Provider，官方推荐走 LiteLLM 这条路。所以代码大致是这样：

```python
root_agent = LlmAgent(
    model=LiteLlm(
        model=MODEL_ID,
        api_base=MODEL_API,
        extra_headers={"Authorization": f"Bearer {MODEL_TOKEN}"}
    ),
    name="root_agent",
    instruction=system_instruction,
    tools=mcp_toolsets,
)
```

`mcp_toolsets` 里放的都是 Remote MCP Server（Streamable HTTP 模式）。

## 现象：模型"知道"要用工具，但就是不调用

通过 ADK Dev UI 里的 Events 面板观察整个对话过程，能看到：

1. ADK 正确识别了 MCP server 暴露的 tools，数量也对。
2. 模型在回复里明确表达"我现在要用 xxx 工具来完成这个任务"。
3. 但是——**实际的 tool call 从未发起**。没有调用，没有报错，没有重试，就这么静悄悄地没了。

模型的回答停在"我要去调用工具"这一步，后面没有任何动作。

为了排除是 MCP server 本身的问题，我换成 Gemini 直连试了一下：

```python
root_agent = Agent(
    model='gemini-3-pro-preview',
    name='root_agent',
    instruction=system_instruction,
    tools=mcp_toolsets,
)
```

同样一套 MCP 配置，Gemini 这边一切正常——工具识别、调用、返回结果一条龙打通。所以问题大概率不在 MCP server，也不在 ADK 的 tool 抽象层，而是出在 LiteLLM 这条链路上的某个环节。

我测试过的模型包括 Llama4 和 granite，行为完全一致——都是识别得到、调用不动。

## 根因：function_call vs tool_calls 的格式不匹配

我把这个问题报给了 Google ADK 团队（[adk-python#3906](https://github.com/google/adk-python/issues/3906)），官方确认了根因：**LiteLLM + vLLM 这条链路上，tool call 返回的是旧版的 `function_call` 格式，而 ADK 期待的是新版的 `tool_calls` 格式**。两边对不上，所以 ADK 完全"看不见"模型发出的调用请求。

OpenAI API 在 tool/function calling 上历史上有过两代格式：

- **旧版（已 deprecated）：`function_call`** —— 单次调用，对象形式：
  ```json
  {
    "role": "assistant",
    "content": null,
    "function_call": {
      "name": "get_weather",
      "arguments": "{\"city\": \"Boston\"}"
    }
  }
  ```
  对应的 `finish_reason` 是 `function_call`。

- **新版（当前推荐）：`tool_calls`** —— 数组形式，支持并行调用：
  ```json
  {
    "role": "assistant",
    "content": null,
    "tool_calls": [{
      "id": "call_abc",
      "type": "function",
      "function": {
        "name": "get_weather",
        "arguments": "{\"city\": \"Boston\"}"
      }
    }]
  }
  ```
  对应的 `finish_reason` 是 `tool_calls`。

ADK 在解析模型响应、决定要不要执行 tool 时，看的是 `tool_calls` 字段。如果 vLLM 兼容层（或 LiteLLM 转发过程中）返回的还是 `function_call` 旧格式，那么 ADK 拿到这个响应时：

- 看不到 `tool_calls` 字段 → 认为模型没决定调用任何工具
- 但 `content` 又是空的或带文本说明 → 当作普通的助手回复处理

结果就是我看到的现象：模型"在文字层面说要用工具"，但 ADK 完全不会发起这个调用。

## 更新：官方给出的解决方案

issue 已经被官方关闭，结论是这不是 ADK 的 bug，而是 vLLM 和 LiteLLM 两端的配置问题。需要做两件事：

**1. vLLM 启动时显式启用 OpenAI 风格的 tool parser**

```bash
python -m vllm.entrypoints.openai.api_server \
  --model <MODEL> \
  --enable-auto-tool-choice \
  --tool-call-parser openai
```

关键是这两个参数：

- `--enable-auto-tool-choice` 打开 vLLM 的自动 tool 选择逻辑
- `--tool-call-parser openai` 强制使用 OpenAI 新格式的 parser，让输出落在 `tool_calls` 字段上而不是旧的 `function_call`

**2. 让 LiteLLM 把模型当作 OpenAI 风格的 provider**

在 model ID 前面加 `openai/` 前缀：

```python
root_agent = LlmAgent(
    model=LiteLlm(
        model="openai/" + MODEL_ID,  # 关键改动
        api_base=MODEL_API,
        extra_headers={"Authorization": f"Bearer {MODEL_TOKEN}"}
    ),
    name="root_agent",
    instruction=system_instruction,
    tools=mcp_toolsets,
)
```

LiteLLM 的 provider routing 是靠模型名前缀来识别的，加上 `openai/` 之后它会走 OpenAI 兼容路径处理 tool calling 字段，而不是用默认的回退逻辑。

做完这两个改动后，MCP tools 就能被正确调用了。Gemini 之所以开箱即用，是因为它本来就用新格式输出 tool call，链路上没人需要做格式转换。

## 一点反思

这个 bug 的隐蔽之处在于：**它不报错**。链路上的每一环都"觉得自己在正常工作"——vLLM 老老实实按旧格式输出，LiteLLM 老老实实转发，ADK 老老实实解析它能识别的字段。最后只是模型"说要调用工具"的那段文字停留在了对话里，没人把它翻译成真正的执行。

也是因此，类似问题在没有专门做端到端测试的情况下很容易被埋住。如果你的 Agent 在某次响应中明明应该调用 MCP/tool 但什么都没发生，第一件事就是绕开 ADK，直接 `curl` 打一下你的 model API，看看 raw response 里到底是 `tool_calls` 还是 `function_call`。

## 环境信息

> ⚠️ 如果你也遇到类似问题，下面这些版本对判断很关键：
> - Python: `3.13`
> - google-adk: `1.22.1`
> - litellm: `1.81.1`
> - vLLM (server 端): `未知`
> - 测试过的模型：Llama4、granite

## 给踩到同样坑的人

如果你正在评估"ADK + 自建 vLLM"这套组合，问题是可解的，不必绕路。直接按官方给的方案配两端就行：

- **vLLM 服务端**：启动时加 `--enable-auto-tool-choice --tool-call-parser openai`
- **ADK 客户端**：在 LiteLLM 的 model 字段前面加 `openai/` 前缀
- 调试时如果还是没动静，先用 `curl` 直接打 vLLM 的 `/v1/chat/completions`，确认返回里是不是 `tool_calls` 字段——如果还是 `function_call`，说明 vLLM 那边的 parser 没生效，回去检查启动参数

MCP 本身完全没问题，这条链路修好之后，所有 MCP server（SSE 或 Streamable HTTP）都能正常被调用。