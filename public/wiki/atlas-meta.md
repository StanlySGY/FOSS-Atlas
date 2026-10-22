---
title: Atlas Meta
slug: atlas-meta
category: atlas
sub_category: atlas-edge
tags: [API, 元数据, 自建]
url: https://meta.sgyyyds.qzz.io
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-19
generated: true
---

# Atlas Meta

> 链接元数据 / OpenGraph 解析：抓标题、摘要与缩略图，请求不转发给第三方解析服务。

## 一句话总结

链接元数据 / OpenGraph 解析：抓标题、摘要与缩略图，请求不转发给第三方解析服务。

## 核心功能 / 特点

- /json?url= 返回标题、描述与缩略图
- 解析在服务端完成，客户端不必处理 HTML
- 自建解析意味着抓取行为与缓存策略由自己定

## 适用场景

- 分享链接时想自动生成卡片，而不依赖第三方元数据 API
- 在自建站点里做链接预览，需要可控的抓取与缓存

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
