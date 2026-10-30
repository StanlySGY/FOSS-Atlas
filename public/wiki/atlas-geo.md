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

- /search?q= 将地名转换为坐标和匹配结果
- /reverse?lat=...&lon=... 根据坐标返回地址、地点类型和地址组成
- 查询结果使用自建 KV 缓存，重复请求可直接命中缓存

## 适用场景

- 应用需要把城市、地标或地址转换为经纬度
- 地图交互已经拿到坐标，需要反查可读的地址或地点信息

## 快速上手

- 地名正向查询使用 /search?q=，对中文或包含空格的地名应先做 URL 编码。
- 坐标逆向查询使用 /reverse?lat=纬度&lon=经度；纬度范围为 -90 至 90，经度范围为 -180 至 180。
- 响应中的 display_name、lat、lon、type 和 category 可用于展示或进一步处理；结果来自 OpenStreetMap Nominatim。

## API 调用示例

### 地名转坐标（首尔）

```bash
curl -sS 'https://geo.sgyyyds.qzz.io/search?q=Seoul'
```

响应示例：

```json
{
  "source": "OpenStreetMap Nominatim",
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

### 坐标反查地址

```bash
curl -sS 'https://geo.sgyyyds.qzz.io/reverse?lat=37.5665&lon=126.9780'
```

响应示例：

```json
{
  "source": "OpenStreetMap Nominatim",
  "result": {
    "display_name": "Happy Plus Cafe, 110, 世宗大路, 太平路1街, 明洞, 中區, 首尔特别市, 04520, 韩国 / 南韓",
    "lat": "37.5665253",
    "lon": "126.9787754",
    "type": "cafe",
    "category": "amenity"
  }
}
```

地理结果会随 OpenStreetMap 数据和上游状态变化。


## 使用边界与安全提醒

- 地理编码结果是地图数据匹配，不代表地址已经过权威核验；同名地点可能返回多个候选项。
- 本轮 /json 统一入口的带参数请求遇到上游暂不可用响应，因此只把已成功核验的 /search 与 /reverse 列为推荐调用示例。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
