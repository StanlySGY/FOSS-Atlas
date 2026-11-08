---
title: Cloudflare Tunnel
slug: cloudflare-tunnel
category: gear
sub_category: gear-tools
tags: [内网穿透, Cloudflare, 免费]
url: https://developers.cloudflare.com/cloudflare-one/
related: [nginx-proxy-manager, cloudflare, subconverter, localsend]
updated: 2026-11-08
generated: true
---

# Cloudflare Tunnel

> 把本地服务通过 Cloudflare 网络发布到公网，无需公网 IP 也不用开放端口。

## 核心功能 / 特点

- 本地运行 cloudflared 建立出站隧道
- 绑定自有域名并自动配置 HTTPS
- 可结合 Zero Trust 做访问控制

## 适用场景

- 家用宽带下想对公网提供 Web 服务
- 临时把本地开发环境分享给他人调试

## 同类推荐

- [[Nginx Proxy Manager]] —— 可视化反向代理与证书管理
- [[Cloudflare]] —— Workers 10 万次/天、Pages、R2 10GB、免费 DNS
- [[subconverter]] —— 订阅格式互转，输出 Clash、Surge 等主流客户端格式，可自建转换后端
- [[LocalSend]] —— 跨平台局域网文件互传，替代 AirDrop
