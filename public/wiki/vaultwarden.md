---
title: Vaultwarden
slug: vaultwarden
category: selfhost
sub_category: selfhost-core
tags: [密码管理, Bitwarden, 开源, Rust]
searchAliases: [bitwarden_rs]
searchKeywords: [密码管理器, 自建密码库, 私有密码库, Bitwarden 自建, 密码管理服务, 密码库备份, 首次注册]
url: https://github.com/dani-garcia/vaultwarden
repo: https://github.com/dani-garcia/vaultwarden
license: AGPL-3.0
alternatives: [Bitwarden, 1Password, KeePassXC]
related: [passbolt, nginx-proxy-manager, cloudflare-tunnel, 1panel, caddy]
updated: 2026-11-06
verifiedAt: 2026-11-06
sources:
  - {"title":"Vaultwarden 官方仓库","url":"https://github.com/dani-garcia/vaultwarden","type":"official","scope":"社区维护的 Bitwarden Client API 实现、客户端兼容定位与 Web Crypto 安全上下文要求；不承诺固定内存占用或所有客户端功能兼容。"}
  - {"title":"Vaultwarden Docker Compose","url":"https://github.com/dani-garcia/vaultwarden/wiki/Using-Docker-Compose","type":"official","scope":"Compose 环境变量、/data 持久化、DOMAIN 与反向代理部署结构。"}
  - {"title":"关闭新用户注册","url":"https://github.com/dani-garcia/vaultwarden/wiki/Disable-registration-of-new-users","type":"official","scope":"SIGNUPS_ALLOWED、域名白名单优先级、组织邀请与管理员邀请的区别。"}
  - {"title":"备份与恢复密码库","url":"https://github.com/dani-garcia/vaultwarden/wiki/Backing-up-your-vault","type":"official","scope":"SQLite 活跃数据库备份、停止写入后复制、附件与 Send 文件、配置和 RSA 密钥的备份范围；不覆盖外置数据库恢复。"}
  - {"title":"管理员面板","url":"https://github.com/dani-garcia/vaultwarden/wiki/Enabling-admin-page","type":"official","scope":"未配置 token 时的管理面板状态、Argon2 哈希与 Compose 美元符号转义、config.json 配置优先级。"}
  - {"title":"Vaultwarden 1.37.5 发布","url":"https://github.com/dani-garcia/vaultwarden/releases/tag/1.37.5","type":"official","scope":"本例固定使用的非预发布版本，发布于 2026-11-01；不保证未来仍是最新版本。"}
  - {"title":"Caddy Local HTTPS","url":"https://caddyserver.com/docs/automatic-https#local-https","type":"official","scope":"本地 CA、tls internal 与容器内证书不会自动获得宿主机和浏览器信任；客户端必须信任自己的根证书。"}
---

# Vaultwarden

Vaultwarden 是社区维护的 Bitwarden 服务端 API 实现，可配合官方客户端使用。下面先在自己的电脑上建立一个只含测试数据的密码库，验证注册、同步与备份，再考虑正式部署。

## 是否适合自己维护

- 适合愿意维护服务更新、HTTPS、备份与恢复的人；主密码和恢复信息仍需要你自己妥善保管。
- 只需要直接使用密码管理器、没有运维时间时，可以先考虑托管服务。团队权限流程可对照 [[Passbolt]]。
- 它不是 Bitwarden 官方服务。客户端升级可能带来兼容问题，应先阅读发布说明；不以“功能全支持”或固定内存数字作为容量保证。

## 开始前准备

准备正在运行的 Docker、Docker Compose v2 和 Bash。以下示例针对 **Docker 引擎运行在当前电脑** 的情况，先只存测试条目；远程服务器应先配置受控 HTTPS 入口，再按官方部署文档初始化。

本文固定使用 `vaultwarden/server:1.37.5`。正式使用时核对发布说明并制定更新计划，不把固定版本当作永久免维护方案。

## 快速上手

### 1. 创建独立的本机试验目录

