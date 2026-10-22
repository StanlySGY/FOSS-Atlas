import { DEPLOY_GROUP_LABEL } from '../lib/data.js'

/**
 * "已自部署 N" — the mark that ties a catalogue entry to the 自部署服务 page and
 * to its node in the graph. Rendered wherever a resource is shown as a card, a
 * row or a page header, so the same fact reads the same way in all three.
 *
 * The hue is the graph's 自建 colour (--own, see src/lib/graphStyle.js), used
 * for the dot and the border; the *words* wear --own-text, the same purple
 * stepped up in lightness, because OWN_COLOR only reaches 2.74:1 against this
 * chip's own background and a badge is text, not a mark.
 *
 * The count is the number of *instances*, not of groups: one tool deployed on
 * both the edge and Docker is two things the reader has to keep running, and
 * that is the number worth seeing.
 */
export default function DeployedBadge({ resource, showGroups = false }) {
  const instances = resource.instances ?? []
  if (instances.length === 0) return null
  const groups = [...new Set(instances.map((i) => i.group))]

  return (
    <span
      title={`已在 ${groups.map((g) => DEPLOY_GROUP_LABEL[g] ?? g).join(' / ')} 部署`}
      className="inline-flex items-center gap-1.5 rounded-[3px] border border-[var(--own)]/45 bg-[var(--own-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--own-text)]"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--own)]" aria-hidden="true" />
      已自部署 <span className="mono">{instances.length}</span>
      {showGroups
        ? groups.map((g) => (
            <span key={g} className="mono text-[9px] text-[var(--text-faint)]">
              {DEPLOY_GROUP_LABEL[g] ?? g}
            </span>
          ))
        : null}
    </span>
  )
}
