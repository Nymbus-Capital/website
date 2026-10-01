/**
 * /contact copy, EN / FR (previous site's contact page, with its three-step form: investor type, interests,
 * contact details). The form has no backend: it prepares an email in the visitor's mail app.
 */
import { l, type L } from "../../../lib/i18n/config.ts";

export const CT = {
  meta: {
    title: l("Contact", "Nous joindre"),
    description: l(
      "Contact Nymbus Capital in Montreal: office address, phone, email, and a short form that prepares your message.",
      "Joignez Nymbus Capital à Montréal : adresse du bureau, téléphone, courriel, et un court formulaire qui prépare votre message.",
    ),
  },
  hero: {
    eyebrow: l("Contact us", "Nous joindre"),
    title: l("Get in", "Communiquez"),
    accent: l("touch", "avec nous"),
    lead: l(
      "Strategies, a custom mandate or the firm: our Montreal team can help.",
      "Nos stratégies, un mandat sur mesure ou la firme : notre équipe de Montréal peut vous aider.",
    ),
  },
  form: {
    title: l("Write to us", "Écrivez-nous"),
    lead: l("Three steps. Your message opens in your mail app, ready to send.", "Trois étapes. Votre message s’ouvre dans votre application de courriel, prêt à envoyer."),
    stepsLabel: l("Form progress", "Progression du formulaire"),
    steps: [l("Investor type", "Type d’investisseur"), l("Interests", "Intérêts"), l("Contact details", "Coordonnées")],
    stepOf: l("Step {n} of 3", "Étape {n} sur 3"),
    q1: l("What type of investor are you?", "Quel type d’investisseur êtes-vous?"),
    q2: l("What are you interested in?", "Qu’est-ce qui vous intéresse?"),
    q2hint: l("Choose one or more.", "Choisissez un ou plusieurs éléments."),
    q3: l("Your contact details", "Vos coordonnées"),
    profiles: [
      { v: "Institutional investor", t: l("Institutional investor", "Investisseur institutionnel"), d: l("Pension funds, foundations, endowments, insurers", "Caisses de retraite, fondations, fonds de dotation, assureurs") },
      { v: "Family office", t: l("Family office", "Bureau de gestion familiale"), d: l("Single and multi-family offices", "Bureaux unifamiliaux et multifamiliaux") },
      { v: "Financial advisor", t: l("Financial advisor", "Conseiller en placement"), d: l("Advisors registered with CIRO or a provincial securities regulator", "Conseillers inscrits auprès de l’OCRI ou d’une autorité provinciale en valeurs mobilières") },
      { v: "Other", t: l("Other", "Autre"), d: l("Individual investors, media, partners", "Particuliers, médias, partenaires") },
    ] as { v: string; t: L; d: L }[],
    custom: l("Custom mandate", "Mandat sur mesure"),
    general: l("General inquiry", "Demande générale"),
    name: l("Full name", "Nom complet"),
    email: l("Email address", "Adresse courriel"),
    phone: l("Phone (optional)", "Téléphone (facultatif)"),
    company: l("Organization (optional)", "Organisation (facultatif)"),
    message: l("Message (optional)", "Message (facultatif)"),
    messagePh: l("Tell us about your needs", "Parlez-nous de vos besoins"),
    next: l("Continue", "Continuer"),
    back: l("Back", "Retour"),
    send: l("Prepare my email", "Préparer mon courriel"),
    errs: {
      profile: l("Please choose an investor type.", "Veuillez choisir un type d’investisseur."),
      interests: l("Please choose at least one interest.", "Veuillez choisir au moins un intérêt."),
      name: l("Please enter your name.", "Veuillez entrer votre nom."),
      email: l("Please enter a valid email address.", "Veuillez entrer une adresse courriel valide."),
      phone: l("Please check the phone number.", "Veuillez vérifier le numéro de téléphone."),
    },
    note: l(
      "This form does not send or store anything: it prepares an email to info@nymbus.ca in your mail app. Please do not include account numbers or other sensitive information.",
      "Ce formulaire n’envoie et n’enregistre rien : il prépare un courriel à info@nymbus.ca dans votre application de courriel. N’y indiquez pas de numéros de compte ni d’autres renseignements sensibles.",
    ),
    ready: l("Your email is ready", "Votre courriel est prêt"),
    readyD: l("Your mail app should have opened with the message. If it didn’t, use the button below or write to info@nymbus.ca.", "Votre application de courriel devrait s’être ouverte avec le message. Sinon, utilisez le bouton ci-dessous ou écrivez à info@nymbus.ca."),
    openMail: l("Open my email", "Ouvrir mon courriel"),
    again: l("Start over", "Recommencer"),
  },
  office: {
    title: l("Montreal office", "Bureau de Montréal"),
    address: l("1002 Sherbrooke Street West, Suite 1900\nMontreal, Quebec H3A 3L6", "1002, rue Sherbrooke Ouest, bureau 1900\nMontréal (Québec) H3A 3L6"),
    phone: l("514-985-1138", "514 985-1138"),
    tollFree: l("1-833-227-2656 (toll-free)", "1 833 227-2656 (sans frais)"),
    hours: l("Monday to Friday, 8:30 a.m. to 5:00 p.m. (Eastern time)", "Du lundi au vendredi, de 8 h 30 à 17 h (heure de l’Est)"),
    map: l("Open in Google Maps", "Ouvrir dans Google Maps"),
    response: l("Response time", "Délai de réponse"),
    responseD: l("Usually within one business day. Urgent? Please call.", "Habituellement en un jour ouvrable. Urgent? Appelez-nous."),
    labels: { phone: l("Phone", "Téléphone"), email: l("Email", "Courriel"), hours: l("Hours", "Heures"), linkedin: l("LinkedIn", "LinkedIn") },
  },
  who: {
    eyebrow: l("Who to contact", "Qui joindre"),
    title: l("The right person", "La bonne personne"),
    accent: l("for your question", "pour votre question"),
    items: [
      { t: l("Investors and institutions", "Investisseurs et institutions"), d: l("Strategies, mandates, due diligence, meetings.", "Stratégies, mandats, vérification diligente, rencontres."), email: "info@nymbus.ca", subject: l("Investor inquiry", "Demande d’investisseur") },
      { t: l("Financial advisors", "Conseillers en placement"), d: l("Fund codes, documents, client portfolio support.", "Codes de fonds, documents, soutien pour vos clients."), email: "info@nymbus.ca", subject: l("Advisor inquiry", "Demande de conseiller") },
      { t: l("Media and careers", "Médias et carrières"), d: l("Interviews, events, job applications.", "Entrevues, événements, candidatures."), email: "info@nymbus.ca", subject: l("Media or careers", "Médias ou carrières") },
      { t: l("Complaints and privacy", "Plaintes et confidentialité"), d: l("Complaints and personal information requests.", "Plaintes et demandes sur les renseignements personnels."), email: "compliance@nymbus.ca", subject: l("Compliance", "Conformité"), link: { href: "/legal#complaints", label: l("Complaints policy", "Politique de traitement des plaintes") } },
    ] as { t: L; d: L; email: string; subject: L; link?: { href: string; label: L } }[],
  },
  visit: {
    eyebrow: l("Visit us", "Nous rendre visite"),
    title: l("In the heart of", "Au cœur du"),
    accent: l("downtown Montreal", "centre-ville de Montréal"),
    text: l("Sherbrooke Street West, a short walk from Peel metro.", "Rue Sherbrooke Ouest, à quelques pas du métro Peel."),
  },
};
