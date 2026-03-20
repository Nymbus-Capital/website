'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

type FormStep = 'investor-type' | 'interests' | 'contact-details';

interface FormData {
  investorType: string;
  interests: string[];
  name: string;
  email: string;
  phone: string;
  company: string;
}

export default function ContactPage() {
  const { t, locale } = useTranslation();
  const [currentStep, setCurrentStep] = useState<FormStep>('investor-type');
  const [formData, setFormData] = useState<FormData>({
    investorType: '',
    interests: [],
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const steps = ['investor-type', 'interests', 'contact-details'];
  const stepIndex = steps.indexOf(currentStep);

  const handleInvestorTypeSelect = (type: string) => {
    setFormData({ ...formData, investorType: type });
    setCurrentStep('interests');
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleContactDetailsChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.email) {
      setSubmitted(true);
      setTimeout(() => {
        setCurrentStep('investor-type');
        setFormData({ investorType: '', interests: [], name: '', email: '', phone: '', company: '' });
        setSubmitted(false);
      }, 3000);
    }
  };

  const investorTypes = [
    { value: 'institutional', label: locale === 'fr' ? 'Institutionnel' : 'Institutional' },
    { value: 'family-office', label: locale === 'fr' ? 'Bureau familial' : 'Family Office' },
    { value: 'advisor', label: locale === 'fr' ? 'Conseiller' : 'Advisor' }
  ];

  const interestOptions = [
    { value: 'fixed-income', label: locale === 'fr' ? 'Revenu fixe' : 'Fixed Income' },
    { value: 'alternatives', label: locale === 'fr' ? 'Placements alternatifs' : 'Alternatives' },
    { value: 'esg', label: locale === 'fr' ? 'Durabilité (ESG)' : 'Sustainability (ESG)' },
    { value: 'performance', label: locale === 'fr' ? 'Performance' : 'Performance' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="md:col-span-2">
            <div className="bg-slate-800/50 rounded-lg p-8">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex justify-between mb-4">
                  {['1', '2', '3'].map((num, index) => (
                    <div
                      key={num}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index <= stepIndex
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-600 text-slate-300'
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
                <div className="w-full bg-slate-600 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${((stepIndex + 1) / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Step 1: Investor Type */}
              {currentStep === 'investor-type' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {locale === 'fr' ? 'Quel type d\'investisseur êtes-vous?' : 'What type of investor are you?'}
                  </h2>
                  <div className="space-y-3">
                    {investorTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => handleInvestorTypeSelect(type.value)}
                        className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left text-white font-semibold transition-all border-2 border-transparent hover:border-emerald-500"
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Interests */}
              {currentStep === 'interests' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {locale === 'fr' ? 'Quels sont vos intérêts?' : 'What are your interests?'}
                  </h2>
                  <div className="space-y-3 mb-6">
                    {interestOptions.map(option => (
                      <label key={option.value} className="flex items-center p-4 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(option.value)}
                          onChange={() => handleInterestToggle(option.value)}
                          className="w-5 h-5 text-emerald-500 rounded"
                        />
                        <span className="ml-3 text-white font-semibold">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentStep('investor-type')}
                      className="flex-1 px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-all"
                    >
                      {locale === 'fr' ? 'Retour' : 'Back'}
                    </button>
                    <button
                      onClick={() => setCurrentStep('contact-details')}
                      className="flex-1 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all"
                    >
                      {locale === 'fr' ? 'Suivant' : 'Next'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Details */}
              {currentStep === 'contact-details' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {locale === 'fr' ? 'Vos coordonnées' : 'Your details'}
                  </h2>
                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      placeholder={locale === 'fr' ? 'Nom' : 'Name'}
                      value={formData.name}
                      onChange={(e) => handleContactDetailsChange('name', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="email"
                      placeholder={locale === 'fr' ? 'Adresse e-mail' : 'Email'}
                      value={formData.email}
                      onChange={(e) => handleContactDetailsChange('email', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="tel"
                      placeholder={locale === 'fr' ? 'Téléphone' : 'Phone'}
                      value={formData.phone}
                      onChange={(e) => handleContactDetailsChange('phone', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder={locale === 'fr' ? 'Entreprise' : 'Company'}
                      value={formData.company}
                      onChange={(e) => handleContactDetailsChange('company', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentStep('interests')}
                      className="flex-1 px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-all"
                    >
                      {locale === 'fr' ? 'Retour' : 'Back'}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!formData.name || !formData.email}
                      className="flex-1 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                      {locale === 'fr' ? 'Envoyer' : 'Submit'}
                    </button>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {submitted && (
                <div className="bg-emerald-500/20 border border-emerald-500 rounded-lg p-6 text-center">
                  <p className="text-emerald-400 font-semibold">
                    {locale === 'fr'
                      ? 'Merci! Nous vous contacterons bientôt.'
                      : 'Thank you! We will be in touch soon.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-slate-700/50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                {locale === 'fr' ? 'Nos bureaux' : 'Our Offices'}
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-emerald-400 mb-2">Montreal</h4>
                  <p className="text-slate-300 text-sm">1234 rue de la Gauchetière<br />Montreal, QC H3B 2B6<br />Canada</p>
                  <p className="text-emerald-400 text-sm mt-2">+1 (514) 555-0123</p>
                </div>
                <div>
                  <h4 className="font-bold text-emerald-400 mb-2">Toronto</h4>
                  <p className="text-slate-300 text-sm">5678 Bay Street<br />Toronto, ON M5J 2N8<br />Canada</p>
                  <p className="text-emerald-400 text-sm mt-2">+1 (416) 555-0456</p>
                </div>
                <div className="border-t border-slate-600 pt-6">
                  <p className="text-slate-400 text-sm">
                    {locale === 'fr'
                      ? 'Disponible du lundi au vendredi, 8h-17h EST'
                      : 'Available Monday-Friday, 8am-5pm EST'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}