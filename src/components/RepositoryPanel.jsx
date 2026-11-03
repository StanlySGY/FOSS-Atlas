import { formatRepositoryCount, repositoryFor, repositoryFreshness } from '../lib/repositories.js'

function Stat({ label, value }) {
  return (
    <div className="rounded-[6px] border border-[var(--line-soft)] bg-[var(--ink-sunken)] px-3 py-2">
      <dt className="text-[10px] text-[var(--text-faint)]">{label}</dt>
      <dd className="mono mt-1 text-sm font-semibold text-[var(--text-strong)]">{value}</dd>
    </div>
  )
}

export default function RepositoryPanel({ resourceId }) {
  const repository = repositoryFor(resourceId)
  if (!repository) return null

  const refreshStatus = repository.refreshStatus ?? 'available'
  const notFound = refreshStatus === 'not-found'
  const stale = refreshStatus === 'stale'
  const unavailable = refreshStatus === 'unavailable'

  return (
    <section className="space-y-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--text-strong)]">开源仓库状态</h2>
        {notFound ? (
          <span className="rounded-full border border-[var(--down-text)]/45 bg-[var(--down-well)] px-2 py-1 text-[10px] text-[var(--down-text)]">上游 API 返回 404</span>
        ) : stale || unavailable ? (
          <span className="rounded-full border border-[var(--line)] px-2 py-1 text-[10px] text-[var(--text-faint)]">{stale ? '沿用历史快照' : '尚无可用快照'}</span>
        ) : repository.archived ? (
          <span className="rounded-full border border-[var(--down-text)]/45 bg-[var(--down-well)] px-2 py-1 text-[10px] text-[var(--down-text)]">已归档</span>
        ) : repository.disabled ? (
          <span className="rounded-full border border-[var(--line)] px-2 py-1 text-[10px] text-[var(--text-faint)]">已禁用</span>
        ) : (
          <span className="rounded-full border border-[var(--line)] px-2 py-1 text-[10px] text-[var(--text-dim)]">公开仓库快照</span>
        )}
      </div>
      <a href={repository.url} target="_blank" rel="noopener noreferrer" className="mono block break-all text-xs text-[var(--accent-text)] hover:underline">
        {repository.repository} ↗
      </a>
      {notFound && repository.stars == null ? (
        <p className="text-xs leading-relaxed text-[var(--down-text)]">GitHub Repository API 当前返回 HTTP 404。仓库可能已删除、改为私有或重命名；本目录保留原始地址，不会自动替换成其他用户的同名 fork。</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Stars" value={formatRepositoryCount(repository.stars)} />
        <Stat label="Forks" value={formatRepositoryCount(repository.forks)} />
        <Stat label="许可证" value={repository.license ?? '未声明 / 未识别'} />
        <Stat label="默认分支" value={repository.defaultBranch ?? '—'} />
      </dl>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[var(--text-faint)]">
        <span>最近推送：{repository.pushedAt?.slice(0, 10) ?? '未知'}</span>
        <span>快照核验：{repositoryFreshness(repository)}</span>
        {repository.attemptedAt && (stale || notFound) ? <span>最近尝试：{repository.attemptedAt.slice(0, 10)} · HTTP {repository.refreshErrorCode}</span> : null}
      </div>
      <p className="text-[10px] leading-relaxed text-[var(--text-mute)]">
        数据来自 GitHub 公开仓库 API，随站点构建刷新；Stars 与 Forks 是快照计数，最近推送时间不代表维护质量或安全性。许可证未识别不等于没有许可证，请以仓库当前 LICENSE 文件为准。更新失败时会保留历史快照并标出状态。
      </p>
    </section>
  )
}
