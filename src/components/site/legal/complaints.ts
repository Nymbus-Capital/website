/**
 * Complaints policy and code of ethics, EN / FR, word for word from the previous site (origin/main), with
 * sentence-case headings. One fix (docs/compliance-review.md, "website legal pages"): the complaints phone
 * number read 514-931-1138, the firm's number everywhere else is 514-985-1138.
 * Website copy review 2026-09-30 (AMF transfer wording, AMF contact, OBSI 90-day rule, French terms): pending
 * compliance approval, see docs/compliance-review.md. Do not edit the wording without compliance approval.
 */
import type { LegalDoc } from "./types.ts";
import type { Locale } from "../../../lib/i18n/config.ts";


export function complaintsPolicy(lang: Locale): LegalDoc {
  const fr = lang === "fr";
  return {
    id: "complaints",
    title: fr ? "Politique de traitement des plaintes" : "Complaints policy",
    sections: [
      {
        id: "complaints-summary",
        title: fr ? "Sommaire de la politique de traitement des plaintes de Nymbus" : "Summary of Nymbus’ complaint policy",
        blocks: [{ kind: "p", text: fr ? "Chez Nymbus Capital Inc. (« Nymbus »), nous reconnaissons que le maintien de la confiance de nos clients est essentiel à nos activités. Nous prenons toutes les plaintes au sérieux et nous nous engageons à les résoudre de manière équitable, rapide et transparente." : "At Nymbus Capital Inc. (“Nymbus”), we recognize that maintaining our clients’ trust is essential to our business. We take all complaints seriously and are committed to resolving them fairly, promptly, and transparently." }],
      },
      {
        id: "complaints-definition",
        title: fr ? "Qu’est-ce qu’une plainte?" : "What is a complaint?",
        blocks: [{ kind: "p", text: fr ? "Une plainte est définie comme une expression d’insatisfaction ou de reproche de la part d’un client concernant les services ou produits que nous fournissons, accompagnée de l’attente que nous prenions des mesures correctives. Cela peut inclure une demande de compensation, des excuses ou toute autre mesure visant à régler le problème." : "A complaint is defined as an expression of dissatisfaction or reproach from a client regarding the services or products we provide, along with the expectation that we take corrective action. This may include a request for compensation, an apology, or any other measure to address the issue." }],
      },
      {
        id: "complaints-file",
        title: fr ? "Comment déposer une plainte" : "How to file a complaint",
        blocks: [{
          kind: "address",
          lines: [
            "Nymbus Capital Inc.",
            fr ? "À l’attention du responsable désigné des plaintes" : "ATTN: Designated Complaints Officer",
            fr ? "1002, rue Sherbrooke Ouest, bureau 1900" : "1002 Sherbrooke Street West, Suite 1900",
            fr ? "Montréal (Québec) H3A 3L6" : "Montreal, Quebec H3A 3L6",
            fr ? "514 985-1138 ou 1 833 227-2656" : "514-985-1138 or 1-833-227-2656",
            "compliance@nymbus.ca",
          ],
        }],
      },
      {
        id: "complaints-process",
        title: fr ? "Processus de traitement des plaintes" : "Complaint handling process",
        blocks: [{
          kind: "steps",
          items: fr ? [
            { title: "Accusé de réception de votre plainte", text: "Nous vous enverrons une confirmation écrite dans les 10 jours suivant la réception de votre plainte. Celle-ci comprend des renseignements sur les prochaines étapes et sur votre droit de nous demander de transmettre votre dossier de plainte à l’AMF." },
            { title: "Examen de votre plainte", text: "Nous analyserons soigneusement votre plainte et clarifierons le résultat que vous recherchez. Si nécessaire, nous pourrons communiquer avec vous pour obtenir des renseignements supplémentaires." },
            { title: "Réponse finale écrite", text: "Vous recevrez notre décision finale par écrit dans les 60 jours. Ce document décrit les étapes que nous avons suivies pour analyser votre plainte, le raisonnement derrière notre conclusion et, le cas échéant, une solution proposée." },
            { title: "Résolution de la plainte", text: "Si nous offrons une résolution, vous aurez le temps de l’examiner et de demander conseil. Vous pouvez accepter, refuser ou proposer des modifications. Une fois convenue, nous appliquerons la résolution dans les 30 jours." },
          ] : [
            { title: "Acknowledging your complaint", text: "We will send you a written confirmation within 10 days of receiving your complaint. This includes information about the next steps and your right to ask us to transfer your complaint file to the AMF." },
            { title: "Reviewing your complaint", text: "We’ll carefully analyze your complaint and clarify what outcome you’re seeking. If needed, we may contact you for additional information to better understand the issue." },
            { title: "Providing a final written response", text: "You’ll receive our final decision in writing within 60 days. This outlines the steps we took to analyze your complaint, the reasoning behind our conclusion, and, where applicable, a proposed solution." },
            { title: "Resolution of the complaint", text: "If we offer a resolution, you’ll have time to review it and seek advice. You may accept, refuse, or propose changes. Once agreed, we’ll apply the resolution within 30 days." },
          ],
        }],
      },
      {
        id: "complaints-escalation",
        title: fr ? "Si vous n’êtes pas satisfait" : "If you’re not satisfied",
        blocks: [
          { kind: "lead", lead: fr ? "1. Faire transmettre votre dossier à l’AMF :" : "1. Have your file transferred to the AMF:", text: fr ? "Vous pouvez nous demander de transmettre votre dossier de plainte à l’Autorité des marchés financiers (AMF), qui peut l’examiner et offrir des services de règlement des différends. Remplissez le formulaire de demande de l’AMF et retournez-le-nous. Nous transmettrons votre dossier complet à l’AMF dans les 15 jours suivant la réception de votre demande. AMF : 1 877 525-0337, lautorite.qc.ca." : "You may ask us to transfer your complaint file to the Autorité des marchés financiers (AMF), which can examine it and offer dispute resolution services. Complete the AMF request form and return it to us. We’ll send your full complaint file to the AMF within 15 days of receiving your request. AMF: 1-877-525-0337, lautorite.qc.ca." },
          { kind: "lead", lead: fr ? "2. Communiquer avec l’Ombudsman des services bancaires et d’investissement (OSBI) :" : "2. Contact the Ombudsman for Banking Services and Investments (OBSI):", text: fr ? "L’OSBI offre un service gratuit et indépendant de règlement des différends, principalement aux clients qui résident à l’extérieur du Québec. Vous pouvez vous adresser à l’OSBI si nous ne vous avons pas transmis notre réponse finale dans les 90 jours suivant la réception de votre plainte, ou si notre réponse finale ne vous satisfait pas; vous devez le faire dans les 180 jours suivant la réception de notre réponse finale. L’OSBI peut recommander une indemnisation allant jusqu’à 350 000 $." : "OBSI provides free, independent dispute resolution, mainly for clients who live outside Québec. You may contact OBSI if we have not given you our final response within 90 days of receiving your complaint, or if you are not satisfied with our final response; you must do so within 180 days of receiving our final response. OBSI can recommend up to $350,000 in compensation." },
          { kind: "p", small: true, text: fr ? "Téléphone de l’OSBI : 416 287-2877 ou 1 888 451-4519 (sans frais)" : "OBSI phone: 416-287-2877 or 1-888-451-4519 (toll-free)" },
        ],
      },
    ],
    effective: fr ? "En vigueur depuis le 1er juillet 2025" : "Effective as of July 1, 2025",
  };
}

