---
title: New API
slug: new-api
category: ai
sub_category: ai-framework
tags: [LLM 网关, API, 开源]
url: https://github.com/QuantumNous/new-api
related: [langchain, llamaindex, langfuse, litellm]
updated: 2026-10-19
generated: true
---

# New API

> 多模型 API 网关：把各家 LLM 接口聚合成一套 OpenAI 兼容端点，再分发给自己的应用。

## 一句话总结

多模型 API 网关：把各家 LLM 接口聚合成一套 OpenAI 兼容端点，再分发给自己的应用。

## 核心功能 / 特点

- 统一入口对接多家模型供应商，客户端只认一个地址
- 带令牌、额度、计费与渠道权重管理
- 支持渠道故障转移，某家接口挂了自动切到另一家

## 适用场景

- 手上有多个平台的免费额度，想让各个客户端共用
- 自建网关统一分发 Key，避免每个应用各存一份凭证

## 同类推荐

- [[LangChain]] —— 构建 LLM 应用的主流框架
- [[LlamaIndex]] —— 面向 RAG 的数据框架
- [[Langfuse]] —— LLM 可观测性与追踪平台
- [[LiteLLM]] —— 统一 100+ 模型 API 的代理层
