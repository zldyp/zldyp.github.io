了解 API 返回结果的结构是正确解析和处理响应的基础。OpenAI 聊天补全 API（包括兼容的本地服务如 `llama.cpp`）在不同场景下返回的数据结构有所不同。下面我将详细说明**非流式响应**、**流式响应**以及**错误响应**的结构，并解释每个字段的含义及何时出现。

---

## 1. 非流式响应 (`stream=False`)

当你不使用流式传输时，API 会一次性返回完整的响应。顶级结构如下：

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好！有什么可以帮你的？",
        "tool_calls": null  // 或工具调用数组
      },
      "finish_reason": "stop",
      "logprobs": null
    }
  ],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 10,
    "total_tokens": 19
  }
}
```

### 关键字段说明

| 字段 | 类型 | 描述 |
|------|------|------|
| `id` | string | 本次补全的唯一标识符 |
| `object` | string | 固定为 `"chat.completion"` |
| `created` | integer | 创建时间戳 |
| `model` | string | 使用的模型 |
| **`choices`** | array | 生成的选项列表（通常只有一个，除非请求了 `n>1`） |
| └ `index` | integer | 选项索引 |
| └ **`message`** | object | 生成的助手消息 |
|   ├ `role` | string | 固定为 `"assistant"` |
|   ├ `content` | string or null | 文本回复内容（如果没有生成文本，如仅工具调用，则为 `null`） |
|   └ `tool_calls` | array or null | **工具调用数组**（当模型决定调用函数时存在） |
| └ **`finish_reason`** | string | 生成结束的原因，见下表 |
| `usage` | object | token 使用统计（本地服务可能不提供） |

### `finish_reason` 可能值及含义

| 值 | 描述 |
|----|------|
| `"stop"` | 模型正常生成了一个消息结束符（如 `<|endoftext|>` 或用户定义的 stop 序列） |
| `"length"` | 生成的 token 数量达到了 `max_tokens` 限制，被截断 |
| `"tool_calls"` | 模型决定调用工具，此时 `message.tool_calls` 包含具体的调用信息 |
| `"content_filter"` | 生成的内容被内容过滤系统拦截 |
| `"function_call"` | （旧版，已被 `tool_calls` 替代） |

### 工具调用时的 `tool_calls` 结构

当 `finish_reason` 为 `"tool_calls"` 时，`message.tool_calls` 是一个数组，每个元素代表一个要调用的工具：

```json
"tool_calls": [
  {
    "id": "call_123",
    "type": "function",
    "function": {
      "name": "get_weather",
      "arguments": "{\"location\": \"北京\"}"
    }
  },
  {
    "id": "call_456",
    "type": "function",
    "function": {
      "name": "get_weather",
      "arguments": "{\"location\": \"上海\"}"
    }
  }
]
```

**注意**：
- `arguments` 是一个 **JSON 字符串**，你需要用 `json.loads()` 解析为 Python 对象。
- 如果一次响应中有多个工具调用（并行调用），它们会按 `id` 区分。

---

## 2. 流式响应 (`stream=True`)

流式模式下，API 会通过 Server-Sent Events (SSE) 逐个发送数据块。每个数据块是一个 JSON 对象，以 `data: ` 开头，最后以 `data: [DONE]` 结束。

### 单个数据块的结构

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion.chunk",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "delta": {
        "role": "assistant",        // 只在第一个块中出现
        "content": "你好",           // 文本增量
        "tool_calls": [             // 工具调用增量
          {
            "index": 0,
            "id": "call_123",
            "function": {
              "name": "get_weather",
              "arguments": "{\"lo"   // 参数片段
            }
          }
        ]
      },
      "finish_reason": null         // 最后一个块才会设置为非 null
    }
  ]
}
```

### `delta` 字段详解

| 子字段 | 出现时机 | 说明 |
|--------|----------|------|
| `role` | 仅在第一个块 | 固定为 `"assistant"`，标识消息角色 |
| `content` | 有文本生成时 | 当前块新增的文本片段（可能为空） |
| `tool_calls` | 模型决定调用工具时 | 工具调用增量信息，包含 `index`、`id`、`function.name`、`function.arguments`（参数片段） |

#### 工具调用增量的特点
- 每个工具调用通过 `index` 区分（从 0 开始）。
- `id` 和 `function.name` 通常只在第一个涉及该工具的块中出现。
- `function.arguments` 是**分块传输**的 JSON 字符串，你需要按 `index` 累积拼接，直到收到 `finish_reason: "tool_calls"`。

### 流式响应的结束

- 最后一个块的 `finish_reason` 会设置为非 `null`（如 `"stop"`、`"tool_calls"` 等）。
- 之后服务器会发送一个 `data: [DONE]` 消息表示流结束。

---

## 3. 错误响应

当请求出错时（如参数错误、认证失败），API 会返回一个标准的错误 JSON，HTTP 状态码通常为 4xx 或 5xx。

```json
{
  "error": {
    "code": 400,
    "message": "JSON schema conversion failed: Unrecognized schema: {\"type\":\"str\",...}",
    "type": "invalid_request_error"
  }
}
```

| 字段 | 说明 |
|------|------|
| `code` | HTTP 状态码 |
| `message` | 错误描述 |
| `type` | 错误类型，如 `"invalid_request_error"`、`"authentication_error"` 等 |

---

## 4. 各场景下的返回结果示例

### 场景一：普通文本生成（无工具）
- **非流式**：`message.content` 包含完整回复，`finish_reason: "stop"`。
- **流式**：每个块的 `delta.content` 包含文本片段，最后一个块 `finish_reason: "stop"`。

### 场景二：单次工具调用
- **非流式**：`message.content` 为 `null`，`message.tool_calls` 有一个元素，`finish_reason: "tool_calls"`。
- **流式**：前几个块可能先出现 `delta.content`（模型有时会先说话再调用工具），然后出现 `delta.tool_calls` 增量，最后 `finish_reason: "tool_calls"`。

### 场景三：并行工具调用
- **非流式**：`message.tool_calls` 数组包含多个元素，每个都有独立的 `id` 和 `arguments`。
- **流式**：多个工具调用的增量会交错出现（按 `index` 区分），你需要按 `index` 分别累积。

### 场景四：达到 max_tokens 截断
- **非流式**：`finish_reason: "length"`，`message.content` 可能不完整。
- **流式**：最后一个块 `finish_reason: "length"`，内容在达到限制处截断。

---

## 5. 总结：如何根据返回结果处理

| 你关心的情况 | 检查哪些字段 |
|--------------|--------------|
| 是否有文本生成 | `message.content` 或 `delta.content` 是否存在 |
| 是否需要调用工具 | `message.tool_calls` 或 `delta.tool_calls` 是否存在；`finish_reason` 是否为 `"tool_calls"` |
| 是否正常结束 | `finish_reason` 是否为 `"stop"` |
| 是否被截断 | `finish_reason` 是否为 `"length"` |
| 是否有多个工具调用 | `tool_calls` 数组长度 > 1，或在流式中通过 `index` 区分 |
| 是否出错 | HTTP 状态码非 2xx，或返回的 JSON 包含 `error` 字段 |

理解这些结构后，你就能正确地解析 API 返回，并实现复杂的对话逻辑。如果有更具体的场景需要解释，欢迎继续提问。
