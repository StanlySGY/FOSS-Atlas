---
title: Atlas QR
slug: qr
category: atlas
sub_category: atlas-edge
tags: [API, 二维码, 自建]
url: https://qr.sgyyyds.qzz.io
alternatives: [QRServer]
related: [qrserver, px, ip, check]
updated: 2026-10-30
generated: true
---

# Atlas QR

> 二维码生成 API：同时支持 SVG 矢量图和 PNG 位图输出，可用于网页嵌入或下载。

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

- [[QRServer]] —— 二维码生成 / 解码 API；文档未公布固定请求上限，但保留拒绝滥用请求的权利
- [[Atlas Proxy]] —— 公开代理聚合 API:HTTP/SOCKS4/SOCKS5 共 8,000+ 条,支持 /json 带国家与 ASN。
- [[Atlas IP]] —— 客户端 IP 与地理位置/ASN 查询 API(/json),替代 ipinfo 等第三方接口。
- [[Atlas Check]] —— 邮箱/域名校验 API:一次性邮箱黑名单(9,900+ 域名)+ MX 记录查询,替代 disify 等第三方。
