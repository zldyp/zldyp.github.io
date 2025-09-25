# 笔记

## Linux 设置代理时, 密码出现特殊字符

解决办法 就是将特殊字符转换成 ASIIC 码形式输入, 以 % + Hex 形式(0x忽略).
```bash
~ : 0x7E,         ! : 0x21    
@ : 0x40,         # : 0x23  
$ : 0x24,         % : 0x25  
^ : 0x5E,         & : 0x26  
* : 0x2A,         ? : 0x3F   
```
```shell
$ export HTTP_PROXY=http://CodeCore:%40MingHou233%21@172.16.2.17:8787  
$ export HTTPS_PROXY=https://CodeCore:%40MingHou233%21@172.16.2.17:8787 

```

## 常用命令
### 统计目录大小
```shell
# 统计当前目录总大小（以人类可读的单位显示，如 K、M、G）
du -sh

# 统计指定目录的大小（例如 /home/user）
du -sh /home/user

# 显示当前目录下所有子目录的大小（包含各级子目录详情）
du -h

# 只显示当前目录下一级子目录的大小（不深入嵌套目录）
du -h --max-depth=1
```
