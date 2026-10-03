/** Every Global Minimum Volatility figure names its downside volatility variant (the ~10 %/yr record is the 6 % variant). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fundSpec, shownVariant } from "../../../src/config/funds.ts";
import { toFundCard } from "../../../src/components/site/home/data.ts";
import { summarizeFund } from "../../../src/components/admin/summary.ts";
import { DISCLAIMERS } from "../../../src/content/disclaimers.ts";
import sample from "../../../src/lib/data/sample-site-data.json" with { type: "json" };
import type { FundData, FundKey } from "../../../src/lib/data/types.ts";

const gmv = fundSpec("global-minimum-volatility")!;
const data = (key: FundKey) => (sample as unknown as { funds: Record<string, FundData> }).funds[key];

test("variants: selector label and full name (EN / FR); the default is 6", () => {
  assert.deepEqual(gmv.variants!.map((v) => v.id), ["6", "3", "9"]);
  assert.deepEqual(gmv.variants![0].label, { en: "6%", fr: "6 %" });
  assert.deepEqual(gmv.variants![0].name, { en: "6% downside volatility", fr: "volatilité à la baisse de 6 %" });
  assert.equal(shownVariant(gmv, "9")!.name.en, "9% downside volatility");
  assert.equal(shownVariant(gmv, undefined)!.id, "6", "no selection: the default variant");
  assert.equal(shownVariant(fundSpec("monthly-income")!, "6"), null, "no variants: no name");
});

test("home / strategies cards and the admin summary name the variant of the published returns", () => {
  const view = (key: FundKey) => ({ spec: fundSpec(key)!, content: {}, data: data(key), sample: true });
  const c = toFundCard(view("global-minimum-volatility") as never);
  assert.ok(c.si !== null, "the sample publishes GMV returns");
  assert.deepEqual(c.perfVariant, gmv.variants![0].name);
  assert.equal(toFundCard(view("monthly-income") as never).perfVariant, null);
  assert.equal(toFundCard({ ...view("global-minimum-volatility"), data: null } as never).perfVariant, null, "nothing published: no label");
  assert.equal(summarizeFund("global-minimum-volatility", data("global-minimum-volatility")).variant, "6% downside volatility");
  assert.equal(summarizeFund("monthly-income", data("monthly-income")).variant, null);
  assert.equal(summarizeFund("global-minimum-volatility", null).variant, null);
});

test("disclaimers: the GMV texts name the 6 % downside volatility variant (EN + FR)", () => {
  const g = DISCLAIMERS.find((d) => d.id === "gmvGross")!.text;
  assert.match(g.en, /6% downside volatility variant/);
  assert.match(g.fr, /volatilité à la baisse de 6 %/);
});
