/**
 * Factsheet archives (factsheet-generator output): `bonds_data_YYYY-MM.json` and
 * `factsheet_data_YYYY-MM.json`, from a local folder (FACTSHEET_DATA_DIR) or SharePoint through Graph
 * (`${FICHES_BASE_PATH}/_data/<file>`). The target month and up to two previous months are tried; every
 * file found is returned (the build picks, per fund, the newest month that has the fund).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { FactsheetFiles, SourceResult } from "../raw.ts";
import { addMonths } from "../metrics.ts";
import { errMsg, type FetchImpl } from "./http.ts";
import { graphConfig, graphDownload } from "./graph.ts";

export const FACTSHEET_PREFIXES = ["bonds_data", "factsheet_data"] as const;

export function candidateFiles(targetMonth: string, back = 2): string[] {
  const out: string[] = [];
  for (let i = 0; i <= back; i++) {
    const ym = addMonths(targetMonth, -i).slice(0, 7);
    for (const p of FACTSHEET_PREFIXES) out.push(`${p}_${ym}.json`);
  }
  return out;
}

/** Python's json.dump writes bare NaN / Infinity: turn them into null before JSON.parse. */
export function parseLooseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // replace NaN/Infinity tokens outside strings
    let out = "";
    let inStr = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inStr) {
        out += ch;
        if (ch === "\\") {
          out += text[++i] ?? "";
        } else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') {
        inStr = true;
        out += ch;
        continue;
      }
      const rest = text.slice(i, i + 9);
      const m = rest.match(/^(-?Infinity|NaN)/);
      if (m) {
        out += "null";
        i += m[1].length - 1;
        continue;
      }
      out += ch;
    }
    return JSON.parse(out);
  }
}

export async function fetchFactsheets(targetMonth: string, fetchImpl: FetchImpl, env: NodeJS.ProcessEnv = process.env): Promise<SourceResult<FactsheetFiles>> {
  const tried = candidateFiles(targetMonth);
  const files: Record<string, unknown> = {};
  const errors: string[] = [];
  const dir = env.FACTSHEET_DATA_DIR;
  const graph = graphConfig(env);
  let where: string;
  if (dir) {
    where = "local folder";
    for (const fn of tried) {
      try {
        files[fn] = parseLooseJson(await fs.readFile(path.join(dir, fn), "utf8"));
      } catch (e: unknown) {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") errors.push(`${fn}: ${errMsg(e)}`);
      }
    }
  } else if (graph) {
    where = "SharePoint";
    const base = (env.FICHES_BASE_PATH || "Business Development/Fiches d'infos").replace(/\/+$/, "");
    for (const fn of tried) {
      try {
        const bytes = await graphDownload(graph, fetchImpl, `${base}/_data/${fn}`);
        if (bytes) files[fn] = parseLooseJson(new TextDecoder().decode(bytes));
      } catch (e: unknown) {
        errors.push(`${fn}: ${errMsg(e)}`);
        // a failing Graph (auth, network) fails every file the same way: stop early
        if (/token|HTTP 40[13]/.test(errMsg(e))) break;
      }
    }
  } else {
    return { ok: false, data: null, error: "factsheets: neither FACTSHEET_DATA_DIR nor GRAPH_* configured" };
  }
  const found = Object.keys(files);
  if (!found.length) {
    return { ok: false, data: null, error: `factsheets (${where}): no archive found for ${tried[0].slice(-12, -5)} or the 2 previous months${errors.length ? `; ${errors.join("; ")}` : ""}` };
  }
  return { ok: true, data: { files, tried, where }, detail: `${where}: ${found.join(", ")}${errors.length ? `; errors: ${errors.join("; ")}` : ""}` };
}
