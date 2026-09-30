/**
 * Privacy policy, EN / FR, word for word from the previous site (origin/main), with sentence-case headings,
 * plus two additions written for the website and PENDING COMPLIANCE REVIEW (`review` set; listed in
 * docs/compliance-review.md, "website legal pages"):
 *  - 3.3 Service providers: section 3.2 referred to a section 3.3 that did not exist;
 *  - 10. Québec residents (Law 25): the policy cited PIPEDA only, while Nymbus is a Québec firm.
 * Do not edit the wording without compliance approval.
 */
import type { LegalDoc } from "./types.ts";

type Lang = "en" | "fr";

export const PRIVACY_REVIEW = {
  serviceProviders: "3.3 Service providers: added by the website team (section 3.2 referred to a missing 3.3).",
  law25: "10. Québec residents (Law 25): added by the website team (the policy only cited PIPEDA).",
};

export function privacyPolicy(lang: Lang): LegalDoc {
  const fr = lang === "fr";
  return {
    id: "privacy",
    title: fr ? "Politique de confidentialité" : "Privacy policy",
    intro: fr
      ? "Chez Nymbus Capital Inc. (« Nymbus »), nous nous engageons à protéger la confidentialité et la sécurité de vos renseignements personnels. Notre politique de confidentialité respecte la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE) et reflète ses dix principes de base en matière de protection des renseignements personnels."
      : "At Nymbus Capital Inc. (\"Nymbus\"), we are committed to protecting the confidentiality and security of your personal information. Our privacy policy complies with the Personal Information Protection and Electronic Documents Act (PIPEDA) and reflects its ten fair information principles.",
    sections: [
      {
        id: "privacy-commitments",
        title: fr ? "1. Nos engagements" : "1. Our commitments",
        blocks: [
          { kind: "p", text: fr ? "Nous appliquons cinq principes essentiels, inspirés des meilleures pratiques, pour protéger vos renseignements :" : "We apply five core principles inspired by best practices to protect your information:" },
          {
            kind: "cards",
            items: fr ? [
              { title: "Supervision responsable", text: "Notre responsable de la protection des renseignements personnels (RPRP) assure la gouvernance et la conformité à la LPRPDE pour toutes les pratiques liées aux données personnelles." },
              { title: "Finalités clairement définies et gestion du consentement", text: "Nous spécifions clairement les motifs de la collecte de vos renseignements avant ou au moment de la collecte et obtenons votre consentement, sauf disposition légale contraire." },
              { title: "Limitation de la collecte et de la conservation", text: "Nous recueillons uniquement les renseignements nécessaires aux finalités déterminées et ne les conservons que le temps requis par la loi ou nos besoins d’affaires." },
              { title: "Qualité et sécurité des données", text: "Nous veillons à l’exactitude et à la pertinence de vos renseignements et appliquons des mesures techniques, administratives et physiques rigoureuses pour les protéger." },
              { title: "Transparence et droit d’accès", text: "Nos pratiques sont accessibles et compréhensibles. Vous disposez du droit d’accéder, de corriger et de contester la gestion de vos renseignements." },
            ] : [
              { title: "Ensure accountable oversight", text: "Our Chief Privacy Officer oversees all personal data practices, ensuring robust governance and PIPEDA compliance." },
              { title: "Respect and specify purposes", text: "We clearly define why we collect your information, obtain your consent, and use data only for those stated purposes." },
              { title: "Limit collection and retention", text: "We gather only what’s necessary and retain personal information only as long as required by law or business need." },
              { title: "Protect with strong safeguards", text: "We maintain data accuracy, secure storage, and implement technical, administrative, and physical controls to keep your information safe." },
              { title: "Be transparent and empower you", text: "Our privacy practices are open and accessible. You have clear rights to access, correct, and challenge how your data is managed." },
            ],
          },
        ],
      },
      {
        id: "privacy-collect",
        title: fr ? "2. Renseignements que nous recueillons" : "2. Information we collect",
        blocks: [
          { kind: "p", text: fr ? "Nous collectons uniquement les données nécessaires à la fourniture de nos services, au respect de nos obligations légales et à la bonne gestion de nos activités." : "We collect only the information required to deliver our services, meet legal requirements, and operate our business effectively." },
          { kind: "p", strong: true, text: fr ? "Types de renseignements" : "Types of information" },
          {
            kind: "list",
            items: fr ? [
              "Identité : nom, date de naissance, état civil, coordonnées, pièces d’identité émises par un gouvernement, numéro d’assurance sociale* (pour fins fiscales), profession, numéros de compte",
              "Rôle professionnel : votre qualité de représentant, administrateur, dirigeant ou actionnaire",
              "Données de vérification : signatures, identifiants uniques, informations de connexion",
              "Profil financier : revenus, antécédents professionnels, placements, tolérance au risque, objectifs financiers",
              "Activité des comptes : historique des opérations, instructions de placement, communications",
              "Préférences : langue et mode de communication",
              "Renseignements tiers : coordonnées des personnes autorisées (titulaire joint, bénéficiaire)",
            ] : [
              "Identification Details: Name, date of birth, marital status, contact information, government-issued ID, Social Insurance Number* (for tax purposes), profession, account numbers",
              "Professional Role: Your status as a representative, director, officer, or shareholder",
              "Verification Data: Signatures, unique identifiers, account credentials",
              "Financial Profile: Income, employment history, investment holdings, risk tolerance, objectives",
              "Account Activity: Transaction history, instructions, communications",
              "Preferences: Language and communication preferences",
              "Third-Party Information: Details of individuals you authorize (e.g., joint account holders, beneficiaries)",
            ],
            note: fr ? "*La fourniture du NAS n’est pas obligatoire, mais peut être requise pour certains comptes." : "*Providing your SIN is not mandatory but may be required to open certain accounts.",
          },
        ],
      },
      {
        id: "privacy-use",
        title: fr ? "3. Utilisation et partage de vos renseignements" : "3. How we use and share your information",
        blocks: [],
        children: [
          {
            id: "privacy-use-1",
            title: fr ? "3.1. Utilisation" : "3.1. Use of information",
            blocks: [
              { kind: "p", text: fr ? "Nous utilisons vos renseignements pour :" : "We use your information to:" },
              {
                kind: "list",
                items: fr ? [
                  "Vérifier votre identité et maintenir des dossiers à jour",
                  "Comprendre votre profil et vos objectifs financiers",
                  "Ouvrir, administrer et gérer vos comptes et services",
                  "Offrir une expérience client personnalisée et cohérente",
                  "Vous informer des mises à jour de compte, des changements de politique et des avis de service",
                  "Prévenir et détecter la fraude, le blanchiment d’argent et les cybermenaces",
                  "Effectuer la diligence raisonnable et les contrôles de conformité",
                  "Respecter nos obligations légales et réglementaires",
                ] : [
                  "Verify identity and maintain records",
                  "Understand your financial profile and objectives",
                  "Open, administer, and manage your accounts and services",
                  "Deliver a consistent, personalized client experience",
                  "Communicate account updates, policy changes, and service notices",
                  "Prevent and detect fraud, money laundering, and cyber threats",
                  "Conduct regulatory due diligence and compliance checks",
                  "Fulfill legal and regulatory obligations",
                ],
              },
            ],
          },
          {
            id: "privacy-use-2",
            title: fr ? "3.2. Partage" : "3.2. Sharing of information",
            blocks: [
              { kind: "p", text: fr ? "Nous pouvons divulguer vos renseignements aux :" : "We may share your information with:" },
              {
                kind: "list",
                items: fr ? [
                  "Équipes internes de Nymbus responsables de la prestation de services et de la conformité",
                  "Personnes ou entités que vous autorisez",
                  "Bureaux de crédit, institutions financières et autorités de réglementation",
                  "Autorités légales ou gouvernementales, selon la loi",
                  "Fournisseurs de services (voir 3.3)",
                ] : [
                  "Internal Nymbus teams responsible for service delivery and compliance",
                  "Individuals or entities you authorize",
                  "Credit bureaus, financial institutions, and regulators",
                  "Legal or governmental authorities, as required by law",
                  "Service providers engaged to support our operations (see 3.3)",
                ],
              },
              { kind: "p", strong: true, text: fr ? "Nous ne vendons jamais vos renseignements personnels." : "We do not sell your personal information under any circumstances." },
            ],
          },
          {
            id: "privacy-use-3",
            title: fr ? "3.3. Fournisseurs de services" : "3.3. Service providers",
            review: PRIVACY_REVIEW.serviceProviders,
            blocks: [
              { kind: "p", text: fr
                ? "Nous pouvons faire appel à des fournisseurs de services, par exemple des administrateurs de fonds, des dépositaires et des fournisseurs de services informatiques et infonuagiques, pour soutenir nos activités. Ils ne reçoivent que les renseignements nécessaires à leurs services et sont liés par des ententes écrites qui les obligent à protéger ces renseignements et à ne les utiliser qu’aux fins de ces services."
                : "We may engage service providers, such as fund administrators, custodians, and information technology and cloud service providers, to support our operations. They receive only the information they need to perform their services and are bound by written agreements that require them to protect it and to use it only for those services." },
              { kind: "p", text: fr
                ? "Certains de ces fournisseurs peuvent conserver ou traiter des renseignements à l’extérieur du Québec ou du Canada, où ils peuvent être assujettis aux lois de ces territoires."
                : "Some of these providers may store or process information outside Québec or Canada, where it may be subject to the laws of those jurisdictions." },
            ],
          },
        ],
      },
      {
        id: "privacy-rights",
        title: fr ? "4. Vos droits et exercice de ceux-ci" : "4. Your rights and how to exercise them",
        blocks: [],
        children: [
          {
            id: "privacy-rights-1",
            title: fr ? "4.1. Droit de refuser ou de retirer votre consentement" : "4.1. Right to refuse or withdraw consent",
            blocks: [{ kind: "p", text: fr ? "Vous pouvez refuser ou retirer votre consentement à la collecte, à l’utilisation ou à la divulgation de vos renseignements, sous réserve des exigences légales ou contractuelles. Toutefois, le refus de fournir certaines données (p. ex. NAS) peut limiter l’accès à certains services." : "You may refuse or withdraw consent for collection, use, or disclosure of your information, subject to legal or contractual limitations. Note that refusal to provide certain data (e.g., SIN for registered accounts) may prevent us from delivering some services." }],
          },
          {
            id: "privacy-rights-2",
            title: fr ? "4.2. Marketing et données numériques" : "4.2. Marketing and digital information",
            blocks: [{ kind: "p", text: fr ? "Vous pouvez vous opposer aux communications promotionnelles de Nymbus et à toute collecte future de données de suivi numérique. Vous continuerez de recevoir les communications réglementaires obligatoires et les mises à jour importantes de vos comptes." : "You may opt out of promotional communications from Nymbus and any future collection of digital tracking information. You will continue to receive mandatory regulatory communications and important account notices." }],
          },
          {
            id: "privacy-rights-3",
            title: fr ? "4.3. Accès à vos renseignements" : "4.3. Accessing your information",
            blocks: [
              { kind: "p", text: fr ? "Vous pouvez demander l’accès à vos renseignements personnels, sauf restrictions légales. Adressez vos demandes par :" : "You may request access to your personal data, except where restricted by law. Submit requests via:" },
              { kind: "address", lines: [fr ? "Téléphone : 514 985-1138 ou 1 833 227-2656 (sans frais)" : "Phone: 514-985-1138 or 1-833-227-2656 (toll-free)", fr ? "Courriel : compliance@nymbus.ca" : "Email: compliance@nymbus.ca"] },
              { kind: "p", text: fr ? "Nous répondrons sous 30 jours ou vous informerons si un délai supplémentaire est nécessaire." : "We will respond within 30 days or notify you if additional time is required." },
            ],
          },
        ],
      },
      {
        id: "privacy-safeguards",
        title: fr ? "5. Protection de vos renseignements" : "5. Safeguarding your information",
        blocks: [{
          kind: "list",
          items: fr ? [
            "Chiffrement, serveurs sécurisés et pare-feu",
            "Contrôles d’accès et authentification forte",
            "Surveillance continue, audits et formation du personnel",
            "Vérification d’identité avant toute divulgation de renseignements",
          ] : [
            "Data encryption, secure servers, and firewalls",
            "Role-based access controls and multi-factor authentication",
            "Regular monitoring, audits, and staff training",
            "Verification of identity before disclosing any account information",
          ],
        }],
      },
      {
        id: "privacy-retention",
        title: fr ? "6. Conservation des données" : "6. Data retention",
        blocks: [{ kind: "p", text: fr ? "Nous conservons vos renseignements uniquement aussi longtemps que nécessaire pour fournir nos services et gérer vos comptes, et pour respecter nos obligations légales, fiscales et réglementaires. Les données obsolètes sont détruites en toute sécurité ou anonymisées." : "We retain personal data only as long as necessary to provide our services and manage accounts, and to comply with legal, tax, and regulatory requirements. When data is no longer required, it is securely destroyed or anonymized." }],
      },
      {
        id: "privacy-complaints",
        title: fr ? "7. Questions et plaintes" : "7. Questions & complaints",
        blocks: [{
          kind: "link",
          before: fr ? "Si vous avez des préoccupations quant à la manière dont vos renseignements personnels sont traités, veuillez consulter notre " : "If you have concerns about how your personal information is handled, please follow our ",
          label: fr ? "Politique de traitement des plaintes" : "Complaints Handling Policy",
          href: "/legal#complaints",
          after: fr ? ". Vous pouvez également contacter l’autorité provinciale ou fédérale en matière de protection des renseignements personnels." : ". You may also contact your provincial or federal privacy authority.",
        }],
      },
      {
        id: "privacy-contact",
        title: fr ? "8. Coordonnées" : "8. Contact information",
        blocks: [{
          kind: "address",
          lines: [
            "Nymbus Capital Inc.",
            fr ? "À l’attention du Responsable de la protection des renseignements personnels" : "ATTN: Designated Privacy Officer",
            fr ? "1002, rue Sherbrooke Ouest, bureau 1900" : "1002 Sherbrooke Street West, Suite 1900",
            fr ? "Montréal (Québec) H3A 3L6" : "Montreal, Quebec H3A 3L6",
            fr ? "514 985-1138 ou 1 833 227-2656 (sans frais)" : "514-985-1138 or 1-833-227-2656 (toll-free)",
            "compliance@nymbus.ca",
          ],
        }],
      },
      {
        id: "privacy-updates",
        title: fr ? "9. Mise à jour de la politique" : "9. Policy updates",
        blocks: [{ kind: "p", text: fr ? "Cette politique peut être mise à jour périodiquement. La version la plus récente est disponible sur notre site web. Les modifications importantes vous seront communiquées." : "This policy may be updated periodically. The latest version is always available on our website. We will communicate significant changes as required." }],
      },
      {
        id: "privacy-quebec",
        title: fr ? "10. Résidents du Québec : Loi 25" : "10. Québec residents: Law 25",
        review: PRIVACY_REVIEW.law25,
        blocks: [
          { kind: "p", text: fr
            ? "Si vous résidez au Québec, la Loi sur la protection des renseignements personnels dans le secteur privé, telle que modifiée par la Loi modernisant des dispositions législatives en matière de protection des renseignements personnels (Loi 25), s’applique aussi au traitement de vos renseignements personnels. En plus des engagements qui précèdent :"
            : "If you reside in Québec, the Act respecting the protection of personal information in the private sector, as amended by the Act to modernize legislative provisions as regards the protection of personal information (Law 25), also applies to how we handle your personal information. In addition to the commitments above:" },
          {
            kind: "list",
            items: fr ? [
              "Personne responsable : notre responsable de la protection des renseignements personnels, joignable aux coordonnées de la section 8, est la personne responsable de la protection des renseignements personnels chez Nymbus.",
              "Vos droits : vous pouvez accéder à vos renseignements personnels, les faire rectifier, retirer votre consentement et, dans les cas prévus par la loi, demander qu’ils vous soient communiqués, ou communiqués à un autre organisme, dans un format technologique structuré et couramment utilisé.",
              "Décisions automatisées : si une décision vous concernant est fondée exclusivement sur un traitement automatisé de vos renseignements, nous vous en informerons et, sur demande, vous indiquerons les renseignements et les principaux facteurs utilisés; vous pourrez faire réviser la décision par un membre de notre personnel.",
              "Communication à l’extérieur du Québec : avant de communiquer des renseignements personnels à l’extérieur du Québec, nous évaluons s’ils y bénéficieront d’une protection adéquate et concluons une entente écrite avec le destinataire.",
              "Incidents de confidentialité : nous tenons un registre des incidents de confidentialité et avisons la Commission d’accès à l’information ainsi que les personnes concernées lorsqu’un incident présente un risque de préjudice sérieux.",
              "Ce site Web : il n’utilise aucune technologie permettant de vous identifier, de vous localiser ou d’effectuer votre profilage. Il enregistre un seul témoin, qui retient votre préférence de langue.",
            ] : [
              "Person in charge: our Designated Privacy Officer, reachable at the contact details in section 8, is the person in charge of the protection of personal information at Nymbus.",
              "Your rights: you may access your personal information, have it corrected, withdraw your consent and, where the law provides, ask that it be communicated to you, or to another organization, in a structured, commonly used technological format.",
              "Automated decisions: if a decision about you is based exclusively on automated processing of your information, we will tell you and, on request, explain the information and the main factors used; you may have the decision reviewed by a member of our staff.",
              "Communication outside Québec: before we communicate personal information outside Québec, we assess whether it will be adequately protected and enter into a written agreement with the recipient.",
              "Confidentiality incidents: we keep a register of confidentiality incidents and notify the Commission d’accès à l’information and the persons concerned when an incident presents a risk of serious injury.",
              "This website: it uses no technology to identify, locate or profile you. It stores a single cookie, which remembers your language preference.",
            ],
          },
          {
            kind: "link",
            before: fr ? "Si vous n’êtes pas satisfait de notre réponse à une demande ou à une plainte concernant vos renseignements personnels, vous pouvez vous adresser à la " : "If you are not satisfied with our response to a privacy request or complaint, you may contact the ",
            label: fr ? "Commission d’accès à l’information du Québec" : "Commission d’accès à l’information du Québec",
            href: "https://www.cai.gouv.qc.ca/",
            after: ".",
          },
        ],
      },
    ],
    effective: fr ? "En vigueur en date du 1er juillet 2025" : "Effective as of July 1, 2025",
  };
}
