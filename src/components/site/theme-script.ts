/**
 * Runs in <head> before first paint (inline, allowed by the per-request CSP nonce that src/app/layout.tsx puts on it):
 *  - marks the document `js` so reveal animations may start hidden (no-JS visitors and crawlers see everything),
 *  - failsafe: if the app has not hydrated after 6 s (script error, blocked bundle) the `js` mark is removed
 *    so nothing stays invisible.
 * The site is light only (no theme switch).
 */
export const themeScript = `(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!window.__nyReady)d.classList.remove('js');},6000);})();`;
