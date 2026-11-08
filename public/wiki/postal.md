---
title: Postal
slug: postal
category: selfhost
sub_category: selfhost-mail
tags: [邮件投递, SMTP, 事务邮件, 邮件 API, 自建, MIT]
url: https://github.com/postalserver/postal
related: [nextcloud, seafile, joplin, trilium]
updated: 2026-11-05
verifiedAt: 2026-11-05
sources:
  - {"title":"Postal 官方仓库与 MIT 许可证","url":"https://github.com/postalserver/postal","type":"official","scope":"开源邮件投递平台定位与 MIT 许可证"}
  - {"title":"Postal Installation","url":"https://docs.postalserver.io/getting-started/installation/","type":"official","scope":"Docker 部署前置步骤、初始化、运行和 SMTP/API 凭据"}
  - {"title":"Postal Sending Domains","url":"https://docs.postalserver.io/features/sending-domains/","type":"official","scope":"发信域名验证、SPF、DKIM、MX 与 Return-Path 的用途和检查方式"}
  - {"title":"Postal Getting Started","url":"https://docs.postalserver.io/getting-started/","type":"official","scope":"自建方负责 DNS、维护和升级的运维责任说明"}
generated: true
---

# Postal

> 自托管邮件投递平台，为网站和应用管理邮件服务器、SMTP/API 凭据以及出站邮件投递。

## 核心功能 / 特点

- 为不同应用或业务建立独立 mail server 与 SMTP / API 凭据
- 支持发信域名验证、SPF / DKIM 检查、退信路径及投递状态管理
- 提供 Docker 安装流程、Web 管理界面和 API

## 适用场景

- 希望自管应用通知、注册验证、订单通知等事务邮件投递链路
- 有域名 DNS 和服务器运维能力，希望减少对第三方邮件投递平台的依赖

## 快速上手

- 按官方安装指南准备主机、Docker、数据库和 Postal 主机名，再运行 bootstrap 与初始化流程。
- 创建组织和 mail server，添加发信域名，按管理界面生成的记录配置 SPF、DKIM 与 Return-Path。
- 创建 SMTP 或 API 凭据，先向自己的测试邮箱发送测试邮件并检查退信与投递状态。

## 使用边界与安全提醒

- Postal 不是开箱即用的 Gmail / Exchange 替代品；它主要解决应用邮件投递，完整邮箱收发和 IMAP/群组协作应另行选型。
- 自托管方需要负责 DNS、服务器维护和升级；邮件域名必须验证，SPF 与 DKIM 是可靠投递的基础，MX 仅在需要由 Postal 接收邮件时配置。
- 公网发信还要关注出口 IP 信誉、反向 DNS、运营商端口策略、退信处理和滥用防护；不能把服务启动等同于邮件可达。

## 同类推荐

- [[Nextcloud]] —— 自建网盘与协作套件，替代 Google Drive
- [[Seafile]] —— 高性能自建网盘，替代 Google Drive
- [[Joplin]] —— 端到端加密笔记，替代 Notion / Evernote
- [[Trilium]] —— 层级化知识库笔记，替代 Notion
