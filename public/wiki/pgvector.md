---
title: pgvector
slug: pgvector
category: ai
sub_category: ai-vector
tags: [PostgreSQL, 向量检索, 向量数据库, RAG, SQL]
url: https://github.com/pgvector/pgvector
related: [qdrant, milvus, poe, huggingchat]
updated: 2026-11-05
verifiedAt: 2026-11-05
sources:
  - {"title":"pgvector 官方 README","url":"https://github.com/pgvector/pgvector/blob/master/README.md","type":"official","scope":"PostgreSQL 扩展能力、支持的向量类型、索引和 PostgreSQL 版本"}
  - {"title":"pgvector META.json","url":"https://github.com/pgvector/pgvector/blob/master/META.json","type":"official","scope":"扩展版本 0.8.7 与 PostgreSQL 许可证标识"}
  - {"title":"PostgreSQL: pgvector 0.8.7 Released","url":"https://www.postgresql.org/about/news/pgvector-087-released-3392/","type":"official","scope":"0.8.7 修复 IVFFlat 索引构建缓冲区溢出及建议升级"}
generated: true
---

# pgvector

> PostgreSQL 的开源向量扩展，可把 Embedding 和业务数据放在同一数据库中，并用 SQL 做精确或近似近邻检索。

## 核心功能 / 特点

- 支持精确最近邻查询及 HNSW、IVFFlat 近似索引
- 支持多种向量类型与距离度量，可直接使用 SQL、JOIN 和事务
- 以 PostgreSQL 扩展形式安装，不需要额外维护一套独立向量数据库

## 适用场景

- 业务已经使用 PostgreSQL，只需要为现有数据增加向量相似度检索
- 中小规模 RAG 项目希望减少独立服务和数据同步链路

## 快速上手

- 确认 PostgreSQL 版本与扩展安装方式；官方 README 当前示例支持 PostgreSQL 13+。
- 安装 pgvector 后启用 CREATE EXTENSION vector，再按查询需求选择 HNSW 或 IVFFlat。
- 为 IVFFlat 和 HNSW 分别评估召回率、索引构建耗时、内存和查询计划。

## 使用边界与安全提醒

- pgvector 是 PostgreSQL 扩展，不是独立向量服务；数据库实例的容量、备份、连接数和故障恢复仍由 PostgreSQL 承担。
- 2026-10 发布的 0.8.7 修复了 IVFFlat 索引构建缓冲区溢出（CVE-2026-103484）；使用受影响旧版本的环境应升级并按安全公告评估。

## 同类推荐

- [[Qdrant]] —— 专用向量数据库，支持相似度检索、元数据过滤与混合检索
- [[Milvus]] —— 面向大规模相似度检索的云原生向量数据库，支持独立部署与分布式扩展
- [[Poe]] —— 多模型聚合对话站点，提供有限免费额度
- [[HuggingChat]] —— Hugging Face 开源模型免费聊天
