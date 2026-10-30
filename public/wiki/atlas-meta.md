---
title: Atlas Meta
slug: atlas-meta
category: atlas
sub_category: atlas-edge
tags: [API, 元数据, 自建]
url: https://meta.sgyyyds.qzz.io
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-30
generated: true
---

# Atlas Meta

> 链接元数据 / OpenGraph 解析 API：抓取公开网页标题、描述、预览图和站点信息，并提供失败降级。

## 一句话总结

链接元数据 / OpenGraph 解析 API：抓取公开网页标题、描述、预览图和站点信息，并提供失败降级。

## 核心功能 / 特点

- /json?url= 接收目标页面地址，返回标题、描述、预览图和 favicon 等字段
- 抓取设置 10 秒超时、400 KiB HTML 读取上限和有限重定向
- 支持 24 小时新鲜缓存与最长 7 天的陈旧结果回退，错误响应带稳定 code

## 适用场景

- 分享链接时希望自动生成标题、摘要和缩略图卡片
- 自建应用需要读取公开网页元数据，并能处理目标站超时或拒绝抓取

## 快速上手

- 在首页「页面 URL」输入一个可公开访问的网页地址，或者直接调用 /json?url=。
- 将目标 URL 作为 url 查询参数并进行 URL 编码；成功时读取 status、content_type、title、description、image、site_name 和 favicon。
- 目标站超时或抓取失败时，接口会返回稳定错误 code；如果存在 7 天内的历史成功缓存，会返回 stale=true 的缓存结果。

## API 调用示例

### 提取公开网页元数据

```bash
curl -sS 'https://meta.sgyyyds.qzz.io/json?url=https%3A%2F%2Fexample.org'
```

成功响应包含 url、status、content_type、bytes、title、description、image、site_name 和 favicon；具体字段取决于目标网页。


## 使用边界与安全提醒

- 只提交你有权抓取且可公开访问的 URL；服务会拒绝常见私网主机名、IP 字面量、非标准端口和不安全重定向，但这些检查不构成对 DNS rebinding 等所有 SSRF 变体的完整防护，不要把它当成任意 URL 代理。
- 这是服务端抓取目标网页的功能；不要传入云服务凭据端点、含访问令牌/签名参数/会话标识的 URL，查询字符串也可能进入浏览器历史或访问日志。
- 上游站点可能拒绝抓取或超时；调用方仍应处理 error/code 并准备降级展示，stale=true 表示返回了缓存而非本次新抓取结果。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享：粘贴即生成链接，附 /raw 纯文本端点（上限 60 KB）；新建分享保留 7 天。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
