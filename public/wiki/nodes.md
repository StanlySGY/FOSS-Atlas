---
title: Atlas Nodes
slug: nodes
category: atlas
sub_category: atlas-edge
tags: [代理订阅, 聚合, 自建]
url: https://nodes.sgyyyds.qzz.io
related: [foss-atlas-cf, short, paste, qr]
updated: 2026-10-30
generated: true
---

# Atlas Nodes

> 免费节点聚合订阅：合并多个公开上游并去重，提供 Base64 订阅、明文列表和来源状态。

## 一句话总结

免费节点聚合订阅：合并多个公开上游并去重，提供 Base64 订阅、明文列表和来源状态。

## 核心功能 / 特点

- /sub 输出客户端可用的 Base64 订阅，/txt 输出明文节点列表
- /api/sources 返回上游来源、抓取状态和各源节点数量
- 缓存按周期自动刷新，聚合结果会随上游可用性变化

## 适用场景

- 客户端需要一份集中管理的节点订阅，避免手动逐个导入多个来源
- 想先查看各上游来源状态，再决定是否使用聚合结果

## 快速上手

- 打开 Atlas Nodes 首页，查看当前去重节点数、缓存更新时间和各上游来源状态。
- 将 /sub 地址作为 Base64 订阅导入兼容客户端；需要可读文本时使用 /txt。
- 脚本或监控可调用 /api/sources，读取 total、cached 和 sources 中每个来源的 ok、count。

## API 调用示例

### 查看聚合与上游来源状态

```bash
curl -sS 'https://nodes.sgyyyds.qzz.io/api/sources'
```

响应示例：

```json
{
  "total": 9058,
  "cached": true,
  "sources": [
    {
      "name": "mahdibland/V2RayAggregator",
      "ok": true,
      "count": 200
    },
    {
      "name": "peasoft/NoMoreWalls",
      "ok": true,
      "count": 436
    },
    {
      "name": "Epodonios/v2ray-configs · vless",
      "ok": false,
      "count": 0
    }
  ]
}
```

数量与 ok 状态为 2026-10-30 的线上快照；上游可用性、节点数量和缓存状态会持续变化。


## 使用边界与安全提醒

- 这些是公开抓取的免费节点，来源和质量不一，不保证可用性、匿名性或安全性；不要用于银行、工作账号、生产系统或其他敏感流量。
- 使用前应自行核验节点来源与出口行为；不要把私人订阅地址、账号凭据或其他秘密混入公开订阅。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享：粘贴即生成链接，附 /raw 纯文本端点（上限 60 KB）；新建分享保留 7 天。
- [[Atlas QR]] —— 二维码生成 API(/api/qr?data=),SVG 输出,替代 qrserver 等第三方接口。
