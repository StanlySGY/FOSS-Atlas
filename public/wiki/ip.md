---
title: Atlas IP
slug: ip
category: atlas
sub_category: atlas-edge
tags: [API, IP 查询, 自建]
url: https://ip.sgyyyds.qzz.io
alternatives: [IPinfo]
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-19
generated: true
---

# Atlas IP

> 客户端 IP 与地理位置 / ASN 查询 API，替代 ipinfo 之类第三方接口。

## 一句话总结

客户端 IP 与地理位置 / ASN 查询 API，替代 ipinfo 之类第三方接口。

## 核心功能 / 特点

- /json 返回请求方的 IP、地理位置与 ASN
- /api/ip 提供同样的结构化查询
- 边缘就近响应，不需要把请求发给外部查询服务

## 适用场景

- 脚本里要拿到出口 IP 及其归属，用来验证路由或策略是否生效
- 页面想显示访客的大致位置，但不愿调用第三方 IP 查询服务

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
