import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEPLOY_GROUP_LABEL } from '../lib/data.js'

/*
 * 发布时探测的健康点 — homepage.dev / Homarr 的招牌语言：一个服务名旁边的小点
 * 自己会说话。数据来自随构建发布的 dist/probe.json（/deployed 页同一份），按
 * 资源的实例行聚合：有一行不可达即红，全部已知且可达即绿，4xx 记琥珀。整个
 * 快照只 fetch 一次，所有徽章共享同一个 promise。
 */
let probePromise = null
function loadProbe() {
  probePromise ??= fetch(`${import.meta.env.BASE_URL}probe.json`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
  return probePromise
}

const DOWN_CLASSES = ['530/1033', '502', '504', 'transport', '5xx']
const probeStateFor = (cls) => {
  if (!cls) return null
  if (DOWN_CLASSES.some((d) => String(cls).startsWith(d)) || String(cls).startsWith('5')) return 'down'
  if (String(cls).startsWith('4')) return 'warn'
  return 'ok'
}

function useProbeState(instanceIds) {
  const [byId, setById] = useState(null)
  useEffect(() => {
    let alive = true
    loadProbe().then((probe) => {
      if (!alive || !probe) return
      const map = {}
      for (const row of probe.rows ?? []) map[row.id] = row.cls
      setById(map)
    })
    return () => {
      alive = false
    }
  }, [])
  if (!byId) return null
  const states = instanceIds.map((id) => probeStateFor(byId[id])).filter(Boolean)
  if (!states.length) return null
  if (states.includes('down')) return { dot: 'var(--down)', label: '发布时探测：有实例不可达' }
  if (states.includes('warn')) return { dot: 'var(--accent)', label: '发布时探测：4xx（多为登录页/鉴权）' }
  return { dot: 'var(--ok)', label: '发布时探测：可达' }
}

/**
 * "已自部署 N" — the mark that ties a catalogue entry to the 自部署服务 page and
 * to its node in the graph. Rendered wherever a resource is shown as a card, a
 * row or a page header, so the same fact reads the same way in all three.
 *
 * `to` turns the badge into a link — the card and the wiki header point it at
 * the 自部署服务 row of the first instance (`/deployed/#<row id>`), so the mark
 * is also the door, not only the label.
 *
 * The hue is the graph's 自建 colour (--own, see src/lib/graphStyle.js), used
 * for the dot; the *words* and the border wear --own-text, the same purple
 * stepped up in lightness, because --own is a mark, not a text colour: a 10px
 * word in it on this chip measures 2.65:1 where 4.5:1 is required. On the
 * chip's own plate --own-text is 8.60:1 and its 65% border 4.56:1, while the
 * 6px --own dot — the one thing here that is a mark rather than a word —
 * clears the 3:1 mark floor at 3.34:1. The plate is --own-well, which is
 * 1.262:1 and ΔE76 8.7 away from the card behind it: enough to read as its own
 * well, not enough to eat the dot (a 16% --own wash swallowed it at 2.67:1).
 * The same well hosts the probe marks — 可达 (--ok) 4.59, 4xx (--accent) 7.52,
 * 不可达 (--down) 3.86, all 6px dots against the 3:1 floor. The GraphNodePopover's
 * instance panel rides the same plate for the same reason.
 *
 * The count is the number of *instances*, not of groups: one tool deployed on
 * both the edge and Docker is two things the reader has to keep running, and
 * that is the number worth seeing.
 */
export default function DeployedBadge({ resource, showGroups = false, to = null }) {
  const instances = resource.instances ?? []
  const probe = useProbeState(instances.map((i) => i.id))
  if (instances.length === 0) return null
  const groups = [...new Set(instances.map((i) => i.group))]

  const badge = (
    <span
      title={`已在 ${groups.map((g) => DEPLOY_GROUP_LABEL[g] ?? g).join(' / ')} 部署${probe ? ` · ${probe.label}` : ''}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border border-[var(--own-text)]/65 bg-[var(--own-well)] px-1.5 py-0.5 text-[10px] text-[var(--own-text)] transition-colors hover:border-[var(--own-text)]"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--own)]" aria-hidden="true" />
      已自部署 <span className="mono">{instances.length}</span>
      {/*
       * The health mark rides beside the count, never instead of it: purple
       * says "mine", green/red says what the last publish saw.
       */}
      {probe ? (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: probe.dot }}
        />
      ) : null}
      {showGroups
        ? groups.map((g) => (
            <span key={g} className="mono text-[9px] text-[var(--text-faint)]">
              {DEPLOY_GROUP_LABEL[g] ?? g}
            </span>
          ))
        : null}
    </span>
  )

  return to ? (
    <Link to={to} className="shrink-0">
      {badge}
    </Link>
  ) : (
    badge
  )
}
