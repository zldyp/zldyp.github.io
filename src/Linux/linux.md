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

## 测试端口
```bash
echo > /dev/tcp/ip/端口

# 不通
bash: /dev/tcp/192.168.139.207/80: Connection refused
```

## base64
```shell
# 编码
echo -n "Hello, World!" | base64

# 解码
echo "SGVsbG8sIFdvcmxkIQ==" | base64 -d
```


## 统计目录大小
```bash
# 统计 /var/log 总大小
du -sh /var/log

# 查看目录下各子目录的大小（一级）
du -h --max-depth=1
# 或
du -h -d 1

# 查看 /home 下各用户占用空间（按大小排序）
du -h --max-depth=1 /home | sort -hr

# 统计当前目录总大小并包含总计
du -sch

# 查看大于 100MB 的目录（需配合 find）
find . -type d -exec du -sh {} \; | grep -E '^[0-9.]+G|^[0-9]{3}M'
```

## dsh插件管理
```shell
# 查看
npx @deepseek-ai/dsh plugin --profile web list

# 添加
npx @deepseek-ai/dsh plugin --profile web add <插件包名>

# 卸载
npx @deepseek-ai/dsh plugin --profile web remove <插件包名>

```
