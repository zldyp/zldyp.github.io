
## github 上传报错
远程仓库名称变成了main  
解决方式：  
重命名本地分支： `git branch -m oldBranchName newBranchName`

## git 子模块
### 添加子模块
``` bash
git submodule add https://github.com/iphysresearch/GWToolkit.git GWToolkit
```

### 更新子模块
``` bash
git submodule init
git submodule update
```

### 子模块上传
``` bash
git branch new
git checkout new
git add .
git commit -m "update"
git checkout main
git merge new
git push origin main

```

## miniforge使用

```shell
# 创建环境
# 传统 conda 方式
conda create -n myenv python=3.9
conda install numpy pandas
# mamba 方式（更快）
mamba create -n myenv python=3.9
mamba install numpy pandas
```

## llama-server

### 使用路由模式

`llama-server --models-dir .\ -c 256000 --port 11434 --metrics --jinja`
```bash
curl http://395-1.local:8072/v1/chat/completions \
-H"Content-Type: application/json" \

-d'{
    "model": "gpt-oss-120b-GGUF/gpt-oss-120b-mxfp4-00001-of-00003.gguf",
    "messages": [{"role": "user", "content": "打印你的模型信息"]
}'
```

### 运行指定模型

`llama-server -m .\Qwen3.5-4B-Q4_K_M.gguf -c 256000 --port 11434 --metrics --jinja`
