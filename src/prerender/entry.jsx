/*
 * The render side of `scripts/prerender.mjs`.
 *
 * This file is loaded through Vite's SSR pipeline (`ssrLoadModule`) rather than
 * imported by Node directly, because the app imports JSON without an assert and
 * reads `import.meta.env.BASE_URL`; only Vite knows how to satisfy either.
 *
 * `renderToString` rather than `renderToStaticMarkup`: the former keeps the
 * comment markers React uses to tell adjacent text nodes apart, and the client
 * hydrates this exact markup (`hydrateFromPayload` in main.jsx). Markers cost a
 * few bytes per page and buy a mismatch-free hydration.
 */
import { renderToString } from 'react-dom/server'
import { StrictMode } from 'react'
import { StaticRouter } from 'react-router-dom'
import App from '../App.jsx'

/**
 * Render one route.
 *
 * @param {string} basename  the app's router basename (`''` for a root deploy,
 *                           `/FOSS-Atlas` for the GitHub Pages project site)
 * @param {string} location  the full location for this deploy, basename included
 *                           (`/FOSS-Atlas/wiki/syncthing/`, or `/wiki/syncthing/`
 *                           for a root deploy) — `StaticRouter` matches nothing
 *                           when it does not start with `basename`
 */
export function renderRoute({ basename, location }) {
  return renderToString(
    <StrictMode>
      <StaticRouter basename={basename} location={location}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}
