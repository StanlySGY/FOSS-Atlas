---
title: Atlas Check
slug: check
category: atlas
sub_category: atlas-edge
tags: [API, 邮箱校验, 自建]
url: https://check.sgyyyds.qzz.io
alternatives: [Disify]
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-30
generated: true
---

# Atlas Check

> 邮箱与域名校验 API：检查邮箱格式、一次性邮箱域名黑名单和 MX 记录。

## 一句话总结

邮箱与域名校验 API：检查邮箱格式、一次性邮箱域名黑名单和 MX 记录。

## 核心功能 / 特点

- /api/email 校验邮箱地址，并返回域名、格式、一次性邮箱和 MX 字段
- /api/domain 直接查询域名的黑名单状态与 MX 记录
- 响应包含 blocklist_size，便于了解当前本地黑名单规模

## 适用场景

- 注册流程需要初步拦截格式错误或常见一次性邮箱域名
- 发信前先检查域名是否配置了 MX 记录

## 快速上手

- 要检查完整邮箱时，请求 /api/email?email= 并对邮箱地址进行 URL 编码。
- 只检查域名时，请求 /api/domain?domain=；例如 gmail.com 可用于查看 MX 记录结构。
- 读取 format_valid、disposable、has_mx、mx 和 blocklist_size 等字段，按业务策略自行决定是否继续注册或发信。

## API 调用示例

### 检查邮箱地址

```bash
curl -sS 'https://check.sgyyyds.qzz.io/api/email?email=test%40gmail.com'
```

响应示例：

```json
{
  "email": "test@gmail.com",
  "domain": "gmail.com",
  "format_valid": true,
  "disposable": false,
  "has_mx": true,
  "mx": [
    "5 gmail-smtp-in.l.google.com."
  ],
  "blocklist_size": 9963
}
```

MX 列表会有多条记录；blocklist_size 是本轮核验的快照值。

### 检查域名 MX 与黑名单状态

```bash
curl -sS 'https://check.sgyyyds.qzz.io/api/domain?domain=gmail.com'
```

响应示例：

```json
{
  "domain": "gmail.com",
  "disposable": false,
  "has_mx": true,
  "format_valid": true,
  "mx": [
    "5 gmail-smtp-in.l.google.com."
  ],
  "blocklist_size": 9963
}
```


## 使用边界与安全提醒

- MX 记录存在不代表具体邮箱地址一定存在，也不代表邮件最终一定送达；该接口不是 SMTP 投递测试。
- 一次性邮箱黑名单存在覆盖和更新滞后，disposable=false 不等于地址可信；不要仅凭此结果作为唯一反欺诈或账户安全依据。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
