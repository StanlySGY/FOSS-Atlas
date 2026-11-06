---
title: Ollama
slug: ollama
category: ai
sub_category: ai-local
tags: [本地推理, LLM, CLI, 开源]
searchKeywords: [本地模型, 本地大模型, 本地 LLM, 模型下载运行, 本地模型 API, OpenAI 兼容本地 API, ollama pull, ollama run, api/chat, 本地离线推理]
url: https://ollama.com
repo: https://github.com/ollama/ollama
license: MIT
alternatives: [LM Studio, Jan, GPT4All, llama.cpp]
related: [lm-studio, jan, gpt4all, text-generation-webui, dify, langchain]
updated: 2026-11-06
verifiedAt: 2026-11-06
sources:
  - {"title":"Ollama Quickstart","url":"https://docs.ollama.com/quickstart","type":"official","scope":"核对安装入口、gemma4:e2b 的本地下载与运行、约 7.2 GB 下载量和 8 GB 可用显存或统一内存建议、本地免密钥与云端 API 认证；不覆盖硬件适配、性能或所有 SDK 功能。"}
  - {"title":"Ollama FAQ","url":"https://docs.ollama.com/faq","type":"official","scope":"核对默认监听地址、ollama ps 的 PROCESSOR 列、模型目录与代理配置、服务环境变量生效方式、云端禁用和本地/云端数据边界；不代表第三方客户端的数据处理行为。"}
  - {"title":"Generate a chat message","url":"https://docs.ollama.com/api/chat","type":"official","scope":"核对 POST /api/chat 的 model、messages、stream 参数以及 message.content、done 响应字段；示例响应为结构示意，未在本机下载模型实测。"}
  - {"title":"Ollama CLI Reference","url":"https://docs.ollama.com/cli","type":"official","scope":"核对 pull、run、模型列表、ps、stop 和 serve 的用途；不覆盖各模型输出质量、运行速度或第三方集成配置。"}
---

# Ollama

Ollama 提供模型下载、命令行对话和 HTTP API。下面用官方快速开始中的 `gemma4:e2b`，完成一次本地对话，再从脚本调用同一个模型。

## 什么时候选它

- 需要在自己的机器上运行模型，并通过命令行或 HTTP 接入应用时，可以从 Ollama 开始。
- 如果主要需求是图形界面里的模型管理与聊天，可对照 [[LM Studio]]、[[Jan]] 的指南再选。
- 本地方案需要自行承担模型下载、存储和计算资源；先用一小段真实任务验证质量与等待时间，再决定是否接入工作流。

本文使用 Ollama 原生 `/api/chat`。OpenAI 兼容接口只覆盖部分功能，已有客户端应逐项核对官方兼容文档中的接口、参数和模型能力。

## 开始前准备

1. 从官方安装入口选择 macOS、Windows 或 Linux 版本；确保可以联网下载模型，并准备好终端。
2. 示例模型下载约 **7.2 GB**，磁盘需留出相应空间；下载大小不等于运行时内存占用。
3. 官方 Quickstart 建议有 **8 GB 可用显存或 Mac 可用统一内存**；较长上下文需要更多内存。显存不足时可能使用系统 RAM，响应可能变慢，不保证运行速度。资源紧张时先选更小模型，并替换下文所有模型名。
4. 以下多行 `curl` 示例使用 **Bash**。macOS / Linux 可直接使用；Windows 请在 Git Bash 中执行，不要原样粘贴到 PowerShell。

## 快速上手

### 1. 安装并确认服务可连接

安装后，macOS / Windows 打开 Ollama 应用，再开终端执行 `ollama list`。

能显示模型列表就说明服务可连接；刚安装时列表没有模型是正常的。默认服务监听 `127.0.0.1:11434`，下文通过 `http://localhost:11434` 访问。

Linux 若安装程序已启动后台服务，直接继续。**仅在服务尚未运行时**执行下面的命令，并保持该终端打开；后续命令放在另一终端执行：

```bash
ollama serve
```

### 2. 下载模型并进行一次对话

先下载，再运行，便于区分下载耗时与模型回答耗时：

```bash
ollama pull gemma4:e2b
ollama run gemma4:e2b
```

进入对话后输入“请用一句中文介绍你能帮我做什么”。看到回答即完成命令行验证；输入 `/bye` 退出交互。首次加载模型可能需要等待。

### 3. 调用本地聊天 API

保持 Ollama 服务运行，在 Bash 中发送一次请求。本地模型调用不需要 API key：

```bash
curl -sS http://localhost:11434/api/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gemma4:e2b",
    "messages": [
      {"role": "user", "content": "请用一句中文介绍你能帮我做什么。"}
    ],
    "stream": false
  }'
```

