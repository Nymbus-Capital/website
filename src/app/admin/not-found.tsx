import Link from "next/link";

export default function AdminNotFound() {
  return (
    <section className="adm-panel">
      <h2 className="adm-h2">
        <span className="adm-mark" /> not found
      </h2>
      <p className="adm-muted">This admin page or record does not exist.</p>
      <Link className="adm-link" href="/admin">
        ← dashboard
      </Link>
    </section>
  );
}
