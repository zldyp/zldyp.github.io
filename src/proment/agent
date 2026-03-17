# agent开发常用工具

## 使用环境变量

```python
from dotenv import load_dotenv
# 加载 .env 文件中的变量到环境变量
load_dotenv()
```

## 流式处理
fastapi 处理流式数据
```python
from fastapi.responses import StreamingResponse

@app.get("/tools/weather/mcp")
async def tool_weather_mcp(city: int | None):
    async def generate():
        try:
            mcp_client: Client = app.state.mcp_client
            arg = {"city_code": 510900, "extensions": "base"}
            result = await mcp_client.call_tool("get_weather", arg)
            print(f"返回值类型: {type(result)}")  # 调试输出
            print(result)
            # logger.info("查询结果")
            yield result.data
        except Exception as e:
            yield f"数据流错误: {e}"

    return StreamingResponse(generate(), media_type="text/plain")
```

## 模型调用
使用openai sdk
```python
# 定义一个请求日志钩子
async def log_request(request: httpx.Request):
    logger.debug("OpenAI Request URL: {} {}", request.method, request.url)
    logger.debug("OpenAI Request Headers: {}", request.headers)
    # 读取并格式化 body
    body_bytes = request.read()
    logger.debug("OpenAI Request Body:{}", body_bytes.decode("utf-8"))
    with open("test//test.json", "w", encoding="utf-8") as f:
        f.write(body_bytes.decode("utf-8"))  # 原有内容会被清空


# 创建一个配置了钩子的 httpx 客户端
custom_http_client = httpx.AsyncClient(event_hooks={"request": [log_request]})
app.state.openai_client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
    http_client=custom_http_client,  # 关键点：传入你的 httpx 客户端
)
```

新建api 请求
```python
stream = await app.state.openai_client.chat.completions.create(
    model=model,
    messages=messages,
    tools=tools,
    tool_choice="auto",
    stream=True,  # 开启流式
)
```

流式处理
```python
async def stream_response_parse(stream):
    # 缓存工具调用信息
    tool_calls_cache = {}
    final_tool_calls = None

    # 异步迭代流式响应
    async for chunk in stream:
        delta = chunk.choices[0].delta
        finish_reason = chunk.choices[0].finish_reason

        # 1. 检测是否有工具调用增量
        if delta.tool_calls:
            for tc_delta in delta.tool_calls:
                index = tc_delta.index
                if index not in tool_calls_cache:
                    tool_calls_cache[index] = {
                        "id": tc_delta.id,
                        "name": tc_delta.function.name,
                        "arguments": "",
                    }
                # 累积参数（可能分多次到达）
                if tc_delta.function.arguments:
                    tool_calls_cache[index]["arguments"] += tc_delta.function.arguments
        # 2. 如果有普通内容，先发送（工具调用时通常内容为空）
        if delta.content:
            yield {"type": "content", "data": delta.content}

        # 3. 检查是否完成工具调用
        if finish_reason is not None:
            if finish_reason == "tool_calls":
                # 工具调用完成，缓存转为最终列表
                final_tool_calls = list(tool_calls_cache.values())
                yield {"type": "tool_calls", "data": final_tool_calls}
            else:
                yield {"type": "end", "data": finish_reason}
            break  # 停止流式输出

```

## funcation call
检查返回值是否有tool call
```python
# 缓存工具调用信息
tool_calls_cache = {}
final_tool_calls = None
# 异步迭代流式响应
async for chunk in stream:
    delta = chunk.choices[0].delta
    finish_reason = chunk.choices[0].finish_reason
    # 1. 检测是否有工具调用增量
    if delta.tool_calls:
        for tc_delta in delta.tool_calls:
            index = tc_delta.index
            if index not in tool_calls_cache:
                tool_calls_cache[index] = {
                    "id": tc_delta.id,
                    "name": tc_delta.function.name,
                    "arguments": "",
                }
            # 累积参数（可能分多次到达）
            if tc_delta.function.arguments:
                tool_calls_cache[index]["arguments"] += tc_delta.function.arguments
    # 3. 检查是否完成工具调用
        if finish_reason is not None:
            if finish_reason == "tool_calls":
                # 工具调用完成，缓存转为最终列表
                final_tool_calls = list(tool_calls_cache.values())
                yield {"type": "tool_calls", "data": final_tool_calls}
```

