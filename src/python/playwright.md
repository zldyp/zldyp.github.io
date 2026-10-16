## 使用
### 下载浏览器
`playwright install --dry-run`
```shell
# linux
https://cdn.playwright.dev/chrome-for-testing-public/145.0.7632.6/linux64/chrome-headless-shell-linux64.zip

# windows
https://cdn.playwright.dev/chrome-for-testing-public/145.0.7632.6/win64/chrome-headless-shell-win64.zip  
```

### 指定路径
```python
# 在导入 playwright 之前设置环境变量

os.environ["PLAYWRIGHT_BROWSERS_PATH"] = os.path.join(
    os.path.dirname(__file__), "chrome"
)

|--chrome/
	|-- chromium_headless_shell-1208/chrome-headless-shell-win64/chrome.exe
	|-- chromium-1208/chrome-win64/chrome.exe

```

### 同步方法
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
	browser = p.chromium.launch(
		headless=False,
		args=[
			"--ignore-certificate-errors",  # 忽略证书错误
			"--ignore-certificate-errors-spki-list",  # 忽略证书公钥错误
			# "--disable-web-security",  # 可选：禁用同源策略，谨慎使用
		],
	)
	context = browser.new_context(accept_downloads=True)
	page = context.new_page()

	# 登录
	page.goto(url)
	page.locator("#username").fill(username)
	page.locator("#password").fill(password)
	button = page.locator("#loginButton")
	button.click()  # Playwright 自动等待可点击
	button.click()  # Playwright 自动等待可点击
	print("登录完成")
```

### 普通定位
`locator()` 里可以写多种字符串，Playwright 会自动识别类型：
####  1. CSS 选择器（最常用）
```python
page.locator("#login-form")                 # id
page.locator(".login-form")                 # class
page.locator("button")                      # 标签
page.locator("input[name='username']")      # 属性
page.locator("#login-form button.primary")  # 组合
```

#### 2. 文本选择器
用于根据文字内容定位，非常直观：
- `text=登录`：精确匹配文本内容为“登录”的元素
- `has-text=登录`：包含“登录”文本的元素（partial match）

```python
page.locator("text=登录")          # 精确匹配
page.locator("has-text=登录")      # 模糊匹配
```
> 注意：这是字符串写法。也可用内置方法 page.get_by_text()，效果一样，更推荐用内置方法（可读性更好）。

#### 3. XPath 选择器
```python
page.locator("xpath=//button[@id='login']")
page.locator("//button[@id='login']")      # 以 // 或 ./ 开头会被自动识别为 XPath
```
但能不用 XPath 就不用，CSS 和内置定位器通常就够了。

#### 4. 角色选择器（官方强推的语义化定位）
```python
page.locator("role=button[name='登录']")
```
等价于：

```python
page.get_by_role("button", name="登录")
```
推荐使用`get_by_role`方法，更清晰，且方便配合可访问性属性。

#### 5. 组合过滤伪类（CSS 扩展）
Playwright 扩展了 CSS 伪类，可以在选择器里直接过滤可见性等：

```python
page.locator("button:visible")
page.locator("button:has-text('登录')")
page.locator("button:text-is('登录')")   # 精确文本
```

### 链式定位
`locator()` 返回的是 Locator 对象，你可以继续链式调用定位方法，在已找到的元素内部再寻找子元素。

#### 1. 链式 .locator(selector) —— 在父级内部用选择器继续找
```python
# 在 #login-form 内部找 button
page.locator("#login-form").locator("button")
这里第二个 locator 的起点是 #login-form 元素，它只会匹配这个容器内的 button。
```

#### 2. 链式使用内置定位方法
所有 `page.get_by_*` 方法都可以在 Locator 上调用，效果是“在这个元素内部找”：

```python
form = page.locator("#login-form")

form.get_by_text("登录")          # 在 form 内找文本“登录”
form.get_by_role("button")       # 在 form 内找所有按钮
form.get_by_placeholder("帐号")  # 在 form 内找占位符为“帐号”的输入框
form.get_by_label("用户名")      # 通过关联的 label 定位
```

#### 3. 过滤已匹配的元素（不找子元素，是从当前结果集中筛选）
如果你已经定位出一组元素，想从中挑出符合某些条件的，用 filter()：

```python
# 所有按钮
buttons = page.locator("button")
# 筛选出文本包含“提交”的按钮
submit_btn = buttons.filter(has_text="提交")
# 筛选出有特定类名的按钮
primary_btn = buttons.filter(has=page.locator(".primary"))
```

#### 4. 取第 N 个或第一个元素
```python
page.locator("button").first          # 第一个
page.locator("button").last           # 最后一个
page.locator("button").nth(2)         # 第 3 个（索引从 0 开始）
```
> ⚠️ 这样会绕过严格模式，可能点错，尽量结合其他方法让定位器唯一。
