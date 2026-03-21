'use client';

import { useState } from 'react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function LegalPage() {
  const { locale } = useTranslation();
  const fr = locale === 'fr';
  const [activeTab, setActiveTab] = useState('complaints');

  const tabs = [
    { id: 'complaints', label: fr ? 'Politique de plaintes' : 'Complaints Policy' },
    { id: 'ethics', label: fr ? 'Code d’éthique' : 'Code of Ethics' },
  ];

  return (
    <main className="bg-white min-h-screen">
      <section className="bg-white border-b border-slate-100 pt-8 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">{fr ? 'Conformité' : 'Compliance'}</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{fr ? 'Juridique' : 'Legal'}</h1>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-2 px-6 sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('px-4 py-3 text-sm font-medium transition-colors border-b-2', activeTab === tab.id ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700')}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'complaints' && <ComplaintsContent fr={fr} />}
          {activeTab === 'ethics' && <EthicsContent fr={fr} />}
        </div>
      </section>
    </main>
  );
}

function ComplaintsContent({ fr }: { fr: boolean }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{fr ? 'Sommaire de la politique de traitement des plaintes de Nymbus' : 'Summary of Nymbus’ Complaint Policy'}</h2>
        <p className="text-slate-600 mb-4">{fr ? 'Chez Nymbus Capital Inc. (« Nymbus »), nous reconnaissons que le maintien de la confiance de nos clients est essentiel à nos activités. Nous prenons toutes les plaintes au sérieux et nous nous engageons à les résoudre de manière équitable, rapide et transparente.' : 'At Nymbus Capital Inc. ("Nymbus"), we recognize that maintaining our clients’ trust is essential to our business. We take all complaints seriously and are committed to resolving them fairly, promptly, and transparently.'}</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? 'Qu’est-ce qu’une plainte?' : 'What is a Complaint?'}</h3>
        <p className="text-sm text-slate-600">{fr ? 'Une plainte est définie comme une expression d’insatisfaction ou de reproche de la part d’un client concernant les services ou produits que nous fournissons, accompagnée de l’attente que nous prenions des mesures correctives. Cela peut inclure une demande de compensation, des excuses ou toute autre mesure visant à régler le problème.' : 'A complaint is defined as an expression of dissatisfaction or reproach from a client regarding the services or products we provide, along with the expectation that we take corrective action. This may include a request for compensation, an apology, or any other measure to address the issue.'}</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? 'Comment déposer une plainte' : 'How to File a Complaint'}</h3>
        <div className="bg-slate-50 rounded-lg p-5 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Nymbus Capital Inc.</p>
          <p>{fr ? 'À l’attention du responsable désigné des plaintes' : 'ATTN: Designated Complaints Officer'}</p>
          <p>1002, {fr ? 'rue Sherbrooke Ouest' : 'Sherbrooke Street West'}, {fr ? 'Bureau' : 'Suite'} 1900</p>
          <p>{fr ? 'Montréal (Québec)' : 'Montreal (Quebec)'} H3A 3L6</p>
          <p className="mt-2">514-931-1138 {fr ? 'ou' : 'or'} 1-833-227-2656</p>
          <p>compliance@nymbus.ca</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? 'Processus de traitement des plaintes' : 'Complaint Handling Process'}</h3>
        <div className="space-y-4">
          {(fr ? [
            { step: '1', title: 'Accusé de réception de votre plainte', desc: 'Nous vous enverrons une confirmation écrite dans les 10 jours suivant la réception de votre plainte. Celle-ci comprend des informations sur les prochaines étapes et votre droit de demander un examen par l’AMF.' },
            { step: '2', title: 'Examen de votre plainte', desc: 'Nous analyserons soigneusement votre plainte et clarifierons le résultat que vous recherchez. Si nécessaire, nous pourrons vous contacter pour obtenir des informations supplémentaires.' },
            { step: '3', title: 'Réponse finale écrite', desc: 'Vous recevrez notre décision finale par écrit dans les 60 jours. Ce document décrit les étapes que nous avons suivies pour analyser votre plainte, le raisonnement derrière notre conclusion et, le cas échéant, une solution proposée.' },
            { step: '4', title: 'Résolution de la plainte', desc: 'Si nous offrons une résolution, vous aurez le temps de l’examiner et de demander conseil. Vous pouvez accepter, refuser ou proposer des modifications. Une fois convenue, nous appliquerons la résolution dans les 30 jours.' },
          ] : [
            { step: '1', title: 'Acknowledging Your Complaint', desc: 'We will send you a written confirmation within 10 days of receiving your complaint. This includes information about the next steps and your right to request a review by the AMF.' },
            { step: '2', title: 'Reviewing Your Complaint', desc: 'We’ll carefully analyze your complaint and clarify what outcome you’re seeking. If needed, we may contact you for additional information to better understand the issue.' },
            { step: '3', title: 'Providing a Final Written Response', desc: 'You’ll receive our final decision in writing within 60 days. This outlines the steps we took to analyze your complaint, the reasoning behind our conclusion, and, where applicable, a proposed solution.' },
            { step: '4', title: 'Resolution of the Complaint', desc: 'If we offer a resolution, you’ll have time to review it and seek advice. You may accept, refuse, or propose changes. Once agreed, we’ll apply the resolution within 30 days.' },
          ]).map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{item.step}</div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm mb-1">{item.title}</h4>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? 'Si vous n’êtes pas satisfait' : 'If You’re Not Satisfied'}</h3>
        <div className="space-y-3 text-sm text-slate-600">
          <p><strong>{fr ? '1. Demander un examen par l’AMF :' : '1. Request a Review by the AMF:'}</strong> {fr ? 'Remplissez le formulaire de demande de l’AMF et retournez-le-nous. Nous enverrons votre dossier complet à l’AMF dans les 15 jours suivant la réception de votre demande.' : 'Complete the AMF request form and return it to us. We’ll send your full complaint record to the AMF within 15 days of receiving your request.'}</p>
          <p><strong>{fr ? '2. Contacter l’OSBI :' : '2. Contact the Ombudsman for Banking Services and Investments (OBSI):'}</strong> {fr ? 'L’OSBI offre un service gratuit et indépendant de règlement des différends. Vous devez les contacter dans les 180 jours suivant la réception de notre réponse finale. Ils peuvent recommander une indemnisation allant jusqu’à 350 000 $.' : 'OBSI provides free, independent dispute resolution. You must contact them within 180 days of receiving our final response. They can recommend up to $350,000 in compensation.'}</p>
          <p className="text-slate-500">{fr ? 'Téléphone : 416-287-2877 ou 1-888-451-4519 (sans frais)' : 'Phone: 416-287-2877 or 1-888-451-4519 (toll-free)'}</p>
        </div>
      </div>

      <p className="text-xs text-slate-500">{fr ? 'En vigueur en date du 1er juillet 2025' : 'Effective as of July 1, 2025'}</p>
    </div>
  );
}