新建一个空目录，在其中保存下面的 `compose.yaml`。Caddy 提供只绑定本机的 HTTPS 入口，Vaultwarden 不直接发布端口。示例不启用管理员面板，也不配置 SMTP。

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:1.37.5
    restart: unless-stopped
    environment:
      DOMAIN: "https://localhost:8443"
      SIGNUPS_ALLOWED: "true"
      INVITATIONS_ALLOWED: "false"
    volumes:
      - ./vw-data:/data
  caddy:
    image: caddy:2.11.9
    restart: unless-stopped
    ports:
      - "127.0.0.1:8443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy-data:/data
      - ./caddy-config:/config
```

同一目录保存 `Caddyfile`：

```caddyfile
https://localhost {
    tls internal
    reverse_proxy vaultwarden:80
}
```

首次注册暂时开启，但入口只绑定本机回环地址。不要把映射改成 `8443:443` 后直接开放给网络中的其他人。

在这个目录执行：

```bash
docker compose up -d
docker compose ps
docker compose logs --tail=50 vaultwarden
```

两个容器应处于运行状态，日志没有持续报错或反复重启。Caddy 为本机站点签发证书，首次启动后先导出自己的根证书并检查 API：

```bash
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-local-root.crt
curl --fail-with-body -sS --cacert ./caddy-local-root.crt https://localhost:8443/api/config
```

预期返回包含 `version` 和 `environment` 的 JSON。刚启动时证书可能尚未生成，先查看 `docker compose logs caddy` 再重试。这里只导出公开证书 `root.crt`，不要复制或分享 CA 私钥。

将**自己刚生成的** `caddy-local-root.crt` 导入当前电脑/浏览器的受信任根证书存储（macOS 钥匙串、Windows 当前用户受信任根证书、Linux/Firefox 对应证书管理入口），再打开 `https://localhost:8443`，确认没有证书警告。容器中的 Caddy 无法自动替宿主机和浏览器建立信任；不方便安装本地 CA 时，应改用自己已有的可信 HTTPS 域名和反代入口。不要通过关闭证书验证来日常使用密码库；试验结束后可移除这张本地根证书的信任。

当前示例版本的网页客户端要求 HTTPS API。本机 HTTP 即使能打开登录页，也可能在注册或登录时提示 `Insecure URL not allowed`，因此本例从首次初始化起就使用 HTTPS。

### 2. 建号后关闭开放注册

在本机页面创建测试账号，保存好主密码，登录后添加一个没有真实凭据的测试条目。确认可以锁定、解锁并再次读取该条目。

随后把 `compose.yaml` 中的 `SIGNUPS_ALLOWED` 改为 `"false"`，保留 `INVITATIONS_ALLOWED: "false"`，重新应用配置：

```bash
docker compose up -d --force-recreate vaultwarden
```

已有账号应仍能登录，新账号注册应被拒绝。仅执行 `docker compose restart` 不会重新载入 Compose 中修改的环境变量。

这里采用“本机建号 → 关闭注册”的顺序，避免第一次运行就关闭注册却没有账号。已有实例还要检查 `SIGNUPS_DOMAINS_WHITELIST`：设置了白名单会忽略 `SIGNUPS_ALLOWED`。组织邀请与管理员邀请是不同入口，管理员面板仍可邀请用户，不能只凭注册按钮是否可见判断权限。

### 3. 跨设备使用前配置 HTTPS

本机试验成功后，在实际部署主机上配置可信 HTTPS 和反向代理，将 `DOMAIN` 改成真实完整地址，例如 `https://vault.example.com`，再重建容器。该示例域名必须替换为你控制的域名。

本例反代与 Vaultwarden 已在同一个 Compose 网络中，使用 `vaultwarden:80` 通信。容器中的 `127.0.0.1` 指向容器自身。改为公网域名时，应按官方 Compose 方案调整 Caddy 站点地址与端口，并使用公网可信证书；不要继续用本机 CA 为其他设备提供未受信任的入口。

客户端登录前选择自托管环境，填写同一个 HTTPS 地址。验证手机或扩展能读取测试条目、修改后能同步，再迁入真实密码。证书链错误或网页一直加载时，先查 HTTPS 和浏览器控制台，不要关闭证书验证。

## 备份与恢复演练

下面给默认 SQLite 部署一个容易核对的停机备份方法，会短暂停止密码库服务。选择维护时间，在 `compose.yaml` 所在目录运行；备份目的目录必须位于 `vw-data` 之外。

