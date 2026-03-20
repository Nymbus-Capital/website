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
  isin?: string;
  assetClass: 'Fixed Income' | 'Equities' | 'Multi-Asset' | 'Alternatives';
  shortDescription?: string;
  description?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  keyHighlights?: string[];
  portfolio?: {
    topHoldings?: TopHolding[];
    sectorAllocation?: SectorAllocation[];
    creditQuality?: CreditQuality[];
    geographicBreakdown?: GeographicBreakdown[];
  };
  characteristics?: PortfolioCharacteristics;
  fees?: FundFees;
  riskMetrics?: RiskMetrics;
  monthlyReturns?: MonthlyReturn[];
  calendarYearReturns?: CalendarYearReturn[];
  compoundReturns?: CompoundReturns;
  distribution?: Distribution;
  distributionHistory?: DistributionHistory[];
  documents?: FundDocument[];
  benchmarks?: {
    primary?: string;
    secondary?: string;
  };
  inceptionDate?: string;
  fundManager?: string;
  fundAUM?: string;
  nav?: number;
  status: 'Active' | 'Closed' | 'Dormant';
  link?: string;
}

export const funds: Fund[] = [
  {
    slug: 'nymbus-canadian-bond-fund',
    name: 'Nymbus Canadian Bond Fund',
    isin: 'CA00000000001',
    assetClass: 'Fixed Income',
    shortDescription: 'A diversified Canadian fixed income fund focusing on high-quality bonds',
    description: 'The Nymbus Canadian Bond Fund seeks to provide investors with a steady stream of income while preserving capital through investment in a diversified portfolio of Canadian fixed income securities. The fund focuses on investment-grade bonds issued by Canadian corporations and governments.',
    profileImageUrl: '/images/funds/canadian-bond.jpg',
    bannerImageUrl: '/images/funds/banners/canadian-bond.jpg',
    keyHighlights: [
      'Diversified portfolio of Canadian bonds',
      'Focus on investment-grade securities',
      'Monthly distribution',
      'Experienced management team'
    ],
    assetClass: 'Fixed Income',
    portfolio: {
      topHoldings: [
        {
          name: 'Government of Canada Bond 2.5% 2030',
          weight: 8.5,
          coupon: '2.5%',
          maturity: '2030-06-01',
          rating: 'AAA'
        },
        {
          name: 'Royal Bank of Canada Bond 3.5% 2028',
          weight: 7.2,
          coupon: '3.5%',
          maturity: '2028-03-15',
          rating: 'AA+'
        },
        {
          name: 'Toronto Dominion Bank Bond 3.0% 2027',
          weight: 6.8,
          coupon: '3.0%',
          maturity: '2027-09-20',
          rating: 'AA'
        },
        {
          name: 'Bank of Montreal Bond 3.25% 2029',
          weight: 6.5,
          coupon: '3.25%',
          maturity: '2029-05-15',
          rating: 'AA'
        },
        {
          name: 'Scotiabank Bond 3.75% 2031',
          weight: 6.2,
          coupon: '3.75%',
          maturity: '2031-11-30',
          rating: 'AA'
        }
      ],
      sectorAllocation: [
        { sector: 'Government', weight: 32.0 },
        { sector: 'Financial Services', weight: 28.5 },
        { sector: 'Utilities', weight: 18.0 },
        { sector: 'Energy', weight: 12.5 },
        { sector: 'Other', weight: 9.0 }
      ],
      creditQuality: [
        { rating: 'AAA', weight: 15.0 },
        { rating: 'AA', weight: 35.0 },
        { rating: 'A', weight: 32.0 },
        { rating: 'BBB', weight: 15.0 },
        { rating: 'BB and Below', weight: 3.0 }
      ],
      geographicBreakdown: [
        { region: 'Ontario', weight: 28.5 },
        { region: 'British Columbia', weight: 18.2 },
        { region: 'Quebec', weight: 25.3 },
        { region: 'Alberta', weight: 15.0 },
        { region: 'Other', weight: 13.0 }
      ]
    },
    characteristics: {
      duration: 6.2,
      yieldToMaturity: 4.15,
      avgCreditRating: 'AA-',
      numberOfHoldings: 145,
      avgCoupon: 3.45,
      weightedAvgLife: 7.5,
      currentYield: 4.25,
      modifiedDuration: 5.8
    },
    fees: {
      managementFee: '0.35%',
      mer: '0.50%',
      tradingExpenseRatio: '0.05%'
    },
    riskMetrics: {
      sharpe: 0.85,
      sortino: 1.12,
      maxDrawdown: -3.2,
      standardDeviation: 2.1,
      beta: 0.95,
      alpha: 0.15,
      trackingError: 0.8,
      informationRatio: 0.45,
      downsideDeviation: 1.5,
      upCaptureRatio: 1.05,
      downCaptureRatio: 0.92
    },
    monthlyReturns: [
      { month: 'January 2024', value: 0.45 },
      { month: 'February 2024', value: 0.52 },
      { month: 'March 2024', value: 0.38 },
      { month: 'April 2024', value: 0.41 },
      { month: 'May 2024', value: 0.35 },
      { month: 'June 2024', value: 0.48 },
      { month: 'July 2024', value: 0.42 },
      { month: 'August 2024', value: 0.39 },
      { month: 'September 2024', value: 0.44 },
      { month: 'October 2024', value: 0.51 },
      { month: 'November 2024', value: 0.46 },
      { month: 'December 2024', value: 0.53 }
    ],
    calendarYearReturns: [
      { year: 2022, fund: 7.8, benchmark: 8.2 },
      { year: 2023, fund: 10.2, benchmark: 10.5 },
      { year: 2024, fund: 8.5, benchmark: 8.1 }
    ],
    compoundReturns: {
      oneMonth: 0.53,
      threeMonth: 1.35,
      sixMonth: 2.65,
      ytd: 5.25,
      oneYear: 8.5,
      threeYear: 9.2,
      fiveYear: 9.8,
      tenYear: 8.5,
      sinceInception: 9.1
    },
    distribution: {
      frequency: 'Monthly',
      lastAmount: '$0.045',
      yield: 4.25
    },
    distributionHistory: [
      { exDate: '2024-12-13', payDate: '2024-12-27', amount: 0.045, interest: 0.045 },
      { exDate: '2024-11-13', payDate: '2024-11-27', amount: 0.046, interest: 0.046 },
      { exDate: '2024-10-11', payDate: '2024-10-25', amount: 0.044, interest: 0.044 },
      { exDate: '2024-09-13', payDate: '2024-09-27', amount: 0.043, interest: 0.043 },
      { exDate: '2024-08-13', payDate: '2024-08-27', amount: 0.042, interest: 0.042 }
    ],
    documents: [
      {
        name: 'Current Fact Sheet',
        type: 'Fact Sheet',
        date: '2024-12-31',
        url: '/documents/nymbus-canadian-bond-fund-factsheet.pdf'
      },
      {
        name: '2024 Annual Report',
        type: 'Annual Report',
        date: '2024-12-31',
        url: '/documents/nymbus-canadian-bond-fund-annual-report.pdf'
      },
      {
        name: 'Prospectus',
        type: 'Prospectus',
        date: '2024-01-15',
        url: '/documents/nymbus-canadian-bond-fund-prospectus.pdf'
      }
    ],
    benchmarks: {
      primary: 'FTSE Canada Universe Bond Index',
      secondary: 'Bloomberg Canada Aggregate Index'
    },
    inceptionDate: '2015-03-15',
    fundManager: 'Nymbus Capital Management',
    fundAUM: '$2,450,000,000',
    nav: 24.52,
    status: 'Active',
    link: '/funds/nymbus-canadian-bond-fund'
  },
  {
    slug: 'nymbus-us-equity-fund',
    name: 'Nymbus US Equity Fund',
    isin: 'CA00000000002',
    assetClass: 'Equities',
    shortDescription: 'A growth-oriented fund investing in US large-cap equities',
    description: 'The Nymbus US Equity Fund provides investors with exposure to a diversified portfolio of US large-cap companies. The fund focuses on companies with strong fundamentals and growth potential.',
    profileImageUrl: '/images/funds/us-equity.jpg',
    bannerImageUrl: '/images/funds/banners/us-equity.jpg',
    keyHighlights: [
      'Diversified US large-cap portfolio',
      'Focus on growth and value stocks',
      'Professional active management',
      'Quarterly distribution'
    ],
    portfolio: {
      topHoldings: [
        { name: 'Apple Inc.', weight: 4.2 },
        { name: 'Microsoft Corp.', weight: 3.8 },
        { name: 'Alphabet Inc.', weight: 3.5 },
        { name: 'Amazon.com Inc.', weight: 3.2 },
        { name: 'Nvidia Corp.', weight: 2.8 }
      ],
      sectorAllocation: [
        { sector: 'Technology', weight: 28.5 },
        { sector: 'Healthcare', weight: 18.2 },
        { sector: 'Financials', weight: 15.3 },
        { sector: 'Consumer Discretionary', weight: 12.5 },
        { sector: 'Other', weight: 25.5 }
      ]
    },
    characteristics: {
      numberOfHoldings: 250,
      beta: 1.05,
      currentYield: 1.85
    },
    fees: {
      managementFee: '0.65%',
      mer: '0.85%',
      tradingExpenseRatio: '0.10%'
    },
    riskMetrics: {
      sharpe: 1.25,
      maxDrawdown: -18.5,
      standardDeviation: 16.2,
      beta: 1.05,
      trackingError: 3.2,
      downsideDeviation: 11.5,
      upCaptureRatio: 1.08,
      downCaptureRatio: 0.95
    },
    monthlyReturns: [
      { month: 'January 2024', value: 2.15 },
      { month: 'February 2024', value: 1.85 },
      { month: 'March 2024', value: 2.45 },
      { month: 'April 2024', value: 1.95 },
      { month: 'May 2024', value: -0.85 },
      { month: 'June 2024', value: 2.25 },
      { month: 'July 2024', value: 3.15 },
      { month: 'August 2024', value: -1.25 },
      { month: 'September 2024', value: 2.05 },
      { month: 'October 2024', value: 2.85 },
      { month: 'November 2024', value: 3.45 },
      { month: 'December 2024', value: 2.95 }
    ],
    calendarYearReturns: [
      { year: 2022, fund: -18.2, benchmark: -18.1 },
      { year: 2023, fund: 24.5, benchmark: 24.2 },
      { year: 2024, fund: 22.8, benchmark: 22.5 }
    ],
    compoundReturns: {
      oneMonth: 2.95,
      threeMonth: 8.35,
      sixMonth: 6.85,
      ytd: 22.8,
      oneYear: 22.8,
      threeYear: 16.5,
      fiveYear: 18.2,
      tenYear: 14.8,
      sinceInception: 13.5
    },
    distribution: {
      frequency: 'Quarterly',
      lastAmount: '$0.35',
      yield: 1.85
    },
    distributionHistory: [
      { exDate: '2024-12-13', payDate: '2024-12-27', amount: 0.35 },
      { exDate: '2024-09-13', payDate: '2024-09-27', amount: 0.32 },
      { exDate: '2024-06-14', payDate: '2024-06-28', amount: 0.30 },
      { exDate: '2024-03-15', payDate: '2024-03-29', amount: 0.28 }
    ],
    documents: [
      {
        name: 'Current Fact Sheet',
        type: 'Fact Sheet',
        date: '2024-12-31',
        url: '/documents/nymbus-us-equity-fund-factsheet.pdf'
      },
      {
        name: '2024 Annual Report',
        type: 'Annual Report',
        date: '2024-12-31',
        url: '/documents/nymbus-us-equity-fund-annual-report.pdf'
      }
    ],
    benchmarks: {
      primary: 'S&P 500 Index',
      secondary: 'Russell 1000 Index'
    },
    inceptionDate: '2010-06-15',
    fundManager: 'Nymbus Capital Management',
    fundAUM: '$3,850,000,000',
    nav: 58.75,
    status: 'Active',
    link: '/funds/nymbus-us-equity-fund'
  },
  {
    slug: 'nymbus-balanced-portfolio',
    name: 'Nymbus Balanced Portfolio',
    isin: 'CA00000000003',
    assetClass: 'Multi-Asset',
    shortDescription: 'A balanced allocation fund with 60% equities and 40% fixed income',
    description: 'The Nymbus Balanced Portfolio is designed for investors seeking a moderate level of growth with capital preservation. The fund maintains a strategic allocation of approximately 60% equities and 40% fixed income.',
    profileImageUrl: '/images/funds/balanced.jpg',
    bannerImageUrl: '/images/funds/banners/balanced.jpg',
    keyHighlights: [
      '60/40 strategic asset allocation',
      'Global diversification',
      'Quarterly rebalancing',
      'Monthly distribution'
    ],
    portfolio: {
      topHoldings: [
        { name: 'Equity Positions (60% of portfolio)', weight: 60.0 },
        { name: 'Fixed Income Positions (40% of portfolio)', weight: 40.0 }
      ],
      sectorAllocation: [
        { sector: 'Equities', weight: 60.0 },
        { sector: 'Fixed Income', weight: 40.0 }
      ]
    },
    characteristics: {
      numberOfHoldings: 320,
      beta: 0.68,
      currentYield: 2.85
    },
    fees: {
      managementFee: '0.50%',
      mer: '0.70%',
      tradingExpenseRatio: '0.08%'
    },
    riskMetrics: {
      sharpe: 1.05,
      maxDrawdown: -9.5,
      standardDeviation: 8.2,
      beta: 0.68,
      trackingError: 1.5,
      downsideDeviation: 5.8,
      upCaptureRatio: 0.98,
      downCaptureRatio: 0.72
    },
    monthlyReturns: [
      { month: 'January 2024', value: 1.25 },
      { month: 'February 2024', value: 1.15 },
      { month: 'March 2024', value: 1.45 },
      { month: 'April 2024', value: 1.05 },
      { month: 'May 2024', value: 0.35 },
      { month: 'June 2024', value: 1.35 },
      { month: 'July 2024', value: 1.75 },
      { month: 'August 2024', value: 0.15 },
      { month: 'September 2024', value: 1.25 },
      { month: 'October 2024', value: 1.65 },
      { month: 'November 2024', value: 1.95 },
      { month: 'December 2024', value: 1.75 }
    ],
    calendarYearReturns: [
      { year: 2022, fund: -5.2, benchmark: -5.5 },
      { year: 2023, fund: 16.5, benchmark: 16.2 },
      { year: 2024, fund: 14.5, benchmark: 14.2 }
    ],
    compoundReturns: {
      oneMonth: 1.75,
      threeMonth: 4.25,
      sixMonth: 4.85,
      ytd: 14.5,
      oneYear: 14.5,
      threeYear: 12.8,
      fiveYear: 13.2,
      tenYear: 10.5,
      sinceInception: 11.2
    },
    distribution: {
      frequency: 'Monthly',
      lastAmount: '$0.085',
      yield: 2.85
    },
    distributionHistory: [
      { exDate: '2024-12-13', payDate: '2024-12-27', amount: 0.085 },
      { exDate: '2024-11-13', payDate: '2024-11-27', amount: 0.084 },
      { exDate: '2024-10-11', payDate: '2024-10-25', amount: 0.082 },
      { exDate: '2024-09-13', payDate: '2024-09-27', amount: 0.081 },
      { exDate: '2024-08-13', payDate: '2024-08-27', amount: 0.080 }
    ],
    documents: [
      {
        name: 'Current Fact Sheet',
        type: 'Fact Sheet',
        date: '2024-12-31',
        url: '/documents/nymbus-balanced-portfolio-factsheet.pdf'
      },
      {
        name: '2024 Annual Report',
        type: 'Annual Report',
        date: '2024-12-31',
        url: '/documents/nymbus-balanced-portfolio-annual-report.pdf'
      }
    ],
    benchmarks: {
      primary: 'FTSE Global All Cap Index',
      secondary: 'FTSE Canada Universe Bond Index'
    },
    inceptionDate: '2012-09-01',
    fundManager: 'Nymbus Capital Management',
    fundAUM: '$1,650,000,000',
    nav: 32.45,
    status: 'Active',
    link: '/funds/nymbus-balanced-portfolio'
  },
  {
    slug: 'nymbus-income-opportunity',
    name: 'Nymbus Income Opportunity Fund',
    isin: 'CA00000000004',
    assetClass: 'Fixed Income',
    shortDescription: 'A high-yield income fund focusing on corporate and government bonds',
    description: 'The Nymbus Income Opportunity Fund seeks to provide investors with a high level of current income through a diversified portfolio of higher-yielding fixed income securities, including corporate bonds and government bonds.',
    profileImageUrl: '/images/funds/income-opportunity.jpg',
    bannerImageUrl: '/images/funds/banners/income-opportunity.jpg',
    keyHighlights: [
      'High income focus',
      'Diversified bond portfolio',
      'Monthly distributions',
      'Active management'
    ],
    portfolio: {
      topHoldings: [
        { name: 'Corporate Bonds (65% of portfolio)', weight: 65.0 },
        { name: 'Government Bonds (20% of portfolio)', weight: 20.0 },
        { name: 'Preferred Shares (15% of portfolio)', weight: 15.0 }
      ],
      sectorAllocation: [
        { sector: 'Corporate Bonds', weight: 65.0 },
        { sector: 'Government Securities', weight: 20.0 },
        { sector: 'Preferred Shares', weight: 15.0 }
      ],
      creditQuality: [
        { rating: 'Investment Grade', weight: 70.0 },
        { rating: 'High Yield', weight: 30.0 }
      ]
    },
    characteristics: {
      duration: 4.8,
      yieldToMaturity: 5.85,
      avgCreditRating: 'BBB+',
      numberOfHoldings: 185,
      currentYield: 6.15
    },
    fees: {
      managementFee: '0.75%',
      mer: '0.95%',
      tradingExpenseRatio: '0.10%'
    },
    riskMetrics: {
      sharpe: 0.95,
      maxDrawdown: -7.8,
      standardDeviation: 5.2,
      trackingError: 2.5,
      downsideDeviation: 3.8,
      upCaptureRatio: 1.02,
      downCaptureRatio: 0.85
    },
    monthlyReturns: [
      { month: 'January 2024', value: 0.65 },
      { month: 'February 2024', value: 0.72 },
      { month: 'March 2024', value: 0.58 },
      { month: 'April 2024', value: 0.61 },
      { month: 'May 2024', value: 0.54 },
      { month: 'June 2024', value: 0.68 },
      { month: 'July 2024', value: 0.62 },
      { month: 'August 2024', value: 0.59 },
      { month: 'September 2024', value: 0.64 },
      { month: 'October 2024', value: 0.71 },
      { month: 'November 2024', value: 0.66 },
      { month: 'December 2024', value: 0.73 }
    ],
    calendarYearReturns: [
      { year: 2022, fund: 10.2, benchmark: 10.5 },
      { year: 2023, fund: 12.8, benchmark: 12.3 },
      { year: 2024, fund: 11.5, benchmark: 11.2 }
    ],
    compoundReturns: {
      oneMonth: 0.73,
      threeMonth: 1.95,
      sixMonth: 3.75,
      ytd: 7.85,
      oneYear: 11.5,
      threeYear: 11.8,
      fiveYear: 10.5,
      tenYear: 9.8,
      sinceInception: 10.2
    },
    distribution: {
      frequency: 'Monthly',
      lastAmount: '$0.062',
      yield: 6.15
    },
    distributionHistory: [
      { exDate: '2024-12-13', payDate: '2024-12-27', amount: 0.062 },
      { exDate: '2024-11-13', payDate: '2024-11-27', amount: 0.063 },
      { exDate: '2024-10-11', payDate: '2024-10-25', amount: 0.061 },
      { exDate: '2024-09-13', payDate: '2024-09-27', amount: 0.060 },
      { exDate: '2024-08-13', payDate: '2024-08-27', amount: 0.059 }
    ],
    documents: [
      {
        name: 'Current Fact Sheet',
        type: 'Fact Sheet',
        date: '2024-12-31',
        url: '/documents/nymbus-income-opportunity-factsheet.pdf'
      },
      {
        name: '2024 Annual Report',
        type: 'Annual Report',
        date: '2024-12-31',
        url: '/documents/nymbus-income-opportunity-annual-report.pdf'
      }
    ],
    benchmarks: {
      primary: 'FTSE Canada High Yield Index',
      secondary: 'Bloomberg US Corporate Index'
    },
    inceptionDate: '2008-04-15',
    fundManager: 'Nymbus Capital Management',
    fundAUM: '$985,000,000',
    nav: 18.92,
    status: 'Active',
    link: '/funds/nymbus-income-opportunity'
  },
  {
    slug: 'nymbus-international-equity',
    name: 'Nymbus International Equity Fund',
    isin: 'CA00000000005',
    assetClass: 'Equities',
    shortDescription: 'A diversified international equity fund with exposure to developed and emerging markets',
    description: 'The Nymbus International Equity Fund provides investors with diversified exposure to international equity markets outside North America. The fund invests in both developed and emerging markets to capture global growth opportunities.',
    profileImageUrl: '/images/funds/international-equity.jpg',
    bannerImageUrl: '/images/funds/banners/international-equity.jpg',
    keyHighlights: [
      'Global diversification',
      'Exposure to emerging markets',
      'Professional active management',
      'Quarterly distributions'
    ],
    portfolio: {
      topHoldings: [
        { name: 'ASML Holding NV', weight: 2.8 },
        { name: 'Nestle SA', weight: 2.5 },
        { name: 'LVMH Moet Hennessy', weight: 2.2 },
        { name: 'Samsung Electronics', weight: 2.0 },
        { name: 'Toyota Motor Corp', weight: 1.8 }
      ],
      sectorAllocation: [
        { sector: 'Technology', weight: 22.5 },
        { sector: 'Consumer Discretionary', weight: 18.2 },
        { sector: 'Financials', weight: 16.8 },
        { sector: 'Healthcare', weight: 14.5 },
        { sector: 'Other', weight: 28.0 }
      ],
      geographicBreakdown: [
        { region: 'Europe', weight: 38.5 },
        { region: 'Asia Pacific', weight: 35.2 },
        { region: 'Emerging Markets', weight: 26.3 }
      ]
    },
    characteristics: {
      numberOfHoldings: 220,
      beta: 1.15,
      currentYield: 1.25
    },
    fees: {
      managementFee: '0.85%',
      mer: '1.05%',
      tradingExpenseRatio: '0.15%'
    },
    riskMetrics: {
      sharpe: 1.15,
      maxDrawdown: -22.5,
      standardDeviation: 18.5,
      beta: 1.15,
      trackingError: 4.2,
      downsideDeviation: 13.2,
      upCaptureRatio: 1.12,
      downCaptureRatio: 0.93
    },
    monthlyReturns: [
      { month: 'January 2024', value: 2.35 },
      { month: 'February 2024', value: 1.65 },
      { month: 'March 2024', value: 2.75 },
      { month: 'April 2024', value: 1.45 },
      { month: 'May 2024', value: -1.25 },
      { month: 'June 2024', value: 2.55 },
      { month: 'July 2024', value: 3.45 },
      { month: 'August 2024', value: -0.95 },
      { month: 'September 2024', value: 2.35 },
      { month: 'October 2024', value: 3.15 },
      { month: 'November 2024', value: 3.75 },
      { month: 'December 2024', value: 3.25 }
    ],
    calendarYearReturns: [
      { year: 2022, fund: -14.5, benchmark: -14.2 },
      { year: 2023, fund: 28.5, benchmark: 28.2 },
      { year: 2024, fund: 25.2, benchmark: 24.8 }
    ],
    compoundReturns: {
      oneMonth: 3.25,
      threeMonth: 7.55,
      sixMonth: 8.15,
      ytd: 25.2,
      oneYear: 25.2,
      threeYear: 18.5,
      fiveYear: 20.2,
      tenYear: 16.8,
      sinceInception: 15.5
    },
    distribution: {
      frequency: 'Quarterly',
      lastAmount: '$0.28',
      yield: 1.25
    },
    distributionHistory: [
      { exDate: '2024-12-13', payDate: '2024-12-27', amount: 0.28 },
      { exDate: '2024-09-13', payDate: '2024-09-27', amount: 0.26 },
      { exDate: '2024-06-14', payDate: '2024-06-28', amount: 0.24 },
      { exDate: '2024-03-15', payDate: '2024-03-29', amount: 0.22 }
    ],
    documents: [
      {
        name: 'Current Fact Sheet',
        type: 'Fact Sheet',
        date: '2024-12-31',
        url: '/documents/nymbus-international-equity-factsheet.pdf'
      },
      {
        name: '2024 Annual Report',
        type: 'Annual Report',
        date: '2024-12-31',
        url: '/documents/nymbus-international-equity-annual-report.pdf'
      }
    ],
    benchmarks: {
      primary: 'MSCI World ex-North America Index',
      secondary: 'FTSE Developed ex-North America Index'
    },
    inceptionDate: '2005-11-20',
    fundManager: 'Nymbus Capital Management',
    fundAUM: '$2,125,000,000',
    nav: 45.32,
    status: 'Active',
    link: '/funds/nymbus-international-equity'
  }
];

export const getFundBySlug = (slug: string): Fund | undefined => {
  return funds.find((fund) => fund.slug === slug);
};

export const getFundsByAssetClass = (assetClass: Fund['assetClass']): Fund[] => {
  return funds.filter((fund) => fund.assetClass === assetClass);
};