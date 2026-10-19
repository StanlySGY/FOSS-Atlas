---
title: Cloudflare Origin CA
slug: cloudflare-origin-ca
category: saas
sub_category: saas-ssl
tags: [SSL, 证书, Cloudflare]
url: https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/
related: [lets-encrypt, zerossl, buypass-go, google-cloud]
updated: 2026-10-19
generated: true
---

# Cloudflare Origin CA

> Cloudflare 的源站证书，专门用来加密 Cloudflare 与源服务器之间的那段连接。

## 一句话总结

Cloudflare 的源站证书，专门用来加密 Cloudflare 与源服务器之间的那段连接。

## 核心功能 / 特点

- 免费签发，有效期最长可达 15 年
- 仅在经过 Cloudflare 代理时生效
- 可生成通配符或单域名证书

## 适用场景

- 为接入 Cloudflare 的源站配 HTTPS
- 免去源站证书频繁续期的麻烦

## 同类推荐

- [[Let's Encrypt]] —— 无限免费证书，90 天有效期，自动续期
- [[ZeroSSL]] —— 3 个 90 天免费证书
- [[Buypass Go SSL]] —— 180 天免费 ACME 证书
- [[Google Cloud]] —— 1 台 e2-micro VM（美区）、5GB 存储、1GB 出网/月