根据tool_call 调用方法
```python
if tool_calls:
    for tool in tool_calls:
        logger.info(
            "调用方法: {},参数: {}", tool["name"], tool["arguments"]
        )
        args = json.loads(tool["arguments"])
        if tool["name"] == "get_city_code":
            result = await get_city_code(
                client=app.state.httpx_client, **args
            )
        if tool["name"] == "get_weather":
            result = await get_weather(
                client=app.state.httpx_client, **args
            )
```

## 对话记忆

```python
system_message = {
        "role": "system",
        "content": "你是一个友好的助手。在需要调用工具时，请先简短说明你的思考（用'思考：'开头），然后再按正常方式调用工具。",
    }
user_message = {"role": "user", "content": body.message}
assistant_message = {"role": "assistant","content": full_assistant_message}
assistant_message = {"role": "assistant","content": None,"tool_calls": []}
assistant_message["tool_calls"].append({
    "id": tool["id"],
    "type": "function",
    "function": {
        "name": tool["name"],
        "arguments": tool["arguments"],
    },})
tool_message = {
      "tool_call_id": tool["id"],
      "role": "tool",
      "tool_name": tool["name"],
      "content": result,
  }
```



## MCP
### MCP 服务端
```python
import httpx
import os
from dotenv import load_dotenv
from loguru import logger
from fastapi import HTTPException
from httpx import Proxy, AsyncClient
import urllib.parse
from contextlib import asynccontextmanager
from fastmcp import FastMCP, Context

@asynccontextmanager
async def lifespan(server: FastMCP):
    # 创建共享 HTTP 客户端
    async with AsyncClient(
        proxy=proxy,
        verify=False,
        timeout=10.0,
        limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
    ) as client:
        yield {"httpx_client": client}


mcp = FastMCP("我的工具集 🚀", lifespan=lifespan)

@mcp.tool()
async def get_weather(ctx: Context, city_code: int, extensions: str = "base") -> str:
    """根据用户输入的 adcode, 查询目标区域当前/未来的天气情况"""
    logger.info("开始查询天气.")
    client = ctx.request_context.lifespan_context["httpx_client"]
    url = "https://restapi.amap.com/v3/weather/weatherInfo"
    params = {
        "key": api_key,
        "city": city_code,
        "extensions": extensions,
        "output": "json",
    }
    try:
        logger.debug("查询天气body:{}", params)
        response = await client.get(url, params=params)
        logger.debug("查询天气url:{}", response.url)
        response.raise_for_status()
        data = response.json()
        logger.debug("查询天气结果:{}", data)
        weather_list = generate_weather_string(data)
        weather_string = "\n".join(weather_list)
        logger.info("查询天气返回:{}", weather_string)
        return weather_string
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="查询天气服务超时")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {e}")

# 4. 运行服务器
if __name__ == "__main__":
    # 使用 stdio 传输运行，这是与 Claude Desktop 等客户端通信的标准方式
    mcp.run(transport="stdio")

```

### mcp 客户端
配合fastapi lifespan
```python
# 定义 lifespan 上下文管理器
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.mcp_client = Client("mcp_server.py")
    # 建立连接
    # await client._connect()
    # 将 client 挂载到 app.state，这样在任何路由里都能访问到
    await app.state.mcp_client._connect()

    # 将 client 挂载到 app.state，这样在任何路由里都能访问到
    # async with client:
    #     app.state.mcp_client = client
    #     await app.state.mcp_client.ping()
    logger.info("✅ MCP 客户端已连接")
    yield  # 应用运行期间
    await app.state.mcp_client.close()
    logger.info("🛑 服务关闭,mcp 客户端已清理")

# 查询tool
async def get_mcp_tools() -> List[dict]:
    mcp_client: Client = app.state.mcp_client
    # 可选使用缓存
    mcp_tools = await mcp_client.list_tools()
    # mcp_tools = tools_result.tools
    logger.info("📋 发现 {} 个工具:", len(mcp_tools))
    # 3. 转换为 OpenAI 工具格式
    openai_tools = []
    for tool in mcp_tools:
        openai_tools.append(
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.inputSchema,  # 直接使用 MCP 提供的 JSON Schema
                },
            }
        )
    return openai_tools

# 调用tool
async def generate():
    mcp_client: Client = app.state.mcp_client
    logger.info("调用方法: {},参数: {}", tool["name"], tool["arguments"])
    args = json.loads(tool["arguments"])
    mcp_result = await mcp_client.call_tool(tool["name"], args)
    result = mcp_result.data
```
