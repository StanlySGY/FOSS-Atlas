---
title: Atlas Short
slug: short
category: atlas
sub_category: atlas-edge
tags: [短链, API, 自建]
url: https://short.sgyyyds.qzz.io
alternatives: [is.gd, TinyURL]
related: [foss-atlas-cf, paste, nodes, qr]
updated: 2026-10-30
generated: true
---

# Atlas Short

> 自建短链服务：Workers 加 KV 做去重存储，带点击统计和可列出的链接清单。

## 一句话总结

自建短链服务：Workers 加 KV 做去重存储，带点击统计和可列出的链接清单。

## 核心功能 / 特点

- POST /api/shorten 生成短链，同一长链接复用同一个短码
- /stats/<短码> 看点击次数，/api/list 列出全部链接
- 短码直达跳转，整个链路不经过第三方短链服务

## 适用场景

- 分享长链接时想要自己的短域名，而不是公共短链的域名
- 需要知道某条链接被点过多少次，并且数据留在自己的 KV 里

## 快速上手

- 在页面的「短链目标 URL」输入完整的 http 或 https 地址。
- 点击「生成短链」，页面会返回对应的短地址；复制短地址后即可分享。
- 已登记的接口入口包括 POST /api/shorten、/stats/<短码> 统计页和 /api/list 链接清单。

## 使用边界与安全提醒

- 短链是公开跳转入口，不要把带有登录令牌、重置密码参数或其他秘密的 URL 转成可公开传播的短链。
- /api/list 是清单入口，不应把它当作私有管理接口；不要在短链目标或短链备注中放入个人敏感信息。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
- [[Atlas QR]] —— 二维码生成 API(/api/qr?data=),SVG 输出,替代 qrserver 等第三方接口。
