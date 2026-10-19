---
title: Immich
slug: immich
category: selfhost
sub_category: selfhost-core
tags: [相册, 备份, 开源, 自部署]
url: https://github.com/immich-app/immich
repo: https://github.com/immich-app/immich
license: AGPL-3.0
alternatives: [Google Photos, Apple Photos, PhotoPrism]
related: [nextcloud, seafile, filebrowser, jellyfin, nginx-proxy-manager]
updated: 2026-10-19
---

# Immich

**Immich** 是目前最接近“自建 Google Photos”体验的开源项目：手机自动备份、时间线、人脸识别、地图、相册共享、Live Photo、RAW 支持，一样不缺。

## 核心能力

- **手机端自动备份**：iOS / Android 官方 App，前后台备份策略可调。
- **ML 能力**：人脸聚类、物体识别、CLIP 语义搜索（“找穿红衣服的照片”）。
- **多用户**：每个账号独立相册，支持共享相册和共享库。
- **原始画质**：不做压缩，保留 EXIF 和 Live Photo 动图。

## 部署要点

```yaml
# 官方 compose 精简示意
services:
  immich-server:
    image: ghcr.io/immich-app/immich-server:release
    volumes:
      - ./library:/usr/src/app/upload
    env_file: [.env]
  immich-machine-learning:
    image: ghcr.io/immich-app/immich-machine-learning:release
  redis:
    image: redis:7-alpine
  database:
    image: pgvecto-rs/pgvecto-rs:pg16-v0.3.0
```

## 硬件与容量

- **ML 容器**：有 GPU 会快非常多，纯 CPU 也能跑，只是首次索引慢。
- **存储**：照片是只增不减的，规划容量时按 **每年手机拍照量 × 3 倍** 留余量。
- **备份策略**：Immich 自带 `immich-go` / CLI 导出，但**真正的备份应该是对 `library/` 目录做快照**，别只依赖数据库。

## 常见坑

- **版本升级很激进**：release 间偶有破坏性变更，升级前**一定读 release notes 并先备份数据库**。
- **反向代理要放开大文件**：Nginx 默认 `client_max_body_size 1m` 会导致上传失败。
- **别把 `library` 放在网络存储上直接跑**：SQLite/Postgres 与 NFS 组合容易出问题，数据库本地盘更稳。
- **和 [[Nextcloud]] 的关系**：两者都能存照片，但 Immich 专注照片体验，Nextcloud 是全能网盘。常见做法是 Immich 管相册、Nextcloud 管文档。

## 相关工具

- [[Nextcloud]] —— 全能网盘，可与之互补
- [[Filebrowser]] —— 轻量文件浏览，适合临时查看
- [[Seafile]] —— 更偏文件同步
