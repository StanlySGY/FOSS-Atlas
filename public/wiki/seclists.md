---
title: SecLists
slug: seclists
category: security
sub_category: security-pentest
tags: [安全, 字典, 开源]
url: https://github.com/danielmiessler/SecLists
related: [nuclei-templates, gtfobins, lolbas, security-audit-skill]
updated: 2026-11-08
generated: true
---

# SecLists

> 安全测试用的字典合集，包含用户名、密码、目录、子域等各类清单。

## 核心功能 / 特点

- 按用户名、密码、目录、子域等类别组织
- 提供大量模糊测试与爆破用词表
- 常被 Burp、ffuf 等工具直接调用

## 适用场景

- 做目录扫描和子域爆破时挑选字典
- 构造口令爆破所需的用户名密码表

## 同类推荐

- [[nuclei-templates]] —— Nuclei 漏洞检测模板库
- [[GTFOBins]] —— Unix 提权二进制利用手册
- [[LOLBAS]] —— Windows 原生二进制滥用手册
- [[Security Audit Skill]] —— Cloudflare 开源的多阶段安全审计 coding-agent skill，产出可机读的核验结论
