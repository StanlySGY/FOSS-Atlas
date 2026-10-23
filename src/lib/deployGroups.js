/*
 * The one name for each deployment group.
 *
 * The same three groups appear as a badge on a card, a bubble label in the
 * graph, a row in the Wiki rail, a line of `og:description`, and the text
 * painted onto a social card. Written in two places those two drift — the UI
 * said `本地 Docker` / `GitHub Pages` while the crawler copy said `Docker 隧道` /
 * `GitHub Pages 镜像`, so a reader comparing a snippet with the page they landed
 * on was comparing two different names for one thing.
 *
 * Lives in its own file because the two readers load code differently: the app
 * imports JSON freely, the prerender build runs in plain Node (`scripts/ogManifest.mjs`
 * → `src/prerender/cards.js` → here) and cannot import `src/lib/data.js` for that
 * reason. This file therefore imports nothing at all.
 *
 * `docker` is 隧道 rather than 本地 on purpose: the containers do run on this
 * machine, but the thing the reader sees is a public HTTPS domain published
 * through cloudflared — `本机 Docker + Cloudflare Tunnel` is the group's own
 * heading on the 自部署服务 page.
 */
export const DEPLOY_GROUP_LABEL = {
  edge: 'Cloudflare 边缘',
  docker: 'Docker 隧道',
  github: 'GitHub Pages 镜像',
}

/** `edge/docker/github` as the crawler sees them, joined. */
export function deployGroupPhrase(groups) {
  return groups.map((g) => DEPLOY_GROUP_LABEL[g] ?? g).join(' / ')
}
