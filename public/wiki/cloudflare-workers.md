---
title: Cloudflare Workers
slug: cloudflare-workers
category: saas
sub_category: saas-cloud
tags: [边缘计算, Serverless, CDN, 免费层]
url: https://www.cloudflare.com/plans/free/
repo: https://github.com/cloudflare/workers-sdk
license: 专有（免费层）
alternatives: [Vercel Edge Functions, Deno Deploy, Netlify Edge]
related: [cloudflare, cloudflare-tunnel, cloudflare-dns, cloudflare-imgbed, vercel, netlify]
updated: 2026-10-19
---

# Cloudflare Workers

**Cloudflare Workers** 是跑在 Cloudflare 全球边缘节点上的 Serverless 运行时，基于 V8 isolates 而不是容器，冷启动基本为零。

免费额度（Free 计划）：

- **10 万次请求 / 天**
- 每次请求最多 10 ms CPU 时间
- 100 个 Worker 脚本
- 配套免费：**Pages**（静态托管）、**R2**（10 GB 对象存储）、**KV**、**D1**（SQLite）、**Durable Objects**（有限额度）

## 最小示例

```js
export default {
  async fetch(request) {
    const url = new URL(request.url)
    if (url.pathname === '/api/hello') {
      return Response.json({ ok: true, at: new Date().toISOString() })
    }
    return new Response('FOSS-Atlas', { status: 404 })
  },
}
```

本地开发用 `wrangler dev`，部署用 `wrangler deploy`。

## 典型玩法

- **API 网关 / 反向代理**：把多个后端聚合成一个域名，顺便做鉴权和缓存。
- **图床**：[[CloudFlare-ImgBed]] 就是纯 Workers + R2 实现的免费图床。
- **内网穿透**：配合 [[Cloudflare Tunnel]] 把家里服务器安全暴露出去，不用公网 IP。
- **定时任务**：Cron Triggers 免费额度内可以跑定时 Worker。

## 注意点

- **CPU 时间 ≠ 墙钟时间**：等外部 API 的 IO 时间不计入，但计算密集任务很容易超 10 ms。
- **免费层无 SLA**，别拿来跑关键业务。
- **Workers 不是 Node.js**：没有完整的 `fs`、`child_process`，依赖要选 edge 兼容版本。
- 想跑容器/长任务，看 Cloudflare **Containers**（付费）。

## 相关工具

- [[Cloudflare]] —— 同一账号下的 DNS / CDN 全家桶
- [[Cloudflare Tunnel]] —— 零信任内网穿透
- [[Vercel]] / [[Netlify]] —— 同类前端托管平台，可横向对比
