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
    returns: { ytd: 1.2, oneYear: 7.8, threeYear: 2.1, fiveYear: 3.4, sinceInception: 4.2 },
    compoundReturns: { oneMonth: 0.3, threeMonth: 1.2, sixMonth: 3.8, ytd: 1.2, oneYear: 7.8, threeYear: 2.1, fiveYear: 3.4, sinceInception: 4.2 },
    monthlyReturns: [
      { month: 'Jan', value: 0.5 }, { month: 'Feb', value: -0.2 }, { month: 'Mar', value: 0.8 },
      { month: 'Apr', value: 0.3 }, { month: 'May', value: -0.1 }, { month: 'Jun', value: 0.7 },
      { month: 'Jul', value: 0.4 }, { month: 'Aug', value: 0.6 }, { month: 'Sep', value: -0.3 },
      { month: 'Oct', value: 0.9 }, { month: 'Nov', value: 0.5 }, { month: 'Dec', value: 0.3 },
    ],
    calendarYearReturns: [
      { year: 2024, fund: 7.8, benchmark: 6.9 }, { year: 2023, fund: 6.4, benchmark: 6.7 },
      { year: 2022, fund: -10.2, benchmark: -11.7 }, { year: 2021, fund: -2.1, benchmark: -2.5 },
      { year: 2020, fund: 8.7, benchmark: 8.7 }, { year: 2019, fund: 7.2, benchmark: 6.9 },
    ],
    creditQuality: [
      { rating: 'AAA', weight: 32.5 }, { rating: 'AA', weight: 18.2 }, { rating: 'A', weight: 24.8 },
      { rating: 'BBB', weight: 20.1 }, { rating: 'BB', weight: 3.2 }, { rating: 'Cash', weight: 1.2 },
    ],
    sectorAllocation: [
      { sector: 'Federal Bonds', weight: 28.4 }, { sector: 'Provincial Bonds', weight: 22.1 },
      { sector: 'Corporate IG', weight: 35.2 }, { sector: 'Green Bonds', weight: 8.5 },
      { sector: 'Supranational', weight: 4.6 }, { sector: 'Cash & Equiv.', weight: 1.2 },
    ],
    geographicBreakdown: [
      { region: 'Canada', weight: 82.4 }, { region: 'United States', weight: 8.2 },
      { region: 'Supranational', weight: 4.6 }, { region: 'Europe', weight: 3.6 }, { region: 'Cash', weight: 1.2 },
    ],
    topHoldings: [
      { name: 'Canada 2.75% Jun 2029', weight: 5.8, coupon: '2.75%', maturity: 'Jun 2029', rating: 'AAA' },
      { name: 'Ontario 3.50% Jun 2043', weight: 4.2, coupon: '3.50%', maturity: 'Jun 2043', rating: 'AA-' },
      { name: 'Quebec 2.60% Jul 2028', weight: 3.9, coupon: '2.60%', maturity: 'Jul 2028', rating: 'AA-' },
      { name: 'RBC 3.20% Sep 2026', weight: 3.1, coupon: '3.20%', maturity: 'Sep 2026', rating: 'A+' },
      { name: 'TD Bank 4.10% Mar 2028', weight: 2.8, coupon: '4.10%', maturity: 'Mar 2028', rating: 'A+' },
      { name: 'Hydro-Quebec Green 2.90% Feb 2031', weight: 2.5, coupon: '2.90%', maturity: 'Feb 2031', rating: 'AA-' },
      { name: 'BMO 3.80% Nov 2027', weight: 2.3, coupon: '3.80%', maturity: 'Nov 2027', rating: 'A+' },
      { name: 'BC Province 3.25% Dec 2033', weight: 2.1, coupon: '3.25%', maturity: 'Dec 2033', rating: 'AAA' },
      { name: 'Enbridge Pipelines 4.45% Apr 2030', weight: 1.9, coupon: '4.45%', maturity: 'Apr 2030', rating: 'BBB+' },
      { name: 'CIBC 3.95% Aug 2029', weight: 1.8, coupon: '3.95%', maturity: 'Aug 2029', rating: 'A+' },
    ],
    distribution: { frequency: 'Quarterly', lastAmount: '$0.065', yield: 3.42 },
    distributionHistory: [
      { exDate: '2025-03-14', payDate: '2025-03-28', amount: 0.065, interest: 0.058, capitalGains: 0.007, returnOfCapital: 0 },
      { exDate: '2024-12-13', payDate: '2024-12-30', amount: 0.065, interest: 0.055, capitalGains: 0.010, returnOfCapital: 0 },
      { exDate: '2024-09-13', payDate: '2024-09-27', amount: 0.062, interest: 0.054, capitalGains: 0.008, returnOfCapital: 0 },
      { exDate: '2024-06-14', payDate: '2024-06-28', amount: 0.060, interest: 0.052, capitalGains: 0.008, returnOfCapital: 0 },
      { exDate: '2024-03-15', payDate: '2024-03-28', amount: 0.058, interest: 0.050, capitalGains: 0.008, returnOfCapital: 0 },
      { exDate: '2023-12-15', payDate: '2023-12-29', amount: 0.058, interest: 0.050, capitalGains: 0.008, returnOfCapital: 0 },
    ],
    riskMetrics: { sharpe: 0.82, sortino: 1.15, maxDrawdown: -12.8, standardDeviation: 5.1, beta: 0.95, alpha: 0.35, trackingError: 0.82, informationRatio: 0.43, downsideDeviation: 3.2, upCaptureRatio: 102, downCaptureRatio: 91 },
    portfolioCharacteristics: { duration: 7.2, yieldToMaturity: 3.85, avgCreditRating: 'A+', numberOfHoldings: 142, avgCoupon: 3.15, weightedAvgLife: 9.4, currentYield: 3.42, modifiedDuration: 6.9 },
    fees: { managementFee: '0.50%', mer: '0.65%', tradingExpenseRatio: '0.02%' },
    fundDocuments: [
      { name: 'Fund Fact Sheet', type: 'Fact Sheet', date: '2025-02-28' },
      { name: 'Simplified Prospectus', type: 'Prospectus', date: '2024-06-30' },
      { name: 'Annual Report 2024', type: 'Annual Report', date: '2024-12-31' },
      { name: 'Semi-Annual Report 2024', type: 'Semi-Annual Report', date: '2024-06-30' },
      { name: 'Management Report of Fund Performance', type: 'MRF', date: '2024-12-31' },
      { name: 'Q4 2024 Commentary', type: 'Commentary', date: '2024-12-31' },
      { name: 'ESG Annual Report 2024', type: 'ESG Report', date: '2024-12-31' },
    ],
    sharpe: 0.82, downsideVolatility: 3.2, annualReturn: 4.2,
    description: "A systematic fixed income strategy that blends enhanced bond selection with sustainability principles, targeting outperformance against the FTSE Canada Universe Bond Index through disciplined research and ESG integration.",
    managers: ["Gabriel Cefaloni", "Mathieu Poulin-Bri\u00e8re"],
  },
  {
    slug: "sustainable-enhanced-short-term-bonds",
    name: "Monthly Income Fund",
    shortName: "Monthly Income",
    type: "mutual-fund",
    assetClass: "Fixed Income",
    vehicle: "Mutual Fund",
    fundCode: "LDM001", cusip: "50218T201", series: "F",
    benchmark: "FTSE Canada Short-Term Bond Index",
    inceptionDate: "2020-06-01", aum: "$310M", mer: "0.55%", currency: "CAD",
    minInvestment: "$1,000", minSubsequentInvestment: "$100",
    navPerUnit: "$9.95", navChange: { dollar: 0.01, percent: 0.10, date: "2025-03-14" },
    riskRating: "Low",
    objectives: "The fund seeks to provide stable monthly income by investing primarily in short-term Canadian fixed income securities. The fund aims to preserve capital while generating returns above the FTSE Canada Short-Term Bond Index with lower volatility through systematic credit selection and ESG integration.",
    investmentFocus: "Short-term Canadian investment-grade bonds including government, corporate, and covered bonds with a maximum term to maturity of five years. The portfolio emphasizes high-quality issuers with strong ESG profiles and maintains daily liquidity.",
    liquidity: "Daily", rspEligible: true,
    returns: { ytd: 1.8, oneYear: 5.2, threeYear: 3.1, sinceInception: 3.8 },
    compoundReturns: { oneMonth: 0.2, threeMonth: 1.0, sixMonth: 2.6, ytd: 1.8, oneYear: 5.2, threeYear: 3.1, sinceInception: 3.8 },
    monthlyReturns: [
      { month: 'Jan', value: 0.4 }, { month: 'Feb', value: 0.3 }, { month: 'Mar', value: 0.5 },
      { month: 'Apr', value: 0.2 }, { month: 'May', value: 0.1 }, { month: 'Jun', value: 0.3 },
      { month: 'Jul', value: 0.3 }, { month: 'Aug', value: 0.4 }, { month: 'Sep', value: 0.1 },
      { month: 'Oct', value: 0.5 }, { month: 'Nov', value: 0.3 }, { month: 'Dec', value: 0.2 },
    ],
    calendarYearReturns: [
      { year: 2024, fund: 5.2, benchmark: 4.8 }, { year: 2023, fund: 5.1, benchmark: 4.6 },
      { year: 2022, fund: -3.8, benchmark: -4.0 }, { year: 2021, fund: -0.5, benchmark: -0.6 },
      { year: 2020, fund: 4.2, benchmark: 4.0 },
    ],
    creditQuality: [
      { rating: 'AAA', weight: 15.8 }, { rating: 'AA', weight: 22.5 }, { rating: 'A', weight: 32.1 },
      { rating: 'BBB', weight: 25.4 }, { rating: 'Cash', weight: 4.2 },
    ],
    sectorAllocation: [
      { sector: 'Corporate IG', weight: 45.2 }, { sector: 'Federal Bonds', weight: 15.8 },
      { sector: 'Provincial Bonds', weight: 18.4 }, { sector: 'Covered Bonds', weight: 8.6 },
      { sector: 'Green Bonds', weight: 5.2 }, { sector: 'Mortgage Bonds', weight: 2.6 },
      { sector: 'Cash & Equiv.', weight: 4.2 },
    ],
    geographicBreakdown: [
      { region: 'Canada', weight: 88.5 }, { region: 'United States', weight: 5.8 },
      { region: 'Europe', weight: 1.5 }, { region: 'Cash', weight: 4.2 },
    ],
    topHoldings: [
      { name: 'Canada 1.50% Jun 2026', weight: 4.5, coupon: '1.50%', maturity: 'Jun 2026', rating: 'AAA' },
      { name: 'RBC 3.60% Apr 2026', weight: 3.8, coupon: '3.60%', maturity: 'Apr 2026', rating: 'A+' },
      { name: 'TD Bank 4.25% Jan 2027', weight: 3.5, coupon: '4.25%', maturity: 'Jan 2027', rating: 'A+' },
      { name: 'Ontario 2.40% Sep 2026', weight: 3.2, coupon: '2.40%', maturity: 'Sep 2026', rating: 'AA-' },
      { name: 'BMO Covered 3.10% May 2027', weight: 2.9, coupon: '3.10%', maturity: 'May 2027', rating: 'AAA' },
      { name: 'CIBC 3.85% Jul 2026', weight: 2.7, coupon: '3.85%', maturity: 'Jul 2026', rating: 'A+' },
      { name: 'Desjardins Green 3.40% Nov 2026', weight: 2.4, coupon: '3.40%', maturity: 'Nov 2026', rating: 'A' },
      { name: 'Scotiabank 4.05% Feb 2027', weight: 2.2, coupon: '4.05%', maturity: 'Feb 2027', rating: 'A+' },
      { name: 'Quebec 2.30% Mar 2027', weight: 2.0, coupon: '2.30%', maturity: 'Mar 2027', rating: 'AA-' },
      { name: 'National Bank 3.70% Aug 2026', weight: 1.8, coupon: '3.70%', maturity: 'Aug 2026', rating: 'A' },
    ],
    distribution: { frequency: 'Monthly', lastAmount: '$0.032', yield: 3.85 },
    distributionHistory: [
      { exDate: '2025-02-28', payDate: '2025-03-14', amount: 0.032, interest: 0.030, capitalGains: 0.002, returnOfCapital: 0 },
      { exDate: '2025-01-31', payDate: '2025-02-14', amount: 0.032, interest: 0.030, capitalGains: 0.002, returnOfCapital: 0 },
      { exDate: '2024-12-31', payDate: '2025-01-15', amount: 0.031, interest: 0.029, capitalGains: 0.002, returnOfCapital: 0 },
      { exDate: '2024-11-29', payDate: '2024-12-13', amount: 0.031, interest: 0.029, capitalGains: 0.002, returnOfCapital: 0 },
      { exDate: '2024-10-31', payDate: '2024-11-15', amount: 0.030, interest: 0.028, capitalGains: 0.002, returnOfCapital: 0 },
      { exDate: '2024-09-30', payDate: '2024-10-15', amount: 0.030, interest: 0.028, capitalGains: 0.002, returnOfCapital: 0 },
      { exDate: '2024-08-30', payDate: '2024-09-13', amount: 0.030, interest: 0.028, capitalGains: 0.002, returnOfCapital: 0 },
      { exDate: '2024-07-31', payDate: '2024-08-15', amount: 0.029, interest: 0.027, capitalGains: 0.002, returnOfCapital: 0 },
    ],
    riskMetrics: { sharpe: 1.12, sortino: 1.68, maxDrawdown: -4.2, standardDeviation: 2.4, beta: 0.88, alpha: 0.42, trackingError: 0.55, informationRatio: 0.76, downsideDeviation: 1.8, upCaptureRatio: 105, downCaptureRatio: 85 },
    portfolioCharacteristics: { duration: 2.4, yieldToMaturity: 4.15, avgCreditRating: 'A', numberOfHoldings: 98, avgCoupon: 3.45, weightedAvgLife: 2.8, currentYield: 3.85, modifiedDuration: 2.3 },
    fees: { managementFee: '0.40%', mer: '0.55%', tradingExpenseRatio: '0.01%' },
    fundDocuments: [
      { name: 'Fund Fact Sheet', type: 'Fact Sheet', date: '2025-02-28' },
      { name: 'Simplified Prospectus', type: 'Prospectus', date: '2024-06-30' },
      { name: 'Annual Report 2024', type: 'Annual Report', date: '2024-12-31' },
      { name: 'Semi-Annual Report 2024', type: 'Semi-Annual Report', date: '2024-06-30' },
      { name: 'Management Report of Fund Performance', type: 'MRF', date: '2024-12-31' },
      { name: 'Q4 2024 Commentary', type: 'Commentary', date: '2024-12-31' },
    ],
    sharpe: 1.12, downsideVolatility: 1.8, annualReturn: 3.8,
    description: "A systematically managed short-term fixed income strategy with embedded sustainability criteria, designed for investors seeking stable returns with lower duration risk and ESG alignment.",
    managers: ["Gabriel Cefaloni", "Mathieu Poulin-Bri\u00e8re"],
  },
  {
    slug: "multi-strategy",
    name: "Multi-Strategy Fund",
    shortName: "Multi-Strat",
    type: "mutual-fund",
    assetClass: "Alternatives",
    vehicle: "Mutual Fund",
    fundCode: "LDM301", cusip: "50218T301", series: "F",
    benchmark: "HFRI Fund Weighted Composite Index",
    inceptionDate: "2014-01-15", aum: "$420M", mer: "1.85%", currency: "CAD",
    minInvestment: "$1,000", minSubsequentInvestment: "$100",
    navPerUnit: "$22.45", navChange: { dollar: 0.12, percent: 0.54, date: "2025-03-14" },
    riskRating: "Medium",
    objectives: "The fund seeks to generate consistent, positive absolute returns across all market conditions with low correlation to traditional equity and fixed income markets. The fund targets an annualized return of 8\u201312% over a full market cycle with volatility significantly below that of global equity markets.",
    investmentFocus: "A diversified portfolio of alternative investment strategies including fixed income enhancement, managed futures (CTA), equity market neutral, volatility arbitrage, and dynamic asset allocation. The fund employs systematic, rules-based models across all sub-strategies.",
    liquidity: "Daily", rspEligible: true,
    returns: { ytd: 3.2, oneYear: 8.5, threeYear: 5.1, fiveYear: 7.2, sinceInception: 12.8 },
    compoundReturns: { oneMonth: 1.1, threeMonth: 3.2, sixMonth: 5.4, ytd: 3.2, oneYear: 8.5, threeYear: 5.1, fiveYear: 7.2, tenYear: 9.4, sinceInception: 12.8 },
    monthlyReturns: [
      { month: 'Jan', value: 1.2 }, { month: 'Feb', value: 0.8 }, { month: 'Mar', value: -0.4 },
      { month: 'Apr', value: 1.5 }, { month: 'May', value: 0.6 }, { month: 'Jun', value: -0.2 },
      { month: 'Jul', value: 1.8 }, { month: 'Aug', value: -0.6 }, { month: 'Sep', value: 0.9 },
      { month: 'Oct', value: 1.4 }, { month: 'Nov', value: 0.7 }, { month: 'Dec', value: 1.1 },
    ],
    calendarYearReturns: [
      { year: 2024, fund: 8.5, benchmark: 5.2 }, { year: 2023, fund: 12.1, benchmark: 6.4 },
      { year: 2022, fund: 3.8, benchmark: -4.2 }, { year: 2021, fund: 15.2, benchmark: 10.3 },
      { year: 2020, fund: 9.4, benchmark: 6.8 }, { year: 2019, fund: 14.8, benchmark: 10.4 },
      { year: 2018, fund: 5.2, benchmark: -0.8 }, { year: 2017, fund: 11.6, benchmark: 7.7 },
      { year: 2016, fund: 8.9, benchmark: 5.5 }, { year: 2015, fund: 6.4, benchmark: -1.1 },
    ],
    sectorAllocation: [
      { sector: 'Fixed Income Enhancement', weight: 35.0 }, { sector: 'Managed Futures (CTA)', weight: 22.5 },
      { sector: 'Equity Market Neutral', weight: 15.0 }, { sector: 'Volatility Arbitrage', weight: 12.5 },
      { sector: 'Dynamic Asset Allocation', weight: 10.0 }, { sector: 'Cash & Collateral', weight: 5.0 },
    ],
    geographicBreakdown: [
      { region: 'Canada', weight: 45.0 }, { region: 'United States', weight: 28.0 },
      { region: 'Europe', weight: 12.0 }, { region: 'Asia-Pacific', weight: 8.0 },
      { region: 'Global Futures', weight: 7.0 },
    ],
    distribution: { frequency: 'Annual', lastAmount: '$1.85' },
    distributionHistory: [
      { exDate: '2024-12-20', payDate: '2024-12-31', amount: 1.85, interest: 0.42, capitalGains: 1.43, returnOfCapital: 0 },
      { exDate: '2023-12-20', payDate: '2023-12-29', amount: 2.10, interest: 0.38, capitalGains: 1.72, returnOfCapital: 0 },
      { exDate: '2022-12-20', payDate: '2022-12-30', amount: 0.85, interest: 0.25, capitalGains: 0.60, returnOfCapital: 0 },
    ],
    riskMetrics: { sharpe: 0.65, sortino: 0.92, maxDrawdown: -15.4, standardDeviation: 8.2, beta: 0.18, alpha: 8.5, downsideDeviation: 7.5, upCaptureRatio: 45, downCaptureRatio: 12 },
    fees: { managementFee: '1.50%', mer: '1.85%', tradingExpenseRatio: '0.15%', performanceFee: '15% above 5% hurdle' },
    fundDocuments: [
      { name: 'Fund Fact Sheet', type: 'Fact Sheet', date: '2025-02-28' },
      { name: 'Simplified Prospectus', type: 'Prospectus', date: '2024-06-30' },
      { name: 'Annual Report 2024', type: 'Annual Report', date: '2024-12-31' },
      { name: 'Management Report of Fund Performance', type: 'MRF', date: '2024-12-31' },
      { name: 'Q4 2024 Commentary', type: 'Commentary', date: '2024-12-31' },
    ],
    sharpe: 0.65, downsideVolatility: 7.5, annualReturn: 12.8,
    description: "A diversified alternatives strategy combining fixed income enhancement, managed futures, and dynamic asset allocation to generate consistent returns across market conditions with low correlation to traditional equities.",
    managers: ["Gabriel Cefaloni", "Richard Langevin"],
  },
  {
    slug: "multi-strategy-managed-account",
    name: "Multi-Strategy Fund",
    shortName: "Multi-Strat MA",
    type: "strategy",
    assetClass: "Alternatives",
    vehicle: "Managed Account",
    benchmark: "HFRI Fund Weighted Composite Index",
    inceptionDate: "2014-01-15", aum: "$180M", currency: "CAD",
    minInvestment: "$5,000,000", minSubsequentInvestment: "$500,000",
    riskRating: "Medium",
    objectives: "The strategy seeks to generate consistent, positive absolute returns across all market conditions with low correlation to traditional equity and fixed income markets.",
    investmentFocus: "A diversified portfolio of alternative investment strategies including fixed income enhancement, managed futures (CTA), equity market neutral, volatility arbitrage, and dynamic asset allocation.",
    liquidity: "Monthly", rspEligible: false,
    returns: { ytd: 3.2, oneYear: 8.5, threeYear: 5.1, fiveYear: 7.2, sinceInception: 12.8 },
    compoundReturns: { oneMonth: 1.1, threeMonth: 3.2, sixMonth: 5.4, ytd: 3.2, oneYear: 8.5, threeYear: 5.1, fiveYear: 7.2, tenYear: 9.4, sinceInception: 12.8 },
    monthlyReturns: [
      { month: 'Jan', value: 1.2 }, { month: 'Feb', value: 0.8 }, { month: 'Mar', value: -0.4 },
      { month: 'Apr', value: 1.5 }, { month: 'May', value: 0.6 }, { month: 'Jun', value: -0.2 },
      { month: 'Jul', value: 1.8 }, { month: 'Aug', value: -0.6 }, { month: 'Sep', value: 0.9 },
      { month: 'Oct', value: 1.4 }, { month: 'Nov', value: 0.7 }, { month: 'Dec', value: 1.1 },
    ],
    calendarYearReturns: [
      { year: 2024, fund: 8.5, benchmark: 5.2 }, { year: 2023, fund: 12.1, benchmark: 6.4 },
      { year: 2022, fund: 3.8, benchmark: -4.2 }, { year: 2021, fund: 15.2, benchmark: 10.3 },
      { year: 2020, fund: 9.4, benchmark: 6.8 }, { year: 2019, fund: 14.8, benchmark: 10.4 },
      { year: 2018, fund: 5.2, benchmark: -0.8 }, { year: 2017, fund: 11.6, benchmark: 7.7 },
      { year: 2016, fund: 8.9, benchmark: 5.5 }, { year: 2015, fund: 6.4, benchmark: -1.1 },
    ],
    sectorAllocation: [
      { sector: 'Fixed Income Enhancement', weight: 35.0 }, { sector: 'Managed Futures (CTA)', weight: 22.5 },
      { sector: 'Equity Market Neutral', weight: 15.0 }, { sector: 'Volatility Arbitrage', weight: 12.5 },
      { sector: 'Dynamic Asset Allocation', weight: 10.0 }, { sector: 'Cash & Collateral', weight: 5.0 },
    ],
    geographicBreakdown: [
      { region: 'Canada', weight: 45.0 }, { region: 'United States', weight: 28.0 },
      { region: 'Europe', weight: 12.0 }, { region: 'Asia-Pacific', weight: 8.0 },
      { region: 'Global Futures', weight: 7.0 },
    ],
    distribution: { frequency: 'Annual', lastAmount: '$1.85' },
    distributionHistory: [
      { exDate: '2024-12-20', payDate: '2024-12-31', amount: 1.85, interest: 0.42, capitalGains: 1.43, returnOfCapital: 0 },
      { exDate: '2023-12-20', payDate: '2023-12-29', amount: 2.10, interest: 0.38, capitalGains: 1.72, returnOfCapital: 0 },
      { exDate: '2022-12-20', payDate: '2022-12-30', amount: 0.85, interest: 0.25, capitalGains: 0.60, returnOfCapital: 0 },
    ],
    riskMetrics: { sharpe: 0.65, sortino: 0.92, maxDrawdown: -15.4, standardDeviation: 8.2, beta: 0.18, alpha: 8.5, downsideDeviation: 7.5, upCaptureRatio: 45, downCaptureRatio: 12 },
    fees: { managementFee: '1.50%', tradingExpenseRatio: '0.15%', performanceFee: '15% above 5% hurdle' },
    fundDocuments: [
      { name: 'Fund Fact Sheet', type: 'Fact Sheet', date: '2025-02-28' },
      { name: 'Prospectus', type: 'Prospectus', date: '2024-06-30' },
      { name: 'Annual Report 2024', type: 'Annual Report', date: '2024-12-31' },
      { name: 'Management Report of Fund Performance', type: 'MRF', date: '2024-12-31' },
      { name: 'Q4 2024 Commentary', type: 'Commentary', date: '2024-12-31' },
    ],
    sharpe: 0.65, downsideVolatility: 7.5, annualReturn: 12.8,
    description: "A diversified alternatives strategy combining fixed income enhancement, managed futures, and dynamic asset allocation to generate consistent returns across market conditions with low correlation to traditional equities.",
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
    inceptionDate: "2015-01-15", aum: "$285M", currency: "USD",
    minInvestment: "$5,000,000", minSubsequentInvestment: "$500,000",
    riskRating: "Medium",
    objectives: "The strategy seeks to deliver equity-like returns with significantly lower volatility than global equity markets over a full market cycle. The strategy targets a volatility reduction of 30\u201340% relative to the MSCI World Index while capturing 70\u201380% of market upside.",
    investmentFocus: "A quantitatively-optimized portfolio of global equities selected for minimum variance characteristics, combined with a fixed income overlay and systematic currency hedging.",
    liquidity: "Monthly", rspEligible: false,
    returns: { ytd: 2.1, oneYear: 6.3, threeYear: 4.8, fiveYear: 5.5, sinceInception: 6.1 },
    compoundReturns: { oneMonth: 0.3, threeMonth: 2.1, sixMonth: 3.8, ytd: 2.1, oneYear: 6.3, threeYear: 4.8, fiveYear: 5.5, tenYear: 5.8, sinceInception: 6.1 },
    monthlyReturns: [
      { month: 'Jan', value: 0.8 }, { month: 'Feb', value: 0.4 }, { month: 'Mar', value: -0.2 },
      { month: 'Apr', value: 0.6 }, { month: 'May', value: 0.3 }, { month: 'Jun', value: -0.1 },
      { month: 'Jul', value: 0.9 }, { month: 'Aug', value: -0.5 }, { month: 'Sep', value: 0.4 },
      { month: 'Oct', value: 0.7 }, { month: 'Nov', value: 0.5 }, { month: 'Dec', value: 0.3 },
    ],
    calendarYearReturns: [
      { year: 2024, fund: 6.3, benchmark: 5.8 }, { year: 2023, fund: 7.2, benchmark: 7.9 },
      { year: 2022, fund: -5.8, benchmark: -12.2 }, { year: 2021, fund: 14.2, benchmark: 16.5 },
      { year: 2020, fund: 2.1, benchmark: -1.8 }, { year: 2019, fund: 18.5, benchmark: 22.4 },
      { year: 2018, fund: -2.4, benchmark: -5.2 }, { year: 2017, fund: 12.8, benchmark: 15.2 },
      { year: 2016, fund: 7.5, benchmark: 8.1 },
    ],
    sectorAllocation: [
      { sector: 'Global Equities (Low Vol)', weight: 42.0 }, { sector: 'Fixed Income Overlay', weight: 25.0 },
      { sector: 'Currency Hedging', weight: 12.0 }, { sector: 'Derivatives Overlay', weight: 11.0 },
      { sector: 'Real Assets', weight: 5.0 }, { sector: 'Cash & Collateral', weight: 5.0 },
    ],
    geographicBreakdown: [
      { region: 'United States', weight: 38.0 }, { region: 'Europe', weight: 22.0 },
      { region: 'Japan', weight: 12.0 }, { region: 'Canada', weight: 10.0 },
      { region: 'Asia ex-Japan', weight: 8.0 }, { region: 'Other', weight: 10.0 },
    ],
    topHoldings: [
      { name: 'Johnson & Johnson', weight: 3.2, rating: 'AAA' },
      { name: 'Procter & Gamble Co', weight: 2.8, rating: 'AA-' },
      { name: 'Nestl\u00e9 SA', weight: 2.5, rating: 'AA' },
      { name: 'Roche Holding AG', weight: 2.3, rating: 'AA' },
      { name: 'Berkshire Hathaway', weight: 2.1, rating: 'AA' },
      { name: 'Waste Management Inc', weight: 1.9, rating: 'A' },
      { name: 'Duke Energy Corp', weight: 1.8, rating: 'A-' },
      { name: 'Colgate-Palmolive Co', weight: 1.7, rating: 'AA-' },
      { name: 'BCE Inc', weight: 1.6, rating: 'BBB+' },
      { name: 'Zurich Insurance Group', weight: 1.5, rating: 'AA-' },
    ],
    riskMetrics: { sharpe: 0.91, sortino: 1.32, maxDrawdown: -8.2, standardDeviation: 6.8, beta: 0.52, alpha: 2.8, downsideDeviation: 5.1, upCaptureRatio: 62, downCaptureRatio: 38 },
    fees: { managementFee: '0.85%', performanceFee: '10% above MSCI World Min Vol' },
    fundDocuments: [
      { name: 'Strategy Fact Sheet', type: 'Fact Sheet', date: '2025-02-28' },
      { name: 'Annual Report 2024', type: 'Annual Report', date: '2024-12-31' },
      { name: 'Q4 2024 Commentary', type: 'Commentary', date: '2024-12-31' },
    ],
    sharpe: 0.91, downsideVolatility: 5.1, annualReturn: 6.1,
    description: "A sophisticated multi-asset strategy employing quantitative optimization to construct low-volatility portfolios with global equity and fixed income exposure, ideal for institutional investors seeking smooth, stable returns.",
    managers: ["Gabriel Cefaloni", "Jason Laliberte"],
  },
];

export const fundBySlug = (slug: string): Fund | undefined => {
  return funds.find((fund) => fund.slug === slug);
};

export const fundsByAssetClass = (assetClass: Fund["assetClass"]): Fund[] => {
  return funds.filter((fund) => fund.assetClass === assetClass);
};
