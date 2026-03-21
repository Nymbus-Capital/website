'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function LegalPage() {
  const { locale } = useTranslation();
  const fr = locale === 'fr';
  const [activeTab, setActiveTab] = useState('terms');

  const tabs = [
    { id: 'terms', label: fr ? 'Conditions d\'utilisation' : 'Terms of Use' },
    { id: 'regulatory', label: fr ? 'Divulgations réglementaires' : 'Regulatory Disclosures' },
  ];

  return (
    <main className="bg-white min-h-screen">
      <section className="bg-white border-b border-slate-100 pt-8 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">{fr ? 'Juridique' : 'Legal'}</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{fr ? 'Conditions d\'utilisation' : 'Terms & Conditions'}</h1>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-8 border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-3 text-sm font-medium transition-colors border-b-2',
                  activeTab === tab.id ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'terms' && (
            <div className="prose prose-slate max-w-none">
              <p className="text-sm text-slate-500 mb-6">{fr ? 'Dernière mise à jour : 15 mars 2025' : 'Last Updated: March 15, 2025'}</p>

              <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '1. Avis de non-responsabilité' : '1. Disclaimer'}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {fr
                  ? 'Les informations et opinions contenues sur ce site sont fournies « telles quelles », sans aucune garantie de quelque nature que ce soit, expresse ou implicite, dans toute la mesure permise par la loi applicable. Nymbus Capital décline spécifiquement toute représentation, approbation, garantie, expresse ou implicite, concernant le site, y compris, sans limitation, les garanties implicites de qualité marchande et d\'adéquation à un usage particulier et de non-contrefaçon des droits de tiers.'
                  : 'The information and opinions contained on this site are provided "as is" without any warranty of any kind, either expressed or implied, to the fullest extent permissible pursuant to applicable law. Nymbus Capital specifically disclaims any representations, endorsements, guarantees, or warranties, express or implied, regarding the site, including without limitation, the implied warranties of merchantability and fitness for a particular purpose and non-infringement of third-party rights.'}
              </p>

              <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '2. Limitation de responsabilité' : '2. Limitation of Liability'}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {fr
                  ? 'Nymbus Capital ne fait aucune garantie que les fonctions contenues sur ce site seront ininterrompues ou exemptes d\'erreurs, que les défauts seront corrigés, ou que ce site ou les serveurs qui le rendent disponible seront exempts de virus ou d\'autres composants nuisibles. L\'utilisateur accepte expressément que l\'ensemble du risque quant à la qualité et la performance du site est assumé uniquement par l\'utilisateur.'
                  : 'Nymbus Capital makes no warranties that functions contained on this site will be uninterrupted or error-free, that defects will be corrected, or that this site or the servers that make it available will be free of viruses or other harmful components. Users expressly agree that the entire risk as to the quality and performance of the site is assumed solely by the user.'}
              </p>

              <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '3. Aucun conseil en placement' : '3. No Investment Advice'}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {fr
                  ? 'Le contenu de ce site Web est fourni à titre informatif uniquement et ne constitue pas un conseil en placement, une offre de vente ou une sollicitation d\'achat de tout titre ou produit financier. Les performances passées ne sont pas indicatives des résultats futurs. Les investisseurs doivent consulter leurs conseillers financiers avant de prendre toute décision d\'investissement.'
                  : 'The content of this website is provided for informational purposes only and does not constitute investment advice, an offer to sell, or a solicitation to buy any security or financial product. Past performance is not indicative of future results. Investors should consult their financial advisors before making any investment decisions.'}
              </p>

              <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '4. Propriété intellectuelle' : '4. Intellectual Property'}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {fr
                  ? 'L\'ensemble du contenu de ce site Web, y compris les textes, graphiques, logos, icônes et images, est la propriété de Nymbus Capital Inc. et est protégé par les lois canadiennes et internationales sur le droit d\'auteur. Aucune partie de ce site ne peut être reproduite, distribuée ou transmise sans l\'autorisation écrite préalable de Nymbus Capital Inc.'
                  : 'All content on this website, including text, graphics, logos, icons, and images, is the property of Nymbus Capital Inc. and is protected by Canadian and international copyright laws. No part of this site may be reproduced, distributed, or transmitted without the prior written permission of Nymbus Capital Inc.'}
              </p>

              <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '5. Liens vers des tiers' : '5. Third-Party Links'}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {fr
                  ? 'Ce site peut contenir des liens vers des sites Web tiers. Nymbus Capital décline toute responsabilité quant au contenu, à l\'exactitude ou aux pratiques de confidentialité de ces sites tiers. L\'inclusion de tels liens ne constitue ni une approbation ni une recommandation.'
                  : 'This site may contain links to third-party websites. Nymbus Capital disclaims any responsibility for the content, accuracy, or privacy practices of such third-party sites. The inclusion of such links does not constitute endorsement or recommendation.'}
              </p>

              <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '6. Droit applicable' : '6. Governing Law'}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {fr
                  ? 'Les présentes conditions sont régies et interprétées conformément aux lois de la province de Québec et aux lois fédérales du Canada applicables dans celle-ci, sans égard aux dispositions relatives aux conflits de lois.'
                  : 'These terms shall be governed by and construed in accordance with the laws of the Province of Quebec and the federal laws of Canada applicable therein, without regard to conflict of law provisions.'}
              </p>
            </div>
          )}

          {activeTab === 'regulatory' && (
            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? 'Inscription réglementaire' : 'Regulatory Registration'}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {fr
                  ? 'Nymbus Capital Inc. est un gestionnaire de portefeuille et un gestionnaire de fonds d\'investissement inscrit auprès de l\'Autorité des marchés financiers (AMF) au Québec et un gestionnaire de portefeuille inscrit en Ontario, en Alberta et en Colombie-Britannique.'
                  : 'Nymbus Capital Inc. is a portfolio manager and investment fund manager registered with the Autorité des marchés financiers (AMF) in Quebec and a registered portfolio manager in Ontario, Alberta, and British Columbia.'}
              </p>

              <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? 'Principes pour l\'investissement responsable (PRI)' : 'Principles for Responsible Investment (PRI)'}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {fr
                  ? 'Nymbus Capital est signataire des Principes pour l\'investissement responsable soutenus par les Nations Unies (PRI) depuis 2018. Nous nous engageons à intégrer les facteurs ESG dans nos décisions d\'investissement et à rendre compte annuellement de nos progrès.'
                  : 'Nymbus Capital has been a signatory to the United Nations-supported Principles for Responsible Investment (PRI) since 2018. We are committed to incorporating ESG factors into our investment decisions and reporting annually on our progress.'}
              </p>

              <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? 'Réclamations et règlement des différends' : 'Complaints & Dispute Resolution'}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {fr
                  ? 'Pour toute plainte, veuillez communiquer avec notre cheffe de la conformité, Diane Dusabimana, à l\'adresse info@nymbus.ca ou au 514-985-1138. Les plaintes non résolues peuvent être adressées à l\'Ombudsman des services bancaires et d\'investissement (OSBI).'
                  : 'For complaints, please contact our Chief Compliance Officer, Diane Dusabimana, at info@nymbus.ca or 514-985-1138. Unresolved complaints may be directed to the Ombudsman for Banking Services and Investments (OBSI).'}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}