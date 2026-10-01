/**
 * Read the tail of `audit/audit.jsonl` (newest first). Server only; reads at most the last 1 MB of the file.
 */
import { promises as fs } from "node:fs";
import { p } from "../../lib/data/store.ts";
import type { AuditEntry } from "../../lib/data/store.ts";

export async function readAuditTail(limit = 200): Promise<AuditEntry[]> {
  const file = p("audit", "audit.jsonl");
  let fh: Awaited<ReturnType<typeof fs.open>>;
  try {
    fh = await fs.open(file, "r");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
  try {
    const { size } = await fh.stat();
    const len = Math.min(size, 1024 * 1024);
    const buf = Buffer.alloc(len);
    await fh.read(buf, 0, len, size - len);
    const lines = buf.toString("utf8").split("\n");
    if (len < size) lines.shift(); // first line may be partial
    const out: AuditEntry[] = [];
    for (let i = lines.length - 1; i >= 0 && out.length < limit; i--) {
      const l = lines[i].trim();
      if (!l) continue;
      try {
        const e = JSON.parse(l) as AuditEntry;
        if (e && typeof e.at === "string" && typeof e.action === "string") out.push(e);
      } catch {
        /* skip corrupt line */
      }
    }
    return out;
  } finally {
    await fh.close();
  }
}
