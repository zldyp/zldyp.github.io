## 启动gitlab
```shell
docker run --detach \
  --hostname liutao.huawei.com \
  --publish 8443:443 --publish 8180:8180 --publish 2222:22  --publish 8008:80\
  --name gitlab \
  --restart always \
   -v /etc/gitlab:/etc/gitlab \
   -v /home/var/log/gitlab:/var/log/gitlab \
   -v /home/var/opt/gitlab:/var/opt/gitlab \
   --shm-size 256m \
  gitlab/gitlab-ce:latest
```
```shell
export GITLAB_HOME=/home/gitlab
sudo docker run --detach \
  --hostname liutao.huawei.com \
  --publish 8443:443 --publish 8180:8180 --publish 2222:22  --publish 8008:80\
  --name gitlab \
  --restart always \
  --volume $GITLAB_HOME/config:/etc/gitlab \
  --volume $GITLAB_HOME/logs:/var/log/gitlab \
  --volume $GITLAB_HOME/data:/var/opt/gitlab \
  --shm-size 256m \
  gitlab/gitlab-ce:latest
```

## 查看gitlab 初始密码
`sudo docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password`

## 修改默认密码
`sudo gitlab-rake "gitlab:password:reset"`

## 修改启动端口
文件在/gitlab/etc/gitlab.rb，
假设宿主机 ip 为 192.168.1.111，external_url 和 nginx['listen_port']的端口需要和第一步的映射端口对应。
```shell
// 修改如下语句
external_url 'http://192.168.1.111:8180'
# https需要下面这句
# nginx['redirect_http_to_https_port'] = 8180
nginx['listen_port'] = 8180
# 配置8022端口
gitlab_rails['gitlab_shell_ssh_port'] = 8022
```
> https://xie.infoq.cn/article/ee0c8990fe7758b64622c6244

## 启动 gitlab runner
创建 Docker 卷：
```shell
docker volume create gitlab-runner-config
```
使用我们刚刚创建的卷启动 GitLab Runner 容器：
```shell
docker run -d --name gitlab-runner --restart always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v gitlab-runner-config:/etc/gitlab-runner \
    gitlab/gitlab-runner:latest
```

## 纳管gitlab runner
使用 Docker 容器注册运行器：
根据挂载类型运行注册命令：
对于本地系统卷安装：
`docker run --rm -it -v /srv/gitlab-runner/config:/etc/gitlab-runner gitlab/gitlab-runner register`
如果您在安装期间以外使用了配置卷/srv/gitlab-runner/config ，请务必使用正确的卷更新命令。
对于 Docker 卷挂载：
`docker run --rm -it -v gitlab-runner-config:/etc/gitlab-runner gitlab/gitlab-runner:latest register`
输入您的 GitLab 实例 URL（也称为gitlab-ci coordinator URL）。
输入您获得的令牌以注册跑步者。
输入跑步者的描述。您可以稍后在 GitLab 用户界面中更改此值。
输入与 runner 关联的标签，用逗号分隔。您可以稍后在 GitLab 用户界面中更改此值。
提供runner executor。对于大多数用例，输入 docker.
如果您docker作为执行人输入，系统会要求您输入默认引擎，用于未在.gitlab-ci.yml.

## gitlab-runner添加docker映射
```shell
[[runners]]
  name = "a90940d190e5"
  url = "http://192.168.140.81:8080/"
  token = "cYRRpU_yztrrWvNmVhxV"
  executor = "docker"
  [runners.custom_build_dir]
  [runners.cache]
    [runners.cache.s3]
    [runners.cache.gcs]
    [runners.cache.azure]
  [runners.docker]
    tls_verify = false
    image = "centos"
    privileged = false
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/cache","/var/run/docker.sock:/var/run/docker.sock"]
    shm_size = 0
    pull_policy = "if-not-present"
```


