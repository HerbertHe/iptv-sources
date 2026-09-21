# iptv-sources

[![Docker Image](https://img.shields.io/docker/image-size/yunnysunny/iptv-sources/latest?logo=docker&label=docker)](https://hub.docker.com/r/yunnysunny/iptv-sources)

自动更新的 IPTV 直播源，支持 M3U、TXT 和 TVBox 格式，并提供基于静态文件的 EPG（电子节目预告）服务。

**本项目仓库**：[yunnysunny/iptv-sources](https://github.com/yunnysunny/iptv-sources) 基于 [HerbertHe/iptv-sources](https://github.com/HerbertHe/iptv-sources) 开发。

## 特性

- 每 2 小时自动从上游抓取并更新直播源
- 支持 M3U、TXT、TVBox JSON 多种格式输出
- **零成本 EPG 方案**：将节目预告拆分为静态 JSON 文件，部署到 Cloudflare Pages，无需自建后端服务即可在 TVBox 中查看直播预告

## 直播源

| 来源 | 说明 |
|------|------|
| [epg.pw](https://epg.pw/test_channel_page.html) | 全球频道 |
| [youhun](https://github.com/HerbertHe/youhun) | 国内频道 |
| [hotel_tvn](https://github.com/HerbertHe/hotel_tvn) | 酒店源 |
| [qwerttvv/Beijing-IPTV](https://github.com/qwerttvv/Beijing-IPTV) | 北京联通、移动 IPTV 直播源 |


## 点播源

| 来源 | 说明 |
|------|------|
| [王小二放牛娃](https://www.xn--4kq62z5rby2qupq9ub.top/) | TVBox点播 |

## EPG 数据源

| 来源 | 说明 |
|------|------|
| [epg.51zmt.top:8000](http://epg.51zmt.top:8000/) | 构建时拉取 XMLTV，保存为 `epg/51zmt.xml` 等；再按日期、频道拆成 TVBox JSON（`epg/51zmt/{date}/…`） |
| [epg.pw](https://epg.pw/) | 抓取中国地区频道列表, 生成 **`epg/pw-7/{date}/{NAME}.json`**（约 7 天滚动窗口） |

## EPG 使用说明

本项目提供两种 EPG 形态：**标准 XMLTV（`.xml`）**，适用于 Kodi、DIYP 等；**TVBox 静态 JSON**，按 URL 模板直接访问静态文件，无需自建后端。

### 标准 EPG（XMLTV XML）

构建产物位于站点根目录下的 `epg/`，与下表文件名一致：

| 名称 | 链接示例 |
|------|----------|
| 51zmt | `https://your-domain.pages.dev/epg/51zmt.xml` |
| 51zmt cc | `https://your-domain.pages.dev/epg/51zmt_cc.xml` |
| 51zmt 地方台 | `https://your-domain.pages.dev/epg/51zmt_df.xml` |
| epg.pw China 聚合 | `https://your-domain.pages.dev/epg/epg_pw.xml.gz` |

在 M3U 头部使用 `x-tvg-url` 指向上述任一地址即可，例如：

```
#EXTM3U x-tvg-url="https://your-domain.pages.dev/epg/51zmt.xml"
```

### 51zmt TVBox EPG

构建脚本会解析 XMLTV，按**节目日期（东八区）**与**频道**写入多份小 JSON，路径为：

```text
epg/{provider}/{date}/{name}.json
```

- **`provider`**：与 `epg/` 下对应 XML 文件名（不含扩展名）一致，例如 `51zmt`、`51zmt_cc` `51zmt_df` 。
- **`{date}`**：TVBox 替换为当天日期，格式为 **`YYYY-MM-DD`**（与生成目录名一致）。
- **`{name}`**：TVBox 替换为当前频道名；**实际文件名**会去掉非法文件名字符（如 `/`、`*` 等），与生成脚本中的 `sanitize` 规则一致。

任选一种数据源，在直播源 JSON 的 `epg` 中填写完整 URL 模板即可。

更多背景见 [EPG 方案详解](docs/EPG.md)。

### epg.pw TVBox EPG

构建完成后 epg.pw TVBox EPG 构建完成后，会生成 `epg/epg-7/{date}/{name}.json` 等文件，其中 `{date}` 为当前日期，`{name}` 为频道名。

## 自行部署

1. Fork 本项目到你的 GitHub 仓库
2. 按下方 [Cloudflare Pages 部署](#cloudflare-pages-部署) 关联仓库并完成首次构建
3. **定时更新**：由 GitHub Actions 的 `schedule` 工作流每 2 小时抓取并生成静态资源；若配置了 Cloudflare 直连上传凭据则直接发布 `m3u/`，否则通过空 commit 触发 Pages 在云端构建。推送代码时仍可按你在 Pages 里配置的构建命令由云端重新构建
4. **Docker 镜像**（可选）：在自有环境用容器跑静态站，见下文 [Docker 镜像](#docker-镜像)

整个过程可完全免费、零运维（具体以 Cloudflare 与 GitHub 当前套餐为准；Docker 与镜像托管以你选用的注册表与主机为准）。

## Cloudflare Pages 部署

静态站点根目录为构建生成的 **`m3u/`**（M3U、TXT、`sources/`、TVBox JSON、`epg/` 等均在此目录下）。

### 通过 Git 连接仓库（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 授权并选择本仓库与要部署的分支（一般为 `main`）。
3. 构建设置如下：

   | 项 | 值 |
   | --- | --- |
   | Framework preset | `None` |
   | Build command | ` pnpm build:static` |
   | Build output directory | `m3u` |

### 定时更新（GitHub Actions `schedule`）

仓库中的 [`.github/workflows/schedule.yml`](.github/workflows/schedule.yml) 按 cron **每 2 小时**执行：安装依赖、`pnpm build`、`pnpm m3u`，然后根据是否配置 Cloudflare 直连上传凭据，选择两种后续行为之一：

| 条件 | 行为 |
| --- | --- |
| 已设置 Secret **`CLOUDFLARE_API_TOKEN`**（非空） | 在 Runner 上通过 `npx wrangler pages deploy` 将本地生成的 **`m3u/`** 目录发布到指定 Pages 项目（**Direct Upload**） |
| 未设置该 Secret | 向当前分支推送一个**空 commit**，利用 Cloudflare Pages「连接 Git」时的推送触发，在 Cloudflare 侧按你在控制台配置的构建命令重新构建站点 |

直连上传时，请在 GitHub 仓库中配置：

| 类型 | 名称 | 说明 |
| --- | --- | --- |
| Secret | `CLOUDFLARE_API_TOKEN` | Cloudflare API 令牌，需包含 Pages 写入权限 |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | 账户 ID（Dashboard 右侧或 Workers 概览可见） |
| Variable 或 Secret | `PROJECT_NAME` | 目标 **Pages 项目名称**（与 Cloudflare 控制台中的项目名一致）；优先读取 Repository variable `PROJECT_NAME`，未设置时再读同名 Secret |

Pages 项目需支持 **Direct Upload**（或通过 Wrangler 首次创建/关联）。若走「空 commit」分支，请确保默认分支未开启会阻止 `github-actions[bot]` 推送的保护规则，否则 push 会失败。

### 部署后检查

- 浏览器访问 `https://<你的-pages-域名>/` 应能看到站点或列表页（取决于 `public/` 内容）。
- TVBox / M3U 中的 EPG 地址请把文档里的 `your-domain.pages.dev` 换成你的 **Pages 域名或自定义域名**。

## Docker 镜像

当前 CI 构建并推送到 Docker Hub 的镜像为：

- **镜像名**：`yunnysunny/iptv-sources:latest`（完整引用：`docker.io/yunnysunny/iptv-sources:latest`）
- **按构建日期的标签**：每次推送 `main` 还会打上 **`vYYYY.m.d`**（UTC，月与日无前导零），例如 `yunnysunny/iptv-sources:v2026.3.24`；同一天多次构建会指向最后一次构建
- **仓库页**：[hub.docker.com/r/yunnysunny/iptv-sources](https://hub.docker.com/r/yunnysunny/iptv-sources)
- **触发方式**：`main` 分支推送时由 [`.github/workflows/docker.yml`](.github/workflows/docker.yml) 构建推送；多架构 **linux/amd64**、**linux/arm64**

> 若你自行 Fork 并配置了不同的 `DOCKERHUB_USERNAME`，请将下文命令中的 `yunnysunny/iptv-sources` 换成 **`<你的用户名>/iptv-sources`**。

### 镜像里有什么

- 构建阶段已执行 `pnpm build`、`pnpm m3u`、`pnpm static`，**静态站点根目录**为容器内 **`/app/m3u`**（与 Cloudflare Pages 的 `m3u/` 产物一致）。
- **nginx** 监听 **80**，对外只提供静态文件（**不再包含**原先的 Node/Koa 动态服务）。
- **busybox crond** 每 **2 小时**执行一次 `node /app/dist/index.js`，在容器内就地更新 `/app/m3u`。

### 拉取与运行

先拉取最新标签（可选，首次 `run` 也会自动拉取）：

```bash
docker pull yunnysunny/iptv-sources:latest
```

将宿主机的 **8080** 映射到容器 **80**（端口可按需修改；电视/盒子在同一局域网时，把 `127.0.0.1` 换成宿主机局域网 IP 即可引用 M3U/EPG）：

**Linux / macOS（bash）：**

```bash
docker run -d --name iptv-sources --restart unless-stopped -p 8080:80 yunnysunny/iptv-sources:latest
```

**Windows（PowerShell）：**

```powershell
docker run -d --name iptv-sources --restart unless-stopped -p 8080:80 yunnysunny/iptv-sources:latest
```

- **本机浏览器**：`http://127.0.0.1:8080/`
- **播放列表与 EPG 路径**与静态站点相同，例如 `http://<宿主机IP>:8080/某源.m3u`、`http://<宿主机IP>:8080/epg/51zmt.xml` 等（具体文件名以构建结果为准）。

**常用维护命令**（容器名均为 `iptv-sources`）：

| 操作 | 命令 |
| --- | --- |
| 查看日志（含 nginx 与定时任务输出） | `docker logs -f iptv-sources` |
| 停止 / 删除容器 | `docker stop iptv-sources` → `docker rm iptv-sources` |
| 更新到最新镜像 | `docker pull yunnysunny/iptv-sources:latest` 后，先 `stop`/`rm` 再按上文重新 `docker run`（或使用你习惯的 compose 流程） |

若提示容器名已存在，说明本机已有同名容器：先 `docker rm -f iptv-sources` 再执行 `run`，或换一个 `--name`。

### `docker run` 使用示例

以下命令在 **Linux / macOS（bash）** 与 **Windows（PowerShell）** 中均可直接使用（路径与镜像名相同）。

**1. 常用：后台运行、开机自启、映射 8080→80**

```bash
docker run -d --name iptv-sources --restart unless-stopped -p 8080:80 yunnysunny/iptv-sources:latest
```

**2. 需要设置环境变量时（将容器内路径换成你的静态根目录）**

```bash
docker run -d --name iptv-sources --restart unless-stopped -p 8080:80 \
  -e LIVE_RESULT_DIR=/app/m3u \
  yunnysunny/iptv-sources:latest
```

PowerShell 中请将上述多行写成一行，或使用反引号 `` ` `` 续行。

### 使用 Volume 映射 `m3u` 目录

把容器内的 **`/app/m3u`** 挂到 **命名卷**或**宿主机目录**后，定时任务写入的 M3U / EPG 等会落在卷上，**换容器或升级镜像**时数据可保留。

> 推荐使用这种方式启动，否则随着时间推移，由于 docker 的 overlay 机制，容器的体积会越来越大。

> **注意**：`-v …:/app/m3u` 会**遮住**镜像里构建阶段自带的 `m3u`。若卷或目录是**空的**，在首次定时任务完成前（默认最长约 2 小时）站点可能暂时没有文件；也可事先把已有 `m3u` 内容放进该目录再启动。

**命名卷（由 Docker 管理，路径无需手写）**

```bash
docker run -d --name iptv-sources --restart unless-stopped -p 8080:80 \
  -v iptv-sources-m3u:/app/m3u \
  yunnysunny/iptv-sources:latest
```

**绑定挂载：Linux / macOS（示例：当前目录下的 `m3u-data`）**

```bash
mkdir -p ./m3u-data
docker run -d --name iptv-sources --restart unless-stopped -p 8080:80 \
  -v "$(pwd)/m3u-data:/app/m3u" \
  yunnysunny/iptv-sources:latest
```

**绑定挂载：Windows PowerShell（示例路径请按本机修改）**

```powershell
New-Item -ItemType Directory -Force -Path E:\data\iptv-m3u | Out-Null
docker run -d --name iptv-sources --restart unless-stopped -p 8080:80 `
  -v E:\data\iptv-m3u:/app/m3u `
  yunnysunny/iptv-sources:latest
```

使用 Docker Desktop 时，一般可将 `E:\...` 写成上述形式；若挂载异常，可改为 WSL2 中的路径（例如 `/mnt/e/data/iptv-m3u:/app/m3u`）。

若将数据挂到容器内**其他路径**（例如 `-v ./data:/data/m3u`），需同时设置 **`LIVE_RESULT_DIR=/data/m3u`**（或 `M3U_ROOT`），与 nginx 的 `root` 保持一致。

### 环境变量（可选）

启动时由 `docker/entrypoint.sh` 调用 `docker/gen-config.mjs` 生成 nginx 配置。若需改静态根目录（默认为 `/app/m3u`），可设置：

| 变量 | 说明 |
| --- | --- |
| `LIVE_RESULT_DIR` | nginx `location /` 的 `root`，默认 `/app/m3u` |
| `M3U_ROOT` | 与上项二选一，效果相同（仍优先读已有 `schedule-config.json` 中的 `liveResultDir`） |
| `CUSTOM_URL`| 站点根 URL，影响 TvBox json 配置文件中 epg 的链接前缀，格式可以为 `http://ip:port` , 其中 `ip` 为 docker 容器运行的宿主机ip |

一般无需设置环境变量；仅当你需要把 nginx 的 `root` 指到容器内**其他目录**时配置 `LIVE_RESULT_DIR` 或 `M3U_ROOT` 即可。

### 本地构建

在项目根目录：

**Linux / macOS：**

```bash
docker build -t iptv-sources:local .
docker run -d --name iptv-sources -p 8080:80 iptv-sources:local
```

**Windows（PowerShell）：**

```powershell
docker build -t iptv-sources:local .
docker run -d --name iptv-sources -p 8080:80 iptv-sources:local
```

### Docker Hub 页面说明

同一工作流会使用 [peter-evans/dockerhub-description](https://github.com/peter-evans/dockerhub-description) 将本仓库根目录 **`README.md`** 同步为 Docker Hub 仓库长说明，便于在 Hub 上直接查看文档。


## LICENSE

GPL-3.0 &copy; yunnysunny

本项目基于 GPL-3.0 协议开源。
