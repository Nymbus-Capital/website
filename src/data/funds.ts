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
  descriptionFr?: string;
  managers: string[];
}
