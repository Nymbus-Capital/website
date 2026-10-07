#!/usr/bin/env node
/**
 * Exports the website's built-in team (src/data/team.ts) and news (src/components/site/home/news.ts) to a JSON file that
 * `wp nymbus import` loads into WordPress (wordpress/plugins/nymbus-site-content/includes/cli.php). Run once, when
 * WordPress goes live, so editors start from the current content instead of an empty site. The mapping itself is
 * src/lib/cms/export.ts (unit tested).
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
 * Read-only on the repository. Only public website content is exported (what the website already shows).
 */
import { writeFileSync } from "node:fs";

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null;
}

async function main(argv) {
  const siteUrl = arg(argv, "--site-url");
  if (siteUrl && !/^https:\/\/[^\s/]+/.test(siteUrl)) throw new Error("--site-url must be an https address");
  const out = arg(argv, "--out");
  const { buildImport } = await import("../../src/lib/cms/export.ts");
  const { team } = await import("../../src/data/team.ts");
  const { NEWS } = await import("../../src/components/site/home/news.ts");
  const doc = buildImport(team, NEWS, siteUrl);
  const json = `${JSON.stringify(doc, null, 2)}\n`;
  if (out) writeFileSync(out, json);
  else process.stdout.write(json);
  process.stderr.write(
    `${doc.team.length} team members, ${doc.news.length} news items${siteUrl ? `, photos from ${siteUrl}` : ", no photos (add --site-url)"}${out ? ` → ${out}` : ""}\n`,
  );
}

main(process.argv.slice(2)).catch((e) => {
  process.stderr.write(`${e.message}\n`);
  process.exit(1);
});
