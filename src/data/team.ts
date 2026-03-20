export interface TeamMember {
  id: string;
  name: string;
  title: string;
  titleFr?: string;
  bio: string;
  bioFr?: string;
  summary: string;
  summaryFr?: string;
  department: string;
  photo?: string;
  initials: string;
  education: string[];
  designation?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: 'jean-claude-martin',
    name: 'Jean-Claude Martin',
    title: 'Chief Investment Officer',
    titleFr: 'Directeur des investissements',
    bio: 'Jean-Claude brings 25+ years of investment management experience.',
    bioFr: 'Jean-Claude apporte plus de 25 ans d\'expérience en gestion d\'investissements.',
    summary: 'CFA, MBA Finance',
    summaryFr: 'CFA, MBA Finance',
    department: 'investment',
    initials: 'JCM',
    education: ['HEC Montreal', 'CFA Charter'],
    designation: 'Founder'
  },
  {
    id: 'marie-sophie-leblanc',
    name: 'Marie-Sophie Leblanc',
    title: 'Head of Fixed Income',
    titleFr: 'Responsable du revenu fixe',
    bio: 'Marie-Sophie specializes in fixed income strategy and portfolio construction.',
    bioFr: 'Marie-Sophie se spécialise dans la stratégie de revenu fixe et la construction de portefeuille.',
    summary: 'CFA, MSc Finance',
    summaryFr: 'CFA, MSc Finance',
    department: 'investment',
    initials: 'MSL',
    education: ['Université McGill', 'CFA Charter'],
    designation: 'Senior Analyst'
  },
  {
    id: 'pierre-deschamps',
    name: 'Pierre Deschamps',
    title: 'Head of Risk Management',
    titleFr: 'Responsable de la gestion des risques',
    bio: 'Pierre leads our comprehensive risk management framework.',
    bioFr: 'Pierre dirige notre cadre complet de gestion des risques.',
    summary: 'CFA, Actuarial Fellow',
    summaryFr: 'CFA, Fellow actuariel',
    department: 'operations',
    initials: 'PD',
    education: ['Université Laval', 'CFA Charter'],
    designation: 'Senior Manager'
  },
  {
    id: 'anne-marie-gagnon',
    name: 'Anne-Marie Gagnon',
    title: 'Head of Client Relations',
    titleFr: 'Responsable des relations clients',
    bio: 'Anne-Marie manages our institutional and high-net-worth client relationships.',
    bioFr: 'Anne-Marie gère nos relations avec les clients institutionnels et les clients fortunés.',
    summary: 'MBA, CIPM',
    summaryFr: 'MBA, CIPM',
    department: 'client-services',
    initials: 'AMG',
    education: ['Université de Montréal', 'CIPM'],
    designation: 'Director'
  },
  {
    id: 'robert-lebrun',
    name: 'Robert Lebrun',
    title: 'Senior Analyst, Alternatives',
    titleFr: 'Analyste principal, Placements alternatifs',
    bio: 'Robert specializes in alternative investment strategies.',
    bioFr: 'Robert se spécialise dans les stratégies de placement alternatif.',
    summary: 'CFA, PhD Economics',
    summaryFr: 'CFA, PhD Économie',
    department: 'investment',
    initials: 'RL',
    education: ['Université du Québec', 'CFA Charter'],
    designation: 'Analyst'
  },
  {
    id: 'isabelle-moreau',
    name: 'Isabelle Moreau',
    title: 'Chief Financial Officer',
    titleFr: 'Directrice financière',
    bio: 'Isabelle oversees all financial operations and fund administration.',
    bioFr: 'Isabelle supervise toutes les opérations financières et l\'administration des fonds.',
    summary: 'MBA, CPA',
    summaryFr: 'MBA, CPA',
    department: 'operations',
    initials: 'IM',
    education: ['HEC Montreal', 'CPA Designation'],
    designation: 'Executive'
  },
  {
    id: 'claude-bernard',
    name: 'Claude Bernard',
    title: 'Head of Compliance',
    titleFr: 'Responsable de la conformité',
    bio: 'Claude ensures our firm meets all regulatory requirements.',
    bioFr: 'Claude s\'assure que notre cabinet respecte toutes les exigences réglementaires.',
    summary: 'MSc Law, ASC',
    summaryFr: 'MSc Droit, ASC',
    department: 'operations',
    initials: 'CB',
    education: ['Université de Montréal Faculty of Law'],
    designation: 'Senior Manager'
  },
  {
    id: 'nadine-rousseau',
    name: 'Nadine Rousseau',
    title: 'Research Analyst',
    titleFr: 'Analyste de recherche',
    bio: 'Nadine leads our proprietary research initiatives.',
    bioFr: 'Nadine dirige nos initiatives de recherche propriétaires.',
    summary: 'MSc, CFA Level III',
    summaryFr: 'MSc, CFA Niveau III',
    department: 'investment',
    initials: 'NR',
    education: ['Concordia University'],
    designation: 'Analyst'
  },
  {
    id: 'thomas-lavigne',
    name: 'Thomas Lavigne',
    title: 'Portfolio Manager',
    titleFr: 'Gestionnaire de portefeuille',
    bio: 'Thomas manages several institutional fixed income strategies.',
    bioFr: 'Thomas gère plusieurs stratégies institutionnelles de revenu fixe.',
    summary: 'CFA, BSc Mathematics',
    summaryFr: 'CFA, BSc Mathématiques',
    department: 'investment',
    initials: 'TL',
    education: ['Université de Sherbrooke'],
    designation: 'Manager'
  },
  {
    id: 'marie-christine-marchand',
    name: 'Marie-Christine Marchand',
    title: 'Operations Manager',
    titleFr: 'Gestionnaire des opérations',
    bio: 'Marie-Christine coordinates daily fund operations.',
    bioFr: 'Marie-Christine coordonne les opérations quotidiennes des fonds.',
    summary: 'BBA, Operations Certified',
    summaryFr: 'BBA, Certifiée opérations',
    department: 'operations',
    initials: 'MCM',
    education: ['Bishop\'s University'],
    designation: 'Coordinator'
  },
  {
    id: 'daniel-lefebvre',
    name: 'Daniel Lefebvre',
    title: 'Senior Portfolio Manager',
    titleFr: 'Gestionnaire de portefeuille principal',
    bio: 'Daniel leads our quantitative research team.',
    bioFr: 'Daniel dirige notre équipe de recherche quantitative.',
    summary: 'CFA, PhD Finance',
    summaryFr: 'CFA, PhD Finance',
    department: 'investment',
    initials: 'DL',
    education: ['Université Laval'],
    designation: 'Senior Manager'
  },
  {
    id: 'veronique-parent',
    name: 'Véronique Parent',
    title: 'Marketing Manager',
    titleFr: 'Gestionnaire du marketing',
    bio: 'Véronique manages our marketing and communications strategy.',
    bioFr: 'Véronique gère notre stratégie de marketing et de communications.',
    summary: 'MBA Marketing, Communications',
    summaryFr: 'MBA Marketing, Communications',
    department: 'client-services',
    initials: 'VP',
    education: ['Université de Montréal'],
    designation: 'Manager'
  },
  {
    id: 'simon-fournier',
    name: 'Simon Fournier',
    title: 'Systems Administrator',
    titleFr: 'Administrateur système',
    bio: 'Simon manages our IT infrastructure and systems.',
    bioFr: 'Simon gère notre infrastructure informatique et nos systèmes.',
    summary: 'BSc IT, Security Certified',
    summaryFr: 'BSc TI, Certifié sécurité',
    department: 'operations',
    initials: 'SF',
    education: ['UQAM'],
    designation: 'Administrator'
  },
  {
    id: 'francine-belanger',
    name: 'Francine Bélanger',
    title: 'Client Service Representative',
    titleFr: 'Représentante du service à la clientèle',
    bio: 'Francine provides support to our institutional clients.',
    bioFr: 'Francine soutient nos clients institutionnels.',
    summary: 'BBA, Customer Service Excellence',
    summaryFr: 'BBA, Excellence du service à la clientèle',
    department: 'client-services',
    initials: 'FB',
    education: ['Collège Héritages'],
    designation: 'Representative'
  },
  {
    id: 'philippe-leclerc',
    name: 'Philippe Leclerc',
    title: 'Investment Analyst',
    titleFr: 'Analyste d\'investissement',
    bio: 'Philippe analyzes credit opportunities across our strategies.',
    bioFr: 'Philippe analyse les opportunités de crédit dans l\'ensemble de nos stratégies.',
    summary: 'CFA, MBA Finance',
    summaryFr: 'CFA, MBA Finance',
    department: 'investment',
    initials: 'PL',
    education: ['HEC Montreal'],
    designation: 'Analyst'
  },
  {
    id: 'dominique-gagne',
    name: 'Dominique Gagné',
    title: 'Compliance Officer',
    titleFr: 'Agent de conformité',
    bio: 'Dominique monitors regulatory compliance across operations.',
    bioFr: 'Dominique surveille la conformité réglementaire dans l\'ensemble des opérations.',
    summary: 'MSc Compliance, Legal Background',
    summaryFr: 'MSc Conformité, Formation juridique',
    department: 'operations',
    initials: 'DG',
    education: ['Université de Montréal'],
    designation: 'Officer'
  },
  {
    id: 'sylvie-demers',
    name: 'Sylvie Demers',
    title: 'Business Development Manager',
    titleFr: 'Gestionnaire du développement commercial',
    bio: 'Sylvie develops relationships with advisor and distribution partners.',
    bioFr: 'Sylvie développe les relations avec les partenaires conseillers et distributeurs.',
    summary: 'MBA, Sales Management Certified',
    summaryFr: 'MBA, Certifiée gestion des ventes',
    department: 'client-services',
    initials: 'SD',
    education: ['Université McGill'],
    designation: 'Manager'
  },
  {
    id: 'eric-marchand',
    name: 'Éric Marchand',
    title: 'Data Analyst',
    titleFr: 'Analyste de données',
    bio: 'Éric supports our analytics and reporting infrastructure.',
    bioFr: 'Éric soutient notre infrastructure d\'analyse et de rapports.',
    summary: 'BSc Data Science, Python Developer',
    summaryFr: 'BSc Science des données, Développeur Python',
    department: 'operations',
    initials: 'EM',
    education: ['Université Laval'],
    designation: 'Analyst'
  },
  {
    id: 'caroline-charest',
    name: 'Caroline Charest',
    title: 'Client Relationship Manager',
    titleFr: 'Gestionnaire des relations client',
    bio: 'Caroline manages relationships with key institutional accounts.',
    bioFr: 'Caroline gère les relations avec les principaux comptes institutionnels.',
    summary: 'BBA, CIM Designation',
    summaryFr: 'BBA, Titre CIM',
    department: 'client-services',
    initials: 'CC',
    education: ['Concordia University'],
    designation: 'Manager'
  }
];

export function teamByDepartment(department: string): TeamMember[] {
  return teamMembers.filter(member => member.department === department);
}

export function teamMemberByName(name: string): TeamMember | undefined {
  return teamMembers.find(member => member.name.toLowerCase() === name.toLowerCase());
}

export const departmentLabels = {
  investment: 'Investment Team',
  operations: 'Operations',
  'client-services': 'Client Services'
};

export const departmentLabelsFr = {
  investment: 'Équipe d\'investissement',
  operations: 'Opérations',
  'client-services': 'Services à la clientèle'
};