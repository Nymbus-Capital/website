export interface NewsItem {
  date: string;
  title: string;
  category: string;
  description: string;
  image: string;
  article: string;
  link: string;
}

export const newsItems: NewsItem[] = [
  {
    date: 'January 28, 2025',
    title: 'Mageska Capital and Nymbus Capital announce a partnership',
    category: 'Partnership',
    description: 'Mageska entrusts Nymbus with the management of a specific portion of the Mageska Fund to implement a portable alpha strategy.',
    image: 'https://www.nymbus.ca/wp-content/uploads/2025/01/2025-01_Mageska-1000x600.png',
    article: 'Mageska Capital Inc., an innovative investment management firm, announces today a partnership with Nymbus Capital Inc, an asset management firm recognized for its avant-garde systematic strategies and rigorous risk management.\n\nUnder this agreement, Mageska Capital entrusts Nymbus Capital with the management of a specific portion of the Mageska Fund to implement a portable alpha strategy. Thanks to Nymbus Capital\'s recognized expertise in low-volatility strategies uncorrelated with traditional indices, this collaboration aims to enhance the Fund\'s overall return potential while reducing its correlation with its benchmark index.\n\nBoth firms share a common vision of investment, combining innovation, technology and discipline to offer investors high-performing, sustainable solutions.',
    link: 'https://www.nymbus.ca/en/nouvelles/mageska-capital-and-nymbus-capital-announce-a-partnership/',
  },
  {
    date: 'April 23, 2024',
    title: 'Nymbus becomes a signatory of the Tobacco-Free Finance Pledge',
    category: 'ESG',
    description: 'Nymbus commits to excluding tobacco companies from all its portfolios.',
    image: 'https://www.nymbus.ca/wp-content/uploads/2024/04/Nouvelle-Site-Web-Signature-Tabacco-Free-Finance-Pledge-1000x600.png',
    article: 'We\'re proud to announce that Nymbus has become a signatory of the Tobacco-Free Finance Pledge led by Tobacco Free Portfolios and that we\'re committed to excluding tobacco companies from all its portfolios.\n\nPublic health programs around the world are spending billions every year treating cancer, emphysema, heart disease, and many other diseases linked to tobacco use. At Nymbus, we think that institutional investors and asset managers can play an active role in the global fight against tobacco.\n\nWith eight million deaths worldwide each year and one billion deaths projected this century due to tobacco-related illnesses, it is vital to build on global and multi-stakeholder collaboration to fight the devastating impact of tobacco on society, as well as on the environment.',
    link: 'https://www.nymbus.ca/en/nouvelles/nymbus-becomes-a-signatory-of-the-tobacco-free-finance-pledge/',
  },
  {
    date: 'November 16, 2023',
    title: 'Nymbus fixed income funds ranked in top percentiles',
    category: 'Recognition',
    description: 'All three fixed income strategies ranked in top percentiles of the RBC Fund Study.',
    image: 'https://www.nymbus.ca/wp-content/uploads/2024/02/2023-11-16_Classement-RBC-1000x600.png',
    article: 'Nymbus Capital is proud to announce that all three of its fixed income strategies managed by the firm have been ranked in the top percentiles of the RBC Fund Study, a comprehensive analysis of Canadian investment fund performance.\n\nThis recognition reflects the firm\'s disciplined quantitative approach to fixed income investing, combining systematic credit analysis with rigorous risk management. The consistent top-tier performance across all three strategies demonstrates the robustness of our investment methodology across different market conditions.',
    link: 'https://www.nymbus.ca/en/news/',
  },
  {
    date: 'October 3, 2023',
    title: 'Nymbus partners with Dans la rue',
    category: 'Community',
    description: 'Supporting at-risk youth — 20% of homeless people in Canada are between 13 and 24 years old.',
    image: 'https://www.nymbus.ca/wp-content/uploads/2024/02/2023-11-03_Dans-la-rue-1000x600.png',
    article: 'Nymbus Capital is proud to announce its partnership with Dans la rue, a Montreal-based organization dedicated to supporting homeless and at-risk youth.\n\nDid you know that 20% of homeless people in Canada are between 13 and 24 years old? Dans la rue has been working since 1988 to help young people in difficulty get off the streets and build a better future. The organization provides essential services including emergency shelter, food, counseling, and educational support.\n\nAt Nymbus, we believe in giving back to our community. This partnership represents our commitment to making a positive impact beyond the financial markets.',
    link: 'https://www.nymbus.ca/en/news/',
  },
];