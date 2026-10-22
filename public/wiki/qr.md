---
title: Atlas QR
slug: qr
category: atlas
sub_category: atlas-edge
tags: [API, 二维码, 自建]
url: https://qr.sgyyyds.qzz.io
alternatives: [QRServer]
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-19
generated: true
---

# Atlas QR

> 二维码生成 API：传 data 参数返回 SVG，替代 qrserver 之类第三方接口。

## 一句话总结

二维码生成 API：传 data 参数返回 SVG，替代 qrserver 之类第三方接口。

## 核心功能 / 特点

- /api/qr?data= 生成二维码，另有 /qr.svg 与 /qr.png 两种输出
- SVG 输出可直接嵌进网页或打印，不受位图尺寸限制
- 生成在自己账号下，不依赖第三方服务的可用性与速率

## 适用场景

- 页面里要放二维码，但不想把内容交给外部二维码接口
- 需要矢量二维码以便缩放或印刷

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
