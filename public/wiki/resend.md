---
title: Resend
slug: resend
category: saas
sub_category: saas-email
tags: [事务邮件, 邮件发送 API, SMTP, 开发者工具]
url: https://resend.com
related: [brevo, postal]
updated: 2026-11-06
verifiedAt: 2026-11-06
sources:
  - {"title":"Resend Send Email","url":"https://resend.com/docs/api-reference/emails/send-email","type":"official","scope":"POST /emails、Bearer 鉴权、from/to/subject/text 请求字段和返回 id"}
  - {"title":"Resend Send Test Emails","url":"https://resend.com/docs/dashboard/emails/send-test-emails","type":"official","scope":"官方模拟投递、退信与投诉地址；测试邮件计入发送额度"}
  - {"title":"Resend Idempotency Keys","url":"https://resend.com/docs/dashboard/emails/idempotency-keys","type":"official","scope":"Idempotency-Key 请求头、同请求重试去重及 24 小时保留窗口"}
  - {"title":"Resend API Errors","url":"https://resend.com/docs/api-reference/errors","type":"official","scope":"401/403 凭据和域名问题、409 幂等冲突、429 限流及额度错误"}
  - {"title":"Resend Verified Domains","url":"https://resend.com/docs/dashboard/domains/introduction","type":"official","scope":"真实业务发信的自有域名验证，以及子域名隔离发信信誉；不用于限制官方模拟测试地址"}
generated: true
---

# Resend

> 面向开发者的事务邮件服务，提供 REST API、SMTP relay 和 SDK，用于从应用发送验证、通知和业务触发邮件。

## 核心功能 / 特点

- 通过 REST API 或 SMTP relay 发送应用邮件，并提供官方 SDK
- 支持独立验证发信域名，可用子域名隔离不同业务的发信信誉
- 提供投递事件与域名管理能力，适合接入应用后端

## 适用场景

- 为 SaaS / Web 应用发送注册验证、密码重置和订单通知
- 希望用 API 或 SMTP 快速接入发信，不自行维护 SMTP 投递服务器

## 快速上手

### 选择测试入口并准备凭据

适合从应用后端发送注册验证、密码重置或订单通知。先准备 Resend 账户、有发送权限的 API Key、Bash 和支持 `--fail-with-body` 的 curl。

本例使用官方发件人 `onboarding@resend.dev`，只发往官方测试收件人 `delivered@resend.dev`，不需要先配置自己的发信域名。这会模拟投递事件，不会把邮件送到你的真实收件箱，但仍然消耗账户发送额度。

密钥只保存在服务端环境或密钥管理中，不要放进前端代码、公开仓库或截图。可在本机 Bash 用隐藏输入设置本次会话的变量，输入过程不会把密钥写进命令文本：

```bash
read -rsp 'Resend API Key: ' RESEND_API_KEY
printf '\n'
export RESEND_API_KEY
```

执行成功不会显示密钥；不要使用 `echo` 输出它或开启 shell 调试跟踪。部署后端时，通过托管平台的秘密变量配置同名变量。

### 发送一封可安全重试的测试邮件

在同一个 Bash 会话执行以下请求。幂等键 `atlas-demo/first-message-v1` 标识这封逻辑邮件；先保持发件人、收件人、主题和正文不变。

```bash
curl --fail-with-body -sS -X POST \
  https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: atlas-demo/first-message-v1' \
  --data '{
    "from":"onboarding@resend.dev",
    "to":["delivered@resend.dev"],
    "subject":"FOSS Atlas API test",
    "text":"This is a simulated delivery test."
  }'
```

预期返回一个带 `id` 的 JSON 对象。该 ID 表示发送请求已被接受，可用于查找记录；它本身不证明邮件已经投递。如果 curl 报 HTTP 错误，保留响应中的错误类型和描述，按后面的排错步骤处理，避免立即换幂等键重复发送。

### 在 Dashboard 核对模拟投递

打开 Resend Dashboard 的 Emails 列表，按返回的邮件 ID 找到测试记录，核对收件人为 `delivered@resend.dev`，并查看详情中的模拟 Delivered 事件。刚接受请求时事件可能尚未出现，稍后刷新再检查；不要去真实邮箱等待这封测试邮件。

返回 ID 与出现 Delivered 是两个检查点：前者验证接口接受了请求，后者验证平台产生了预期的模拟事件。这个测试不证明真实收件方一定会接收邮件或把它放入收件箱。接入 Webhook 后，还可用官方 `bounced@resend.dev`、`complained@resend.dev` 地址测试退信和投诉处理；每个新测试场景使用新的幂等键。

### 按错误类型重试或修正配置

同一逻辑邮件因超时或网络中断重试时，保留相同请求体和 `Idempotency-Key`；官方去重窗口为 24 小时，窗口内重复请求会得到相同响应且不会重复发送。不同邮件要用新键。不要每次重试都随机换键，也不要把本例固定键用于所有业务邮件。超过 24 小时先核对发送记录和业务状态，不能再依赖这个窗口去重。

- 401：确认变量已设置，`Authorization: Bearer` 格式正确，Key 未失效且具备所需权限；密钥格式错误也可能返回 400，应同时读取错误正文。
- 403：先核对错误类型。常见原因是发件域名未验证、`from` 不匹配已验证域名，或使用测试发件域名向不允许的真实地址发送；Key 被停用或权限不足也会触发 403。
- 409：`invalid_idempotent_request` 表示同一键的请求体变了；若是原邮件重试，恢复原请求体，若确实要发另一封，换新键。`concurrent_idempotent_requests` 表示同键请求仍在处理中，稍后用原键重试。
- 429：限流时让任务进入队列，降低并发并按响应头提示退避；若错误是日/月额度耗尽，等待额度恢复或调整方案，持续重试不会解决。

### 验证自有域名后再面向真实用户

面向真实用户发信前，在 Dashboard 的 Domains 添加自己拥有且能管理 DNS 的域名或子域名。逐项使用当前域名页面生成的 DNS 记录完成验证；不要照抄别人的记录名、值或截图，也不要随意覆盖已有邮件服务的记录。

等状态变为 Verified 后，将 `from` 改为该已验证域名下的地址，并以新的逻辑邮件键向你有权测试的真实收件人发送。保留返回 ID，结合投递事件、退信和投诉处理核对结果；正式接入时把请求放到后端队列，并按业务事件持久保存幂等键。

事务邮件与营销邮件可使用不同子域名管理发信信誉。本指南只核验测试与接口流程，套餐额度见本站独立额度面板及账户当前显示；测试邮件也计入发送额度。结束本机试验后可执行 `unset RESEND_API_KEY` 清除当前 shell 的变量。

## 使用边界与安全提醒

- 官方测试地址只模拟投递，不会进入你的真实收件箱，但仍计入发送额度；具体套餐限制以独立额度面板和账户显示为准。
- API Key 只放在服务端；正式向用户发信前验证自有域名，API 返回 id 不等于已送达。
- 事务邮件和营销邮件的发信域名宜分开管理，避免营销退信影响账号验证和密码重置等关键邮件。

## 同类推荐

- [[Brevo]] —— 提供事务邮件 API 的云端邮件平台，Free 每天最多发送 300 封
- [[Postal]] —— 自托管邮件投递平台，为网站和应用发送及接收电子邮件