export function codeOfEthics(lang: Locale): LegalDoc {
  const fr = lang === "fr";
  const items = fr ? [
    { title: "1. Aperçu et principes généraux", text: "Nymbus, ses dirigeants, employés et administrateurs exercent leurs activités selon les normes les plus élevées d’éthique et d’intégrité. Tous les employés adhèrent aux principes de ce code d’éthique dès leur embauche pour préserver la réputation de l’entreprise et assurer une conduite professionnelle constante. Ce code s’applique à tous les employés, y compris à temps partiel, temporaires, contractuels, stagiaires et conseillers." },
    { title: "2. Professionnalisme", text: "Les employés agissent avec intégrité, compétence, diligence, respect et comportement éthique envers les clients, les clients potentiels, les employeurs, les collègues et les autres participants du marché. Tous les employés lisent, comprennent et suivent ce code. Le non-respect peut entraîner des mesures disciplinaires, y compris le congédiement." },
    { title: "3. Conformité aux lois, politiques et procédures", text: "Nymbus et ses employés respectent toutes les lois, règlements et normes professionnelles applicables. En cas de conflit entre les règles, la norme la plus stricte s’applique. Les employés ne participent pas sciemment à des violations et ne les facilitent pas. Les employés signalent les violations ou les violations suspectées au chef de la conformité (CCO)." },
    { title: "4. Exceptions aux politiques", text: "Les employés demandent des exceptions par écrit au chef de la conformité, avec justification. Les exceptions ne sont accordées que par écrit et doivent être conformes aux lois." },
    { title: "5. Autorité des employés", text: "Les employés ne peuvent pas lier Nymbus contractuellement ni parler en son nom au-delà de leurs fonctions." },
    { title: "6. Loyauté et non-sollicitation", text: "Les clients appartiennent exclusivement à Nymbus; les employés ne peuvent pas prendre ou utiliser les renseignements des clients. À leur départ, les employés ne doivent pas copier ou utiliser les renseignements des clients. La sollicitation ou le recrutement d’employés, de conseillers, de représentants ou de clients pendant l’emploi et pendant deux ans après la cessation est interdit." },
    { title: "7. Respect des clients et de Nymbus", text: "Les employés maintiennent le professionnalisme et la confiance dans les interactions avec les clients. La confidentialité des renseignements de l’entreprise et des clients est strictement observée. Les employés protègent la réputation et les actifs de Nymbus." },
    { title: "8. Supervision et délégation", text: "Nymbus supervise la conformité des employés et l’atténuation des risques. Les superviseurs peuvent déléguer des tâches mais conservent la responsabilité. Les délégations sont conformes aux lois et politiques et nécessitent du personnel qualifié." },
    { title: "9. Demandes de renseignements et communications publiques", text: "Les employés dirigent toutes les demandes du public, des clients ou des médias concernant les politiques, pratiques ou services de Nymbus vers le service ou le porte-parole désigné approprié. Les employés ne doivent pas fournir de renseignements non autorisés ou faire des déclarations au nom de Nymbus sans approbation préalable." },
  ] : [
    { title: "1. Overview and general principles", text: "Nymbus, its executives, employees, and directors conduct their activities according to the highest standards of ethics and integrity. All employees adhere to the principles in this Code of Ethics from the moment they are hired to preserve the company’s reputation and ensure consistent professional conduct. This Code applies to all employees, including part-time, temporary, contract workers, interns, and advisors." },
    { title: "2. Professionalism", text: "Employees act with integrity, competence, diligence, respect, and ethical behavior toward clients, potential clients, employers, colleagues, and other market participants. All employees read, understand, and follow this Code. Failure to comply may result in disciplinary actions, including termination." },
    { title: "3. Compliance with laws, policies, and procedures", text: "Nymbus and its employees comply with all applicable laws, regulations, and professional standards. In conflicts between rules, the strictest standard applies. Employees do not knowingly participate in or assist violations. Employees report violations or suspected violations to the Chief Compliance Officer (CCO)." },
    { title: "4. Exceptions to policies", text: "Employees request exceptions in writing to the CCO with justification. Exceptions are granted only in writing and must comply with laws." },
    { title: "5. Employee authority", text: "Employees cannot bind Nymbus contractually or speak on its behalf beyond their duties." },
    { title: "6. Loyalty and non-solicitation", text: "Clients belong exclusively to Nymbus; employees may not take or use client information. Upon leaving, employees must not copy or use client information. Soliciting or recruiting employees, advisors, representatives, or clients during employment and for two years after termination is prohibited." },
    { title: "7. Respect for clients and Nymbus", text: "Employees maintain professionalism and trust in client interactions. Confidentiality of company and client information is strictly observed. Employees protect Nymbus’s reputation and assets." },
    { title: "8. Supervision and delegation", text: "Nymbus supervises employee compliance and risk mitigation. Supervisors may delegate tasks but retain responsibility. Delegations comply with laws and policies and require qualified personnel." },
    { title: "9. Inquiries and public communication", text: "Employees direct all inquiries from the public, clients, or media regarding Nymbus’s policies, practices, or services to the appropriate department or designated spokesperson. Employees must not provide unauthorized information or make statements on behalf of Nymbus without prior approval." },
  ];
  return {
    id: "ethics",
    title: fr ? "Code d’éthique" : "Code of ethics",
    intro: fr ? "Chez Nymbus Capital Inc. (« Nymbus »), nous reconnaissons que l’intégrité et le professionnalisme de nos employés sont essentiels au maintien de notre réputation et de la confiance de nos clients. Ce code d’éthique énonce les principes et normes qui guident la conduite de tous les employés." : "At Nymbus Capital Inc. (“Nymbus”), we recognize that the integrity and professionalism of our employees are essential to maintaining our reputation and the trust of our clients. This Code of Ethics outlines the principles and standards that guide the conduct of all employees.",
    sections: [
      ...items.map((it, i) => ({ id: `ethics-${i + 1}`, title: it.title, blocks: [{ kind: "p" as const, text: it.text }] })),
      {
        id: "ethics-contact",
        title: fr ? "Pour nous joindre" : "Contact information",
        blocks: [{
          kind: "address",
          lines: [
            "Nymbus Capital Inc.",
            fr ? "À l’attention de la cheffe de la conformité" : "ATTN: Chief Compliance Officer",
            fr ? "1002, rue Sherbrooke Ouest, bureau 1900" : "1002 Sherbrooke Street West, Suite 1900",
            fr ? "Montréal (Québec) H3A 3L6" : "Montreal, Quebec H3A 3L6",
            fr ? "514 985-1138 ou 1 833 227-2656 (sans frais)" : "514-985-1138 or 1-833-227-2656 (toll-free)",
            "compliance@nymbus.ca",
          ],
        }],
      },
    ],
    effective: fr ? "En vigueur depuis le 1er août 2025" : "Effective as of August 1, 2025",
  };
}
