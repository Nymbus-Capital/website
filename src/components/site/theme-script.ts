/**
 * Runs in <head> before first paint (inline, allowed by the per-request CSP nonce that src/app/layout.tsx puts on it):
 *  - applies the persisted theme ("light" | "dark"; "system" = no attribute, the CSS follows the OS),
 *  - marks the document `js` so reveal animations may start hidden (no-JS visitors and crawlers see everything),
 *  - failsafe: if the app has not hydrated after 6 s (script error, blocked bundle) the `js` mark is removed
 *    so nothing stays invisible.
 */
export const THEME_KEY = "nymbus-theme";
export type ThemeMode = "light" | "dark" | "system";

export const themeScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')d.setAttribute('data-theme',t);}catch(e){}setTimeout(function(){if(!window.__nyReady)d.classList.remove('js');},6000);})();`;
