# iptv-sources

自动更新的 IPTV 直播源，支持 M3U、TXT 和 TVBox 格式，并提供基于静态文件的 EPG（电子节目预告）服务。

**本项目仓库**：[yunnysunny/iptv-sources](https://github.com/yunnysunny/iptv-sources) 基于 [HerbertHe/iptv-sources](https://github.com/HerbertHe/iptv-sources) 开发。

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
| [王小二放牛娃](https://www.xn--4kq62z5rby2qupq9ub.top/) | tvbox点播 |

## EPG 数据源

| 来源 | 说明 |
|------|------|
| [epg.51zmt.top:8000](http://epg.51zmt.top:8000/) | 央视、卫视及地方频道 |
| [epg.pw](https://epg.pw/) | 抓取中国地区频道列表, 生成 **`epg/pw-7/{date}/{NAME}.json`**（约 7 天滚动窗口）|

## Channel

| channel | url | list | count | isRollback |
| ------- | --- | ---- | ----- | ---------- |
<!-- channels_here -->

## EPG

| epg | url | isRollback |
| --- | --- | ---------- |
<!-- epgs_here -->

## TVBox EPG 使用
### 直接修改直播源 JSON
本站将 EPG 数据按日期和频道拆分为静态 JSON 文件，可直接在 TVBox 中使用。

EPG 链接格式（`{date}`、`{name}` 由 TVBox 自动替换）：

- 51zmt 当天聚合：`{site_url}/epg/51zmt/{date}/{name}.json`
- epg.pw 7天聚合：`{site_url}/epg/pw-7/{date}/{name}.json`

在 TVBox 直播源 JSON 的 `epg` 字段中填入上述任一完整 URL 即可查看节目预告。

可以通过以下两个链接来测试 tvbox 中的 json 地址是否正确：

- 51zmt 当天聚合测试链接：`{site_url}/epg/51zmt/{today}/CCTV1.json`
- epg.pw 7天聚合测试链接：`{site_url}/epg/pw-7/{today}/CCTV1.json`

### TVBox JSON 配置文件链接修改
某些第三方 TVBox 软件不支持直接修改直播源 JSON，必须使用 TVBox JSON 配置文件链接进行修改，这里基于 [王小二放牛娃](https://www.xn--4kq62z5rby2qupq9ub.top/) 提供的配置文件，将 EPG 配置为 `epg.pw 7天聚合`，并将直播源替换为本项目中采集的直播源。

TVBox JSON 配置文件链接：

- `{site_url}/tvbox/tvbox.json`

## LICENSE

GPL-3.0 &copy; yunnysunny

本项目基于 GPL-3.0 协议开源。
