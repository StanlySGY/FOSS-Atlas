/**
 * The font weights this site ships, listed once.
 *
 * scripts/build-fonts.mjs writes exactly these faces, scripts/fontCoverage.mjs
 * reads their cmap, and scripts/ogManifest.mjs hashes their bytes. Three lists
 * that all have to agree is three lists that eventually will not — the failure
 * is a build that cannot find a file it was told to expect.
 */
export const SHIPPED_FACES = [
  { weight: 400, file: 'NotoSansCJKsc-Regular.otf' },
  { weight: 700, file: 'NotoSansCJKsc-Bold.otf' },
]

export const SHIPPED_WEIGHTS = SHIPPED_FACES.map((f) => f.weight)
