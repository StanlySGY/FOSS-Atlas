---
title: Trojan-Go
slug: trojan-go
category: selfhost
sub_category: selfhost-proxy
tags: [代理, TLS, 开源]
url: https://github.com/p4gefau1t/trojan-go
related: [xray-reality, sing-box, mihomo, hysteria2]
updated: 2026-11-06
verifiedAt: 2026-11-06
sources:
  - {"title":"Trojan-Go GitHub 仓库","url":"https://github.com/p4gefau1t/trojan-go","type":"official","scope":"核验仓库仍可访问、未标记 archived；仓库元数据显示最近推送于 2024-07-14，不能据此推断仍有安全维护"}
generated: true
---

# Trojan-Go

> TLS 伪装的 Trojan 代理实现。仓库未归档，但最近一次仓库推送距今已超过两年，缺少持续维护信号；仅供理解与维护既有部署，不建议新生产环境优先采用。

## 一句话总结

TLS 伪装的 Trojan 代理实现。仓库未归档，但最近一次仓库推送距今已超过两年，缺少持续维护信号；仅供理解与维护既有部署，不建议新生产环境优先采用。

## 核心功能 / 特点

- 以 TLS 承载流量，外形与普通 HTTPS 相似
- 支持 WebSocket 与多路复用，便于套 CDN
- 项目未被 GitHub 标记归档，但维护活跃度偏低

## 适用场景

- 理解既有 Trojan-Go 部署与兼容性
- 新部署前应优先比较仍在持续维护的替代内核

## 同类推荐

- [[Xray + Reality]] —— 当前主流方案，Reality 伪装 SNI
- [[sing-box]] —— 一体化通用代理内核，多协议支持
- [[mihomo / Clash Meta]] —— Clash Meta 内核，客户端与服务端通用
- [[Hysteria2]] —— 基于 QUIC 的高速代理协议
