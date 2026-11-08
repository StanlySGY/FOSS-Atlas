---
title: GTFOBins
slug: gtfobins
category: security
sub_category: security-pentest
tags: [安全, 提权, 手册]
url: https://gtfobins.github.io
related: [lolbas, security-audit-skill, awesome-hacking, payloadsallthethings]
updated: 2026-11-08
generated: true
---

# GTFOBins

> 整理 Unix 上可被滥用的二进制程序清单，说明如何借此提权或读取文件。

## 核心功能 / 特点

- 按提权、文件读写、反弹 shell 等能力筛选
- 给出针对每个二进制可直接照抄的命令
- 同时覆盖 sudo、SUID 与 capability 场景

## 适用场景

- 拿到低权限 shell 后寻找提权路径
- 审计系统上存在哪些危险的 SUID 程序

## 同类推荐

- [[LOLBAS]] —— Windows 原生二进制滥用手册
- [[Security Audit Skill]] —— Cloudflare 开源的多阶段安全审计 coding-agent skill，产出可机读的核验结论
- [[Awesome Hacking]] —— 黑客与安全资源大全
- [[PayloadsAllTheThings]] —— 各类漏洞利用 Payload 合集
