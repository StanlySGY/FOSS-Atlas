---
title: Atlas Tools
slug: atlas-tools
category: atlas
sub_category: atlas-edge
tags: [API, 编码解码, 自建]
url: https://tools.sgyyyds.qzz.io
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-19
generated: true
---

# Atlas Tools

> 常用编码小工具 API：SHA 系列哈希、UUID v4、Base64 / URL / Hex 编解码。

## 一句话总结

常用编码小工具 API：SHA 系列哈希、UUID v4、Base64 / URL / Hex 编解码。

## 核心功能 / 特点

- /api/hash 计算哈希，/api/uuid 生成 UUID v4
- /api/encode 做 Base64、URL 与 Hex 编解码
- 一个端点集合覆盖日常零散转换，省掉临时脚本

## 适用场景

- 命令行里临时要算个哈希或做段 Base64，不想装额外工具
- 在脚本中调用编码转换，希望有个稳定的 HTTP 接口

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
