---
title: Atlas Paste
slug: paste
category: atlas
sub_category: atlas-edge
tags: [粘贴分享, 临时分享, 自建]
url: https://paste.sgyyyds.qzz.io
related: [foss-atlas-cf, short, nodes, qr]
updated: 2026-10-30
generated: true
---

# Atlas Paste

> 临时文本分享：粘贴即生成链接，附带纯文本端点，内容上限 60KB；新建分享保留 7 天。

## 一句话总结

临时文本分享：粘贴即生成链接，附带纯文本端点，内容上限 60KB；新建分享保留 7 天。

## 核心功能 / 特点

- POST /api/paste 返回分享链接，/raw/<id> 直接取纯文本
- 无需登录，也不需要先开某个编辑器
- 文本存在自己的 KV，不投递给第三方粘贴站
- 新建分享使用 7 天 KV TTL，到期自动删除

## 适用场景

- 贴一段配置或报错给别人看，几分钟内有效就够
- 需要在两个设备之间传一小段文本，但不想经过外部站点

## 快速上手

- 在页面的文本框中粘贴要分享的内容，当前单条内容上限为 60 KB。
- 点击「生成链接」，复制返回的分享地址并发送给接收者。
- 需要程序读取纯文本时，可使用分享地址对应的 /raw/<id> 端点。
- 创建接口返回 expires_at；以该字段为准确认新分享的过期时间。

## 使用边界与安全提醒

- 持有分享地址的人即可读取内容；不要粘贴密码、访问令牌、私钥、个人身份信息或未脱敏的生产日志。
- 新建分享会在 7 天后自动删除；上线前创建的旧分享未追溯设置 TTL，不能假定它们会自动过期。

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
- [[Atlas QR]] —— 二维码生成 API(/api/qr?data=),SVG 输出,替代 qrserver 等第三方接口。
