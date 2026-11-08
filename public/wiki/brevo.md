---
title: Brevo
slug: brevo
category: saas
sub_category: saas-email
tags: [事务邮件, 邮件发送 API, SMTP, 邮件服务]
url: https://www.brevo.com
related: [resend, google-cloud, aws, azure]
updated: 2026-11-05
verifiedAt: 2026-11-05
sources:
  - {"title":"Brevo Pricing Plans","url":"https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans","type":"official","scope":"Free 方案每日 300 封与最多 100,000 个联系人；未用发送额度不结转"}
  - {"title":"Brevo Send a Transactional Email","url":"https://developers.brevo.com/docs/send-a-transactional-email","type":"official","scope":"事务邮件 API、POST /v3/smtp/email、HTML/文本/模板与 Webhook 事件"}
  - {"title":"Brevo Senders and Domains","url":"https://developers.brevo.com/docs/getting-started-with-senders-and-domains","type":"official","scope":"发件人验证和域名认证前置要求"}
generated: true
---

# Brevo

> 云端邮件与客户沟通平台，提供独立的事务邮件 API，可通过接口或 SDK 发送由应用事件触发的邮件。

## 核心功能 / 特点

- 通过 POST /v3/smtp/email 发送 HTML、纯文本或模板事务邮件
- 提供发送结果 messageId 和事务邮件事件 Webhook
- 除事务邮件外还包含营销邮件、联系人管理等产品能力

## 适用场景

- 为网站发送注册确认、订单通知、账单提醒等非营销邮件
- 希望在一个服务中管理应用邮件，并按需使用其联系人和营销工具

## 快速上手

- 创建 Brevo 账户和 API Key，登记发件人并验证发信域名。
- 调用 POST /v3/smtp/email，传入 sender、to、subject 与 htmlContent、textContent 或 templateId。
- 根据返回的 messageId 和 Webhook 事件记录投递状态，并监测退信、投诉和错误。

## 使用边界与安全提醒

- Free 方案每天最多发送 300 封，未使用的当日额度不会结转；最多 100,000 个联系人不代表每天能发送 100,000 封。
- 发件人必须登记并验证，域名还需完成认证；调用 API 前先核对账户额度、发信身份和收件人限制。
- Brevo 同时包含营销邮件能力，本目录将其放在事务邮件 API 分类只表示开发者接口用途，不代表营销群发规则与事务邮件相同。

## 同类推荐

- [[Resend]] —— 面向开发者的事务邮件 API，Free 每月 3,000 封且每天最多 100 封
- [[Google Cloud]] —— 1 台 e2-micro VM（美区）、5GB 存储、1GB 出网/月
- [[AWS]] —— 750 小时 t2.micro/月（12 个月）+ Lambda 100 万次/月永久免费
- [[Microsoft Azure]] —— 55+ 永久免费服务，含 App Service F1
