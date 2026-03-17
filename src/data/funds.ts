export interface Fund {
  slug: string;
  name: string;
  shortName: string;
  type: "mutual-fund" | "strategy";
  assetClass: "Fixed Income" | "Alternatives" | "Multi-Asset";
  vehicle: "Mutual Fund" | "Managed Account";
  fundCode?: string;
  benchmark?: string;
  inceptionDate: string;
  aum?: string;
  mer?: string;
  currency: string;
  minInvestment: string;
  returns: { ytd: number; oneYear: number; threeYear?: number; fiveYear?: number; sinceInception: number };
  sharpe?: number;
  downsideVolatility?: number;
  annualReturn?: number;
  description: string;
  managers: string[];
}

export const funds: Fund[] = [
  {
    slug: "sustainable-enhanced-bonds",
    name: "Sustainable Enhanced Bonds",
    shortName: "SEB",
    type: "mutual-fund",
    assetClass: "Fixed Income",
    vehicle: "Mutual Fund",
    fundCode: "LDM201",
    benchmark: "FTSE Canada Universe Bond Index",
    inceptionDate: "2019-01-01",
    mer: "0.65%",
    currency: "CAD",
    minInvestment: "$1,000",
    returns: {
      ytd: 1.2,
      oneYear: 7.8,
      threeYear: 2.1,
      fiveYear: 3.4,
      sinceInception: 4.2,
    },
    sharpe: 0.82,
    downsideVolatility: 3.2,
    annualReturn: 4.2,
    description:
      "A systematic fixed income strategy that blends enhanced bond selection with sustainability principles, targeting outperformance against the FTSE Canada Universe Bond Index through disciplined research and ESG integration.",
    managers: ["Gabriel Cefaloni", "Mathieu Poulin-Brière"],
  },
  {
    slug: "sustainable-enhanced-short-term-bonds",
    name: "Monthly Income Fund",
    shortName: "Monthly Income",
    type: "mutual-fund",
    assetClass: "Fixed Income",
    vehicle: "Mutual Fund",
    fundCode: "LDM001",
    benchmark: "FTSE Canada Short-Term Bond Index",
    inceptionDate: "2020-06-01",
    mer: "0.55%",
    currency: "CAD",
    minInvestment: "$1,000",
    returns: {
      ytd: 1.8,
      oneYear: 5.2,
      threeYear: 3.1,
      sinceInception: 3.8,
    },
    sharpe: 1.12,
    downsideVolatility: 1.8,
    annualReturn: 3.8,
    description:
      "A systematically managed short-term fixed income strategy with embedded sustainability criteria, designed for investors seeking stable returns with lower duration risk and ESG alignment.",
    managers: ["Gabriel Cefaloni", "Mathieu Poulin-Brière"],
  },
  {
    slug: "multi-strategy",
    name: "Multi-Strategy Fund",
    shortName: "Multi-Strat",
    type: "mutual-fund",
    assetClass: "Alternatives",
    vehicle: "Mutual Fund",
    fundCode: "LDM301",
    inceptionDate: "2014-01-01",
    mer: "1.85%",
    currency: "CAD",
    minInvestment: "$1,000",
    returns: {
      ytd: 3.2,
      oneYear: 8.5,
      threeYear: 5.1,
      fiveYear: 7.2,
      sinceInception: 12.8,
    },
    sharpe: 0.65,
    downsideVolatility: 7.5,
    annualReturn: 12.8,
    description:
      "A diversified alternatives strategy combining fixed income enhancement, managed futures, and dynamic asset allocation to generate consistent returns across market conditions with low correlation to traditional equities.",
    managers: ["Gabriel Cefaloni", "Richard Langevin"],
  },
  {
    slug: "global-minimum-volatility",
    name: "Global Minimum Volatility",
    shortName: "GMV",
    type: "strategy",
    assetClass: "Alternatives",
    vehicle: "Managed Account",
    inceptionDate: "2015-01-01",
    currency: "USD",
    minInvestment: "$5,000,000",
    returns: {
      ytd: 2.1,
      oneYear: 6.3,
      threeYear: 4.8,
      fiveYear: 5.5,
      sinceInception: 6.1,
    },
    sharpe: 0.91,
    downsideVolatility: 5.1,
    annualReturn: 6.1,
    description:
      "A sophisticated multi-asset strategy employing quantitative optimization to construct low-volatility portfolios with global equity and fixed income exposure, ideal for institutional investors seeking smooth, stable returns.",
    managers: ["Gabriel Cefaloni", "Jason Laliberte"],
  },
];

export const fundBySlug = (slug: string): Fund | undefined => {
  return funds.find((fund) => fund.slug === slug);
};

export const fundsByAssetClass = (assetClass: Fund["assetClass"]): Fund[] => {
  return funds.filter((fund) => fund.assetClass === assetClass);
};