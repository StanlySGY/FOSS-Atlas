import { getOffering } from '../lib/offerings.js'

export default function OfferingPanel({ resourceId }) {
  const offering = getOffering(resourceId)
  if (!offering) return null

  return (
    <section className="space-y-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--text-strong)]">免费方案与使用额度</h2>
        <span className="rounded-full border border-[var(--line)] px-2 py-1 text-[10px] text-[var(--text-dim)]">
          {offering.label}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-[var(--text-dim)]">{offering.summary}</p>
      {offering.limits?.length ? (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {offering.limits.map(([label, value, period]) => (
            <div key={label} className="min-w-0 rounded-[6px] border border-[var(--line-soft)] bg-[var(--ink-sunken)] px-3 py-2">
              <dt className="text-[10px] text-[var(--text-faint)]">{label}</dt>
              <dd className="mt-1 break-words text-xs font-semibold text-[var(--text-strong)]">{value}</dd>
              {period ? <dd className="mt-0.5 text-[10px] leading-relaxed text-[var(--text-faint)]">{period}</dd> : null}
            </div>
          ))}
        </dl>
      ) : null}
      {offering.conditions?.length ? (
        <div className="space-y-1.5">
          <h3 className="text-[11px] font-medium text-[var(--text-dim)]">使用前注意</h3>
          <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-[var(--text-faint)]">
            {offering.conditions.map((condition) => <li key={condition}>{condition}</li>)}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--line-soft)] pt-2">
        <span className="text-[10px] text-[var(--text-faint)]">官方依据 · 核验于 {offering.verifiedAt ?? '2026-11-03'}</span>
        {offering.sources.map(([label, url]) => (
          <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[var(--accent-text)] hover:underline">
            {label} ↗
          </a>
        ))}
      </div>
      {offering.types.includes('api-demo') ? (
        <p className="text-[10px] leading-relaxed text-[var(--text-faint)]">本条核验的是官方 API 定价 / 使用政策；没有使用你的账户密钥，也未验证真实接口鉴权、调用成功率或免费额度扣减结果。</p>
      ) : null}
      <p className="text-[10px] leading-relaxed text-[var(--text-mute)]">额度与条款可能调整；本页记录的是所列官方来源在核验日公开的信息，不构成供应商承诺。开通或部署前请再次确认官方页面和账户实际资格。</p>
    </section>
  )
}
