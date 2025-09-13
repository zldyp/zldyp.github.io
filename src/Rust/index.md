## 常用create &#x20;

*   **tokio** 异步运行时

*   **reqwest**  http客户端

*   **chrono** 日期处理

*   **serde** 序列化

*   **calamine** 读取excel

*   **actix-web** web框架

*   **quick-xml**  读取xml

*   **anyhow** 简化Result返回

*   **tauri-winrt-notification**  windows消息通知

*   **whoami** 查询登录用户

*   **base64** 处理base64

*   **zip** 读取zip

*   **html-escape** html格式转换

*   **clap** 命令行参数工具

*   **log** 日志工具

*   **env\_logger** 日志工具

*   **rust-crypto** 加密工具

*   **serde\_json** json处理

## 经验

*   特征需要引入后，才能使用实现了该特征的方法

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

```rust
use tokio::fs::File;
use tokio::io::AsyncWriteExt;        

// 打开或创建文件以写入
        let mut file = File::create(file_name).await?;
        // 将响应体写入文件
        let bytes = response.bytes().await?;
        file.write_all(&bytes).await?;
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


## stm32 
sudo chmod 666 /dev/hidraw4

## 安装gcc

[MSYS2](https://www.msys2.org/)

```rust
$ pacman -Sy && pacman -Syu
$ pacman -S mingw-w64-x86_64-toolchain
```
