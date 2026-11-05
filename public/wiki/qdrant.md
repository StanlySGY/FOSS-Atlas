---
title: Qdrant
slug: qdrant
category: ai
sub_category: ai-vector
tags: [向量数据库, 向量检索, RAG, 语义搜索, Apache-2.0]
url: https://github.com/qdrant/qdrant
related: [milvus, pgvector, poe, huggingchat]
updated: 2026-11-05
verifiedAt: 2026-11-05
sources:
  - {"title":"Qdrant 官方仓库与许可证","url":"https://github.com/qdrant/qdrant","type":"official","scope":"项目定位、Apache-2.0 许可证和开源代码"}
  - {"title":"Qdrant Docker 安装","url":"https://qdrant.tech/documentation/installation/","type":"official","scope":"Docker 镜像、持久化目录和默认 REST 端口"}
  - {"title":"Qdrant Releases","url":"https://github.com/qdrant/qdrant/releases","type":"official","scope":"2026-11-05 核验时最新稳定发布为 v1.20.0（2026-10-22）"}
generated: true
---

# Qdrant

> 专用的开源向量数据库与向量搜索引擎，用于保存 Embedding 并按相似度检索，同时可按 payload 元数据过滤。

## 一句话总结

专用的开源向量数据库与向量搜索引擎，用于保存 Embedding 并按相似度检索，同时可按 payload 元数据过滤。

## 核心功能 / 特点

- 支持向量相似度检索、payload 元数据过滤与组合查询
- 提供 Docker 部署、HTTP API 和多语言客户端
- 可用于 RAG 检索、语义搜索、推荐与多模态相似度查询

## 适用场景

- 给 RAG 应用单独部署向量检索服务，不把向量索引塞进业务表结构
- 需要按用户、文档版本或业务字段过滤相似度检索结果

## 快速上手

- 官方 Docker 安装方式启动 qdrant/qdrant，并把 /qdrant/storage 映射到持久化目录。
- 通过本机 6333 端口访问 REST API；生产环境先配置鉴权、网络边界和备份。
- 由应用侧生成 Embedding，再写入 collection 并按向量及 payload 条件检索。

## 使用边界与安全提醒

- Qdrant 只负责存储和检索向量，不会自动生成 Embedding；模型、切分和权限过滤仍需应用负责。
- 官方 Docker 示例用于快速启动，公网生产部署前必须配置认证、TLS、持久化和备份。

## 同类推荐

- [[Milvus]] —— 面向大规模相似度检索的云原生向量数据库，支持独立部署与分布式扩展
- [[pgvector]] —— PostgreSQL 向量扩展，在关系型数据旁存储向量并执行相似度检索
- [[Poe]] —— 多模型聚合对话站点，提供有限免费额度
- [[HuggingChat]] —— Hugging Face 开源模型免费聊天
