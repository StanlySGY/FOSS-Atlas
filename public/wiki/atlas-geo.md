---
title: Atlas Geo
slug: atlas-geo
category: atlas
sub_category: atlas-edge
tags: [API, 地理编码, 自建]
url: https://geo.sgyyyds.qzz.io
alternatives: [OpenStreetMap Nominatim]
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-30
generated: true
---

# Atlas Geo

> 地理编码与逆地理编码 API：通过地名查找坐标，或通过坐标反查附近地点与地址。

## 一句话总结

地理编码与逆地理编码 API：通过地名查找坐标，或通过坐标反查附近地点与地址。

## 核心功能 / 特点

- /search?q= 与 /json?q= 将地名转换为坐标和匹配结果，/reverse 根据坐标反查地址
- KV 提供 7 天新鲜缓存与最长 30 天的陈旧结果回退
- 单个 Durable Object 对全站上游请求排队限速，并支持通过 KV 切换 Nominatim-compatible 上游

## 适用场景

- 应用需要把城市、地标或地址转换为经纬度
- 地图交互已经拿到坐标，需要反查可读的地址或地点信息

## 快速上手

- 地名正向查询使用 /search?q= 或 /json?q=，对中文或包含空格的地名应先做 URL 编码；坐标逆向查询使用 /reverse?lat=纬度&lon=经度。
- 上游请求由全站共享的队列统一限速，至少间隔 1 秒；不要把接口用于自动补全、批量抓取或系统性查询。
- 默认数据来自 OpenStreetMap Nominatim，使用时请保留页面提供的 © OpenStreetMap contributors 署名。可通过 KV 的 config:atlas-geo-upstream 与 config:atlas-geo-attribution 切换兼容上游和署名；将上游配置为 disabled 可停止新的外部请求。

## API 调用示例

### 地名转坐标（首尔）

```bash
curl -sS 'https://geo.sgyyyds.qzz.io/search?q=Seoul'
```

响应示例：

```json
{
  "source": "Nominatim-compatible geocoder",
  "attribution": "© OpenStreetMap contributors",
  "cached": true,
  "stale": false,
  "count": 1,
  "results": [
    {
      "display_name": "首尔特别市, 韩国 / 南韓",
      "lat": "37.5666791",
      "lon": "126.9782914",
      "type": "administrative",
      "category": "boundary"
    }
  ]
}
```

线上缓存命中响应示例；结果会随上游数据和缓存状态变化。

### 坐标反查地址

```bash
curl -sS 'https://geo.sgyyyds.qzz.io/reverse?lat=37.5665&lon=126.9780'
```

响应示例：

```json
{
  "source": "Nominatim-compatible geocoder",
  "attribution": "© OpenStreetMap contributors",
  "cached": true,
  "stale": false,
  "result": {
    "display_name": "Happy Plus Cafe, 110, 世宗大路, 太平路1街, 明洞, 中區, 首尔特别市, 04520, 韩国 / 南韓",
    "lat": "37.5665253",
    "lon": "126.9787754",
    "type": "cafe",
    "category": "amenity"
  }
}
```

地理结果会随地图数据和上游状态变化；缓存回退时 stale 会为 true。


## 使用边界与安全提醒

- 公开 Nominatim 对整个应用设有每秒最多 1 次请求的限额，不是每个访客各 1 次；当前由全局 Durable Object 排队执行，队列过满时请求可能被拒绝。
- 不要实现自动补全或批量/系统性查询；如需调整上游，先确认替代服务的使用条款、速率限制和署名要求。详见 https://operations.osmfoundation.org/policies/nominatim/。
- 地理编码结果是地图数据匹配，不代表地址已经过权威核验；同名地点可能返回多个候选项，缓存回退结果也可能不是最新数据。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享：粘贴即生成链接，附 /raw 纯文本端点（上限 60 KB）；新建分享保留 7 天。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
