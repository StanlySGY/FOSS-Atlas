---
title: Atlas Check
slug: check
category: atlas
sub_category: atlas-edge
tags: [API, 邮箱校验, 自建]
url: https://check.sgyyyds.qzz.io
alternatives: [Disify]
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-19
generated: true
---

# Atlas Check

> 邮箱与域名校验 API：9,900+ 一次性邮箱域名黑名单加 MX 记录查询，替代 disify 等第三方。

## 一句话总结

邮箱与域名校验 API：9,900+ 一次性邮箱域名黑名单加 MX 记录查询，替代 disify 等第三方。

## 核心功能 / 特点

- /api/email 判断域名是否属于一次性邮箱
- /api/domain 查询 MX 记录，确认可收件域名
- 黑名单自带在 KV 里，判定不依赖外部服务

## 适用场景

- 注册表单要挡掉临时邮箱，需要一个能自己控制的判定接口
- 发信前先确认域名的 MX 是否真的存在

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
