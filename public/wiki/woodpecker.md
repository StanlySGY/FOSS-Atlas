---
title: Woodpecker CI
slug: woodpecker
category: selfhost
sub_category: selfhost-core
tags: [CI/CD, 开源]
url: https://woodpecker-ci.org
alternatives: [GitLab CI]
related: [drone, gitea, forgejo, nginx-proxy-manager]
updated: 2026-11-08
generated: true
---

# Woodpecker CI

> 轻量级 CI/CD 工具，用容器流水线自动构建与部署。

## 核心功能 / 特点

- 用 YAML 定义流水线，在容器中执行各步骤
- 可与 Gitea、Forgejo、GitHub 等代码库集成
- 支持插件扩展与多条流水线并行运行

## 适用场景

- 给自建 Git 服务上的项目接入自动构建
- 代码提交后自动跑测试并部署到服务器

## 同类推荐

- [[Drone CI]] —— 容器原生 CI/CD，替代 GitLab CI
- [[Gitea]] —— 轻量自建 Git 服务，替代 GitHub
- [[Forgejo]] —— 社区驱动的 Gitea 分支，替代 GitHub
- [[Nginx Proxy Manager]] —— 可视化反向代理与证书管理
