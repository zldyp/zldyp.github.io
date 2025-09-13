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
