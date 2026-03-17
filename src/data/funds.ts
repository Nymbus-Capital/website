export interface MonthlyReturn {
  month: string;
  value: number;
}

export interface CalendarYearReturn {
  year: number;
  fund: number;
  benchmark?: number;
}

export interface CreditQuality {
  rating: string;
  weight: number;
}

export interface SectorAllocation {
  sector: string;
  weight: number;
}

export interface TopHolding {
  name: string;
  weight: number;
  coupon?: string;
  maturity?: string;
}

export interface Distribution {
  frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  lastAmount?: string;
  yield?: number;
}

export interface RiskMetrics {
  sharpe: number;
  sortino?: number;
  maxDrawdown?: number;
  standardDeviation?: number;
  beta?: number;
  alpha?: number;
  trackingError?: number;
  informationRatio?: number;
  downsideDeviation?: number;
  upCaptureRatio?: number;
  downCaptureRatio?: number;
}

export interface PortfolioCharacteristics {
  duration?: number;
  yieldToMaturity?: number;
  avgCreditRating?: string;
  numberOfHoldings?: number;
  avgCoupon?: number;
  weightedAvgLife?: number;
  currentYield?: number;
  modifiedDuration?: number;
}

export interface Fund {
  slug: string;
  name: string;
  shortName: string;
  type: "mutual-fund" | "strategy";
  assetClass: "Fixed Income" | "Alternatives" | "Multi-Asset";
  vehicle: "Mutual Fund" | "Managed Account";
  fundCode?: string;
  cusip?: string;
  benchmark?: string;
  inceptionDate: string;
  aum?: string;
  mer?: string;
  currency: string;
  minInvestment: string;
  navPerUnit?: string;
  returns: { ytd: number; oneYear: number; threeYear?: number; fiveYear?: number; sinceInception: number };
  monthlyReturns?: MonthlyReturn[];
  calendarYearReturns?: CalendarYearReturn[];
  creditQuality?: CreditQuality[];
  sectorAllocation?: SectorAllocation[];
  topHoldings?: TopHolding[];
  distribution?: Distribution;
  riskMetrics?: RiskMetrics;
  portfolioCharacteristics?: PortfolioCharacteristics;
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
    cusip: "50218T102",
    benchmark: "FTSE Canada Universe Bond Index",
    inceptionDate: "2019-01-01",
    aum: "$485M",
    mer: "0.65%",
    currency: "CAD",
    minInvestment: "$1,000",
    navPerUnit: "$9.82",
    returns: {
      ytd: 1.2,
      oneYear: 7.8,
      threeYear: 2.1,
      fiveYear: 3.4,
      sinceInception: 4.2,
    },
    monthlyReturns: [
      { month: 'Jan', value: 0.5 }, { month: 'Feb', value: -0.2 }, { month: 'Mar', value: 0.8 },
      { month: 'Apr', value: 0.3 }, { month: 'May', value: -0.1 }, { month: 'Jun', value: 0.7 },
      { month: 'Jul', value: 0.4 }, { month: 'Aug', value: 0.6 }, { month: 'Sep', value: -0.3 },
      { month: 'Oct', value: 0.9 }, { month: 'Nov', value: 0.5 }, { month: 'Dec', value: 0.3 },
    ],
    calendarYearReturns: [
      { year: 2024, fund: 7.8, benchmark: 6.9 },
      { year: 2023, fund: 6.4, benchmark: 6.7 },
      { year: 2022, fund: -10.2, benchmark: -11.7 },
      { year: 2021, fund: -2.1, benchmark: -2.5 },
      { year: 2020, fund: 8.7, benchmark: 8.7 },
      { year: 2019, fund: 7.2, benchmark: 6.9 },
    ],
    creditQuality: [
      { rating: 'AAA', weight: 32.5 },
      { rating: 'AA', weight: 18.2 },
      { rating: 'A', weight: 24.8 },
      { rating: 'BBB', weight: 20.1 },
      { rating: 'BB', weight: 3.2 },
      { rating: 'Cash', weight: 1.2 },
    ],
    sectorAllocation: [
      { sector: 'Federal Bonds', weight: 28.4 },
      { sector: 'Provincial Bonds', weight: 22.1 },
      { sector: 'Corporate IG', weight: 35.2 },
      { sector: 'Green Bonds', weight: 8.5 },
      { sector: 'Supranational', weight: 4.6 },
      { sector: 'Cash & Equiv.', weight: 1.2 },
    ],
    topHoldings: [
      { name: 'Canada 2.75% Jun 2029', weight: 5.8, coupon: '2.75%', maturity: 'Jun 2029' },
      { name: 'Ontario 3.50% Jun 2043', weight: 4.2, coupon: '3.50%', maturity: 'Jun 2043' },
      { name: 'Quebec 2.60% Jul 2028', weight: 3.9, coupon: '2.60%', maturity: 'Jul 2028' },
      { name: 'RBC 3.20% Sep 2026', weight: 3.1, coupon: '3.20%', maturity: 'Sep 2026' },
      { name: 'TD Bank 4.10% Mar 2028', weight: 2.8, coupon: '4.10%', maturity: 'Mar 2028' },
      { name: 'Hydro-Quebec Green 2.90% Feb 2031', weight: 2.5, coupon: '2.90%', maturity: 'Feb 2031' },
      { name: 'BMO 3.80% Nov 2027', weight: 2.3, coupon: '3.80%', maturity: 'Nov 2027' },
      { name: 'BC Province 3.25% Dec 2033', weight: 2.1, coupon: '3.25%', maturity: 'Dec 2033' },
      { name: 'Enbridge Pipelines 4.45% Apr 2030', weight: 1.9, coupon: '4.45%', maturity: 'Apr 2030' },
      { name: 'CIBC 3.95% Aug 2029', weight: 1.8, coupon: '3.95%', maturity: 'Aug 2029' },
    ],
    distribution: {
      frequency: 'Quarterly',
      lastAmount: '$0.065',
      yield: 3.42,
    },
    riskMetrics: {
      sharpe: 0.82,
      sortino: 1.15,
      maxDrawdown: -12.8,
      standardDeviation: 5.1,
      beta: 0.95,
      alpha: 0.35,
      trackingError: 0.82,
      informationRatio: 0.43,
      downsideDeviation: 3.2,
      upCaptureRatio: 102,
      downCaptureRatio: 91,
    },
    portfolioCharacteristics: {
      duration: 7.2,
      yieldToMaturity: 3.85,
      avgCreditRating: 'A+',
      numberOfHoldings: 142,
      avgCoupon: 3.15,
      weightedAvgLife: 9.4,
      currentYield: 3.42,
      modifiedDuration: 6.9,
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
    cusip: "50218T201",
    benchmark: "FTSE Canada Short-Term Bond Index",
    inceptionDate: "2020-06-01",
    aum: "$310M",
    mer: "0.55%",
    currency: "CAD",
    minInvestment: "$1,000",
    navPerUnit: "$9.95",
    returns: {
      ytd: 1.8,
      oneYear: 5.2,
      threeYear: 3.1,
      sinceInception: 3.8,
    },
    monthlyReturns: [
      { month: 'Jan', value: 0.4 }, { month: 'Feb', value: 0.3 }, { month: 'Mar', value: 0.5 },
      { month: 'Apr', value: 0.2 }, { month: 'May', value: 0.1 }, { month: 'Jun', value: 0.3 },
      { month: 'Jul', value: 0.3 }, { month: 'Aug', value: 0.4 }, { month: 'Sep', value: 0.1 },
      { month: 'Oct', value: 0.5 }, { month: 'Nov', value: 0.3 }, { month: 'Dec', value: 0.2 },
    ],
    calendarYearReturns: [
      { year: 2024, fund: 5.2, benchmark: 4.8 },
      { year: 2023, fund: 5.1, benchmark: 4.6 },
      { year: 2022, fund: -3.8, benchmark: -4.0 },
      { year: 2021, fund: -0.5, benchmark: -0.6 },
      { year: 2020, fund: 4.2, benchmark: 4.0 },
    ],
    creditQuality: [
      { rating: 'AAA', weight: 15.8 },
      { rating: 'AA', weight: 22.5 },
      { rating: 'A', weight: 32.1 },
      { rating: 'BBB', weight: 25.4 },
      { rating: 'Cash', weight: 4.2 },
    ],
    sectorAllocation: [
      { sector: 'Corporate IG', weight: 45.2 },
      { sector: 'Federal Bonds', weight: 15.8 },
      { sector: 'Provincial Bonds', weight: 18.4 },
      { sector: 'Covered Bonds', weight: 8.6 },
      { sector: 'Green Bonds', weight: 5.2 },
      { sector: 'Mortgage Bonds', weight: 2.6 },
      { sector: 'Cash & Equiv.', weight: 4.2 },
    ],
    topHoldings: [
      { name: 'Canada 1.50% Jun 2026', weight: 4.5, coupon: '1.50%', maturity: 'Jun 2026' },
      { name: 'RBC 3.60% Apr 2026', weight: 3.8, coupon: '3.60%', maturity: 'Apr 2026' },
      { name: 'TD Bank 4.25% Jan 2027', weight: 3.5, coupon: '4.25%', maturity: 'Jan 2027' },
      { name: 'Ontario 2.40% Sep 2026', weight: 3.2, coupon: '2.40%', maturity: 'Sep 2026' },
      { name: 'BMO Covered 3.10% May 2027', weight: 2.9, coupon: '3.10%', maturity: 'May 2027' },
      { name: 'CIBC 3.85% Jul 2026', weight: 2.7, coupon: '3.85%', maturity: 'Jul 2026' },
      { name: 'Desjardins Green 3.40% Nov 2026', weight: 2.4, coupon: '3.40%', maturity: 'Nov 2026' },
      { name: 'Scotiabank 4.05% Feb 2027', weight: 2.2, coupon: '4.05%', maturity: 'Feb 2027' },
      { name: 'Quebec 2.30% Mar 2027', weight: 2.0, coupon: '2.30%', maturity: 'Mar 2027' },
      { name: 'National Bank 3.70% Aug 2026', weight: 1.8, coupon: '3.70%', maturity: 'Aug 2026' },
    ],
    distribution: {
      frequency: 'Monthly',
      lastAmount: '$0.032',
      yield: 3.85,
    },
    riskMetrics: {
      sharpe: 1.12,
      sortino: 1.68,
      maxDrawdown: -4.2,
      standardDeviation: 2.4,
      beta: 0.88,
      alpha: 0.42,
      trackingError: 0.55,
      informationRatio: 0.76,
      downsideDeviation: 1.8,
      upCaptureRatio: 105,
      downCaptureRatio: 85,
    },
    portfolioCharacteristics: {
      duration: 2.4,
      yieldToMaturity: 4.15,
      avgCreditRating: 'A',
      numberOfHoldings: 98,
      avgCoupon: 3.45,
      weightedAvgLife: 2.8,
      currentYield: 3.85,
      modifiedDuration: 2.3,
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
    cusip: "50218T301",
    benchmark: "HFRI Fund Weighted Composite Index",
    inceptionDate: "2014-01-01",
    aum: "$420M",
    mer: "1.85%",
    currency: "CAD",
    minInvestment: "$1,000",
    navPerUnit: "$22.45",
    returns: {
      ytd: 3.2,
      oneYear: 8.5,
      threeYear: 5.1,
      fiveYear: 7.2,
      sinceInception: 12.8,
    },
    monthlyReturns: [
      { month: 'Jan', value: 1.2 }, { month: 'Feb', value: 0.8 }, { month: 'Mar', value: -0.4 },
      { month: 'Apr', value: 1.5 }, { month: 'May', value: 0.6 }, { month: 'Jun', value: -0.2 },
      { month: 'Jul', value: 1.8 }, { month: 'Aug', value: -0.6 }, { month: 'Sep', value: 0.9 },
      { month: 'Oct', value: 1.4 }, { month: 'Nov', value: 0.7 }, { month: 'Dec', value: 1.1 },
    ],
    calendarYearReturns: [
      { year: 2024, fund: 8.5, benchmark: 5.2 },
      { year: 2023, fund: 12.1, benchmark: 6.4 },
      { year: 2022, fund: 3.8, benchmark: -4.2 },
      { year: 2021, fund: 15.2, benchmark: 10.3 },
      { year: 2020, fund: 9.4, benchmark: 6.8 },
      { year: 2019, fund: 14.8, benchmark: 10.4 },
      { year: 2018, fund: 5.2, benchmark: -0.8 },
      { year: 2017, fund: 11.6, benchmark: 7.7 },
      { year: 2016, fund: 8.9, benchmark: 5.5 },
      { year: 2015, fund: 6.4, benchmark: -1.1 },
    ],
    sectorAllocation: [
      { sector: 'Fixed Income Enhancement', weight: 35.0 },
      { sector: 'Managed Futures (CTA)', weight: 22.5 },
      { sector: 'Equity Market Neutral', weight: 15.0 },
      { sector: 'Volatility Arbitrage', weight: 12.5 },
      { sector: 'Dynamic Asset Allocation', weight: 10.0 },
      { sector: 'Cash & Collateral', weight: 5.0 },
    ],
    distribution: {
      frequency: 'Annual',
      lastAmount: '$1.85',
    },
    riskMetrics: {
      sharpe: 0.65,
      sortino: 0.92,
      maxDrawdown: -15.4,
      standardDeviation: 8.2,
      beta: 0.18,
      alpha: 8.5,
      downsideDeviation: 7.5,
      upCaptureRatio: 45,
      downCaptureRatio: 12,
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
    benchmark: "MSCI World Minimum Volatility Index",
    inceptionDate: "2015-01-01",
    aum: "$285M",
    currency: "USD",
    minInvestment: "$5,000,000",
    returns: {
      ytd: 2.1,
      oneYear: 6.3,
      threeYear: 4.8,
      fiveYear: 5.5,
      sinceInception: 6.1,
    },
    monthlyReturns: [
      { month: 'Jan', value: 0.8 }, { month: 'Feb', value: 0.4 }, { month: 'Mar', value: -0.2 },
      { month: 'Apr', value: 0.6 }, { month: 'May', value: 0.3 }, { month: 'Jun', value: -0.1 },
      { month: 'Jul', value: 0.9 }, { month: 'Aug', value: -0.5 }, { month: 'Sep', value: 0.4 },
      { month: 'Oct', value: 0.7 }, { month: 'Nov', value: 0.5 }, { month: 'Dec', value: 0.3 },
    ],
    calendarYearReturns: [
      { year: 2024, fund: 6.3, benchmark: 5.8 },
      { year: 2023, fund: 7.2, benchmark: 7.9 },
      { year: 2022, fund: -5.8, benchmark: -12.2 },
      { year: 2021, fund: 14.2, benchmark: 16.5 },
      { year: 2020, fund: 2.1, benchmark: -1.8 },
      { year: 2019, fund: 18.5, benchmark: 22.4 },
      { year: 2018, fund: -2.4, benchmark: -5.2 },
      { year: 2017, fund: 12.8, benchmark: 15.2 },
      { year: 2016, fund: 7.5, benchmark: 8.1 },
    ],
    sectorAllocation: [
      { sector: 'Global Equities (Low Vol)', weight: 42.0 },
      { sector: 'Fixed Income Overlay', weight: 25.0 },
      { sector: 'Currency Hedging', weight: 12.0 },
      { sector: 'Derivatives Overlay', weight: 11.0 },
      { sector: 'Real Assets', weight: 5.0 },
      { sector: 'Cash & Collateral', weight: 5.0 },
    ],
    riskMetrics: {
      sharpe: 0.91,
      sortino: 1.32,
      maxDrawdown: -8.2,
      standardDeviation: 6.8,
      beta: 0.52,
      alpha: 2.8,
      downsideDeviation: 5.1,
      upCaptureRatio: 62,
      downCaptureRatio: 38,
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