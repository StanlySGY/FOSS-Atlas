---
title: Atlas Nodes
slug: nodes
category: atlas
sub_category: atlas-edge
tags: [代理订阅, 聚合, 自建]
url: https://nodes.sgyyyds.qzz.io
related: [foss-atlas-cf, short, paste, qr]
updated: 2026-10-19
generated: true
---

# Atlas Nodes

> 免费节点聚合订阅：合并 11 个上游源并去重，13,000+ 条节点，30 分钟自动刷新。

## 一句话总结

免费节点聚合订阅：合并 11 个上游源并去重，13,000+ 条节点，30 分钟自动刷新。

## 核心功能 / 特点

- /sub 输出订阅，/txt 输出明文列表，/api/sources 列出上游源
- 跨源合并去重，避免客户端里出现重复节点
- 定时刷新，上游变动后订阅自己跟上

## 适用场景

- 客户端里想要一份持续更新的免费节点订阅，而不是手动导入了就过期
- 多个上游源质量不一，需要先合并去重再喂给客户端

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas QR]] —— 二维码生成 API(/api/qr?data=),SVG 输出,替代 qrserver 等第三方接口。