`-d` 会发送 POST 请求；`stream: false` 让服务在完成后返回一个 JSON 对象，便于先验证链路。未关闭流式输出时，不应把整段响应当作单个 JSON 对象解析。

成功响应的关键字段如下，正文仅为示意，实际还会包含时间和用量等字段：

```json
{
  "model": "gemma4:e2b",
  "message": {
    "role": "assistant",
    "content": "我可以帮助你整理资料、解释问题和起草文本。"
  },
  "done": true
}
```

读取 `message.content` 获得回答，`done: true` 表示生成已结束。命令行和 API 都得到回答后，再接入自己的应用；模型名称须与下载的标签一致。

### 4. 检查模型和资源占用

```bash
ollama list
ollama ps
```

`list` 查看已下载的模型；`ps` 查看当前已加载到内存的模型。`PROCESSOR` 列中的 `100% GPU`、`100% CPU` 或 CPU/GPU 比例表示模型的加载分布，不是实时利用率或速度评分。

空闲后模型可能从内存卸载，所以 `ps` 为空不等于模型文件丢失。需要主动释放当前模型占用时执行：

```bash
ollama stop gemma4:e2b
```

## 常见问题怎么排查

| 现象 | 先检查什么 |
| --- | --- |
| 找不到 `ollama` 命令 | 确认已完成对应系统的官方安装，再重新打开终端检查命令路径。 |
| API 连接被拒绝 | 确认应用或服务在运行，先执行 `ollama list`；检查是否改过 `OLLAMA_HOST`。 |
| `ollama serve` 提示地址已被占用 | 可能已有服务监听 11434；先用 `ollama list` 验证，避免重复启动。 |
| API 提示模型不存在 | 用 `ollama list` 核对完整标签；确认 `ollama pull gemma4:e2b` 已完成，并使用同一服务。 |
| 回答慢或内存不足 | 用 `ollama ps` 看加载位置，停止不用的模型，缩短上下文或换更小模型；再查官方 GPU 支持与日志。 |
| 下载慢、失败或磁盘不足 | 分别检查网络、代理和磁盘；`OLLAMA_MODELS` 只改变存储目录，不会加速下载。 |

需要代理时，按 FAQ 为服务配置 `HTTPS_PROXY`；不要为了模型下载随意设置 `HTTP_PROXY`，它可能影响本地客户端连接。更改模型目录时，还要确保运行服务的账户能读写新目录。

## 本地、云端与配置生效范围

本页模型在本机运行，不需要云端账户或 API key。官方说明本地运行时不会向其发送提示词和回答；接入第三方应用后，还需检查该应用自己的日志与外部调用。

选择云端模型会把请求交给云端处理，即使入口仍是本地 Ollama 服务，也不能据此认定为离线推理。通过本地 Ollama 使用云端模型需要登录；直接请求 `https://ollama.com/api/chat` 则需要 API key 和 Bearer 认证。

只需本地功能时，设置 `OLLAMA_NO_CLOUD=1` 并重启 Ollama。它会禁用云端模型和网页搜索；安装、更新和下载模型仍需要相应网络访问。

`OLLAMA_NO_CLOUD`、`OLLAMA_MODELS` 等变量必须设置到**实际运行服务的进程环境**，仅在另一个终端 `export` 不会改变已经运行的应用：

- macOS 应用：通过 `launchctl setenv OLLAMA_NO_CLOUD 1` 设置，然后重启 Ollama 应用。
- Linux systemd 服务：用 `sudo systemctl edit ollama.service`，在 `[Service]` 下添加 `Environment="OLLAMA_NO_CLOUD=1"`，再执行 `sudo systemctl daemon-reload` 和 `sudo systemctl restart ollama`。
- Windows 应用：退出托盘中的 Ollama，在用户环境变量中设置 `OLLAMA_NO_CLOUD=1`，再从开始菜单启动应用。

默认本地 API 没有鉴权。若通过 `OLLAMA_HOST` 开放给其他机器，应先配置受控网络与带认证的访问入口，避免直接暴露到公网。

## 继续阅读

- [官方安装入口](https://ollama.com/download)与 [Quickstart](https://docs.ollama.com/quickstart)：安装、本地示例和云端认证。
- [API 聊天参考](https://docs.ollama.com/api/chat)与 [CLI 参考](https://docs.ollama.com/cli)：请求字段、响应结构和模型管理。
- [FAQ](https://docs.ollama.com/faq)：环境变量、模型目录、隐私与服务配置。
- [OpenAI 兼容范围](https://docs.ollama.com/api/openai-compatibility)、[GPU 支持](https://docs.ollama.com/gpu)与 [排障日志](https://docs.ollama.com/troubleshooting)：按实际客户端与硬件逐项核对。
- [[Dify]]、[[LangChain]]：本地 API 验证成功后，可继续查阅应用编排与开发框架的接入指南。
