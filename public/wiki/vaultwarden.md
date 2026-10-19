---
title: Vaultwarden
slug: vaultwarden
category: selfhost
sub_category: selfhost-core
tags: [密码管理, Bitwarden, 开源, Rust]
url: https://github.com/dani-garcia/vaultwarden
repo: https://github.com/dani-garcia/vaultwarden
license: AGPL-3.0
alternatives: [Bitwarden, 1Password, KeePassXC]
related: [passbolt, nginx-proxy-manager, cloudflare-tunnel, 1panel, caddy]
updated: 2026-10-19
---

# Vaultwarden

**Vaultwarden**（原名 bitwarden_rs）是 Bitwarden 服务端的轻量 Rust 重写版。官方服务端要跑一堆 .NET 微服务 + SQL Server，Vaultwarden 只要**一个二进制 + SQLite**，256 MB 内存的机器就能跑得很舒服。

## 为什么几乎人手一个

- **兼容官方客户端**：浏览器扩展、iOS、Android、桌面端、CLI 全部直接连，不用改客户端。
- **资源占用极低**：树莓派 / 1 核 512 MB 小机器足够。
- **功能不缺**：TOTP、附件、组织共享、Send、紧急访问、WebAuthn 都支持。

## Docker 部署

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    restart: unless-stopped
    environment:
      DOMAIN: "https://vault.example.com"
      SIGNUPS_ALLOWED: "false"   # 注册完自己账号后务必关掉
      ADMIN_TOKEN: "请换成随机长字符串"
    volumes:
      - ./vw-data:/data
    ports:
      - "127.0.0.1:8080:80"
```

## 上线前必须做的几件事

1. **关掉开放注册**：`SIGNUPS_ALLOWED=false`，否则你的实例会变成公开密码库。
2. **必须上 HTTPS**：客户端对非 HTTPS 的 self-host 支持很差，用 [[Nginx Proxy Manager]] 或 Caddy 配证书。
3. **备份 `/data` 目录**：`db.sqlite3`、`rsa_key*`、`attachments/` 一个都不能少。丢了 RSA key，所有已登录设备都会失效。
4. **别裸奔公网**：至少加 fail2ban，或者干脆走 [[Cloudflare Tunnel]] 不开放端口。

## 常见坑

- **注册后忘记关注册**：最经典的事故。
- **`ADMIN_TOKEN` 用明文**：可以用 Argon2 哈希形式 `$argon2id$...`。
- **反代没传 `X-Real-IP`**：会导致限流和日志里全是反代 IP。
- **大附件**：默认存本地磁盘，量大建议挂 S3 兼容存储。

## 相关工具

- [[Passbolt]] —— 更偏团队协作的密码管理方案
- [[Nginx Proxy Manager]] —— 可视化反代 + 自动证书
- [[1Panel]] —— 一键部署 Vaultwarden 的运维面板
