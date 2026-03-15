export interface TeamMember {
  name: string;
  title: string;
  department: "Leadership" | "Investment Team" | "Quantitative Research" | "Operations";
  bio: string;
}

export const team: TeamMember[] = [
  // Leadership
  {
    name: "Gabriel Cefaloni",
    title: "CIO & Founder",
    department: "Leadership",
    bio: "Gabriel founded Nymbus Capital with a vision to bring scientific rigor and systematic approaches to alternative asset management. With extensive experience in quantitative finance and portfolio construction, he leads the investment strategy and research direction across all fund products.",
  },
  {
    name: "Marc Rivet",
    title: "VP Business Development",
    department: "Leadership",
    bio: "Marc drives institutional relationships and business growth for Nymbus Capital, leveraging deep connections across the Canadian investment community. He focuses on expanding distribution channels and supporting new client onboarding.",
  },

  // Investment Team
  {
    name: "Mathieu Poulin-Brière",
    title: "Portfolio Manager",
    department: "Investment Team",
    bio: "Mathieu manages the Sustainable Enhanced Bonds strategies with a focus on ESG integration and fixed income enhancement. His analytical approach combines traditional credit analysis with quantitative screening to identify compelling investment opportunities.",
  },
  {
    name: "Richard Langevin",
    title: "Portfolio Manager, Managed Futures",
    department: "Investment Team",
    bio: "Richard oversees the managed futures components of the Multi-Strategy Fund, applying systematic trend-following and quantitative signals to generate diversified returns. His expertise spans commodity, equity, and fixed income futures markets.",
  },
  {
    name: "Jason Laliberte",
    title: "Portfolio Manager, Global Equities",
    department: "Investment Team",
    bio: "Jason leads the global equity allocation and minimum volatility strategies, utilizing quantitative optimization and risk modeling to construct efficient multi-asset portfolios. His focus is on delivering resilient returns across market cycles.",
  },
  {
    name: "François-Olivier",
    title: "Analyst",
    department: "Investment Team",
    bio: "François-Olivier supports the investment team with fundamental and quantitative analysis across multiple asset classes, contributing to security selection and portfolio construction processes.",
  },

  // Quantitative Research
  {
    name: "Jessica Martins",
    title: "Quant Researcher",
    department: "Quantitative Research",
    bio: "Jessica leads research initiatives in factor analysis, portfolio optimization, and systematic strategy development. She develops proprietary models and backtesting frameworks that form the foundation of Nymbus's investment processes.",
  },
  {
    name: "Jean-Philippe Lejeune",
    title: "Quant Developer",
    department: "Quantitative Research",
    bio: "Jean-Philippe builds and maintains the quantitative infrastructure supporting all trading and portfolio management activities. His work includes algorithm development, data engineering, and real-time risk monitoring systems.",
  },
  {
    name: "Olivier Cyr-Choinière",
    title: "Quant Developer",
    department: "Quantitative Research",
    bio: "Olivier develops advanced portfolio analytics tools and optimization models used across fund strategies. He specializes in performance attribution and risk decomposition for both internal analysis and client reporting.",
  },
  {
    name: "Tyler Wang",
    title: "Quant Analyst",
    department: "Quantitative Research",
    bio: "Tyler supports quantitative research and strategy development with statistical analysis and data science techniques. He contributes to strategy backtesting, signal research, and model validation across all fund products.",
  },

  // Operations
  {
    name: "Axl Villapaz",
    title: "Operations Manager",
    department: "Operations",
    bio: "Axl oversees operational excellence, technology infrastructure, and process optimization for Nymbus Capital. He ensures smooth execution of trading, settlement, and fund administration across all strategies.",
  },
  {
    name: "Xavier Girard",
    title: "Client Relations",
    department: "Operations",
    bio: "Xavier manages relationships with institutional clients, advisors, and fund platforms, providing exceptional service and support. He coordinates client communications, reporting, and onboarding initiatives.",
  },
  {
    name: "Jennifer Pinkerton",
    title: "Compliance Officer",
    department: "Operations",
    bio: "Jennifer ensures Nymbus Capital maintains the highest standards of regulatory compliance and governance. She manages compliance policies, conducts regulatory reviews, and maintains relationships with regulatory bodies.",
  },
  {
    name: "Danira Csano",
    title: "Fund Administration",
    department: "Operations",
    bio: "Danira oversees fund accounting, NAV calculations, and investor reporting for all fund products. She ensures accurate and timely reporting to investors and regulatory authorities.",
  },
];

export const teamByDepartment = (department: TeamMember["department"]): TeamMember[] => {
  return team.filter((member) => member.department === department);
};

export const teamMemberByName = (name: string): TeamMember | undefined => {
  return team.find((member) => member.name === name);
};