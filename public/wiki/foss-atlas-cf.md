---
title: FOSS-Atlas(Cloudflare Pages)
slug: foss-atlas-cf
category: atlas
sub_category: atlas-edge
tags: [本站, 静态托管, 自建]
url: https://atlas.sgyyyds.qzz.io
related: [short, paste, nodes, qr]
updated: 2026-10-19
generated: true
---

# FOSS-Atlas(Cloudflare Pages)

> 本目录站的 Cloudflare Pages 镜像，与 GitHub Pages 上的主站保持同一份内容。

## 一句话总结

本目录站的 Cloudflare Pages 镜像，与 GitHub Pages 上的主站保持同一份内容。

## 核心功能 / 特点

- 同一构建产物发布到 Cloudflare Pages，绑定自定义域
- 与 GitHub Pages 主站内容一致，任一侧可达
- 静态资源走 Cloudflare 边缘缓存，访问不依赖本机

## 适用场景

- 主站所在平台访问不稳时，还有一条能打开的路径
- 希望目录站在边缘网络分发，而不是从本机回源

## 同类推荐

- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
- [[Atlas QR]] —— 二维码生成 API(/api/qr?data=),SVG 输出,替代 qrserver 等第三方接口。
