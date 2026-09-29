"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="adm-panel" role="alert">
      <h2 className="adm-h2"><span className="adm-mark" /> something went wrong</h2>
      <p className="adm-muted">{error.digest ? `Error reference ${error.digest}.` : "The page could not be loaded."}</p>
      <div className="adm-actions">
        <button type="button" className="adm-btn" onClick={reset}>try again</button>
        <form method="post" action="/api/auth/logout"><button type="submit" className="adm-btn ghost">sign out</button></form>
      </div>
    </section>
  );
}
