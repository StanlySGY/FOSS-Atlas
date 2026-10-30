---
title: Atlas Tools
slug: atlas-tools
category: atlas
sub_category: atlas-edge
tags: [API, 编码解码, 自建]
url: https://tools.sgyyyds.qzz.io
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-30
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

## 快速上手

- 手动计算时，在首页「哈希」文本框输入内容并点击「计算 SHA-256」；页面说明这条交互在浏览器侧处理。
- 脚本调用可使用只读 GET 接口：/api/hash?data=hello、/api/uuid?count=3，以及 /api/encode?mode=base64&data=hello。
- 编解码接口还可使用 mode=url；示例输入 hello world 会返回 hello%20world。

## API 调用示例

### 计算 SHA-256 哈希

```bash
curl -sS 'https://tools.sgyyyds.qzz.io/api/hash?data=hello'
```

响应示例：

```json
{
  "alg": "sha-256",
  "input_bytes": 5,
  "hex": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  "base64": "LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ="
}
```

此示例省略 alg 参数，当前实测默认算法为 sha-256。

### 生成 3 个 UUID v4

```bash
curl -sS 'https://tools.sgyyyds.qzz.io/api/uuid?count=3'
```

响应示例：

```json
{
  "uuids": [
    "<uuid-v4>",
    "<uuid-v4>",
    "<uuid-v4>"
  ]
}
```

UUID 是每次请求动态生成的，响应中的占位值仅用于说明 JSON 结构。

### Base64 编码

```bash
curl -sS 'https://tools.sgyyyds.qzz.io/api/encode?mode=base64&data=hello'
```

响应示例：

```json
{
  "mode": "base64",
  "input": "hello",
  "output": "aGVsbG8="
}
```

### URL 编码

```bash
curl -sS 'https://tools.sgyyyds.qzz.io/api/encode?mode=url&data=hello%20world'
```

响应示例：

```json
{
  "mode": "url",
  "input": "hello world",
  "output": "hello%20world"
}
```


## 使用边界与安全提醒

- 页面手动哈希交互在浏览器侧执行；调用 /api/* 时，参数会发送到自己的 tools.sgyyyds.qzz.io 服务。
- 这些接口通过 GET 查询参数传入文本，参数可能留在浏览器历史、代理或服务访问日志中，不要传入密码、令牌或其他敏感内容。
- 普通 SHA-256 摘要不等于密码存储方案；不要直接用它替代带盐、专门设计的密码哈希算法。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
