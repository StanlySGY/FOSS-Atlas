import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { readPrerenderPayload } from './lib/wikiPrefill.js'
import './index.css'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')
const container = document.getElementById('root')

const app = (
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
)

/*
 * `scripts/prerender.mjs` ships wiki routes as real HTML, and the payload that
 * produced it rides along in the document (`wikiPrefill`). When it is there the
 * markup is already the article the reader came for, so the client hydrates it:
 * the text is interactive as soon as the bundle lands, with no spinner and no
 * second fetch of the markdown.
 *
 * When it is not — the SPA fallback, a client-side navigation, `npm run dev` —
 * `#root` is empty and the normal replace-render path runs unchanged.
 */
const prerendered = readPrerenderPayload()

if (prerendered) {
  // No options: react-dom's `hydrateRoot` reads only strictMode/identifierPrefix/
  // onRecoverableError/formState, so anything else here would be silently ignored
  // (and `hydrate` is an option of `createRoot`, where it only warns).
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
