
# k8s笔记

## 实用技巧
```bash
kubectl命令太多太长记不住？ 
 查看资源缩写 
kubectl describe 
 配置kubectl自动完成 
source <(kubectl completion bash)

kubectl写yaml太累，找样例太麻烦? 
 用run命令生成 
kubectl run --image=nginx my-deploy -o yaml --dry-run > my-deploy.yaml 
 用get命令导出 
kubectl get statefulset/foo -o=yaml --export > new.yaml 
 Pod亲和性下面字段的拼写忘记了 
kubectl explain pod.spec.affinity.podAffinity

批量删除pod
kubectl -n kube-system delete pod `kubectl -n kube-system get pods | grep 0/ | awk '{print $1}'| xargs`

强制删除
kubectl delete po <your-pod-name> -n <name-space> --force --grace-period=0
```

## nginx默认root位置
```bash
conf
/etc/nginx/nginx.conf
html
/usr/share/nginx/html
log
/var/log/nginx
```

## 启动nginx
```bash
docker run -d -v /root/SiteTest/SuQian/web/:/usr/share/nginx/html/ -p 8080:80 nginx:latest
```

## 启动msyql
```bash
docker run --name=mysql   --restart=always -d -p 33066:3306 -e MYSQL_ROOT_PASSWORD=Huawei@123  mysql

docker run --name=mysql --restart=always  -d -p 3306:3306  -v /home/mysql-data/conf:/etc/mysql/conf.d -v /home/mysql-data/logs:/logs -v /home/mysql-data/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=Huawei@123 --skip-name-resolve mysql

--nam 自定义的容器名称
-d 以后台方式运行，后面为镜像名称
-t让docker分配一个伪终端并绑定到容器的标准输入上
-i则让容器的标准输入保持打开

```
> https://segmentfault.com/a/1190000021941762

## 启动postgre
```bash
docker run --name mypostgres  --restart=always -d -p 5432:5432 -e POSTGRES_PASSWORD=Huawei@123 postgres
# 下载指定镜像版本或者下载最新版本(postgres:latest)
docker pull postgres:12.3
# 创建并运行容器
docker run --name mypostgres  --restart=always -d -p 5432:5432 -v /home/postgre-data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=Huawei@123 postgres
```

## 启动jenkins
```bash
docker run -d -p 8081:8080 -v /home/liutao/jenkins:/var/jenkins_home -v /etc/localtime:/etc/localtime --name jenkins jenkins:latest
```

## 启动docekr-registry
```bash
docker run -d -p 5000:5000 --restart=always --name=registry-srv -v /home/liutao/dockerRegistry:/var/lib/registry registry
```

## 启动docker registry-web
```bash
docker run -d -p 8082:8080 --restart=always --name registry-web --link registry-srv -e REGISTRY_URL=http://registry-srv:5000/v2 -e REGISTRY_NAME=localhost:5000 hyper/docker-registry-web
```
```
docker run -d -p 5000:5000 --restart=always --name=registry-srv -v /home/nfs-data/docker_registry:/var/lib/registry registry
docker run -d -p 8180:8080 --restart=always --name registry-web --link registry-srv -e REGISTRY_URL=http://registry-srv:5000/v2 -e REGISTRY_NAME=localhost:5000 hyper/docker-registry-web
```

## 启动tomcat
```bash
docker run --restart=always  --name jenkins -p 8080:8080 -v /root/file/jenkins.war:/usr/local/tomcat/webapps/ -d tomcat
```

## 启动gitlab
```bash
docker run --detach \
  --hostname liutao.huawei.com \
  --publish 8443:443 --publish 8180:8180 --publish 222:22 \
  --name gitlab \
  --restart always \
   -v /etc/gitlab:/etc/gitlab \
   -v /home/var/log/gitlab:/var/log/gitlab \
   -v /home/var/opt/gitlab:/var/opt/gitlab \
   --shm-size 256m \
  gitlab/gitlab-ce:latest
```
## 启动 gitlab runner
创建 Docker 卷：
```bash
docker volume create gitlab-runner-config
```
使用我们刚刚创建的卷启动 GitLab Runner 容器：
```bash
docker run -d --name gitlab-runner --restart always \
    -p 8093:8093\
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v gitlab-runner-config:/etc/gitlab-runner \
    gitlab/gitlab-runner:latest
```

## jenkins插件源
```bash
wget http://mirror.esuni.jp/jenkins/updates/update-center.json
```
## 安装Prometheus
```bash
[root@Docker ~]# docker pull prom/prometheus
[root@Docker ~]# docker run -itd --name=prometheus --restart=always -p 9090:9090 prom/prometheus
```
## 安装Grafana
```bash
[root@Docker ~]# docker pull grafana/grafana
[root@Docker ~]# docker run -itd --name=grafana \
--restart=always \
-p 3000:3000 \
-v $PWD/grafana-storage:/var/lib/grafana \
grafana/grafana
[root@Docker ~]# docker run -itd --name=grafana --restart=always -p 3000:3000 -v /home/liutao/grafana-storage:/var/lib/grafana grafana/grafana
```bash

## 批量停止
```bash
docker ps -a | grep opsant | awk '{print $1}'| xargs docker rm
```
