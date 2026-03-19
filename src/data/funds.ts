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
  rating?: string;
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

export interface GeographicBreakdown {
  region: string;
  weight: number;
}

export interface CompoundReturns {
  oneMonth?: number;
  threeMonth?: number;
  sixMonth?: number;
  ytd: number;
  oneYear: number;
  threeYear?: number;
  fiveYear?: number;
  tenYear?: number;
  sinceInception: number;
}

export interface DistributionHistory {
  exDate: string;
  payDate: string;
  amount: number;
  interest?: number;
  capitalGains?: number;
  returnOfCapital?: number;
}

export interface FundDocument {
  name: string;
  type: 'Fact Sheet' | 'Prospectus' | 'Annual Report' | 'Semi-Annual Report' | 'MRF' | 'Commentary' | 'ESG Report';
  date: string;
  url?: string;
}

export interface FundFees {
  managementFee: string;
  mer?: string;
  tradingExpenseRatio?: string;
  performanceFee?: string;
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
  minSubsequentInvestment?: string;
  navPerUnit?: string;
  navChange?: { dollar: number; percent: number; date: string };
  riskRating?: 'Low' | 'Low to Medium' | 'Medium' | 'Medium to High' | 'High';
  objectives?: string;
  investmentFocus?: string;
  liquidity?: string;
  rspEligible?: boolean;
  series?: string;
  returns: { ytd: number; oneYear: number; threeYear?: number; fiveYear?: number; sinceInception: number };
  compoundReturns?: CompoundReturns;
  monthlyReturns?: MonthlyReturn[];
  calendarYearReturns?: CalendarYearReturn[];
  creditQuality?: CreditQuality[];
  sectorAllocation?: SectorAllocation[];
  geographicBreakdown?: GeographicBreakdown[];
  topHoldings?: TopHolding[];
  distribution?: Distribution;
  distributionHistory?: DistributionHistory[];
  riskMetrics?: RiskMetrics;
  portfolioCharacteristics?: PortfolioCharacteristics;
  fees?: FundFees;
  fundDocuments?: FundDocument[];
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
    series: "F",
    benchmark: "FTSE Canada Universe Bond Index",
    inceptionDate: "2019-01-15",
    aum: "$485M",
    mer: "0.65%",
    currency: "CAD",
    minInvestment: "$1,000",
    minSubsequentInvestment: "$100",
    navPerUnit: "$9.82",
    navChange: { dollar: 0.03, percent: 0.31, date: "2025-03-14" },
    riskRating: "Low to Medium",
    objectives: "The fund seeks to generate returns that exceed the FTSE Canada Universe Bond Index over a full market cycle by investing primarily in Canadian fixed income securities, while integrating ESG factors into the investment process. The fund targets consistent income and capital preservation with a sustainability overlay.",
    investmentFocus: "Canadian investment-grade fixed income securities including government, provincial, and corporate bonds, with emphasis on green bonds and ESG-screened issuers. The fund systematically excludes fossil fuel producers, tobacco companies, and controversial weapons manufacturers.",
    liquidity: "Daily",
    rspEligible: true,
    returns: {
      ytd: 1.2,
      oneYear: 7.8,
      threeYear: 2.1,
      fiveYear: 3.4,
      sinceInception: 4.2,
    },
    compoundReturns: {
      oneMonth: 0.3,
      threeMonth: 1.2,
      sixMonth: 3.8,
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
    geographicBreakdown: [
      { region: 'Canada', weight: 82.4 },
      { region: 'United States', weight: 8.2 },
      { region: 'Supranational', weight: 4.6 },
      { region: 'Europe', weight: 3.6 },
      { region: 'Cash', weight: 1.2 },
    ],
    topHoldings: [
      { name: 'Canada 2.75% Jun 2029', weight: 5.8, coupon: '2.75%', maturity: 'Jun 2029', rating: 'AAA' },
      { name: 'Ontario 3.50% Jun 2043', weight: 4.2, coupon: '3.50%', maturity: 'Jun 2043', rating: 'AA-' },
      { name: 'Quebec 2.60% Jul 2028', weight: 3.9, coupon: '2.60%', maturity: 'Jul 2028', rating: 'AA-' },
      { name: 'RBC 3.20% Sep 2026', weight: 3.1, coupon: '3.20%', maturity: 'Sep 2026', rating: 'A+' },
      { name: 'TD Bank 4.10% Mar 2028', weight: 2.8, coupon: '4.10%', maturity: 'Mar 2028', rating: 'A+' },
      { name: 'Hydro-Quebec Green 2.90% Feb 2031', weight: 2.5, coupon: '2.90%', maturity: 'Feb 2031', rating: 'AA-' },
      { name: 'BMO 3.80% Nov 2027', weight: 2.3, coupon: '3.80%', maturity: 'Nov 2027', rating: 'A+' },
      { name: 'BC Province 3.25% Dec 2033', weight: 2.1, coupon: '3.25%', maturity: 'Dec 2033', rating: 'AA-' },
      { name: 'Scotiabank 4.15% Jun 2026', weight: 1.9, coupon: '4.15%', maturity: 'Jun 2026', rating: 'A' },
      { name: 'CIBC 3.95% Sep 2028', weight: 1.7, coupon: '3.95%', maturity: 'Sep 2028', rating: 'A' },
    ],
    distribution: { frequency: 'Monthly', lastAmount: '$0.058', yield: 3.2 },
    distributionHistory: [
      { exDate: '2025-02-28', payDate: '2025-03-10', amount: 0.058, interest: 0.058 },
      { exDate: '2025-01-31', payDate: '2025-02-10', amount: 0.057, interest: 0.057 },
      { exDate: '2024-12-31', payDate: '2025-01-10', amount: 0.059, interest: 0.059 },
    ],
    riskMetrics: {
      sharpe: 0.85,
      sortino: 1.12,
      maxDrawdown: -8.2,
      standardDeviation: 3.4,
      beta: 0.92,
      alpha: 0.6,
      trackingError: 0.45,
      informationRatio: 1.33,
      downsideDeviation: 2.1,
      upCaptureRatio: 85.3,
      downCaptureRatio: 72.4,
    },
    portfolioCharacteristics: {
      duration: 5.2,
      yieldToMaturity: 3.45,
      avgCreditRating: 'A+',
      numberOfHoldings: 324,
      avgCoupon: 2.85,
      weightedAvgLife: 6.1,
      currentYield: 3.2,
      modifiedDuration: 5.0,
    },
    fees: {
      managementFee: "0.65%",
      mer: "0.65%",
      tradingExpenseRatio: "0.02%",
      performanceFee: "None",
    },
    fundDocuments: [
      { name: 'Latest Fact Sheet', type: 'Fact Sheet', date: '2025-02-28', url: '#' },
      { name: 'Fund Prospectus', type: 'Prospectus', date: '2023-05-01', url: '#' },
      { name: 'Annual Report 2024', type: 'Annual Report', date: '2024-12-31', url: '#' },
    ],
    sharpe: 0.85,
    annualReturn: 7.8,
    description: "A sustainable bond fund designed for Canadian investors seeking income with environmental responsibility. Combines fixed income expertise with ESG integration.",
    managers: ["Nymbus Capital Inc."],
  },
  {
    slug: "multi-strategy-overlay",
    name: "Multi-Strategy Overlay Fund",
    shortName: "MSO",
    type: "strategy",
    assetClass: "Alternatives",
    vehicle: "Managed Account",
    fundCode: "LDM202",
    cusip: "50218T300",
    benchmark: "HFRI Fund Weighted Composite Index",
    inceptionDate: "2018-06-01",
    aum: "$320M",
    currency: "CAD",
    minInvestment: "$100,000",
    navPerUnit: "$12.45",
    navChange: { dollar: 0.08, percent: 0.65, date: "2025-03-14" },
    riskRating: "Medium",
    objectives: "The fund employs systematic overlay strategies to enhance returns across traditional portfolios. It combines quantitative signal generation with disciplined risk management to deliver consistent alpha.",
    investmentFocus: "Systematic tactical overlays on equity and fixed income exposures, including long/short strategies, volatility overlay, and macro-driven positioning.",
    liquidity: "Quarterly",
    returns: {
      ytd: 2.1,
      oneYear: 12.3,
      threeYear: 5.8,
      fiveYear: 6.2,
      sinceInception: 7.1,
    },
    riskMetrics: {
      sharpe: 1.15,
      sortino: 1.54,
      maxDrawdown: -6.8,
      standardDeviation: 5.2,
      beta: 0.65,
      alpha: 3.8,
      trackingError: 2.4,
      informationRatio: 1.58,
      downsideDeviation: 2.8,
      upCaptureRatio: 92.1,
      downCaptureRatio: 58.3,
    },
    sharpe: 1.15,
    annualReturn: 12.3,
    description: "Institutional-quality overlay strategy combining systematic trading with rigorous risk management for sophisticated investors.",
    managers: ["Nymbus Capital Inc."],
  },
  {
    slug: "global-equity-strategy",
    name: "Global Equity Low Volatility Strategy",
    shortName: "GELV",
    type: "strategy",
    assetClass: "Multi-Asset",
    vehicle: "Managed Account",
    fundCode: "LDM203",
    cusip: "50218T400",
    benchmark: "MSCI World Min Vol Index",
    inceptionDate: "2020-03-15",
    aum: "$275M",
    currency: "USD",
    minInvestment: "$250,000",
    navPerUnit: "$14.82",
    navChange: { dollar: 0.12, percent: 0.81, date: "2025-03-14" },
    riskRating: "Medium",
    objectives: "Provides global equity exposure with reduced volatility through systematic selection of lower-volatility securities and dynamic hedging strategies.",
    investmentFocus: "Global equities (low vol), fixed income overlay, currency hedging, derivatives overlay, real assets, and cash collateral management.",
    liquidity: "Daily",
    returns: {
      ytd: 3.4,
      oneYear: 15.7,
      threeYear: 8.2,
      fiveYear: 9.4,
      sinceInception: 10.2,
    },
    sectorAllocation: [
      { sector: 'Global Equities (Low Vol)', weight: 42.0 },
      { sector: 'Fixed Income Overlay', weight: 25.0 },
      { sector: 'Currency Hedging', weight: 12.0 },
      { sector: 'Derivatives Overlay', weight: 11.0 },
      { sector: 'Real Assets', weight: 5.0 },
      { sector: 'Cash & Collateral', weight: 5.0 },
    ],
    geographicBreakdown: [
      { region: 'United States', weight: 38.0 },
      { region: 'Europe', weight: 22.0 },
      { region: 'Japan', weight: 12.0 },
      { region: 'Canada', weight: 10.0 },
      { region: 'Asia ex-Japan', weight: 8.0 },
      { region: 'Other', weight: 10.0 },
    ],
    topHoldings: [
      { name: 'Johnson & Johnson', weight: 3.2, rating: 'AAA' },
      { name: 'Procter & Gamble Co', weight: 2.8, rating: 'AA-' },
      { name: 'Nestlé SA', weight: 2.5, rating: 'AA' },
      { name: 'Roche Holding AG', weight: 2.3, rating: 'AA' },
      { name: 'Berkshire Hathaway', weight: 2.1, rating: 'AA' },
      { name: 'Waste Management Inc', weight: 1.9, rating: 'AA-' },
      { name: 'Unilever PLC', weight: 1.8, rating: 'A+' },
      { name: 'Colgate-Palmolive Co', weight: 1.7, rating: 'A+' },
      { name: 'Clorox Company', weight: 1.6, rating: 'A' },
      { name: 'Campbell Soup Co', weight: 1.4, rating: 'BBB+' },
    ],
    riskMetrics: {
      sharpe: 1.24,
      sortino: 1.68,
      maxDrawdown: -12.4,
      standardDeviation: 8.9,
      beta: 0.72,
      alpha: 2.4,
      trackingError: 3.2,
      informationRatio: 0.75,
      downsideDeviation: 4.8,
      upCaptureRatio: 78.5,
      downCaptureRatio: 65.2,
    },
    portfolioCharacteristics: {
      numberOfHoldings: 156,
      avgCoupon: 1.85,
    },
    sharpe: 1.24,
    annualReturn: 15.7,
    description: "Systematic global equity strategy emphasizing lower-volatility securities with dynamic overlay management for institutional investors.",
    managers: ["Nymbus Capital Inc."],
  },
  {
    slug: "canadian-dividend-growth",
    name: "Canadian Dividend Growth Fund",
    shortName: "CDG",
    type: "mutual-fund",
    assetClass: "Multi-Asset",
    vehicle: "Mutual Fund",
    fundCode: "LDM204",
    cusip: "50218T500",
    benchmark: "S&P TSX Composite Index",
    inceptionDate: "2019-09-01",
    aum: "$145M",
    mer: "0.78%",
    currency: "CAD",
    minInvestment: "$1,000",
    minSubsequentInvestment: "$100",
    navPerUnit: "$11.34",
    navChange: { dollar: 0.05, percent: 0.44, date: "2025-03-14" },
    riskRating: "Medium",
    objectives: "Seeks long-term capital appreciation and dividend income through systematic investment in Canadian companies with strong dividend growth potential.",
    investmentFocus: "Canadian equities with proven dividend histories, increasing dividend payments, and sustainable business models. Focus on quality companies across all sectors.",
    liquidity: "Daily",
    rspEligible: true,
    returns: {
      ytd: 2.8,
      oneYear: 11.4,
      threeYear: 7.2,
      fiveYear: 8.6,
      sinceInception: 9.3,
    },
    distribution: { frequency: 'Quarterly', lastAmount: '$0.185', yield: 2.9 },
    riskMetrics: {
      sharpe: 0.94,
      sortino: 1.29,
      maxDrawdown: -18.3,
      standardDeviation: 11.2,
      beta: 1.05,
      alpha: 1.2,
      trackingError: 4.8,
      informationRatio: 0.25,
    },
    sharpe: 0.94,
    annualReturn: 11.4,
    description: "Canadian dividend-focused fund designed for income-seeking investors who want exposure to quality dividend-paying companies.",
    managers: ["Nymbus Capital Inc."],
  },
];