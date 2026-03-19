export interface TeamMember {
  name: string;
  title: string;
  titleFr?: string;
  department: "Leadership" | "Investment Team" | "Quantitative Research" | "Operations" | "Board";
  bio: string;
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
    titleFr: "Président du conseil",
    department: "Board",
    bio: "Jean Turmel is the Chairman of Nymbus Capital's Board of Directors. He founded Perseus Capital in 2005 and previously served as President of Financial Markets at National Bank of Canada. He is a former Chairman of the Montreal Exchange and Natcan Portfolio Management, and currently serves as President of the Ontario Teachers' Pension Plan.",
    previousRoles: ["Founder, Perseus Capital", "President, Financial Markets — National Bank", "Chairman, Montreal Exchange", "President, Ontario Teachers' Pension Plan"],
    initials: "JT",
    color: "#1e3a5f",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/JEAN.png",
  },
  {
    name: "Jean-Luc Landry",
    title: "Associate Director & Vice-Chairman",
    titleFr: "Directeur associé et vice-président du conseil",
    department: "Board",
    bio: "Jean-Luc Landry brings over four decades of investment management expertise. He began his career in 1981 at Bolton Tremblay, where he rose to become President. He then served as President and CEO of Montrusco Bolton. He has held board positions at AIMCo and GardaWorld, bringing invaluable governance experience to Nymbus.",
    previousRoles: ["President & CEO, Montrusco Bolton", "President, Bolton Tremblay", "Board Member, AIMCo", "Board Member, GardaWorld"],
    initials: "JL",
    color: "#2d4a3e",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/JEAN-LUC.png",
  },
  {
    name: "Marc Rivet",
    title: "Chief Executive Officer",
    titleFr: "Directeur général",
    department: "Leadership",
    bio: "Marc Rivet co-founded Nymbus Capital in 2013, bringing decades of fixed income and derivatives experience. He previously founded Groupe ARB in 2005 and was an independent participant on the Montreal Exchange from 1991 to 2005, specializing in Canadian bond and derivative trading. He began his career in 1986 at Lévesque Beaubien Geoffrion (now National Bank Financial).",
    education: ["B.Comm Finance, Concordia University"],
    previousRoles: ["Founder, Groupe ARB", "Independent Participant, Montreal Exchange", "Lévesque Beaubien Geoffrion"],
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
    education: ["B.Com Finance, Concordia University"],
    designations: ["CIM"],
    previousRoles: ["Portfolio Manager, GC Capital", "Quantitative Trader, Groupe ARB"],
    yearJoined: 2013,
    initials: "GC",
    color: "#0066FF",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/GABRIEL.png",
  },
  {
    name: "Mathieu Poulin-Brière",
    title: "Partner, Systematic Overlays",
    titleFr: "Associé, superpositions systématiques",
    department: "Investment Team",
    bio: "Mathieu Poulin-Brière joined Nymbus in 2021 after eight years at Perseus Capital, a quantitative hedge fund, where he served as Head of Investments. He brings deep expertise in systematic trading strategies and portfolio overlay management, contributing to the firm's fixed income and multi-strategy mandates.",
    education: ["BAA Finance, UQAM", "M.Sc. Finance, Université de Sherbrooke"],
    designations: ["MSc"],
    yearJoined: 2021,
    initials: "MP",
    color: "#4a5568",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/MATHIEU.png",
  },
  {
    name: "Guy Liébart",
    title: "Portfolio Manager",
    titleFr: "Gestionnaire de portefeuille",
    department: "Investment Team",
    bio: "Guy Liébart oversees fixed income and multi-asset institutional mandates at Nymbus Capital. He previously served as President of Gestion Sodagep and began his career at the Caisse de dépôt et placement du Québec (CDPQ), one of Canada's largest institutional investors.",
    previousRoles: ["President, Gestion Sodagep", "Caisse de dépôt et placement du Québec"],
    initials: "GL",
    color: "#553c9a",
    photo: "https://www.nymbus.ca/wp-content/uploads/2025/06/Guy.png",
  },
  {
    name: "François-Olivier Laplante",
    title: "Partner & PM, Folco Strategies",
    titleFr: "Partenaire et gestionnaire de portefeuille, stratégies Folco",
    department: "Investment Team",
    bio: "François-Olivier Laplante leads Nymbus's Folco equity strategies. He previously held roles as Vice-President and Director at Desjardins Securities, where he specialized in equity portfolio management and institutional sales.",
    education: ["BAA, Université Laval"],
    previousRoles: ["VP & Director, Desjardins Securities"],
    initials: "FL",
    color: "#2b6cb0",
    photo: "https://www.nymbus.ca/wp-content/uploads/2025/06/FRANCOIS-OLIVIER.png",
  },
  {
    name: "Jessica Martins",
    title: "Head of Quantitative Research",
    titleFr: "Cheffe de la recherche quantitative",
    department: "Quantitative Research",
    bio: "Jessica Martins leads Nymbus's quantitative research team, bringing expertise in data science, machine learning, and mathematical modeling. She previously worked at Tower Research Capital, one of the world's leading quantitative trading firms, where she developed systematic FX trading strategies. She holds a PhD in Astrophysics.",
    education: ["PhD Astrophysics"],
    designations: ["PhD, Astrophysics"],
    previousRoles: ["Quantitative Researcher, Tower Research Capital"],
    yearJoined: 2022,
    initials: "JM",
    color: "#9b2c2c",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/JESSICA.png",
  },
  {
    name: "Jean-Philippe Lejeune",
    title: "Associate PM & Quantitative Developer",
    titleFr: "Gestionnaire de portefeuille associé et développeur quantitatif",
    department: "Quantitative Research",
    bio: "Jean-Philippe Lejeune oversees trading operations, model development, and risk management at Nymbus. He combines deep quantitative skills with practical portfolio management experience, ensuring the firm's systematic strategies are executed with precision and reliability.",
    education: ["M.Sc. Finance, Université Laval"],
    designations: ["CFA"],
    initials: "JPL",
    color: "#276749",
    photo: "https://www.nymbus.ca/wp-content/uploads/2025/06/Jean-Philippe.png",
  },
  {
    name: "Olivier Cyr-Choinière",
    title: "Quantitative Researcher",
    titleFr: "Chercheur quantitatif",
    department: "Quantitative Research",
    bio: "Olivier Cyr-Choinière joined Nymbus in 2023, bringing expertise in financial engineering and physics. He previously held research and portfolio management roles at the CDPQ, Trans-Canada Capital, and Futures First. He applies advanced statistical methods and machine learning to signal generation and strategy development.",
    education: ["PhD Physics, Superconductivity", "M.Sc. Financial Engineering"],
    designations: ["PhD, Physics, Superconductivity"],
    previousRoles: ["Researcher, CDPQ", "Trans-Canada Capital", "Futures First"],
    yearJoined: 2023,
    initials: "OC",
    color: "#744210",
    photo: "https://www.nymbus.ca/wp-content/uploads/2023/10/OLIVIER_new.png",
  },
  {
    name: "Diane Dusabimana",
    title: "Chief Compliance Officer",
    titleFr: "Cheffe de la conformité",
    department: "Operations",
    bio: "Diane Dusabimana oversees all compliance and regulatory affairs at Nymbus Capital. She brings extensive compliance experience from senior roles at Banque Nationale Investissements, Desjardins, and Fiera Capital. Her multi-disciplinary background ensures Nymbus maintains the highest standards of regulatory governance.",
    education: ["MBA, Université Laval"],
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
    designations: ["CFA"],
    previousRoles: ["Portfolio Administrator, Sodagep (23 years)"],
    initials: "JP",
    color: "#285e61",
    photo: "https://www.nymbus.ca/wp-content/uploads/2025/06/Jennifer.png",
  },
];

export const departmentLabels = ["Board", "Leadership", "Investment Team", "Quantitative Research", "Operations"] as const;

export const teamByDepartment = (department: TeamMember["department"]): TeamMember[] => {
  return team.filter((member) => member.department === department);
};

export const teamMemberByName = (name: string): TeamMember | undefined => {
  return team.find((member) => member.name === name);
};