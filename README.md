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
- [joevess/IPTV](https://github.com/joevess/IPTV)
- [cymz6/AutoIPTV-Hotel](https://github.com/cymz6/AutoIPTV-Hotel)

EPG Sources are from:

- [fanmingming/live](https://github.com/fanmingming/live)
- [112114.xyz](https://diyp1.112114.xyz)
- [epg.51zmt.top:8000](http://epg.51zmt.top:8000/)

See <https://m3u.ibert.me> to get more.

## Deploy by yourself

- [How to deploy with GitHub Pages](https://github.com/HerbertHe/iptv-sources/discussions/35)
- [How to deploy with docker](https://github.com/HerbertHe/iptv-sources/discussions/36)
- [How to deploy with nodejs](https://github.com/HerbertHe/iptv-sources/discussions/37)

## Supported Environment Variables

```shell
# add custom rollback urls, default is empty
# ROLLBACK_URLS=https://xxxx.xxx.com

# close source proxy, default is false
# CLOSE_SOURCE_PROXY=true

# add custom github raw source proxy url
# The custom proxy service you configured MUST supports the request urls, like `${CUSTOM_GITHUB_RAW_SOURCE_PROXY_URL}/https://raw.githubusercontent.com/xxx/xxx`
# If you want to deploy the ghproxy by yourself, see https://github.com/hunshcn/gh-proxy
# CUSTOM_GITHUB_RAW_SOURCE_PROXY_URL=https://ghp.ci/

# enable iptv checker, default is false
# ENABLE_IPTV_CHECKER=true

# add iptv checker url, default is empty
# IPTV_CHECKER_URL=http://[::1]:8081
```

## Q&A

- [How to close the github raw content proxy](https://github.com/HerbertHe/iptv-sources/discussions/38)
- [How to set the custom github raw source proxy url](https://github.com/HerbertHe/iptv-sources/discussions/39)
- [How to use `iptv-checker` feature](https://github.com/HerbertHe/iptv-sources/discussions/40)
- [How to add your own rollback urls](https://github.com/HerbertHe/iptv-sources/discussions/41)
- [How to create custom sources based on the upstream](https://github.com/HerbertHe/iptv-sources/discussions/68)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=HerbertHe/iptv-sources&type=Date)](https://star-history.com/#HerbertHe/iptv-sources&Date)

## LICENSE

GPL-3.0 &copy; Herbert He

本项目基于 GPL-3.0 协议开源。
