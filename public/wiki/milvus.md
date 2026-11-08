---
title: Milvus
slug: milvus
category: ai
sub_category: ai-vector
tags: [向量数据库, ANN 检索, RAG, 混合检索, Apache-2.0]
url: https://github.com/milvus-io/milvus
related: [pgvector, qdrant, poe, huggingchat]
updated: 2026-11-05
verifiedAt: 2026-11-05
sources:
  - {"title":"Milvus 官方仓库","url":"https://github.com/milvus-io/milvus","type":"official","scope":"项目定位、LF AI & Data Foundation 治理和 Apache-2.0 许可证"}
  - {"title":"Milvus Overview","url":"https://milvus.io/docs/overview.md","type":"official","scope":"向量与结构化元数据检索、RAG 和语义搜索用途"}
  - {"title":"Milvus Standalone 硬件要求","url":"https://milvus.io/docs/v2.6.x/prerequisite-docker.md","type":"official","scope":"v2.6.x Standalone 与 Cluster 的 CPU、内存最低要求和推荐值"}
  - {"title":"Milvus Releases","url":"https://github.com/milvus-io/milvus/releases","type":"official","scope":"核验稳定版本发布和维护状态"}
generated: true
---

# Milvus

> LF AI & Data Foundation 下的开源云原生向量数据库，面向高规模 ANN 检索、RAG 和混合检索场景。

## 核心功能 / 特点

- 保存 Embedding 与结构化元数据，支持向量相似度和混合搜索
- 可从 Milvus Lite / Standalone 起步，再按规模扩展到分布式集群
- 支持 Docker Compose 和 Kubernetes 部署路径

## 适用场景

- 向量数据量较大，需要专用检索引擎和后续横向扩展能力
- 需要把稠密向量、稀疏向量和关键词检索组合用于 RAG

## 快速上手

- 对照目标 Milvus 版本的安装文档选择 Lite、Standalone 或 Distributed。
- PoC 可从官方 Quick Start 开始；Standalone 按官方硬件要求预留 CPU、内存和 SSD。
- 上线前压测导入、索引构建、过滤和并发查询，并明确数据备份与升级策略。

## 使用边界与安全提醒

- Milvus 不是低配 VPS 上随手启动的轻量单容器工具：官方 v2.6.x 文档对 Standalone 列出 8 GB 内存最低要求、16 GB 推荐，并建议 4 核；集群要求更高。请以实际部署版本的硬件文档为准。
- Milvus 只提供向量数据检索层，Embedding 模型、文档处理、业务权限和 RAG 生成链路仍由应用承担。

## 同类推荐

- [[pgvector]] —— PostgreSQL 向量扩展，在关系型数据旁存储向量并执行相似度检索
- [[Qdrant]] —— 专用向量数据库，支持相似度检索、元数据过滤与混合检索
- [[Poe]] —— 多模型聚合对话站点，提供有限免费额度
- [[HuggingChat]] —— Hugging Face 开源模型免费聊天
