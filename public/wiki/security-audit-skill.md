---
title: Security Audit Skill
slug: security-audit-skill
category: security
sub_category: security-pentest
tags: [安全, 审计, Skill, 开源]
url: https://github.com/cloudflare/security-audit-skill
related: [awesome-hacking, payloadsallthethings, hacktricks, seclists]
updated: 2026-11-07
verifiedAt: 2026-11-07
sources:
  - {"title":"cloudflare/security-audit-skill（GitHub）","url":"https://github.com/cloudflare/security-audit-skill","type":"official","scope":"核对仓库定位（多阶段安全审计的 coding-agent skill、独立复核的机器可读 findings）、MIT 许可与 Cloudflare 官方维护身份"}
  - {"title":"L 站 2026.11 精选帖（发现来源）","url":"https://linux.do/t/topic/3106502","type":"third-party","scope":"收录线索来源：timerring 的月度精选帖「帖子/项目/工具类」条目，附一句点评"}
generated: true
---

# Security Audit Skill

> Cloudflare 官方开源的安全审计 Skill，把多阶段审查流程装进 coding agent。

## 核心功能 / 特点

- 多阶段审计流程：从侦察、攻击面分析到结论复核
- 产出独立复核过的机器可读 findings，便于归档与追踪
- 可直接挂载到 Claude Code / Codex 等主流 coding agent

## 适用场景

- 给自己的开源仓库或内部服务做一轮自动化安全体检
- 为 coding agent 配置标准化、可复现的安全审查流程

## 同类推荐

- [[Awesome Hacking]] —— 黑客与安全资源大全
- [[PayloadsAllTheThings]] —— 各类漏洞利用 Payload 合集
- [[HackTricks]] —— 渗透测试技巧百科全书
- [[SecLists]] —— 渗透测试字典集：用户名、密码、子域名、敏感路径等数十个分类
