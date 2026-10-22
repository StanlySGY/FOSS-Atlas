---
title: Atlas Proxy
slug: px
category: atlas
sub_category: atlas-edge
tags: [API, 代理, 自建]
url: https://px.sgyyyds.qzz.io
alternatives: [ProxyScrape]
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-19
generated: true
---

# Atlas Proxy

> 公开代理聚合 API：HTTP / SOCKS4 / SOCKS5 共 8,000+ 条，可按类型取用并带国家与 ASN 信息。

## 一句话总结

公开代理聚合 API：HTTP / SOCKS4 / SOCKS5 共 8,000+ 条，可按类型取用并带国家与 ASN 信息。

## 核心功能 / 特点

- /http、/socks4、/socks5 分别输出对应类型，/all 一次取全部
- /json 返回结构化结果，附国家与 ASN 字段
- /api/sources 说明上游来源，便于判断数据新鲜度

## 适用场景

- 做网络实验或抓取时需要成批公开代理，不想逐个站点去抓
- 按国家筛代理列表，需要每条带元数据而不只是地址

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
