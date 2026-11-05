---
title: Resend
slug: resend
category: saas
sub_category: saas-email
tags: [事务邮件, 邮件发送 API, SMTP, 开发者工具]
url: https://resend.com
related: [brevo, google-cloud, aws, azure]
updated: 2026-11-05
verifiedAt: 2026-11-05
sources:
  - {"title":"Resend Pricing","url":"https://resend.com/pricing","type":"official","scope":"Free 方案每月 3,000 封、每天 100 封和 3 个域名的当前额度"}
  - {"title":"Resend Verified Domains","url":"https://resend.com/docs/dashboard/domains/introduction","type":"official","scope":"发送前必须验证自有域名以及子域名隔离发信信誉的建议"}
generated: true
---

# Resend

> 面向开发者的事务邮件服务，提供 REST API、SMTP relay 和 SDK，用于从应用发送验证、通知和业务触发邮件。

## 一句话总结

面向开发者的事务邮件服务，提供 REST API、SMTP relay 和 SDK，用于从应用发送验证、通知和业务触发邮件。

## 核心功能 / 特点

- 通过 REST API 或 SMTP relay 发送应用邮件，并提供官方 SDK
- 支持独立验证发信域名，可用子域名隔离不同业务的发信信誉
- 提供投递事件与域名管理能力，适合接入应用后端

## 适用场景

- 为 SaaS / Web 应用发送注册验证、密码重置和订单通知
- 希望用 API 或 SMTP 快速接入发信，不自行维护 SMTP 投递服务器

## 快速上手

- 创建 Resend 账户并添加自己拥有的发信域名；未验证至少一个域名无法发送邮件。
- 按域名页面提供的 DNS 记录完成验证，再生成 API Key 并放入后端密钥管理。
- 用 API 或 SMTP 发送测试邮件，先验证退信、送达和事件回调处理。

## 使用边界与安全提醒

- Free 方案每月 3,000 封、每天最多 100 封，另有 3 个自定义域名限制；月额度和日上限必须同时满足。
- 发送邮件需要使用自有且通过验证的域名；不要把 Resend 当作收件箱或完整邮箱托管服务。
- 事务邮件和营销邮件的发信域名宜分开管理，避免营销退信影响账号验证和密码重置等关键邮件。

## 同类推荐

- [[Brevo]] —— 提供事务邮件 API 的云端邮件平台，Free 每天最多发送 300 封
- [[Google Cloud]] —— 1 台 e2-micro VM（美区）、5GB 存储、1GB 出网/月
- [[AWS]] —— 750 小时 t2.micro/月（12 个月）+ Lambda 100 万次/月永久免费
- [[Microsoft Azure]] —— 55+ 永久免费服务，含 App Service F1
