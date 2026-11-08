---
title: Hysteria2
slug: hysteria2
category: selfhost
sub_category: selfhost-proxy
tags: [代理, QUIC, 开源]
url: https://github.com/HyNetworks/hysteria
related: [xray-reality, tuic, trojan-go, snell]
updated: 2026-11-08
generated: true
---

# Hysteria2

> 基于 QUIC 的代理协议，在网络质量较差、丢包严重时仍能保持较高速度。

## 核心功能 / 特点

- 基于 QUIC 传输，弱网与丢包环境下速度好
- 可伪装成 HTTP/3 流量，隐蔽性较好
- 自带拥塞控制，尽量跑满可用带宽

## 适用场景

- 线路质量差、丢包严重时追求传输速度
- 自建节点希望协议较新且不易被识别

## 同类推荐

- [[Xray + Reality]] —— 当前主流方案，Reality 伪装 SNI
- [[TUIC]] —— 基于 QUIC 的轻量代理协议
- [[Trojan-Go]] —— TLS 伪装的 Trojan 实现
- [[Snell]] —— Surge 自研的加密代理协议
