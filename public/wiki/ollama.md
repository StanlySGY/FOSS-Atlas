---
title: Ollama
slug: ollama
category: ai
sub_category: ai-local
tags: [本地推理, LLM, CLI, 开源]
url: https://ollama.com
repo: https://github.com/ollama/ollama
license: MIT
alternatives: [LM Studio, Jan, GPT4All, llama.cpp]
related: [lm-studio, jan, gpt4all, text-generation-webui, dify, langchain]
updated: 2026-10-19
---

# Ollama

**Ollama** 是目前最省事的本地大模型运行方案。一条命令就能把模型拉下来跑起来，不用折腾 CUDA、Python 环境或者量化脚本。

```bash
# 安装后直接跑
ollama run qwen3
ollama run deepseek-r1:7b
ollama run llama3.2

# 列出本地已有模型
ollama list
```

## 为什么值得用

- **零配置**：自动处理量化格式（GGUF）、显存分配、GPU 加速。
- **自带 API**：默认在 `http://localhost:11434` 暴露一个兼容 OpenAI 的接口，任何支持 OpenAI SDK 的客户端都能直接接。
- **生态好**：[[Dify]]、[[LangChain]]、[[Continue]]、[[Cline]] 都能把 Ollama 当后端。

## 硬件建议

| 显存 | 能舒服跑的规模 |
| --- | --- |
| 8 GB | 7B ~ 8B（Q4 量化） |
| 16 GB | 14B（Q4） |
| 24 GB | 32B（Q4）/ 14B（Q8） |
| 64 GB+ | 70B（Q4） |

内存不够时会自动回落到 CPU 推理，只是慢很多。

## 常见坑

- **模型下载慢**：设置 `OLLAMA_MODELS` 到磁盘空间大的分区，国内可配镜像。
- **端口冲突**：`OLLAMA_HOST=0.0.0.0:11434` 可让局域网其他设备访问，但**不要直接暴露到公网**，API 无鉴权。
- **和 [[LM Studio]] 的区别**：Ollama 偏 CLI / 服务化，LM Studio 偏图形界面，两者可以共存但别同时抢显存。

## 相关工具

- [[LM Studio]] —— 图形化替代方案，适合不习惯命令行的场景
- [[Jan]] —— 开源桌面客户端，界面更现代
- [[GPT4All]] —— 主打完全离线
- [[Text Generation WebUI]] —— 功能最全的本地 WebUI
- [[Dify]] —— 把 Ollama 接进 RAG 应用