```bash
(
  set -eu
  umask 077
  backup_dir="./backups/$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$backup_dir"
  docker compose stop vaultwarden
  trap 'docker compose start vaultwarden' EXIT
  sudo tar -czf "$backup_dir/vw-data.tar.gz" vw-data
  cp compose.yaml Caddyfile "$backup_dir/"
  sudo tar -tzf "$backup_dir/vw-data.tar.gz"
)
```

确认归档清单包含 `db.sqlite3`、存在时的 SQLite WAL 文件、`rsa_key.*`，以及实际使用过的 `attachments/`、`sends/` 和 `config.json`。测试库没有附件时对应目录可能尚未生成。本例还应单独加密备份 `caddy-data` 中的证书及 CA 私钥，以保留本机证书信任；它不属于密码库 SQLite 归档。若另用 `.env` 或其他证书配置，也应另行加密备份。命令退出时会尝试重启服务，再用 `docker compose ps` 确认已恢复运行。

**归档可读只是第一步。** 上述 `sudo tar` 创建的归档可能归 root 所有，复制和解压时也需要 `sudo`；恢复时保留数据文件原有的属主和权限。若迁移到 rootless Docker 等不同运行方式，应先按目标容器的 UID/GID 核对可读写权限，不要直接放宽为全员可写。

把备份复制到独立的演练目录，解压后应得到该目录下的 `vw-data`，避免再嵌套一层同名目录。复制 Compose 和 Caddyfile，用相同版本镜像及另一回环端口启动，修改演练配置的入口端口和 `DOMAIN`，保留关闭注册。演练目录内的 Caddy 数据也应独立管理；若生成了新的本地 CA，需要重新导出并信任它。验证测试账号能解锁、条目和附件能读取。不要直接覆盖正在使用的数据目录。

运行中的 SQLite 不能靠只复制 `db.sqlite3` 得到可靠备份；不停机时应使用官方内置 `/vaultwarden backup` 或 SQLite 在线备份方式，并同时处理附件等文件。内置命令只备份数据库，不等于备份了整个密码库。MySQL/PostgreSQL 需要单独备份数据库，不适用这里的 SQLite 示例。

至少保留一份异机副本，并限制访问、加密存放。丢失主密码不能靠恢复服务器备份解决；升级前先备份并演练恢复，避免在已迁移的数据库上盲目降级。

## 常见故障与管理边界

| 现象 | 检查与处理 |
| --- | --- |
| 页面一直加载、加密 API 不可用或 Insecure URL not allowed | 使用 HTTPS，确认 DOMAIN 与浏览器入口一致、本机根证书已受信任；不要退回 HTTP 或关闭证书验证。 |
| 初次启动没有账号且不能注册 | 仅在受控的本机试验环境临时允许注册，建号后关闭并重建；已有正式实例可按官方管理员邀请流程处理。 |
| 改了环境变量仍然无效 | 先重建容器；若通过管理页保存过设置，`/data/config.json` 中的对应值可能覆盖环境变量。 |
| 反代返回 502 | 确认上游服务运行、端口与 Docker 网络正确；容器内的 localhost 不是宿主机。 |
| 重建后测试条目消失 | 核对挂载的是原来的数据目录，及启动命令所在目录；停止写入并找到原始数据，避免创建新库后误覆盖。 |

需要管理员面板时，再按官方文档生成 Argon2 哈希的 `ADMIN_TOKEN` 并限制入口。直接写入 Compose 的哈希含 `$` 时要处理 Compose 插值；不要照抄公开 token，也不要启用无 token 的管理入口。使用隧道并不会自动替代应用鉴权、HTTPS 和备份。

## 继续阅读

- [官方 Compose 与反代示例](https://github.com/dani-garcia/vaultwarden/wiki/Using-Docker-Compose)
- [备份范围与在线备份](https://github.com/dani-garcia/vaultwarden/wiki/Backing-up-your-vault)
- [[Nginx Proxy Manager]]、[[1Panel]]：已有部署管理工具的配置入口
- [[Passbolt]]：按团队共享与权限需求进一步比较
