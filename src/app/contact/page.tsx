'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import {
  Building2, Users, Briefcase, MapPin, Phone, Mail,
  ArrowRight, ArrowLeft, CheckCircle, Send, Clock,
} from 'lucide-react';

type Step = 1 | 2 | 3;

export default function ContactPage() {
  const { locale } = useTranslation();
  const fr = locale === 'fr';
  const [step, setStep] = useState<Step>(1);
  const [investorType, setInvestorType] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const investorTypes = [
    { key: 'institutional', label: fr ? 'Investisseur institutionnel' : 'Institutional Investor', icon: Building2 },
    { key: 'family-office', label: fr ? 'Bureau familial' : 'Family Office', icon: Users },
    { key: 'advisor', label: fr ? 'Conseiller en placement' : 'Investment Advisor', icon: Briefcase },
    { key: 'other', label: fr ? 'Autre' : 'Other', icon: Mail },
  ];

  const interestOptions = fr
    ? ['Obligations durables bonifiées', 'Revenu Mensuel', 'Multi-stratégies', 'Global Minimum Volatilité', 'Mandat personnalisé', 'Demande générale']
    : ['Sustainable Enhanced Bonds', 'Monthly Income Fund', 'Multi-Strategy Fund', 'Global Minimum Volatility', 'Custom Mandate', 'General Inquiry'];

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">{fr ? 'Merci' : 'Thank You'}</h1>
          <p className="text-slate-600 mb-6">{fr ? 'Votre demande a été reçue. Notre équipe vous répondra dans un délai d\'un jour ouvrable.' : 'Your inquiry has been received. Our team will respond within one business day.'}</p>
          <a href="/" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">{fr ? 'Retour à l\'accueil' : 'Return to Home'}</a>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-slate-100 pt-8 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">{fr ? 'Nous joindre' : 'Contact Us'}</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{fr ? 'Communiquez avec nous' : 'Get in Touch'}</h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              {fr ? 'Intéressé à en apprendre davantage sur nos stratégies d\'investissement? Notre équipe est là pour vous aider.' : 'Interested in learning more about our investment strategies? Our team is here to help.'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-8">
                {([1, 2, 3] as Step[]).map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                      step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    )}>
                      {s}
                    </div>
                    {s < 3 && <div className={cn('w-12 h-0.5', step > s ? 'bg-blue-600' : 'bg-slate-200')} />}
                  </div>
                ))}
                <span className="text-sm text-slate-500 ml-4">
                  {step === 1 ? (fr ? 'Type d\'investisseur' : 'Investor Type') : step === 2 ? (fr ? 'Intérêts' : 'Interests') : (fr ? 'Coordonnées' : 'Contact Details')}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {/* Step 1: Investor Type */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? 'Quel type d\'investisseur êtes-vous?' : 'What type of investor are you?'}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {investorTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.key}
                            onClick={() => setInvestorType(type.key)}
                            className={cn(
                              'text-left p-5 rounded-xl border-2 transition-all',
                              investorType === type.key ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                            )}
                          >
                            <Icon className={cn('w-6 h-6 mb-2', investorType === type.key ? 'text-blue-600' : 'text-slate-400')} />
                            <p className="font-semibold text-slate-900">{type.label}</p>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => investorType && setStep(2)}
                      disabled={!investorType}
                      className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {fr ? 'Continuer' : 'Continue'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Interests */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? 'Quels sont vos intérêts?' : 'What are you interested in?'}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {interestOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setInterests(interests.includes(opt) ? interests.filter((i) => i !== opt) : [...interests, opt])}
                          className={cn(
                            'text-left p-4 rounded-xl border-2 transition-all text-sm font-medium',
                            interests.includes(opt) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:border-slate-300'
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> {fr ? 'Retour' : 'Back'}
                      </button>
                      <button
                        onClick={() => interests.length > 0 && setStep(3)}
                        disabled={interests.length === 0}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {fr ? 'Continuer' : 'Continue'} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Contact Details */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{fr ? 'Vos coordonnées' : 'Your Contact Details'}</h2>
                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">{fr ? 'Nom complet *' : 'Full Name *'}</label>
                          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-sm" placeholder={fr ? 'Votre nom' : 'Your name'} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">{fr ? 'Adresse courriel *' : 'Email Address *'}</label>
                          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-sm" placeholder={fr ? 'vous@entreprise.com' : 'you@company.com'} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">{fr ? 'Téléphone' : 'Phone'}</label>
                          <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-sm" placeholder="+1 (555) 000-0000" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">{fr ? 'Entreprise' : 'Company'}</label>
                          <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-sm" placeholder={fr ? 'Nom de l\'entreprise' : 'Company name'} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{fr ? 'Message' : 'Message'}</label>
                        <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-sm resize-none" placeholder={fr ? 'Décrivez vos besoins en investissement...' : 'Tell us about your investment needs...'} />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> {fr ? 'Retour' : 'Back'}
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!formData.name || !formData.email}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" /> {fr ? 'Envoyer la demande' : 'Send Inquiry'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Office Info Sidebar */}
            <div className="space-y-4">
              <Card className="p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">{fr ? 'Bureau de Montréal' : 'Montreal Office'}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-900 font-medium">1002 {fr ? 'rue Sherbrooke Ouest' : 'Sherbrooke Street West'}, Suite 1900</p>
                      <p className="text-slate-500">{fr ? 'Montréal' : 'Montreal'}, QC H3A 3L6</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <a href="tel:+15149851138" className="text-slate-700 hover:text-blue-600 transition-colors">514-985-1138</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <a href="mailto:info@nymbus.ca" className="text-slate-700 hover:text-blue-600 transition-colors">info@nymbus.ca</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-700">{fr ? 'Lun–Ven : 8 h 30 – 17 h 00 HE' : 'Mon–Fri: 8:30 AM – 5:00 PM ET'}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-slate-200 bg-slate-50">
                <h3 className="font-bold text-slate-900 mb-2">{fr ? 'Délai de réponse' : 'Response Time'}</h3>
                <p className="text-sm text-slate-600">
                  {fr ? 'Nous répondons habituellement aux demandes dans un délai d\'un jour ouvrable. Pour les questions urgentes, veuillez nous appeler directement.' : 'We typically respond to inquiries within one business day. For urgent matters, please call us directly.'}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">{fr ? 'Visitez notre bureau' : 'Visit Our Office'}</h2>
          </ScrollReveal>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.3!2d-73.5773!3d45.5048!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc91a541d52ab21%3A0x206ea20b4e38c712!2s1002+Rue+Sherbrooke+O%2C+Montr%C3%A9al%2C+QC+H3A+3L6!5e0!3m2!1sen!2sca!4v1711000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute bottom-6 left-6 z-10"
            >
              <Card className="p-5 border border-slate-200 bg-white shadow-lg backdrop-blur-sm bg-opacity-95">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Nymbus Capital</p>
                    <p className="text-xs text-slate-600 mt-1">1002 {fr ? 'rue Sherbrooke Ouest' : 'Sherbrooke Street West'}, Suite 1900</p>
                    <p className="text-xs text-slate-600">{fr ? 'Montréal' : 'Montreal'}, QC H3A 3L6</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}