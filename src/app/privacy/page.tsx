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
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">{fr ? 'Confidentialité' : 'Privacy'}</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{fr ? 'Politique de confidentialité' : 'Privacy Policy'}</h1>
            <p className="text-sm text-slate-500">{fr ? 'Dernière mise à jour : 15 mars 2025' : 'Last Updated: March 15, 2025'}</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto prose prose-slate max-w-none">
          <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '1. Introduction' : '1. Introduction'}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {fr
              ? 'La présente politique de confidentialité s\'applique à l\'utilisation et à la communication de tous les renseignements recueillis, ainsi qu\'à la manière dont Nymbus Capital Inc. (« Nymbus ») recueille des renseignements dans le cadre de votre relation d\'affaires. Cette politique s\'applique tant que Nymbus détient vos renseignements, y compris après la fin de la relation d\'affaires.'
              : 'This privacy policy applies to the use and communication of all information collected, as well as how Nymbus Capital Inc. ("Nymbus") collects information in the context of your business relationship. This policy applies so long as Nymbus holds your information, including after the end of the business relationship.'}
          </p>

          <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '2. Renseignements recueillis' : '2. Information Collected'}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {fr
              ? 'Nymbus peut recueillir les types de renseignements suivants : nom, adresse, numéro de téléphone, adresse courriel, informations financières et de placement, renseignements sur l\'emploi, et toute autre information que vous nous fournissez volontairement dans le cadre de nos services de gestion de portefeuille et de fonds d\'investissement.'
              : 'Nymbus may collect the following types of information: name, address, phone number, email address, financial and investment information, employment information, and any other information you voluntarily provide to us in the context of our portfolio management and investment fund services.'}
          </p>

          <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '3. Utilisation des renseignements' : '3. Use of Information'}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {fr
              ? 'Les renseignements recueillis sont utilisés pour : gérer votre compte et fournir les services de placement demandés, respecter nos obligations réglementaires et légales, communiquer avec vous au sujet de votre compte et de nos services, et améliorer nos services et notre site Web.'
              : 'Information collected is used to: manage your account and provide the investment services requested, comply with our regulatory and legal obligations, communicate with you about your account and our services, and improve our services and website.'}
          </p>

          <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '4. Conservation des renseignements' : '4. Retention of Information'}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {fr
              ? 'Les renseignements de votre profil client seront conservés pendant la durée de la relation avec Nymbus et pendant sept (7) ans suivant la fin de cette relation. Les renseignements transactionnels seront conservés pendant sept (7) ans après l\'exécution.'
              : 'Customer profile information will be retained during the relationship with Nymbus and for seven (7) years following the end of that relationship. Transactional information will be retained for seven (7) years after execution.'}
          </p>

          <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '5. Protection des renseignements' : '5. Protection of Information'}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {fr
              ? 'Nymbus met en place des mesures de sécurité physiques, organisationnelles et technologiques appropriées pour protéger les renseignements personnels contre la perte, le vol, l\'accès non autorisé, la divulgation, la copie, l\'utilisation ou la modification.'
              : 'Nymbus implements appropriate physical, organizational, and technological security measures to protect personal information against loss, theft, unauthorized access, disclosure, copying, use, or modification.'}
          </p>

          <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '6. Divulgation à des tiers' : '6. Disclosure to Third Parties'}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {fr
              ? 'Nymbus ne divulgue pas vos renseignements personnels à des tiers, sauf dans les cas suivants : avec votre consentement, pour se conformer à une obligation légale ou réglementaire, à nos fournisseurs de services qui nous aident à fournir nos services (sous réserve d\'obligations de confidentialité), ou lorsque requis par la loi ou par ordonnance d\'un tribunal.'
              : 'Nymbus does not disclose your personal information to third parties except in the following cases: with your consent, to comply with a legal or regulatory obligation, to our service providers who help us deliver our services (subject to confidentiality obligations), or when required by law or court order.'}
          </p>

          <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '7. Témoins (Cookies) et site Web' : '7. Cookies & Website'}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {fr
              ? 'Notre site Web peut utiliser des témoins (cookies) pour améliorer votre expérience de navigation. Les témoins sont de petits fichiers stockés sur votre appareil qui nous permettent de mémoriser vos préférences. Vous pouvez configurer votre navigateur pour refuser les témoins, mais certaines fonctionnalités du site pourraient ne pas fonctionner correctement.'
              : 'Our website may use cookies to improve your browsing experience. Cookies are small files stored on your device that allow us to remember your preferences. You can configure your browser to refuse cookies, but some site functionality may not work properly.'}
          </p>

          <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '8. Vos droits' : '8. Your Rights'}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {fr
              ? 'Vous avez le droit d\'accéder à vos renseignements personnels détenus par Nymbus, de demander leur rectification ou leur suppression, et de retirer votre consentement à leur utilisation, sous réserve des exigences légales et réglementaires applicables.'
              : 'You have the right to access your personal information held by Nymbus, request its correction or deletion, and withdraw your consent to its use, subject to applicable legal and regulatory requirements.'}
          </p>

          <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? '9. Nous joindre' : '9. Contact Us'}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {fr
              ? 'Pour toute question concernant la présente politique de confidentialité ou pour exercer vos droits en matière de renseignements personnels, veuillez communiquer avec notre cheffe de la conformité :'
              : 'For any questions regarding this privacy policy or to exercise your rights regarding personal information, please contact our Chief Compliance Officer:'}
          </p>
          <div className="bg-slate-50 rounded-lg p-6 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Diane Dusabimana</p>
            <p>{fr ? 'Cheffe de la conformité' : 'Chief Compliance Officer'}</p>
            <p>Nymbus Capital Inc.</p>
            <p>1002 {fr ? 'rue Sherbrooke Ouest' : 'Sherbrooke Street West'}, Suite 1900</p>
            <p>{fr ? 'Montréal' : 'Montreal'}, QC H3A 3L6</p>
            <p className="mt-2">info@nymbus.ca | 514-985-1138</p>
          </div>
        </div>
      </section>
    </main>
  );
}