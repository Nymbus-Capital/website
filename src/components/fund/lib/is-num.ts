// is-num.ts — the finite-number guard every fund-page selector uses


export const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
