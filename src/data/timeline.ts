export interface Milestone {
  year: number;
  title: string;
  description: string;
  category: "founding" | "growth" | "esg" | "milestone" | "innovation";
}

export const timeline: Milestone[] = [
  {
    year: 2013,
    title: "Foundation",
    description: "Nymbus Capital is founded. Algorithm development begins with R&D in fixed income macro and systematic overlays.",
    category: "founding",
  },
  {
    year: 2015,
    title: "Strategic Partnership",
    description: "Jean Turmel, founder of Perseus Capital and former Chairman of the Montreal Exchange, becomes a partner.",
    category: "growth",
  },
  {
    year: 2018,
    title: "PRI Signatory & Institutional Growth",
    description: "Nymbus becomes a signatory of the UN Principles for Responsible Investment (PRI). New institutional mandate with GardaWorld.",
    category: "esg",
  },
  {
    year: 2019,
    title: "Product Expansion",
    description: "New mandate with PGEQ. Launch of quantitative fixed income, short-term fixed income, and multi-strategy funds. Micro fixed income algorithm development begins.",
    category: "growth",
  },
  {
    year: 2020,
    title: "Historic Merger",
    description: "Three firms unite: Nymbus Capital (2013), Gestion de portefeuille Landry (2002), and Perseus Capital (2005). ESG exclusion integration begins. Operational automation rollout.",
    category: "milestone",
  },
  {
    year: 2021,
    title: "ESG Leadership",
    description: "Implementation of positive ESG screening in credit analysis. Team expansion with systematic overlay specialists.",
    category: "esg",
  },
  {
    year: 2022,
    title: "Innovation & New Mandates",
    description: "New institutional mandate with FMOQ (Quebec medical professionals' fund). Credit spread hedging modeling development.",
    category: "innovation",
  },
  {
    year: 2023,
    title: "Machine Learning Integration",
    description: "ML integration in market regime classification. Launch of sustainable bond funds with Fondaction. Achievement of zero fossil fuel exposure in credit portfolio.",
    category: "innovation",
  },
  {
    year: 2024,
    title: "$1 Billion Milestone",
    description: "Firm reaches $1 billion in assets under management, marking a major milestone in institutional growth and client trust.",
    category: "milestone",
  },
];

export const values = [
  {
    title: "Innovation",
    description: "We continuously push the boundaries of quantitative finance, integrating cutting-edge technology and research methodologies.",
    icon: "lightbulb",
  },
  {
    title: "Agility",
    description: "Our lean structure enables rapid adaptation to market conditions and swift implementation of new strategies.",
    icon: "zap",
  },
  {
    title: "Accountability",
    description: "We hold ourselves to the highest standards of performance, transparency, and fiduciary responsibility.",
    icon: "shield",
  },
  {
    title: "Integrity",
    description: "Every decision is guided by ethical principles and a commitment to acting in our clients' best interests.",
    icon: "heart",
  },
  {
    title: "Collaboration",
    description: "We believe the best outcomes emerge from diverse perspectives working together toward shared goals.",
    icon: "users",
  },
];