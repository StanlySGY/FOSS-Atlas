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

> 二维码生成 API：将文本或链接转换为 SVG 二维码，适合网页嵌入和矢量打印。

## 一句话总结

二维码生成 API：将文本或链接转换为 SVG 二维码，适合网页嵌入和矢量打印。

## 核心功能 / 特点

- /api/qr?data= 和 /qr.svg?data= 均可生成 SVG 二维码
- 首页提供内容输入框与可选边长像素设置
- 二维码在自建边缘服务生成，不必把内容交给第三方二维码 API

## 适用场景

- 页面里要放二维码，但不想调用外部二维码生成服务
- 需要 SVG 矢量图以便缩放、嵌入网页或打印

## 快速上手

- 在 Atlas QR 首页输入要编码的文本或完整 URL；需要调整图像尺寸时，可使用页面提供的可选边长像素设置。
- 程序调用可使用 /api/qr?data=... 或 /qr.svg?data=...，请先对 data 参数进行 URL 编码。
- 接口返回 SVG 图像，可保存为 .svg 文件或直接作为网页图片资源使用。

## API 调用示例

### 生成 SVG 二维码

```bash
curl -sS 'https://qr.sgyyyds.qzz.io/api/qr?data=FOSS-Atlas'
```

线上响应为 image/svg+xml；本轮同时验证 /qr.svg?data=FOSS-Atlas 可用。


## 使用边界与安全提醒

- 本轮检查发现 /qr.png?data=FOSS-Atlas 虽返回 HTTP 200，响应 MIME 仍为 image/svg+xml；不要把该路径当作已验证的 PNG 输出。
- 二维码只是把内容编码成图像，不会替链接背书；扫描陌生二维码前应先核对解码出的域名和目标地址。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
