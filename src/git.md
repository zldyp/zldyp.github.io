
## github 上传报错
1. 远程仓库名称变成了main
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
