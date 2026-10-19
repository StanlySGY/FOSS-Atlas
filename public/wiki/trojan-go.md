---
title: Trojan-Go
slug: trojan-go
category: selfhost
sub_category: selfhost-proxy
tags: [代理, TLS, 开源]
url: https://github.com/p4gefau1t/trojan-go
related: [xray-reality, sing-box, mihomo, hysteria2]
updated: 2026-10-19
generated: true
---

# Trojan-Go

> TLS 伪装的 Trojan 代理实现，把代理流量伪装成正常的 HTTPS 访问。

## 一句话总结

TLS 伪装的 Trojan 代理实现，把代理流量伪装成正常的 HTTPS 访问。

## 核心功能 / 特点

- 以 TLS 承载流量，外形与普通 HTTPS 相似
- 支持 WebSocket 与多路复用，便于套 CDN
- 兼容 Trojan 协议，可对接常见客户端

## 适用场景

- 想让代理流量伪装成正常网站访问
- 配合 CDN 隐藏节点的真实地址

## 同类推荐

- [[Xray + Reality]] —— 当前主流方案，Reality 伪装 SNI
- [[sing-box]] —— 一体化通用代理内核，多协议支持
- [[mihomo / Clash Meta]] —— Clash Meta 内核，客户端与服务端通用
- [[Hysteria2]] —— 基于 QUIC 的高速代理协议
