---
title: Nextcloud
slug: nextcloud
category: selfhost
sub_category: selfhost-core
tags: [网盘, 协作, 开源, PHP]
url: https://nextcloud.com
repo: https://github.com/nextcloud/server
license: AGPL-3.0
alternatives: [Google Drive, Dropbox, OneDrive]
related: [seafile, immich, filebrowser, collabora, nginx-proxy-manager, 1panel]
updated: 2026-10-19
---

# Nextcloud

**Nextcloud** 是自托管领域的“瑞士军刀”：网盘只是入口，往下还有日历、联系人、在线文档、视频会议、任务看板、密码库……装完一套，基本可以把 Google Workspace 整套替掉。

## 能替代什么

| 原本用的 | Nextcloud 对应模块 |
| --- | --- |
| Google Drive | Files（文件同步） |
| Google Docs | Nextcloud Office（Collabora / OnlyOffice） |
| Google Calendar | Calendar（CalDAV） |
| Google Contacts | Contacts（CardDAV） |
| Google Meet | Talk（WebRTC 视频会议） |
| Trello | Deck（看板） |
| Dropbox | 桌面 / 移动端同步客户端 |

## 部署建议

- **官方 AIO（All-in-One）**：Docker 一条命令起全套，适合新手，但资源占用偏高。
- **手动 compose**：`nextcloud` + `mariadb` + `redis` + 独立 `collabora`，可控性最好。
- **务必配 Redis**：文件锁和缓存都靠它，不配 Redis 会频繁出现“文件已被锁定”。

```yaml
services:
  app:
    image: nextcloud:apache
    environment:
      MYSQL_HOST: db
      REDIS_HOST: redis
      TRUSTED_PROXIES: 172.16.0.0/12
    volumes:
      - ./html:/var/www/html
      - ./data:/var/www/html/data
```

## 性能与运维

- **PHP + 数据库是瓶颈**，不是磁盘。开 OPcache、配 Redis、用 MariaDB 而不是 SQLite。
- **`occ` 命令行**是运维主力：`occ maintenance:mode --on`、`occ files:scan --all`、`occ upgrade`。
- **大文件上传**：调 `php.ini` 的 `upload_max_filesize`、`post_max_size`，以及反代的 `client_max_body_size`。
- **别用 NFS 存 `data/`**：文件锁在 NFS 上不可靠，官方明确不推荐。

## 常见坑

- **升级不可逆**：Nextcloud 大版本升级不能回退，**升级前必须整库 + 整目录备份**。
- **`TRUSTED_PROXIES` 没配**：反代后面会报“Access through untrusted domain”。
- **Cron 用 AJAX 模式**：默认后台任务走 AJAX，性能差，改成系统 cron 跑 `cron.php`。
- **和 [[Immich]] 的分工**：照片体验交给 Immich，Nextcloud 负责文档和协作，两者共存很常见。

## 相关工具

- [[Seafile]] —— 更纯粹、更快的文件同步方案
- [[Immich]] —— 专业相册，补足 Nextcloud 的照片体验
- [[Filebrowser]] —— 轻量文件浏览
- [[Nginx Proxy Manager]] —— 反代 + 证书一条龙
