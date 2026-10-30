---
title: Atlas Proxy
slug: px
category: atlas
sub_category: atlas-edge
tags: [API, 代理, 自建]
url: https://px.sgyyyds.qzz.io
alternatives: [ProxyScrape]
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-30
generated: true
---

# Atlas Proxy

> 公开代理聚合 API：聚合 HTTP、SOCKS4 和 SOCKS5 代理列表，提供明文与结构化输出。

## 一句话总结

公开代理聚合 API：聚合 HTTP、SOCKS4 和 SOCKS5 代理列表，提供明文与结构化输出。

## 核心功能 / 特点

- /http、/socks4、/socks5 分别输出对应协议的明文列表
- /json 返回结构化代理数据，包含国家与 ASN 等字段
- /api/sources 返回上游抓取状态和各来源数量

## 适用场景

- 进行隔离的网络连通性实验，需要按协议读取公开代理样本
- 研究公开代理来源与数据结构，而不是逐个上游站点抓取

## 快速上手

- 打开 Atlas Proxy 首页，先查看 HTTP、SOCKS4、SOCKS5 当前数量和页面顶部的安全提示。
- 按需要读取 /http、/socks4 或 /socks5 明文列表；需要国家和 ASN 字段时再请求 /json。
- 监控数据来源时使用 /api/sources；本次实测 JSON 汇总接口响应约 913 KB，避免在高频轮询中无必要地重复下载完整列表。

## API 调用示例

### 查看代理上游来源

```bash
curl -sS 'https://px.sgyyyds.qzz.io/api/sources'
```

响应示例：

```json
{
  "total": 9533,
  "cached": true,
  "sources": [
    {
      "name": "TheSpeedX/PROXY-List · http",
      "ok": true,
      "count": 2757
    },
    {
      "name": "monosans/proxy-list · http",
      "ok": true,
      "count": 721
    },
    {
      "name": "monosans/proxy-list · json(带国家/ASN)",
      "ok": true,
      "count": 1752
    }
  ]
}
```

这是 2026-10-30 的来源快照；各类型数量随上游更新和缓存刷新而变化。


## 使用边界与安全提醒

- 首页明确将数据限定为研究和连通性测试用途；代理来自公开抓取，不保证可用性或安全性，严禁承载密码、Cookie、支付信息和其他敏感流量。
- 公开代理可能记录、篡改或中转请求；不要把代理列表的存在理解为可信代理服务或隐私保护承诺。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
