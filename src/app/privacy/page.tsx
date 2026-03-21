'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useTranslation } from '@/lib/i18n';

export default function PrivacyPage() {
  const { locale } = useTranslation();
  const fr = locale === 'fr';

  return (
    <main className="bg-white min-h-screen">
      <section className="bg-white border-b border-slate-100 pt-8 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">{fr ? 'Conformité' : 'Compliance'}</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{fr ? 'Politique de confidentialité' : 'Privacy Policy'}</h1>
            <p className="text-slate-600 max-w-2xl">
              {fr
                ? 'Chez Nymbus Capital Inc. (« Nymbus »), nous nous engageons à protéger la confidentialité et la sécurité de vos renseignements personnels. Notre politique de confidentialité respecte la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE) et reflète ses dix principes de base en matière de protection des renseignements personnels.'
                : 'At Nymbus Capital Inc. ("Nymbus"), we are committed to protecting the confidentiality and security of your personal information. Our privacy policy complies with the Personal Information Protection and Electronic Documents Act (PIPEDA) and reflects its ten fair information principles.'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? '1. Nos engagements' : '1. Our Commitments'}</h2>
            <p className="text-slate-600 mb-4">{fr ? 'Nous appliquons cinq principes essentiels, inspirés des meilleures pratiques, pour protéger vos renseignements :' : 'We apply five core principles inspired by best practices to protect your information:'}</p>
            <div className="space-y-4">
              {(fr ? [
                { title: 'Supervision responsable', desc: 'Notre responsable de la protection des renseignements personnels (RPRP) assure la gouvernance et la conformité à la LPRPDE pour toutes les pratiques liées aux données personnelles.' },
                { title: 'Finalités clairement définies et gestion du consentement', desc: 'Nous spécifions clairement les motifs de la collecte de vos renseignements avant ou au moment de la collecte et obtenons votre consentement, sauf disposition légale contraire.' },
                { title: 'Limitation de la collecte et de la conservation', desc: 'Nous recueillons uniquement les renseignements nécessaires aux finalités déterminées et ne les conservons que le temps requis par la loi ou nos besoins d’affaires.' },
                { title: 'Qualité et sécurité des données', desc: 'Nous veillons à l’exactitude et à la pertinence de vos renseignements et appliquons des mesures techniques, administratives et physiques rigoureuses pour les protéger.' },
                { title: 'Transparence et droit d’accès', desc: 'Nos pratiques sont accessibles et compréhensibles. Vous disposez du droit d’accéder, de corriger et de contester la gestion de vos renseignements.' },
              ] : [
                { title: 'Ensure Accountable Oversight', desc: 'Our Chief Privacy Officer oversees all personal data practices, ensuring robust governance and PIPEDA compliance.' },
                { title: 'Respect and Specify Purposes', desc: 'We clearly define why we collect your information, obtain your consent, and use data only for those stated purposes.' },
                { title: 'Limit Collection and Retention', desc: 'We gather only what’s necessary and retain personal information only as long as required by law or business need.' },
                { title: 'Protect with Strong Safeguards', desc: 'We maintain data accuracy, secure storage, and implement technical, administrative, and physical controls to keep your information safe.' },
                { title: 'Be Transparent and Empower You', desc: 'Our privacy practices are open and accessible. You have clear rights to access, correct, and challenge how your data is managed.' },
              ]).map((item) => (
                <div key={item.title} className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? '2. Renseignements que nous recueillons' : '2. Information We Collect'}</h2>
            <p className="text-slate-600 mb-4">{fr ? 'Nous collectons uniquement les données nécessaires à la fourniture de nos services, au respect de nos obligations légales et à la bonne gestion de nos activités.' : 'We collect only the information required to deliver our services, meet legal requirements, and operate our business effectively.'}</p>
            <div className="bg-slate-50 rounded-lg p-5">
              <h4 className="font-semibold text-slate-900 text-sm mb-3">{fr ? 'Types de renseignements' : 'Types of Information'}</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {(fr ? [
                  'Identité : nom, date de naissance, état civil, coordonnées, pièces d’identité émises par un gouvernement, numéro d’assurance sociale* (pour fins fiscales), profession, numéros de compte',
                  'Rôle professionnel : votre qualité de représentant, administrateur, dirigeant ou actionnaire',
                  'Données de vérification : signatures, identifiants uniques, informations de connexion',
                  'Profil financier : revenus, antécédents professionnels, placements, tolérance au risque, objectifs financiers',
                  'Activité des comptes : historique des opérations, instructions de placement, communications',
                  'Préférences : langue et mode de communication',
                  'Renseignements tiers : coordonnées des personnes autorisées (titulaire joint, bénéficiaire)',
                ] : [
                  'Identification Details: Name, date of birth, marital status, contact information, government-issued ID, Social Insurance Number* (for tax purposes), profession, account numbers',
                  'Professional Role: Your status as a representative, director, officer, or shareholder',
                  'Verification Data: Signatures, unique identifiers, account credentials',
                  'Financial Profile: Income, employment history, investment holdings, risk tolerance, objectives',
                  'Account Activity: Transaction history, instructions, communications',
                  'Preferences: Language and communication preferences',
                  'Third-Party Information: Details of individuals you authorize (e.g., joint account holders, beneficiaries)',
                ]).map((item) => (
                  <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-3 italic">{fr ? '*La fourniture du NAS n’est pas obligatoire, mais peut être requise pour certains comptes.' : '*Providing your SIN is not mandatory but may be required to open certain accounts.'}</p>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? '3. Utilisation et partage de vos renseignements' : '3. How We Use and Share Your Information'}</h2>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">{fr ? '3.1. Utilisation' : '3.1. Use of Information'}</h3>
            <p className="text-slate-600 mb-3">{fr ? 'Nous utilisons vos renseignements pour :' : 'We use your information to:'}</p>
            <ul className="space-y-1 text-sm text-slate-600 mb-6">
              {(fr ? [
                'Vérifier votre identité et maintenir des dossiers à jour',
                'Comprendre votre profil et vos objectifs financiers',
                'Ouvrir, administrer et gérer vos comptes et services',
                'Offrir une expérience client personnalisée et cohérente',
                'Vous informer des mises à jour de compte, des changements de politique et des avis de service',
                'Prévenir et détecter la fraude, le blanchiment d’argent et les cybermenaces',
                'Effectuer la diligence raisonnable et les contrôles de conformité',
                'Respecter nos obligations légales et réglementaires',
              ] : [
                'Verify identity and maintain records',
                'Understand your financial profile and objectives',
                'Open, administer, and manage your accounts and services',
                'Deliver a consistent, personalized client experience',
                'Communicate account updates, policy changes, and service notices',
                'Prevent and detect fraud, money laundering, and cyber threats',
                'Conduct regulatory due diligence and compliance checks',
                'Fulfill legal and regulatory obligations',
              ]).map((item) => (
                <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />{item}</li>
              ))}
            </ul>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">{fr ? '3.2. Partage' : '3.2. Sharing of Information'}</h3>
            <p className="text-slate-600 mb-3">{fr ? 'Nous pouvons divulguer vos renseignements aux :' : 'We may share your information with:'}</p>
            <ul className="space-y-1 text-sm text-slate-600 mb-4">
              {(fr ? [
                'Équipes internes de Nymbus responsables de la prestation de services et de la conformité',
                'Personnes ou entités que vous autorisez',
                'Bureaux de crédit, institutions financières et autorités de réglementation',
                'Autorités légales ou gouvernementales, selon la loi',
                'Fournisseurs de services (voir 3.3)',
              ] : [
                'Internal Nymbus teams responsible for service delivery and compliance',
                'Individuals or entities you authorize',
                'Credit bureaus, financial institutions, and regulators',
                'Legal or governmental authorities, as required by law',
                'Service providers engaged to support our operations (see 3.3)',
              ]).map((item) => (
                <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />{item}</li>
              ))}
            </ul>
            <p className="text-sm text-slate-700 font-semibold">{fr ? 'Nous ne vendons jamais vos renseignements personnels.' : 'We do not sell your personal information under any circumstances.'}</p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? '4. Vos droits et exercice de ceux-ci' : '4. Your Rights and How to Exercise Them'}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{fr ? '4.1. Droit de refuser ou de retirer votre consentement' : '4.1. Right to Refuse or Withdraw Consent'}</h3>
                <p className="text-sm text-slate-600">{fr ? 'Vous pouvez refuser ou retirer votre consentement à la collecte, à l’utilisation ou à la divulgation de vos renseignements, sous réserve des exigences légales ou contractuelles. Toutefois, le refus de fournir certaines données (p. ex. NAS) peut limiter l’accès à certains services.' : 'You may refuse or withdraw consent for collection, use, or disclosure of your information, subject to legal or contractual limitations. Note that refusal to provide certain data (e.g., SIN for registered accounts) may prevent us from delivering some services.'}</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{fr ? '4.2. Marketing et données numériques' : '4.2. Marketing and Digital Information'}</h3>
                <p className="text-sm text-slate-600">{fr ? 'Vous pouvez vous opposer aux communications promotionnelles de Nymbus et à toute collecte future de données de suivi numérique. Vous continuerez de recevoir les communications réglementaires obligatoires et les mises à jour importantes de vos comptes.' : 'You may opt out of promotional communications from Nymbus and any future collection of digital tracking information. You will continue to receive mandatory regulatory communications and important account notices.'}</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{fr ? '4.3. Accès à vos renseignements' : '4.3. Accessing Your Information'}</h3>
                <p className="text-sm text-slate-600 mb-2">{fr ? 'Vous pouvez demander l’accès à vos renseignements personnels, sauf restrictions légales. Adressez vos demandes par :' : 'You may request access to your personal data, except where restricted by law. Submit requests via:'}</p>
                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                  <p>{fr ? 'Téléphone : 514 985‑1138 ou 1 833 227‑2656 (sans frais)' : 'Phone: 514-985-1138 or 1-833-227-2656 (toll-free)'}</p>
                  <p>{fr ? 'Courriel : compliance@nymbus.ca' : 'Email: compliance@nymbus.ca'}</p>
                </div>
                <p className="text-sm text-slate-600 mt-2">{fr ? 'Nous répondrons sous 30 jours ou vous informerons si un délai supplémentaire est nécessaire.' : 'We will respond within 30 days or notify you if additional time is required.'}</p>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? '5. Protection de vos renseignements' : '5. Safeguarding Your Information'}</h2>
            <ul className="space-y-1 text-sm text-slate-600">
              {(fr ? [
                'Chiffrement, serveurs sécurisés et pare-feu',
                'Contrôles d’accès et authentification forte',
                'Surveillance continue, audits et formation du personnel',
                'Vérification d’identité avant toute divulgation de renseignements',
              ] : [
                'Data encryption, secure servers, and firewalls',
                'Role-based access controls and multi-factor authentication',
                'Regular monitoring, audits, and staff training',
                'Verification of identity before disclosing any account information',
              ]).map((item) => (
                <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />{item}</li>
              ))}
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? '6. Conservation des données' : '6. Data Retention'}</h2>
            <p className="text-sm text-slate-600">{fr ? 'Nous conservons vos renseignements uniquement aussi longtemps que nécessaire pour fournir nos services et gérer vos comptes, et pour respecter nos obligations légales, fiscales et réglementaires. Les données obsolètes sont détruites en toute sécurité ou anonymisées.' : 'We retain personal data only as long as necessary to provide our services and manage accounts, and to comply with legal, tax, and regulatory requirements. When data is no longer required, it is securely destroyed or anonymized.'}</p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? '7. Questions et plaintes' : '7. Questions & Complaints'}</h2>
            <p className="text-sm text-slate-600">{fr ? 'Si vous avez des préoccupations quant à la manière dont vos renseignements personnels sont traités, veuillez consulter notre Politique de traitement des plaintes. Vous pouvez également contacter l’autorité provinciale ou fédérale en matière de protection des renseignements personnels.' : 'If you have concerns about how your personal information is handled, please follow our Complaints Handling Policy. You may also contact your provincial or federal privacy authority.'}</p>
          </div>

          {/* Section 8 - Contact */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? '8. Coordonnées' : '8. Contact Information'}</h2>
            <div className="bg-slate-50 rounded-lg p-6 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Nymbus Capital Inc.</p>
              <p>{fr ? 'À l’attention du Responsable de la protection des renseignements personnels' : 'ATTN: Designated Privacy Officer'}</p>
              <p>1002 {fr ? 'rue Sherbrooke Ouest' : 'Sherbrooke Street West'}, {fr ? 'Bureau' : 'Suite'} 1900</p>
              <p>{fr ? 'Montréal (Québec)' : 'Montreal, Quebec'} H3A 3L6</p>
              <p className="mt-2">514‑985‑1138 {fr ? 'ou' : 'or'} 1‑833‑227‑2656 ({fr ? 'sans frais' : 'toll-free'})</p>
              <p>compliance@nymbus.ca</p>
            </div>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? '9. Mise à jour de la politique' : '9. Policy Updates'}</h2>
            <p className="text-sm text-slate-600">{fr ? 'Cette politique peut être mise à jour périodiquement. La version la plus récente est disponible sur notre site web. Les modifications importantes vous seront communiquées.' : 'This policy may be updated periodically. The latest version is always available on our website. We will communicate significant changes as required.'}</p>
            <p className="text-xs text-slate-500 mt-4">{fr ? 'En vigueur en date du 1er juillet 2025' : 'Effective as of July 1, 2025'}</p>
          </div>
        </div>
      </section>
    </main>
  );
}