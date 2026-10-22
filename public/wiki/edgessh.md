---
title: EdgeSSH
slug: edgessh
category: atlas
sub_category: atlas-edge
tags: [SSH, 终端, 自建]
url: https://ssh.sgyyyds.qzz.io
related: [foss-atlas-cf, short, paste, nodes]
updated: 2026-10-19
generated: true
---

# EdgeSSH

> 浏览器里的 SSH 客户端：Workers 加 Durable Objects 维持会话，D1 存审计记录，由 Cloudflare Access 邮箱验证码保护。

## 一句话总结

浏览器里的 SSH 客户端：Workers 加 Durable Objects 维持会话，D1 存审计记录，由 Cloudflare Access 邮箱验证码保护。

## 核心功能 / 特点

- 无需本机装终端或跳板机，浏览器打开即可连服务器
- 会话由 Durable Objects 承载，连接状态在边缘侧保持
- 访问由 Cloudflare Access 的邮箱验证码把关，不依赖密码

## 适用场景

- 在别人电脑或手机上要临时连一台服务器应急
- 需要一个能审计、能撤销的入口，而不是长期有效的密钥或密码

## 同类推荐

- [[FOSS-Atlas(Cloudflare Pages)]] —— 本目录站的 Cloudflare Pages 镜像,与 GitHub Pages 自动同步。
- [[Atlas Short]] —— 自建短链服务:Workers + KV 去重存储,带点击统计与 /api/list 列表。
- [[Atlas Paste]] —— 临时文本分享:粘贴即生成链接,附 /raw 纯文本端点(上限 60KB)。
- [[Atlas Nodes]] —— 免费节点聚合订阅:11 个上游源合并去重 13,000+ 节点,输出 Base64/明文订阅,30 分钟自动刷新。
