---
title: Qdrant
slug: qdrant
category: ai
sub_category: ai-vector
tags: [向量数据库, 向量检索, RAG, 语义搜索, Apache-2.0]
url: https://github.com/qdrant/qdrant
related: [milvus, pgvector]
updated: 2026-11-06
verifiedAt: 2026-11-06
sources:
  - {"title":"Qdrant Local Quickstart","url":"https://qdrant.tech/documentation/quickstart/","type":"official","scope":"本地容器、持久化存储路径、REST 端口、四维示例与 payload 查询"}
  - {"title":"Qdrant Security","url":"https://qdrant.tech/documentation/security/","type":"official","scope":"自托管默认无鉴权；本机回环绑定、API Key、私网和 TLS 要求"}
  - {"title":"Qdrant Create a collection","url":"https://api.qdrant.tech/api-reference/collections/create-collection","type":"official","scope":"PUT 集合接口、vectors.size、Cosine 距离与成功响应结构"}
  - {"title":"Qdrant Upsert points","url":"https://api.qdrant.tech/api-reference/points/upsert-points","type":"official","scope":"PUT points、wait=true、相同 ID 覆盖及 completed 状态"}
  - {"title":"Qdrant Query points","url":"https://api.qdrant.tech/api-reference/search/query-points","type":"official","scope":"POST points/query、query、with_payload、limit 与 result.points 字段"}
  - {"title":"Qdrant v1.20.0 Release","url":"https://github.com/qdrant/qdrant/releases/tag/v1.20.0","type":"official","scope":"2026-11-06 核验 v1.20.0 为 2026-10-22 发布的非预发布版本；用于本例固定标签，不表示永远最新"}
generated: true
---

# Qdrant

> 专用的开源向量数据库与向量搜索引擎，用于保存 Embedding 并按相似度检索，同时可按 payload 元数据过滤。

## 核心功能 / 特点

- 支持向量相似度检索、payload 元数据过滤与组合查询
- 提供 Docker 部署、HTTP API 和多语言客户端
- 可用于 RAG 检索、语义搜索、推荐与多模态相似度查询

## 适用场景

- 给 RAG 应用单独部署向量检索服务，不把向量索引塞进业务表结构
- 需要按用户、文档版本或业务字段过滤相似度检索结果

## 快速上手

### 准备本机环境并启动服务

适合需要独立向量检索服务、愿意维护容器和数据备份的项目。已有 PostgreSQL 且希望少维护一个服务时，也可先比较 pgvector。准备已运行的 Docker、Bash 和支持 `--fail-with-body` 的 curl；本例不需要 GPU、模型账号或 Embedding API。

以下固定使用已核验发布的 `v1.20.0`，只在自己的开发电脑上试跑。自托管 Qdrant 默认没有鉴权，因此只把 REST 端口映射到本机回环地址。先确认容器名、卷名和 6333 端口没有被其他项目占用；不要借用存放业务数据的卷。

```bash
docker run -d --name atlas-qdrant \
  -p 127.0.0.1:6333:6333 \
  -v atlas_qdrant_storage:/qdrant/storage \
  qdrant/qdrant:v1.20.0

curl --fail-with-body -sS http://127.0.0.1:6333/
```

启动命令返回容器 ID；服务就绪后，curl 应返回包含 Qdrant 版本的 JSON。刚启动尚未就绪时，查看 `docker logs atlas-qdrant` 后再试。命名卷保存数据，重启容器不会清空集合；已有本例容器时，用 `docker start atlas-qdrant` 恢复，无需再执行创建容器命令。

### 创建专用的四维演示集合

集合决定向量的维度和相似度算法。本例使用人工构造的四维向量与 `Cosine`，只验证接口和排序，不代表任何文本的语义。

仅在第一次运行且 `atlas_demo` 尚不存在时执行：

```bash
curl --fail-with-body -sS -X PUT \
  http://127.0.0.1:6333/collections/atlas_demo \
  -H 'Content-Type: application/json' \
  --data '{"vectors":{"size":4,"distance":"Cosine"}}'
```

预期响应含 `"result":true` 和 `"status":"ok"`。重跑本例时跳过创建；可用 `curl --fail-with-body -sS http://127.0.0.1:6333/collections/atlas_demo` 查看配置，确认 `result.config.params.vectors` 是四维 Cosine。若同名集合来自其他用途或配置不同，换一个未使用的集合名，并同步修改后续 URL，保留原有数据。

### 写入两条带元数据的向量

在刚建立的专用演示集合写入两条记录。`payload.label` 只是方便辨认结果的标签，不会被这次请求自动转换成 Embedding。`wait=true` 要求服务等待写入完成再返回。

```bash
curl --fail-with-body -sS -X PUT \
  'http://127.0.0.1:6333/collections/atlas_demo/points?wait=true' \
  -H 'Content-Type: application/json' \
  --data '{"points":[
    {"id":1,"vector":[1,0,0,0],"payload":{"label":"demo-a"}},
    {"id":2,"vector":[0,1,0,0],"payload":{"label":"demo-b"}}
  ]}'
```

预期顶层 `status` 为 `ok`，且 `result.status` 为 `completed`。相同 ID 的 upsert 会覆盖该记录，因此只在本例专用集合重跑；它不会追加重复的 ID 1、2。每条向量都必须有四个数，查询向量也一样。

### 查询并核对确定的排序

用与第一条记录相同的向量查询，并显式要求返回 payload：

```bash
curl --fail-with-body -sS -X POST \
  http://127.0.0.1:6333/collections/atlas_demo/points/query \
  -H 'Content-Type: application/json' \
  --data '{"query":[1,0,0,0],"with_payload":true,"limit":2}'
```

在只有这两条演示记录的集合中，`result.points` 应先返回 ID 1、标签 `demo-a`，得分约为 1；再返回 ID 2、标签 `demo-b`，得分约为 0。这说明创建、写入和相似度查询已经连通。响应还有版本、耗时等字段，不必逐字匹配；如果看不到标签，先检查请求中的 `with_payload`。

### 排查错误，再接入真实检索

- 连不上服务：查看 `docker ps -a` 与 `docker logs atlas-qdrant`，确认容器已启动、6333 端口未被占用。容器名冲突时先确认是不是上次的演示容器。
- 集合不存在或维度报错：核对 URL、集合配置和向量长度。实际 Embedding 模型若输出其他维度，应为它另建匹配的集合，不要直接把输出塞进四维演示集合。
- 返回顺序不符：确认仍是 Cosine、查询仍为 `[1,0,0,0]`，且集合没有混入其他数据。人工向量的标签与文本相似度无关。

接入文本检索时，由应用选择同一个 Embedding 模型处理文档和查询，保存来源等 payload，并在检索时落实业务权限过滤。生产部署要固定经过测试的镜像版本或 digest，配置 API Key、私网访问、TLS 与备份恢复；不要把本例无鉴权服务直接暴露到公网。

## 使用边界与安全提醒

- 本例只传入人工向量，不调用 Embedding 服务；文本语义检索还需要选择模型、切分文档并统一向量维度。
- 自托管实例默认没有鉴权；本机回环端口映射用于开发试跑，生产环境仍需认证、TLS、网络边界和备份。

## 同类推荐

- [[Milvus]] —— 面向大规模相似度检索的云原生向量数据库，支持独立部署与分布式扩展
- [[pgvector]] —— PostgreSQL 向量扩展，在关系型数据旁存储向量并执行相似度检索
