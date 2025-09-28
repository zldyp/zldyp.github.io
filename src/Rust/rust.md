## 常用create &#x20;

* **tokio** 异步运行时
* **reqwest**  http客户端
* **chrono** 日期处理
* **serde** 序列化
* **calamine** 读取excel
* **actix-web** web框架
* **quick-xml**  读取xml
* **anyhow** 简化Result返回
* **tauri-winrt-notification**  windows消息通知
* **whoami** 查询登录用户
* **base64** 处理base64
* **zip** 读取zip
* **html-escape** html格式转换
* **clap** 命令行参数工具
* **log** 日志工具
* **env\_logger** 日志工具
* **rust-crypto** 加密工具
* **serde\_json** json处理
* **tracing** 日志工具
* **indicatif** 进度条工具

## 经验

* 特征需要引入后，才能使用实现了该特征的方法

## 安装gcc

[MSYS2下载](https://www.msys2.org/)

```shell
$ pacman -Sy && pacman -Syu
$ pacman -S mingw-w64-x86_64-gcc mingw-w64-x86_64-binutils
$ pacman -S mingw-w64-x86_64-toolchain
```

## 交叉编译
### 指定库文件
文件: .cargo/config.toml
```toml
[target.aarch64-unknown-linux-gnu]
# 指定目标架构的链接器（必须与目标匹配）
linker = "aarch64-linux-gnu-gcc"
# 指定库文件搜索路径（可添加多个路径，用分号分隔）
rustflags = [
    "-L", "/usr/aarch64-linux-gnu/lib",          # 目标架构系统库路径
]
```
### 编译到x86
1. 安装工具链
```shell
rustup target add x86_64-unknown-linux-gnu
```
2. 编译
```shell
cargo build --target x86_64-unknown-linux-gnu --release
```

### 编译到arm
1. 安装目标架构
```shell
# 32位 ARM
rustup target add armv7-unknown-linux-gnueabihf

# 64位 ARM
rustup target add aarch64-unknown-linux-gnu
```

2. 编译
```shell
# 32位 ARM
cargo build --target armv7-unknown-linux-gnueabihf --release

# 64位 ARM
cargo build --target aarch64-unknown-linux-gnu --release
```

### config.toml
```toml
[target.x86_64-unknown-linux-gnu]
# 根据你的系统调整链接器路径
# macOS 通常为 "x86_64-linux-gnu-gcc"
# Linux 通常为 "x86_64-linux-gnu-gcc"
linker = "x86_64-linux-gnu-gcc"
```

### 编译报错
#### 缺少openssl-sys
##### 安装依赖
1. CentOS/RHEL 系统
```shell
# 安装 OpenSSL 开发包
sudo yum install openssl-devel
```
2. Ubuntu/Debian 系统
```shell
# 安装 OpenSSL 开发包
sudo apt-get install libssl-dev
```
3. macOS 系统
使用 Homebrew 安装：
```shell
brew install openssl@3
# 手动指定 OpenSSL 路径（如果 brew 安装路径非默认）
export OPENSSL_DIR=$(brew --prefix openssl@3)
```
4. Windows 系统（WSL2 或 MSYS2）
WSL2 中按 Ubuntu 方式安装 libssl-dev
原生 Windows 建议使用 MSYS2：
```shell
# 使用MSYS2
pacman -S mingw-w64-x86_64-openssl
```
##### 使用rustls代替
如果不想在系统中安装 OpenSSL，可以使用纯 Rust 实现的 rustls 替代，避免依赖系统库：

在 Cargo.toml 中替换依赖：
```toml
# 移除原来的 openssl 相关依赖
# openssl = "0.10"
# 添加 rustls 及相关适配器（以 reqwest 为例）
reqwest = { version = "0.12.23", features = ["stream","rustls-tls"] ,default-features = false }
# 其他库（如 hyper、tokio-rustls 等）也有类似的 rustls 特性
```

#### ring编译失败

## create使用

### anyhow

```rust
use anyhow::Result;
fn www -> Result<String>{
	let w = res_data.get("data").ok_or(anyhow::format_err!("Get data error"))?
}
```

### reqwest

```rust
use reqwest::Client;
use reqwest::header::{HeaderMap, HeaderValue};
use serde::Deserialize;
use serde_json::{json, Value};

fn www {
		let mut headers = HeaderMap::new();
        headers.insert(
            "Content-Type",
            HeaderValue::from_str("application/json").unwrap(),
        );
		let client = Client::builder()
            .danger_accept_invalid_certs(true)  //忽略https证书
            .build()
            .unwrap();
		let response = client.post(url).json(&data).send().await?;
        let res_data = response.json::<serde_json::Value>().await;
}

----
// 阻塞的
use reqwest::{blocking::Client, header::HeaderMap};

// 创建一个不使用代理的 Client
    let client = Client::builder()
        .cookie_store(true)  //使用cookie
        .no_proxy()  // 不用代理
        .build()
        .unwrap();
    let response = client.post(url).headers(headers).body(body).send().unwrap();

#[derive(Debug, Deserialize)]
      struct ResData {
            data: Vec<Asset>,
        }
let response_text = response.text().await?;
let res_data: Result<ResData, serde_json::Error> = serde_json::from_str(&response_text);
```

### tokio

#### 文件读写
1. option方式
```rust
use tokio::fs::{self, File, OpenOptions};
use tokio::io::{AsyncSeekExt, AsyncWriteExt};
let mut options = OpenOptions::new(); // 新建文件option
options.create(true).write(true);
// 创建文件用于写入
if start > 0 {
    options.append(true); // 关键：写入时自动定位到文件末尾（追加）
} else {
    options.truncate(true); // 关键：如果文件存在,清空其内容（覆盖）
}
// 开始下载并显示进度
let mut file = options.open(file_path).await?; // 通过路径打开/创建文件
```
2. 直接创建
```rust
use tokio::fs::File;
use tokio::io::AsyncWriteExt;        

// 打开或创建文件以写入
let mut file = File::create(file_name).await?;
// 将响应体写入文件
let bytes = response.bytes().await?;
file.write_all(&bytes).await?;
```
3. 分块读写
```rust
// 创建空文件（预分配空间）
let file = File::create(&file_path).await?;
file.set_len(file_size).await?;
drop(file);

// 打开文件并定位到块的起始位置
let mut file = OpenOptions::new().write(true).open(file_path).await?;
file.seek(std::io::SeekFrom::Start(start)).await?;
// 写入块数据并更新进度
while let Some(chunk) = response.chunk().await? {
    let chunk_size = chunk.len() as u64;
    file.write_all(&chunk).await?;
    chunk_pb.inc(chunk_size); // 更新当前块进度
    total_pb.inc(chunk_size); // 同时更新总进度
}
```

#### 多线程
```rust
use std::sync::Arc;
use tokio::sync::Semaphore;

// 限制并发数量
let semaphore = Arc::new(Semaphore::new(num_chunks as usize));
// 为每个块创建独立进度条并启动下载任务
let mut main_tasks = Vec::new(); // 主线程用于处理结果的任务向量
for (i, &(start, end)) in chunks.iter().enumerate() {
    let task = tokio::spawn(async move {download_chunk(&url,&output).await
    .map_err(|e| format!("块 #{} 错误: {}", i, e))
    });
    main_tasks.push(task);
}
// 主线程使用main_tasks向量等待完成并处理结果
for task in main_tasks {
    task.await??;
}

```

### tracing
#### 初始化
```rust
use tracing::{debug, error, info, warn};
// 初始化日志（输出到控制台,支持级别过滤）
tracing_subscriber::fmt()
    .with_max_level(tracing::Level::INFO)
    .init();
```

#### 打印日志
```rust
use indicatif::{HumanBytes, HumanDuration, MultiProgress, ProgressBar, ProgressStyle};
info!("下载完成,程序总运行时长: {}",HumanDuration(program_start.elapsed()));
```

### calamine

```rust
use calamine::{open_workbook, Reader, Xlsx};

pub fn resolve_asset_table(excel_path: &String) -> Result<Vec<String>> {
    // 打开工作簿
    let mut workbook: Xlsx<_> = open_workbook(excel_path).expect("Cannot open file");
    // 获取工作簿中的第一个工作表
    let sheets = workbook.sheet_names().to_owned();
    // 注意：这里我们直接通过索引访问，因为Rust的迭代器是从0开始的
    let mut assert_no_vec: Vec<String> = Vec::new();
    if let Ok(range) = workbook.worksheet_range(sheets.get(0).unwrap()) {
        // 示例：读取A1单元格的值
        for row in range.rows() {
            if let Some(assert_no) = row.get(0) {
               assert_no_vec.push(assert_no.to_string())
            }
        }
    } else {
        info!("No sheets found in workbook.");
    }
    Ok(assert_no_vec)
}
```

### toml

```rust
async fn read_config() -> Result<Imoc> {
    // 读取文件
    let mut file_path = "config/config.toml";
    match tokio::fs::metadata("config/config_local.toml").await {
        Ok(_) => file_path = "config/config_local.toml",
        Err(_e) => {}
    }
    let mut file = File::open(file_path).await?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).await?;
    // println!("{}", contents);
    // 解析 TOML 字符串为一个值
    let config: Config = toml::from_str(&contents).unwrap();
    println!("{:?}", config);
    Ok(config)
}
```

### wasm

```rust
 wasm-pack build --target web   // 编译成wasm

[dependencies]
wasm-bindgen = "0.2.83"
console_error_panic_hook = "0.1.7"

// 使用
use wasm_bindgen::prelude::*; // 用于加载 Prelude（预导入）模块
use console_error_panic_hook;
#[wasm_bindgen]
pub fn take_table(){
console_error_panic_hook::set_once();
}

```

### indicatif
#### 创建进度条
1. 有总大小
```rust
let pb = ProgressBar::new(file_size);
// 设置进度条样式：包含进度条、百分比、已下载/总大小、速度
pb.set_style(ProgressStyle::with_template("{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {percent}% ({bytes}/{total_bytes}) {bytes_per_sec}")
    .unwrap()
    .progress_chars("#>-"));
```
2. 没有总大小
```rust
// 创建一个不确定进度条（不指定总大小）
let pb = ProgressBar::new_spinner();
// 配置样式：显示已下载大小、速度、耗时和旋转动画
pb.set_style(
    ProgressStyle::with_template(
        "{spinner:.green} 已下载: {bytes} | 速度: {bytes_per_sec} | 耗时: {elapsed_precise}",
    )
    .unwrap()
    .tick_chars("⣀⣄⣤⣦⣶⣷⣿⣷⣶⣦⣤⣄⣀"),
); // 自定义旋转动画字符
pb.enable_steady_tick(Duration::from_millis(100)); // 启动旋转动画）
```
#### 更新进度
```rust
pb.set_position(downloaded); // 更新已下载大小（进度条会自动计算速度）
pb.inc(chunk_size); // 更新当前块进度
chunk_pb.finish_with_message(""); // 结束输出
```
1. **set_position(n)**
- 作用：直接将进度条的当前位置设置为指定的数值 n（n 是一个具体的进度值，如字节数、任务数等）。
- 场景：适用于已知精确进度值的情况，例如从某个状态恢复进度、或根据外部计算直接定位到特定进度。
2. **inc()**
- 作用：将进度条的当前位置递增 1（默认步长为 1）。也可以通过 inc(n) 指定递增的步长 n。
- 场景：适用于按步骤推进进度的情况，例如循环处理任务时，每完成一个任务就递增一次进度。
3. **finish_with_message()**
- 作用：结束时内容
- 直接使用不生效时，需要使用`pb.set_style()`先设定样式

#### 多进度条
```rust
// 创建多进度条管理器
let multi_pb = MultiProgress::new();
// 创建总进度条（添加到多进度条管理器）
let total_pb = multi_pb.add(ProgressBar::new(file_size));
let chunk_pb = multi_pb.add(ProgressBar::new(0)); // 初始大小设为0，后续会更新
```
