# stm32开发
## 添加设备权限
```shell
sudo chmod 666 /dev/hidraw4
```

## 项目初始化

### 添加编译环境
```shell
# thumbv7em-none-eabi
rustup target add thumbv7em-none-eabihf 
```

### 安装烧录工具
[probe-rs](https://probe.rs/docs/getting-started/installation/)

`probe-rs.exe list` 查看设备列表
如果没有设备，需要安装stlink驱动

### 添加依赖
**Config.toml**
```toml
[package]
name = "stm32f401_demo"
version = "0.1.0"
edition = "2021"

[dependencies]
# Cortex-M 内核抽象（含启动代码和中断）
cortex-m = "0.7.7"
cortex-m-rt = "0.7.3"  # 提供启动流程和中断向量表

# STM32F401 外设访问层（PAC）和 HAL
stm32f4xx-hal = { version = "0.18.0", features = ["stm32f401", "rt", "defmt"] }
# 说明：
# - "stm32f401"：指定芯片型号（自动匹配 F401 全系列，如 F401CC、F401RE 等）
# - "rt"：启用 cortex-m-rt 集成（中断支持）
# - "defmt"（可选）：日志格式化工具，需配合 defmt 相关依赖

# Panic 处理（根据需求选择）
panic-halt = "0.2.0"  # panic 时停机（简单场景用）
# 或 panic-probe = "0.3.0"  # 配合调试器输出 panic 信息（需 defmt 支持）

# 可选：日志输出（通过调试器）
defmt = "0.3.5"
defmt-rtt = "0.4.0"  # 基于 RTT 协议输出日志

```

### 定义内存
**memory.x**
```toml
/* memory.x - STM32F401RE 配置（512KB Flash，96KB RAM） */
MEMORY
{
  FLASH : ORIGIN = 0x08000000, LENGTH = 512K
  RAM : ORIGIN = 0x20000000, LENGTH = 96K
}

/* 栈大小：根据需求调整（默认 16KB） */
_stack_size = 0x4000;
```

### 定义编译环境
.cargo/config.toml
```toml
[build]
# 编译目标：Cortex-M4 无硬件浮点（F401 无 FPU）
target = "thumbv7em-none-eabi"

[target.thumbv7em-none-eabi]
# 指定链接脚本（使用项目根目录的 memory.x）
# linker = "memory.x"
runner = 'probe-rs run --chip STM32F401CCU6'
# 编译优化和链接参数
rustflags = [
    "-C", "link-arg=-Tlink.x",  # 启用 cortex-m-rt 的链接脚本
    "-C", "opt-level=3",        # Release 模式优化
    "-C", "debuginfo=2",        # 保留调试信息（方便调试）
]

# probe-rs 配置（通过 cargo-embed 工具）
[tool.embed]
# 1. 芯片型号（必须精确匹配，probe-rs 依赖此识别芯片）
chip = "STM32F401CCU6"  # 或 "STM32F401CCC6"（根据实际型号后缀调整）

# 2. 调试器配置（默认自动检测，若有多个探针可指定）
probe = "stlink"  # 指定使用 ST-Link（probe-rs 支持的探针：stlink/jlink/cmsis-dap 等）

# 3. 烧录选项（可选）
flash = { erase = "sector" }  # 烧录前擦除对应扇区（比全擦除快）

# 4. 调试输出配置（可选，通过 RTT 输出日志）
rtt = { enabled = true, channel = 0 }  # 启用 RTT 通道 0

# 5. 会话配置（可选，调试时保持连接）
session = { connect_under_reset = true }  # 复位时连接芯片（避免程序跑飞后无法连接）

```

### 编译并烧录
`cargo run`