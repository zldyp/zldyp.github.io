
# python
## 随机字符
```python
#!/usr/bin/python
# -*- coding: UTF-8 -*-

import random
import string

# 随机整数：
print random.randint(1,50)

# 随机选取0到100间的偶数：
print random.randrange(0, 101, 2)

# 随机浮点数：
print random.random()
print random.uniform(1, 10)

# 随机字符：
print random.choice('abcdefghijklmnopqrstuvwxyz!@#$%^&*()')

# 多个字符中生成指定数量的随机字符：
print random.sample('zyxwvutsrqponmlkjihgfedcba',5)

# 从a-zA-Z0-9生成指定数量的随机字符：
ran_str = ''.join(random.sample(string.ascii_letters + string.digits, 8))
print ran_str

# 多个字符中选取指定数量的字符组成新字符串：
print ''.join(random.sample(['z','y','x','w','v','u','t','s','r','q','p','o','n','m','l','k','j','i','h','g','f','e','d','c','b','a'], 5))

# 随机选取字符串：
print random.choice(['剪刀', '石头', '布'])

# 打乱排序
items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
print random.shuffle(items)
```

## pymysql
### 批量插入数据
```python
批量插入数据：

#!/usr/bin/env python
# -*-encoding:utf-8-*-

import pymysql

# 打开数据库连接
db = pymysql.connect("localhost","root","123","testdb")

# 使用 cursor() 方法创建一个游标对象 cursor
cursor = db.cursor()

# SQL 插入语句
sql = "INSERT INTO EMPLOYEE(FIRST_NAME, \
LAST_NAME, AGE, SEX, INCOME) \
VALUES (%s,%s,%s,%s,%s)"
# 区别与单条插入数据，VALUES ('%s', '%s', %s, '%s', %s) 里面不用引号

val = (('li', 'si', 16, 'F', 1000),
('Bruse', 'Jerry', 30, 'F', 3000),
('Lee', 'Tomcat', 40, 'M', 4000),
('zhang', 'san', 18, 'M', 1500))
try:
# 执行sql语句
cursor.executemany(sql,val)
# 提交到数据库执行
db.commit()
except:
# 如果发生错误则回滚
db.rollback()

# 关闭数据库连接
db.close()

```

## pip
### 卸载
```pyhton
pip uninstall PackageName.
```

### 下载依赖
```bash
下载依赖：pip download -r pkg/requirements.txt --platform=linux_x86 -d pkg/ --only-binary=:all: 

platform: linux_aarch64,linux_x86
```

## ThreadPoolExecutor
```python
from concurrent.futures import ThreadPoolExecutor
executor = ThreadPoolExecutor(20)  # 定义线程池

def executor_callback(worker):
# 线程执行完后回调打印错误日志
  worker_exception = worker.exception()
  if worker_exception:
      log.exception(worker_exception)

task_list[key] = executor.submit(compute_metric, csv_name, key)
task_list[key].add_done_callback(executor_callback)
executor.submit(check_status, key)

```
