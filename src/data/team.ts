export interface TeamMember {
  name: string;
  title: string;
  titleFr?: string;
  department: "Leadership" | "Investment Team" | "Quantitative Research" | "Operations" | "Board";
  bio: string;
  summary?: string;
  education?: string[];
  designations?: string[];
  previousRoles?: string[];
  yearJoined?: number;
  initials: string;
  color: string;
  photo?: string;
}

export const team: TeamMember[] = [
  {
    name: "Jean Turmel",
    title: "Chairman of the Board",
    titleFr: "Pr\u00e9sident du conseil",
    department: "Board",
    bio: "Jean Turmel is the Chairman of Nymbus Capital's Board of Directors. He founded Perseus Capital in 2005 and previously served as President of Financial Markets at National Bank of Canada. He is a former Chairman of the Montreal Exchange and Natcan Portfolio Management, and currently serves as President of the Ontario Teachers' Pension Plan.",
    summary: "Former Chairman of the Montreal Exchange and President at National Bank",
    education: ["MBA, Universit\u00e9 Laval"],
    designations: ["MBA"],
    previousRoles: ["Founder, Perseus Capital", "President, Financial Markets \u2014 National Bank", "Chairman, Montreal Exchange", "President, Ontario Teachers' Pension Plan"],
    initials: "JT",
    color: "#1e3a5f",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/JEAN.png",
  },
  {
    name: "Jean-Luc Landry",
    title: "Vice-Chairman of the Board",
    titleFr: "Vice-pr\u00e9sident du conseil",
    department: "Board",
    bio: "Jean-Luc Landry brings over four decades of investment management expertise. He began his career in 1981 at Bolton Tremblay, where he rose to become President. He then served as President and CEO of Montrusco Bolton. He has held board positions at AIMCo and GardaWorld, bringing invaluable governance experience to Nymbus.",
    summary: "Former CEO of Montrusco Bolton, 40+ years in portfolio management",
    education: ["M.Sc. Economics, University of Ottawa", "B.A. Economics, Coll\u00e8ge Sainte-Marie"],
    designations: ["M.Sc."],
    previousRoles: ["President & CEO, Montrusco Bolton", "President, Bolton Tremblay", "Board Member, AIMCo", "Board Member, GardaWorld"],
    initials: "JL",
    color: "#2d4a3e",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/JEAN-LUC.png",
  },
  {
    name: "Marc Rivet",
    title: "Chief Executive Officer",
    titleFr: "Directeur g\u00e9n\u00e9ral",
    department: "Leadership",
    bio: "Marc Rivet co-founded Nymbus Capital in 2013, bringing decades of fixed income and derivatives experience. He previously founded Groupe ARB in 2005 and was an independent participant on the Montreal Exchange from 1991 to 2005, specializing in Canadian bond and derivative trading. He began his career in 1986 at L\u00e9vesque Beaubien Geoffrion (now National Bank Financial).",
    summary: "Co-founded Nymbus after 25+ years trading Canadian bonds and derivatives",
    education: ["B.Comm Finance, Concordia University"],
    previousRoles: ["Founder, Groupe ARB", "Independent Participant, Montreal Exchange", "L\u00e9vesque Beaubien Geoffrion"],
    yearJoined: 2013,
    initials: "MR",
    color: "#1a365d",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/MARC.png",
  },
  {
    name: "Gabriel Cefaloni",
    title: "Chief Investment Officer",
    titleFr: "Chef des placements",
    department: "Leadership",
    bio: "Gabriel Cefaloni co-founded Nymbus Capital with a focus on technology-driven systematic investing. With nearly two decades of experience, he participated in the first wave of high-frequency trading in Canada at Groupe ARB and subsequently managed quantitative derivatives strategies at GC Capital. He leads the firm's investment strategy, research, and technology direction.",
    summary: "Technologist at the intersection of applied math, CS, and quantitative finance",
    education: ["B.Com Finance, Concordia University"],
    designations: ["CIM"],
    previousRoles: ["Portfolio Manager, GC Capital", "Quantitative Trader, Groupe ARB"],
    yearJoined: 2013,
    initials: "GC",
    color: "#0066FF",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/GABRIEL.png",
  },
  {
    name: "Mathieu Poulin-Bri\u00e8re",
    title: "Partner, Systematic Overlays",
    titleFr: "Associ\u00e9, superpositions syst\u00e9matiques",
    department: "Leadership",
    bio: "Mathieu Poulin-Bri\u00e8re joined Nymbus in 2021 after eight years at Perseus Capital, a quantitative hedge fund, where he served as Head of Investments. He brings deep expertise in systematic trading strategies and portfolio overlay management, contributing to the firm's fixed income and multi-strategy mandates.",
    summary: "Built systematic macro strategies across derivatives and multiple asset classes",
    education: ["BAA Finance, UQAM", "M.Sc. Finance, Universit\u00e9 de Sherbrooke"],
    designations: ["MSc"],
    yearJoined: 2021,
    initials: "MP",
    color: "#4a5568",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/MATHIEU.png",
  },
  {
    name: "Guy Li\u00e9bart",
    title: "Portfolio Manager",
    titleFr: "Gestionnaire de portefeuille",
    department: "Investment Team",
    bio: "Guy Li\u00e9bart oversees fixed income and multi-asset institutional mandates at Nymbus Capital. He previously served as President of Gestion Sodagep and began his career at the Caisse de d\u00e9p\u00f4t et placement du Qu\u00e9bec (CDPQ), one of Canada's largest institutional investors.",
    summary: "50+ years managing institutional fixed income, starting at CDPQ",
    previousRoles: ["President, Gestion Sodagep", "Caisse de d\u00e9p\u00f4t et placement du Qu\u00e9bec"],
    initials: "GL",
    color: "#553c9a",
    photo: "https://www.nymbus.ca/wp-content/uploads/2025/06/Guy.png",
  },
  {
    name: "Fran\u00e7ois-Olivier Laplante",
    title: "Portfolio Manager, Folco Strategies",
    titleFr: "Gestionnaire de portefeuille, strat\u00e9gies Folco",
    department: "Investment Team",
    bio: "Fran\u00e7ois-Olivier Laplante leads Nymbus's Folco equity strategies. He previously held roles as Vice-President and Director at Desjardins Securities, where he specialized in equity portfolio management and institutional sales.",
    summary: "Leads Nymbus's real estate equity strategies",
    education: ["BAA, Universit\u00e9 Laval"],
    previousRoles: ["VP & Director, Desjardins Securities"],
    initials: "FL",
    color: "#2b6cb0",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/FRANCOIS-OLIVIER.png",
  },
  {
    name: "Jessica Martins",
    title: "Head of Quantitative Research",
    titleFr: "Cheffe de la recherche quantitative",
    department: "Quantitative Research",
    bio: "Jessica Martins leads Nymbus's quantitative research team, bringing expertise in data science, machine learning, and mathematical modeling. She previously worked at Tower Research Capital, one of the world's leading quantitative trading firms, where she developed systematic FX trading strategies. She holds a PhD in Astrophysics.",
    summary: "PhD in Astrophysics turned quantitative finance researcher",
    education: ["PhD Astrophysics"],
    designations: ["PhD"],
    previousRoles: ["Quantitative Researcher, Tower Research Capital"],
    yearJoined: 2022,
    initials: "JM",
    color: "#9b2c2c",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/JESSICA.png",
  },
  {
    name: "Jean-Philippe Lejeune",
    title: "Associate PM & Quantitative Developer",
    titleFr: "Gestionnaire de portefeuille associ\u00e9 et d\u00e9veloppeur quantitatif",
    department: "Quantitative Research",
    bio: "Jean-Philippe Lejeune oversees trading operations, model development, and risk management at Nymbus. He combines deep quantitative skills with practical portfolio management experience, ensuring the firm's systematic strategies are executed with precision and reliability.",
    summary: "CFA charterholder bridging quantitative models with live trading execution",
    education: ["M.Sc. Finance, Universit\u00e9 Laval"],
    designations: ["CFA", "M.Sc."],
    initials: "JPL",
    color: "#276749",
    photo: "https://www.nymbus.ca/wp-content/uploads/2025/06/Jean-Philippe.png",
  },
  {
    name: "Olivier Cyr-Choini\u00e8re",
    title: "Quantitative Researcher",
    titleFr: "Chercheur quantitatif",
    department: "Quantitative Research",
    bio: "Olivier Cyr-Choini\u00e8re joined Nymbus in 2023, bringing expertise in financial engineering and physics. He previously held research and portfolio management roles at the CDPQ, Trans-Canada Capital, and Futures First. He applies advanced statistical methods and machine learning to signal generation and strategy development.",
    summary: "PhD in Condensed Matter Physics, former quant analyst at CDPQ",
    education: ["PhD Physics, Superconductivity", "M.Sc. Financial Engineering"],
    designations: ["PhD", "M.Sc."],
    previousRoles: ["Researcher, CDPQ", "Trans-Canada Capital", "Futures First"],
    yearJoined: 2023,
    initials: "OC",
    color: "#744210",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/OLIVIER_new.png",
  },
  {
    name: "Diane Dusabimana",
    title: "Chief Compliance Officer",
    titleFr: "Cheffe de la conformit\u00e9",
    department: "Operations",
    bio: "Diane Dusabimana oversees all compliance and regulatory affairs at Nymbus Capital. She brings extensive compliance experience from senior roles at Banque Nationale Investissements, Desjardins, and Fiera Capital. Her multi-disciplinary background ensures Nymbus maintains the highest standards of regulatory governance.",
    summary: "CPA, CFA with compliance leadership at National Bank, Desjardins, and Fiera",
    education: ["MBA, Universit\u00e9 Laval"],
    designations: ["MBA", "CPA", "CFA"],
    previousRoles: ["Banque Nationale Investissements", "Desjardins", "Fiera Capital"],
    initials: "DD",
    color: "#702459",
    photo: "https://www.nymbus.ca/wp-content/uploads/2025/07/DIANE.png",
  },
  {
    name: "Jennifer Pinkerton",
    title: "Portfolio Administrator",
    titleFr: "Administratrice de portefeuille",
    department: "Operations",
    bio: "Jennifer Pinkerton manages portfolio administration, NAV calculations, and investor reporting for all fund products. She brings over 23 years of experience from Sodagep, ensuring accurate and timely reporting to investors and regulatory authorities.",
    summary: "CFA charterholder with 20+ years in institutional portfolio administration",
    designations: ["CFA"],
    previousRoles: ["Portfolio Administrator, Sodagep (23 years)"],
    initials: "JP",
    color: "#285e61",
    photo: "https://www.nymbus.ca/wp-content/uploads/2025/06/Jennifer.png",
  },
];

export const departmentLabels = ["Leadership", "Quantitative Research", "Investment Team", "Operations", "Board"] as const;

export const teamByDepartment = (department: TeamMember["department"]): TeamMember[] => {
  return team.filter((member) => member.department === department);
};

export const teamMemberByName = (name: string): TeamMember | undefined => {
  return team.find((member) => member.name === name);
};
