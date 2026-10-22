---
title: Atlas Geo
slug: atlas-geo
category: atlas
sub_category: atlas-edge
tags: [API, 地理编码, 自建]
url: https://geo.sgyyyds.qzz.io
alternatives: [OpenStreetMap Nominatim]
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-19
generated: true
---

# Atlas Geo

> 地理编码与逆地理编码：地名与坐标互转，带自建 KV 缓存，替代 Nominatim 公共实例。

## 一句话总结

地理编码与逆地理编码：地名与坐标互转，带自建 KV 缓存，替代 Nominatim 公共实例。

## 核心功能 / 特点

- /search 地名转坐标，/reverse 坐标转地名，/json 统一输出
- 查询结果缓存在 KV，重复请求不再回源
- 不受公共实例的速率限制与可用性影响

## 适用场景

- 应用里需要把地址转成坐标，但公共 Nominatim 实例限速或不稳
- 同一批地点反复查询，希望第二次几乎瞬时返回

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
