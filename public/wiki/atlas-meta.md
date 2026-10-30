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

> 链接元数据 / OpenGraph 解析 API：尝试抓取公开网页标题、描述、预览图和站点信息。

## 一句话总结

链接元数据 / OpenGraph 解析 API：尝试抓取公开网页标题、描述、预览图和站点信息。

## 核心功能 / 特点

- /json?url= 接收目标页面地址，返回标题、描述、预览图和 favicon 等字段
- 由服务端抓取目标 HTML 并解析元数据，客户端不必自行处理网页源码
- 成功响应提供目标状态码、内容类型、字节数和缓存标记；抓取失败会返回 error

## 适用场景

- 分享链接时希望自动生成标题、摘要和缩略图卡片
- 自建应用需要尝试读取公开网页元数据，并能处理上游抓取失败

## 快速上手

- 在首页「页面 URL」输入一个可公开访问的网页地址，或者直接调用 /json?url=。
- 将目标 URL 作为 url 查询参数并进行 URL 编码；请先用普通公开网页做小规模测试。
- 成功时读取 status、content_type、title、description、image、site_name 和 favicon；失败时检查 error 字段并准备回退内容。

## API 调用示例

### 请求公开网页元数据（当前错误响应示例）

```bash
curl -sS 'https://meta.sgyyyds.qzz.io/json?url=https%3A%2F%2Fexample.org'
```

响应示例：

```json
{
  "error": "抓取失败"
}
```

本轮早期请求曾成功返回 Example Domain 的标题和 status=200，随后对相同公开目标重复探测又返回此错误；此示例记录当前复测到的失败响应，不代表唯一可能的结果。


## 使用边界与安全提醒

- 本轮服务表现为间歇性抓取失败：公开页面有过成功响应，但重复探测随后返回「抓取失败」；稳定性尚未确认，调用方必须处理 error 并准备降级展示。
- 这是服务端抓取目标网页的功能；只提交你有权抓取且可以公开访问的 URL，不要传入内网管理地址、云服务凭据端点或含访问令牌、签名参数、会话标识的 URL。
- URL 查询字符串可能进入浏览器历史、代理或服务访问日志，不要放入个人隐私或其他秘密。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
