import { test } from "node:test";
import assert from "node:assert/strict";
import { FUNDS } from "../../../src/config/funds.ts";
import { toPublicData, toPublicSpec } from "../../../src/components/fund/types.ts";
import type { FundData } from "../../../src/lib/data/types.ts";

test("public fund spec keeps only the basis of the internal sources", () => {
  for (const spec of FUNDS) {
    const pub = toPublicSpec(spec);
    assert.deepEqual(pub.sources, { basis: spec.sources.basis });
    const json = JSON.stringify(pub);
    for (const secret of [spec.sources.dataplatform, spec.sources.ftseIndex, spec.sources.factsheet?.key, spec.sources.factsheet?.file]) {
      if (secret) assert.equal(json.includes(`"${secret}"`), false, `${spec.key} leaks ${secret}`);
    }
    assert.equal(pub.name.en, spec.name.en);
  }
});

test("public fund data drops sourceName", () => {
  const data = { key: "monthly-income", sourceName: "dataplatform SEST / analytics X", performance: null } as unknown as FundData;
  const pub = toPublicData(data)!;
  assert.equal("sourceName" in pub, false);
  assert.equal(pub.key, "monthly-income");
  assert.equal(toPublicData(null), null);
});
