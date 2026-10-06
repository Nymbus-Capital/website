#!/usr/bin/env node
/**
 * Exports the website's built-in team (src/data/team.ts) and news (src/components/site/home/news.ts) to a JSON file that
 * `wp nymbus import` loads into WordPress (wordpress/plugins/nymbus-site-content/includes/cli.php). Run once, when
 * WordPress goes live, so editors start from the current content instead of an empty site.
 *
 *   node --experimental-strip-types wordpress/scripts/import-from-site.mjs \
 *     [--site-url https://<website address>] [--out nymbus-import.json]
 *
 *   --site-url  makes the photo paths absolute (https) so `wp nymbus import --photos` can download them from the
 *               running website; without it the file carries no photos.
 *   --out       file to write (default: standard output).
 *
 * Then, on the WordPress service (Northflank shell; `wp` is in the image):
 *   wp nymbus import nymbus-import.json --dry-run      # lists create / skip, changes nothing
 *   wp nymbus import nymbus-import.json --photos       # imports; existing items (same slug) are left alone
 *
 * Read-only on the repository. Only public website content is exported (what www.nymbus.ca already shows).
 */
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const DEPARTMENTS = ["Leadership", "Quantitative Research", "Investment Team", "Operations", "Board"];

/** "Léana D’Imperio" → "leana-d-imperio" (the WordPress slug). */
export function slugOf(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Absolute https photo URL on the website, or null. */
export function photoUrl(photo, siteUrl) {
  if (!photo || !siteUrl) return null;
  try {
    const u = new URL(photo, siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`);
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

/**
 * The import document. Team order: 10, 20, 30… in the order of the built-in list, so the website shows people exactly
 * as today; the gaps let editors slip someone in between (e.g. 25).
 */
export function buildImport(team, news, siteUrl = null) {
  const people = team.map((m, i) => {
    if (!DEPARTMENTS.includes(m.department)) throw new Error(`${m.name}: unknown department ${m.department}`);
    return {
      slug: slugOf(m.name),
      name: m.name,
      department: m.department,
      additionalDepartments: (m.additionalDepartments ?? []).filter((d) => d !== m.department),
      order: (i + 1) * 10,
      role: { en: m.title ?? "", fr: m.titleFr ?? "" },
      bio: { en: m.bio ?? "", fr: m.bioFr ?? "" },
      previousRoles: { en: m.previousRoles ?? [], fr: m.previousRolesFr ?? [] },
      designations: m.designations ?? [],
      education: m.education ?? [],
      yearJoined: Number.isInteger(m.yearJoined) ? m.yearJoined : null,
      linkedin: m.linkedin ?? null,
      photo: photoUrl(m.photo, siteUrl),
    };
  });
  const items = news.map((n) => ({
    slug: n.id,
    date: n.date,
    category: n.category,
    title: n.title,
    summary: n.summary,
    body: n.body,
    link: null,
    image: null,
  }));
  return { format: "nymbus-site-import", version: 1, news: items, team: people };
}

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null;
}

async function main(argv) {
  const siteUrl = arg(argv, "--site-url");
  if (siteUrl && !/^https:\/\/[^\s/]+/.test(siteUrl)) throw new Error("--site-url must be an https address");
  const out = arg(argv, "--out");
  const { team } = await import("../../src/data/team.ts");
  const { NEWS } = await import("../../src/components/site/home/news.ts");
  const doc = buildImport(team, NEWS, siteUrl);
  const json = `${JSON.stringify(doc, null, 2)}\n`;
  if (out) writeFileSync(out, json);
  else process.stdout.write(json);
  process.stderr.write(`${doc.team.length} team members, ${doc.news.length} news items${siteUrl ? `, photos from ${siteUrl}` : ", no photos (add --site-url)"}${out ? ` → ${out}` : ""}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).catch((e) => { process.stderr.write(`${e.message}\n`); process.exit(1); });
}
