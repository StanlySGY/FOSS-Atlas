---
title: Atlas IP
slug: ip
category: atlas
sub_category: atlas-edge
tags: [API, IP 查询, 自建]
url: https://ip.sgyyyds.qzz.io
alternatives: [IPinfo]
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-30
generated: true
---

# Atlas IP

> 客户端 IP 查询 API：返回请求来源 IP、粗略地理位置、ASN 和 Cloudflare 边缘节点信息。

## 一句话总结

客户端 IP 查询 API：返回请求来源 IP、粗略地理位置、ASN 和 Cloudflare 边缘节点信息。

## 核心功能 / 特点

- /json 和 /api/ip 均返回请求来源的结构化信息
- 字段包括国家、城市、区域、经纬度、时区、ASN、运营商组织和 colo
- 适合验证当前请求的出口网络与边缘接入位置

## 适用场景

- 脚本需要读取当前出口 IP 和 ASN，检查代理或路由策略是否生效
- 应用需要展示访客的大致网络归属，而不是精确住址

## 快速上手

- 浏览器打开 Atlas IP 首页，可直接看到当前请求来源的 IP、地理位置、ASN 和边缘 colo。
- 脚本调用 GET /api/ip 或 /json 获取 JSON；返回信息描述的是发起这次请求的客户端网络。
- 需要自动处理时，可按 ip、country、city、timezone、asn、as_organization 和 colo 等字段读取。

## API 调用示例

### 查询当前请求来源信息

```bash
curl -sS 'https://ip.sgyyyds.qzz.io/api/ip'
```

响应示例：

```json
{
  "ip": "<request-ip>",
  "country": "<country-code>",
  "country_name": "<country-name>",
  "city": "<city>",
  "timezone": "<iana-timezone>",
  "asn": 0,
  "as_organization": "<network-organization>",
  "colo": "<cloudflare-colo>"
}
```

尖括号字段和 ASN=0 是文档占位符；真实结果取决于发起请求的网络出口。


## 使用边界与安全提醒

- 城市、区域和经纬度来自 IP 归属信息，只能用于粗略定位，不能推断街道、楼栋或真实住址。
- 接口返回的是调用者本次请求的公网出口信息；通过代理、VPN 或云端执行环境调用时，看到的会是代理或执行环境的出口。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
