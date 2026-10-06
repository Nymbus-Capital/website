// factsheets.ts — lookups in the monthly factsheet archives (newest block, same-class archive, printed month)
import type { FundSpec } from "../../../config/funds.ts";
import { factsheetClassAt, FUND_SOURCES } from "../fund-sources.ts";
import { fundMonthlyTableKey, isObj, parseMonthlyTable, type Obj } from "../parse.ts";
import type { RawPayloads } from "../raw.ts";

/** factsheet archive file name -> parsed month-keyed view, newest first */
export function factsheetFilesFor(raw: RawPayloads, file: "bonds_data" | "factsheet_data"): { name: string; month: string; data: Obj }[] {
  const out: { name: string; month: string; data: Obj }[] = [];
  const files = raw.factsheets.ok && raw.factsheets.data ? raw.factsheets.data.files : {};
  for (const [name, data] of Object.entries(files)) {
    const m = name.match(/^(bonds_data|factsheet_data)_(\d{4}-\d{2})\.json$/);
    if (!m || m[1] !== file || !isObj(data)) continue;
    out.push({ name, month: m[2], data });
  }
  return out.sort((a, b) => (a.month < b.month ? 1 : -1));
}

/** Newest archive block of the fund (or of `key`), optionally of one archive month. */
export function factsheetBlock(raw: RawPayloads, spec: FundSpec, month?: string, key?: string): { name: string; month: string; block: Obj } | null {
  const fs = FUND_SOURCES[spec.key].factsheet;
  if (!fs) return null;
  for (const f of factsheetFilesFor(raw, fs.file)) {
    if (month && f.month !== month) continue;
    const block = f.data[key ?? fs.key];
    if (isObj(block)) return { name: f.name, month: f.month, block };
  }
  return null;
}

/** newest factsheet archive having the fund whose published class is `classCode` (other classes are never used) */
export function sameClassArchive(raw: RawPayloads, spec: FundSpec, classCode: string): { name: string; month: string; block: Obj } | null {
  const fs = FUND_SOURCES[spec.key].factsheet;
  if (!fs) return null;
  for (const f of factsheetFilesFor(raw, fs.file)) {
    const block = f.data[fs.key];
    if (isObj(block) && factsheetClassAt(spec.key, f.month) === classCode) return { name: f.name, month: f.month, block };
  }
  return null;
}

/** a same-class factsheet monthly table's printed return for `month`, with its print tolerance, or null */
export function factsheetMonthValue(raw: RawPayloads, spec: FundSpec, classCode: string, month: string): { value: number; tol: number; name: string } | null {
  const fsb = sameClassArchive(raw, spec, classCode);
  const tk = fsb ? fundMonthlyTableKey(fsb.block, "Net") : null;
  if (!fsb || !tk) return null;
  const { points, decimals } = parseMonthlyTable(fsb.block[tk]);
  const pt = points.find((x) => x.month === month);
  return pt ? { value: pt.r, tol: (0.5 * 10 ** -(decimals[pt.month] ?? 1)) / 100 + 1e-9, name: fsb.name } : null;
}
