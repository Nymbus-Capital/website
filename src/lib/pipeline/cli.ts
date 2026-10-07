/**
 * npm run pipeline -- run [--dry-run]   one run now (uses the environment: DATAPLATFORM_URL, GRAPH_* …)
 * npm run pipeline -- status            scheduler / last run / published run
 * npm run pipeline -- sample            regenerate src/lib/data/sample-site-data.json from the synthetic fixtures
 * npm run pipeline -- publish <id>      publish (approve / roll back to) a stored run
 */
import os from "node:os";
import { pipelineStatus, publishRun, runPipeline } from "./run.ts";

const who = (): string => {
  try {
    return `cli:${os.userInfo().username}`;
  } catch {
    return "cli";
  }
};

async function main(argv: string[]): Promise<number> {
  const [cmd, ...rest] = argv;
  switch (cmd) {
    case "run": {
      const r = await runPipeline({ trigger: "cli", by: who(), dryRun: rest.includes("--dry-run") });
      if ("locked" in r) {
        console.error("another pipeline run is in progress");
        return 2;
      }
      console.log(`run ${r.id}: ${r.status}${r.publishedAt ? " (published)" : ""}`);
      console.log(`as of: ${JSON.stringify(r.asOf)}`);
      for (const s of r.sources) console.log(`  ${s.ok ? "ok  " : "FAIL"} ${s.name}${s.detail ? `: ${s.detail}` : ""}`);
      for (const [k, v] of Object.entries(r.funds)) console.log(`  ${k}: ${v}`);
      for (const i of r.issues) console.log(`  [${i.level}] ${i.key}: ${i.message}`);
      return r.status === "failed" ? 1 : 0;
    }
    case "status": {
      console.log(JSON.stringify(await pipelineStatus(), null, 2));
      return 0;
    }
    case "publish": {
      if (!rest[0]) {
        console.error("usage: pipeline publish <run-id>");
        return 64;
      }
      const r = await publishRun(rest[0], who());
      console.log(`run ${r.id} published at ${r.publishedAt}`);
      return 0;
    }
    case "sample": {
      const { writeSample, SAMPLE_PATH } = await import("./sample.ts");
      const d = await writeSample();
      console.log(
        `sample written to ${SAMPLE_PATH} (${Object.keys(d.funds).length} funds, as of ${JSON.stringify(d.asOf)})`,
      );
      return 0;
    }
    default:
      console.error("usage: npm run pipeline -- run [--dry-run] | status | sample | publish <run-id>");
      return 64;
  }
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (e: unknown) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  },
);
