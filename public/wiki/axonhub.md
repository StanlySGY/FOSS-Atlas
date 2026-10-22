---
title: AxonHub
slug: axonhub
category: ai
sub_category: ai-framework
tags: [LLM 网关, API, 开源]
url: https://github.com/looplj/axonhub
related: [langchain, llamaindex, langfuse, litellm]
updated: 2026-10-19
generated: true
---

# AxonHub

> 开源 AI 网关，重点是渠道故障转移与成本控制，把模型调用集中在一个可观测的入口。

## 一句话总结

开源 AI 网关，重点是渠道故障转移与成本控制，把模型调用集中在一个可观测的入口。

## 核心功能 / 特点

- 多渠道路由与自动故障转移，失败请求可回落到备用渠道
- 按模型与渠道统计用量和花费
- 兼容 OpenAI 接口格式，接入现有客户端改动很小

## 适用场景

- 模型渠道不稳定，需要在超时或限流时自动换一条路
- 想看清每个模型实际花了多少，而不是只有一张账单

## 同类推荐

- [[LangChain]] —— 构建 LLM 应用的主流框架
- [[LlamaIndex]] —— 面向 RAG 的数据框架
- [[Langfuse]] —— LLM 可观测性与追踪平台
- [[LiteLLM]] —— 统一 100+ 模型 API 的代理层
