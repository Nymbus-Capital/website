// chunk-recover.ts — reload once when a lazily loaded animation chunk is gone after a redeploy
const KEY = "nymbus-chunk-reload";

/** True for the errors a stale page gets when its chunk files were replaced by a new deployment. */
function isChunkError(e: unknown): boolean {
  const msg = e instanceof Error ? `${e.name} ${e.message}` : String(e);
  return /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed|error loading dynamically/i.test(
    msg,
  );
}

/** Logs an animation start failure; on a stale chunk, reloads the page once per session to pick up the new build. */
export function recoverFromChunkError(e: unknown, where: string): void {
  console.error(`[fx] ${where} failed to start`, e);
  if (typeof window === "undefined" || !isChunkError(e)) return;
  try {
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    return;
  }
  window.location.reload();
}
