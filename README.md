# iptv-sources

Autoupdate iptv sources

[![Docker Build](https://img.shields.io/docker/automated/herberthe0229/iptv-sources?style=flat-square)](https://hub.docker.com/r/herberthe0229/iptv-sources)
[![Docker Version](https://img.shields.io/docker/v/herberthe0229/iptv-sources/latest?style=flat-square)](https://hub.docker.com/r/herberthe0229/iptv-sources)
[![Docker Image](https://img.shields.io/docker/image-size/herberthe0229/iptv-sources/latest?style=flat-square)](https://hub.docker.com/r/herberthe0229/iptv-sources)
[![Docker Pulls](https://img.shields.io/docker/pulls/herberthe0229/iptv-sources?style=flat-square)](https://hub.docker.com/r/herberthe0229/iptv-sources)
[![Docker Stars](https://img.shields.io/docker/stars/herberthe0229/iptv-sources?style=flat-square)](https://hub.docker.com/r/herberthe0229/iptv-sources)

Join discord: [![Discord](https://discord.badge.ibert.me/api/server/betxHcsTqa)](https://discord.gg/betxHcsTqa)

Sources are from:

- <https://epg.pw/test_channel_page.html>
- [iptv.org](https://github.com/iptv-org/iptv)
- [YueChan/Live](https://github.com/YueChan/Live)
- [YanG-1989/m3u](https://github.com/YanG-1989/m3u)
- [fanmingming/live](https://github.com/fanmingming/live)
- [qwerttvv/Beijing-IPTV](https://github.com/qwerttvv/Beijing-IPTV)

EPG Sources are from:

- [fanmingming/live](https://github.com/fanmingming/live)
- [112114.xyz](https://diyp1.112114.xyz)
- [epg.51zmt.top:8000](http://epg.51zmt.top:8000/)

See <https://m3u.ibert.me> to get more.

> Use CDN **(Not recommended)**: You can use `https://fastly.jsdelivr.net/gh/HerbertHe/iptv-sources@gh-pages/` to replace `https://m3u.ibert.me/` for using CDN Service. Due to the **Cache Policy** of CDN, the content wouldn't be the latest, the m3u files would be updated every **2 hours**.

## Deploy by yourself

You can also deploy the project by yourself with docker.

```bash
docker run --name iptv-sources -p 3000:8080 -d herberthe0229/iptv-sources:latest
```

- Run `docker ps` to get container status.

Wait a minute, visit <http://localhost:3000>.

Then, you can use `http://localhost:3000` instead of `https://m3u.ibert.me`.

For example: `https://m3u.ibert.me/cn.m3u` -> `http://localhost:3000/cn.m3u`

Or, you can also deploy with your own server & domain.

## Crontab

Maybe you want to set schedule for auto-updating per 2 hours.

- Download `iptv-update.sh` <https://github.com/HerbertHe/iptv-sources/blob/main/iptv-update.sh> to your homedir.

- Edit you crontab:

```bash
crontab -e
```

- Press keyboard `i` for adding schedule.

- Add:

```cron
0 */2 * * * /bin/sh ~/iptv-update.sh
```

- Press keyboard `ESC` to exit edit mode
- Type `:wq` to save
- Restart crontab service

```bash
service crond restart
```

## Update docker image

- Download bash script file `update-image.sh` <https://github.com/HerbertHe/iptv-sources/blob/main/update-image.sh> to your homedir.

- run

```bash
/bin/sh ~/update-image.sh
```

## Supported Environment Variables

```shell
# add custom rollback urls, default is empty
# ROLLBACK_URLS=https://xxxx.xxx.com

# close source proxy, default is false
# CLOSE_SOURCE_PROXY=true

# add custom github raw source proxy url, default is https://ghproxy.net
# The custom proxy service you configured MUST supports the request urls, like `${CUSTOM_GITHUB_RAW_SOURCE_PROXY_URL}/https://raw.githubusercontent.com/xxx/xxx`
# If you want to deploy the ghproxy by yourself, see https://github.com/hunshcn/gh-proxy
# CUSTOM_GITHUB_RAW_SOURCE_PROXY_URL=https://ghproxy.net

# enable iptv checker, default is false
# ENABLE_IPTV_CHECKER=true

# add iptv checker url, default is empty
# IPTV_CHECKER_URL=http://[::1]:8081
```

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=HerbertHe/iptv-sources&type=Date)](https://star-history.com/#HerbertHe/iptv-sources&Date)

## LICENSE

GPL-3.0 &copy; Herbert He 2023-2024