function EthicsContent({ fr }: { fr: boolean }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{fr ? 'Code d’éthique' : 'Code of Ethics'}</h2>
        <p className="text-slate-600">{fr ? 'Chez Nymbus Capital Inc. (« Nymbus »), nous reconnaissons que l’intégrité et le professionnalisme de nos employés sont essentiels au maintien de notre réputation et de la confiance de nos clients. Ce code d’éthique énonce les principes et normes qui guident la conduite de tous les employés.' : 'At Nymbus Capital Inc. ("Nymbus"), we recognize that the integrity and professionalism of our employees are essential to maintaining our reputation and the trust of our clients. This Code of Ethics outlines the principles and standards that guide the conduct of all employees.'}</p>
      </div>

      {(fr ? [
        { title: '1. Aperçu et principes généraux', content: 'Nymbus, ses dirigeants, employés et administrateurs exercent leurs activités selon les normes les plus élevées d’éthique et d’intégrité. Tous les employés adhèrent aux principes de ce code d’éthique dès leur embauche pour préserver la réputation de l’entreprise et assurer une conduite professionnelle constante. Ce code s’applique à tous les employés, y compris à temps partiel, temporaires, contractuels, stagiaires et conseillers.' },
        { title: '2. Professionnalisme', content: 'Les employés agissent avec intégrité, compétence, diligence, respect et comportement éthique envers les clients, les clients potentiels, les employeurs, les collègues et les autres participants du marché. Tous les employés lisent, comprennent et suivent ce code. Le non-respect peut entraîner des mesures disciplinaires, y compris le congédiement.' },
        { title: '3. Conformité aux lois, politiques et procédures', content: 'Nymbus et ses employés respectent toutes les lois, règlements et normes professionnelles applicables. En cas de conflit entre les règles, la norme la plus stricte s’applique. Les employés ne participent pas sciemment à des violations et ne les facilitent pas. Les employés signalent les violations ou les violations suspectées au responsable de la conformité (CCO).' },
        { title: '4. Exceptions aux politiques', content: 'Les employés demandent des exceptions par écrit au CCO avec justification. Les exceptions ne sont accordées que par écrit et doivent être conformes aux lois.' },
        { title: '5. Autorité des employés', content: 'Les employés ne peuvent pas lier Nymbus contractuellement ni parler en son nom au-delà de leurs fonctions.' },
        { title: '6. Loyauté et non-sollicitation', content: 'Les clients appartiennent exclusivement à Nymbus; les employés ne peuvent pas prendre ou utiliser les renseignements des clients. À leur départ, les employés ne doivent pas copier ou utiliser les renseignements des clients. La sollicitation ou le recrutement d’employés, de conseillers, de représentants ou de clients pendant l’emploi et pendant deux ans après la cessation est interdit.' },
        { title: '7. Respect des clients et de Nymbus', content: 'Les employés maintiennent le professionnalisme et la confiance dans les interactions avec les clients. La confidentialité des renseignements de l’entreprise et des clients est strictement observée. Les employés protègent la réputation et les actifs de Nymbus.' },
        { title: '8. Supervision et délégation', content: 'Nymbus supervise la conformité des employés et l’atténuation des risques. Les superviseurs peuvent déléguer des tâches mais conservent la responsabilité. Les délégations sont conformes aux lois et politiques et nécessitent du personnel qualifié.' },
        { title: '9. Demandes de renseignements et communications publiques', content: 'Les employés dirigent toutes les demandes du public, des clients ou des médias concernant les politiques, pratiques ou services de Nymbus vers le département ou le porte-parole désigné approprié. Les employés ne doivent pas fournir d’informations non autorisées ou faire des déclarations au nom de Nymbus sans approbation préalable.' },
      ] : [
        { title: '1. Overview and General Principles', content: 'Nymbus, its executives, employees, and directors conduct their activities according to the highest standards of ethics and integrity. All employees adhere to the principles in this Code of Ethics from the moment they are hired to preserve the company’s reputation and ensure consistent professional conduct. This Code applies to all employees, including part-time, temporary, contract workers, interns, and advisors.' },
        { title: '2. Professionalism', content: 'Employees act with integrity, competence, diligence, respect, and ethical behavior toward clients, potential clients, employers, colleagues, and other market participants. All employees read, understand, and follow this Code. Failure to comply may result in disciplinary actions, including termination.' },
        { title: '3. Compliance with Laws, Policies, and Procedures', content: 'Nymbus and its employees comply with all applicable laws, regulations, and professional standards. In conflicts between rules, the strictest standard applies. Employees do not knowingly participate in or assist violations. Employees report violations or suspected violations to the Chief Compliance Officer (CCO).' },
        { title: '4. Exceptions to Policies', content: 'Employees request exceptions in writing to the CCO with justification. Exceptions are granted only in writing and must comply with laws.' },
        { title: '5. Employee Authority', content: 'Employees cannot bind Nymbus contractually or speak on its behalf beyond their duties.' },
        { title: '6. Loyalty and Non-Solicitation', content: 'Clients belong exclusively to Nymbus; employees may not take or use client information. Upon leaving, employees must not copy or use client information. Soliciting or recruiting employees, advisors, representatives, or clients during employment and for two years after termination is prohibited.' },
        { title: '7. Respect for Clients and Nymbus', content: 'Employees maintain professionalism and trust in client interactions. Confidentiality of company and client information is strictly observed. Employees protect Nymbus’s reputation and assets.' },
        { title: '8. Supervision and Delegation', content: 'Nymbus supervises employee compliance and risk mitigation. Supervisors may delegate tasks but retain responsibility. Delegations comply with laws and policies and require qualified personnel.' },
        { title: '9. Inquiries and Public Communication', content: 'Employees direct all inquiries from the public, clients, or media regarding Nymbus’s policies, practices, or services to the appropriate department or designated spokesperson. Employees must not provide unauthorized information or make statements on behalf of Nymbus without prior approval.' },
      ]).map((section) => (
        <div key={section.title}>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{section.title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
        </div>
      ))}

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">{fr ? 'Pour nous joindre' : 'Contact Information'}</h3>
        <div className="bg-slate-50 rounded-lg p-5 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Nymbus Capital Inc.</p>
          <p>{fr ? 'À l’attention de la cheffe de la conformité' : 'ATTN: Chief Compliance Officer'}</p>
          <p>1002 {fr ? 'rue Sherbrooke Ouest' : 'Sherbrooke Street West'}, {fr ? 'Bureau' : 'Suite'} 1900</p>
          <p>{fr ? 'Montréal (Québec)' : 'Montreal, Quebec'} H3A 3L6</p>
          <p className="mt-2">514‑985‑1138 {fr ? 'ou' : 'or'} 1‑833‑227‑2656 ({fr ? 'sans frais' : 'toll-free'})</p>
          <p>compliance@nymbus.ca</p>
        </div>
      </div>

      <p className="text-xs text-slate-500">{fr ? 'En vigueur en date du 1er août 2025' : 'Effective as of August 1, 2025'}</p>
    </div>
  );
}