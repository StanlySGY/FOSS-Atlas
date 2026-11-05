import { getOffering } from '../lib/offerings.js'

function Limit({ limit }) {
  const [label, value, period] = limit
  return (
    <div key={label} className="min-w-0 rounded-[6px] border border-[var(--line-soft)] bg-[var(--ink-sunken)] px-3 py-2">
      <dt className="text-[10px] text-[var(--text-faint)]">{label}</dt>
      <dd className="mt-1 break-words text-xs font-semibold text-[var(--text-strong)]">{value}</dd>
      {period ? <dd className="mt-0.5 text-[10px] leading-relaxed text-[var(--text-faint)]">{period}</dd> : null}
    </div>
  )
}

export default function OfferingPanel({ resourceId }) {
  const offering = getOffering(resourceId)
  if (!offering) return null

  const visibleLimits = offering.limits?.slice(0, 2) ?? []
  const extraLimits = offering.limits?.slice(2) ?? []

  return (
    <section className="fa-surface space-y-3 p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--text-strong)]">使用成本与额度</h2>
        <span className="rounded-full border border-[var(--line)] bg-[var(--ink-sunken)] px-2 py-1 text-[10px] text-[var(--accent-text)]">
          {offering.shortLabel}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-[var(--text-dim)]">{offering.summary}</p>
      {visibleLimits.length ? (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {visibleLimits.map((limit) => <Limit key={limit[0]} limit={limit} />)}
        </dl>
      ) : null}
      {extraLimits.length ? (
        <details className="fa-disclosure rounded-[6px] border border-[var(--line-soft)] px-3 py-2">
          <summary className="cursor-pointer text-[11px] text-[var(--text-dim)]">查看其余额度项（{extraLimits.length}）</summary>
          <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {extraLimits.map((limit) => <Limit key={limit[0]} limit={limit} />)}
          </dl>
        </details>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line-soft)] pt-2">
        <span className="text-[10px] text-[var(--text-faint)]">方案信息核验日 · {offering.verifiedAt ?? '日期未记录'}</span>
        <details className="fa-disclosure text-right">
          <summary className="cursor-pointer text-[10px] text-[var(--accent-text)]">条件、来源与核验范围</summary>
          <div className="mt-2 space-y-2 text-left">
            {offering.conditions?.length ? (
              <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-[var(--text-faint)]">
                {offering.conditions.map((condition) => <li key={condition}>{condition}</li>)}
              </ul>
            ) : null}
            <div className="space-y-1.5">
              {offering.sources.map(([label, url, claim]) => (
                <div key={url} className="text-[11px] leading-relaxed">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-text)] hover:underline">{label} ↗</a>
                  {claim ? <p className="mt-0.5 text-[var(--text-faint)]">{claim}</p> : null}
                </div>
              ))}
            </div>
            {offering.types.includes('api-demo') ? (
              <p className="text-[10px] leading-relaxed text-[var(--text-faint)]">本条核验的是官方 API 定价 / 使用政策；没有使用你的账户密钥，也未验证真实接口鉴权、调用成功率或免费额度扣减结果。</p>
            ) : null}
            <p className="text-[10px] leading-relaxed text-[var(--text-mute)]">额度与条款可能调整；本页记录的是所列官方来源在核验日公开的信息，不构成供应商承诺。开通或部署前请再次确认官方页面和账户实际资格。</p>
          </div>
        </details>
      </div>
    </section>
  )
}
