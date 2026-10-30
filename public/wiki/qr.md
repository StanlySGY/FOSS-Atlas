---
title: Atlas QR
slug: qr
category: atlas
sub_category: atlas-edge
tags: [API, 二维码, 自建]
url: https://qr.sgyyyds.qzz.io
alternatives: [QRServer]
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-30
generated: true
---

# Atlas QR

> 二维码生成 API：同时支持 SVG 矢量图和 PNG 位图输出，可用于网页嵌入或下载。

## 一句话总结

二维码生成 API：同时支持 SVG 矢量图和 PNG 位图输出，可用于网页嵌入或下载。

## 核心功能 / 特点

- /api/qr?data= 和 /qr.svg?data= 返回 SVG 二维码
- /qr.png?data= 返回真实 PNG 图像，MIME 为 image/png
- 首页提供内容输入框与可选边长像素设置，二维码由自建边缘服务生成

## 适用场景

- 页面里要放二维码，但不想调用外部二维码生成服务
- 需要 SVG 矢量图或可直接下载的 PNG 位图

## 快速上手

- 在 Atlas QR 首页输入要编码的文本或完整 URL；可选设置图像边长像素。
- 需要矢量图时使用 /api/qr?data=... 或 /qr.svg?data=...；需要 PNG 文件时使用 /qr.png?data=...&size=320。
- 程序传参前请对 data 内容进行 URL 编码；PNG 响应可保存为 .png 文件，SVG 响应可保存为 .svg 文件。

## API 调用示例

### 生成 SVG 二维码

```bash
curl -sS 'https://qr.sgyyyds.qzz.io/api/qr?data=FOSS-Atlas'
```

线上响应类型为 image/svg+xml；/qr.svg 使用相同 SVG 输出。


## 使用边界与安全提醒

- 二维码只是把内容编码成图像，不会替链接背书；扫描陌生二维码前应先核对解码出的域名和目标地址。
- PNG 路由现在返回真实 1-bit 灰度 PNG；不要再把旧版曾返回 SVG 的行为当作当前响应格式。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
