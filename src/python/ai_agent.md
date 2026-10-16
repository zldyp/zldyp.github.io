## env
```python
from dotenv import load_dotenv

load_dotenv()

# .env
OPENAI_API_KEY=sr_ewfjweofoewfjweowef
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=gemma-4-E2B-it-Q4_K_M

```

## llm
```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
	api_key=os.getenv("OPENAI_API_KEY"),
	base_url=os.getenv("OPENAI_BASE_URL"),
	http_client=custom_http_client,  # 关键点：传入你的 httpx 客户端
)

```

## mcp
```python
from fastmcp import FastMCP, Context

mcp = FastMCP("我的工具集 🚀", lifespan=lifespan)

@mcp.tool()
async def get_weather(ctx: Context, city_code: int, extensions: str = "base") -> str:
    """tag:weather 根据用户输入的 adcode, 查询目标区域当前/未来的天气情况"""
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
```

## openai sdk

### 同步非流式

```python
def chat():
    """
    ## 同步普通(sync,stream=False)
    **场景**:一次性拿到全部回答,简单脚本、小批量工具,没有并发压力,简单命令行工具。
    >
    > 缺点:调用时整个程序卡住,大模型生成慢的时候,全程等待。
    """
    resp = client.chat.completions.create(
        model=model, messages=messages, temperature=0.7, stream=False
    )

    ans = resp.choices[0].message.content
    print(ans)

```

### 同步流式

```python
def stream_chat():
    """
    ## 同步流式(sync + stream=True)

    **场景**:终端聊天程序,本地脚本实时打印 token;**不适合 web 后端**,会阻塞 web 工作线程。

    >
    > 主线程依然阻塞,只是一边等一边拿片段。
    """
    stream = client.chat.completions.create(
        model=model, messages=messages, temperature=0.7, stream=True
    )

    for chunk in stream:
        # 安全检查：确保 choices 非空，且 content 存在且不为 None
        if chunk.choices:
            delta = chunk.choices[0].delta
            content = getattr(delta, "content", None)
            if content:  # 过滤 None 和空字符串
                print(content, end="", flush=True)
    print()

```


### 异步非流式

```python
async def async_chat():
    """
    ## 异步普通(async,stream=False)

    **场景:Web 后端 FastAPI,同时处理很多请求;批量并行调用大模型;后台任务。**
    不会卡住事件循环,可以同时跑几十个 LLM 请求。需要 `async def` + `await`。
    """
    resp = await aclient.chat.completions.create(
        model=model, messages=messages, temperature=0.7, stream=False
    )
    ans = resp.choices[0].message.content
    print(ans)

```


### 异步非流式

```python
async def async_stream_chat():
    """
    ## 异步流式(async + stream=True)【Web 聊天最常用】

    **场景:网页 SSE 实时打字效果;FastAPI 后端对外提供流式接口;Agent 并发多轮对话。**
    不阻塞事件循环,同时分片吐出 token。
    """

    stream = await aclient.chat.completions.create(
        model=model, messages=messages, temperature=0.7, stream=True
    )
    try:
        async for chunk in stream:
            if chunk.choices and (content := chunk.choices[0].delta.content):
                print(content, end="", flush=True)
    finally:
        await stream.close()

```
