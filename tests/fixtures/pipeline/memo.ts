// memo.ts — build a pipeline baseline once per test file and hand every caller its own deep copy.
import { CHAIN, CLASS_CHECKS, CLASS_SPREAD, DISTRIBUTIONS, PIPELINE_FUNDS, PORTFOLIO, TOL } from "../../../src/lib/pipeline/config.ts";
import { FUND_SOURCES } from "../../../src/lib/pipeline/fund-sources.ts";
import { FUNDS } from "../../../src/config/funds.ts";

/** Fingerprint of the module configuration a build reads (a test that mutates it must build fresh). */
export const configPrint = (): string =>
  JSON.stringify({ PIPELINE_FUNDS, TOL, CLASS_CHECKS, CLASS_SPREAD, CHAIN, PORTFOLIO, DISTRIBUTIONS, FUND_SOURCES, FUNDS });

const LOADED = configPrint();

/** Throws when the module configuration differs from what it was when the test file loaded. */
export function assertConfigUntouched(): void {
  if (configPrint() !== LOADED) throw new Error("pipeline config was mutated: a memoised baseline would be poisoned; build fresh in that test");
}

/**
 * Memoise `make` (a pure fetch / build of the unaltered fixtures). The first call runs it; every call returns a
 * structuredClone. Each call checks that no test has mutated the module configuration first.
 */
export function once<T>(make: () => Promise<T>): () => Promise<T> {
  let value: Promise<T> | undefined;
  return async () => {
    assertConfigUntouched();
    value ??= make();
    return structuredClone(await value);
  };
}
